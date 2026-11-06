import { lazy, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  History,
  X,
  Send,
  Bot,
  Loader2,
  Search,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Quote,
  FileWarning,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Command,
  Wand2,
} from 'lucide-react';
import { useWritingInsights, type Insight, type InsightType } from '@/hooks/useWritingInsights';
import { cn } from '@/lib/utils';
import { useDeerFlowStream } from '@/hooks/useDeerFlowStream';
import { NeuralPanel } from '@/components/writing-studio/nobel/NeuralPanel';
import { UXAgentPanel } from '@/components/writing-studio/ux/UXAgentPanel';
import { MultiAgentReviewBoard } from '../components/MultiAgentReviewBoard';
import { useAiCoWriter } from '@/hooks/useAiCoWriter';
import type { InterfaceMode } from '@/lib/user-preferences';
import type { UXAnalysisResult } from '@/lib/ux-agent-engine';
import {
  INKOS_TOOLS,
  INKOS_TOOL_MAP,
  recommendInkOsToolsForChat,
  detectAmbientCoPilotWhisper,
  type InkOsToolId,
  type InkOsToolRecommendation,
} from '../config/inkos-tool-catalog';

const NobelPanel = lazy(() => import('@/components/writing-studio/nobel/NobelPanel').then(m => ({ default: m.NobelPanel })));
const CharacterPanel = lazy(() => import('@/components/writing-studio/nobel/CharacterPanel').then(m => ({ default: m.CharacterPanel })));

interface Version {
  id: string;
  timestamp: string;
  preview: string;
  isAISuggestion?: boolean;
  status?: 'pending' | 'applied' | 'rejected';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  suggestedTools?: InkOsToolRecommendation[];
}

type TabId = 'neuro' | 'nobel' | 'chars' | 'ai' | 'research' | 'plan' | 'critique' | 'ux' | 'insights';

interface RightPanelProps {
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
  content?: string;
  projectId?: string;
  projectTitle?: string;
  projectType?: 'book' | 'research' | 'assignment';
  interfaceMode?: InterfaceMode;
  uxResult?: UXAnalysisResult | null;
  onJumpToSection?: (anchor: string) => void;
  onOpenInkOsTool?: (toolId: InkOsToolId, contextText?: string) => void;
  onInsertToEditor?: (text: string) => void;
  externalChatPrompt?: string | null;
  onClearExternalChatPrompt?: () => void;
}

const ALL_TABS: { id: TabId; label: string; advancedOnly?: boolean }[] = [
  { id: 'ai', label: 'AI' },
  { id: 'neuro', label: 'Neuro' },
  { id: 'insights', label: 'Insights', advancedOnly: true },
  { id: 'nobel', label: 'Nobel', advancedOnly: true },
  { id: 'chars', label: 'Chars', advancedOnly: true },
  { id: 'research', label: 'Research', advancedOnly: true },
  { id: 'plan', label: 'Plan', advancedOnly: true },
  { id: 'critique', label: 'Critique', advancedOnly: true },
  { id: 'ux', label: 'UX', advancedOnly: true },
];

const BEGINNER_PROMPTS = [
  { icon: '✍️', text: 'Help me start this section', prompt: 'Help me write the opening of this section based on what I have so far.' },
  { icon: '✨', text: 'Make this paragraph clearer', prompt: 'Please rewrite the last paragraph to be clearer and more engaging.' },
  { icon: '🔍', text: 'Check my argument & pacing', prompt: 'Analyze the strength and pacing of my current text and suggest improvements.' },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      "I'm your AI Co-Writer & InkOS Studio guide. Ask me to draft a scene, refine dialogue, or type `/` to launch any of our 45 literary, audio, and Boi Mela publishing engines directly from chat.",
    suggestedTools: [
      {
        tool: INKOS_TOOL_MAP['story-bible'],
        reason: 'Pin character bios, world rules & canon facts (0 Credits)',
      },
      {
        tool: INKOS_TOOL_MAP['block-catalyzer'],
        reason: 'Spark 3 unexpected plot beats or opening hooks (#23)',
      },
      {
        tool: INKOS_TOOL_MAP['deslop'],
        reason: 'Strip AI clichés and tighten literary prose (#3)',
      },
    ],
  },
];

export function RightPanel({
  activeTab = 'ai',
  onTabChange,
  content = '',
  projectId = 'default',
  projectTitle = 'Untitled',
  projectType = 'book',
  interfaceMode = 'beginner',
  uxResult,
  onJumpToSection,
  onOpenInkOsTool,
  onInsertToEditor,
  externalChatPrompt,
  onClearExternalChatPrompt,
}: RightPanelProps) {
  const insights = useWritingInsights(content, { projectType, debounceMs: 5000, maxInsights: 3 });
  const visibleTabs = interfaceMode === 'beginner'
    ? ALL_TABS.filter(t => !t.advancedOnly)
    : ALL_TABS;

  const [currentTab, setCurrentTab] = useState<TabId>(
    visibleTabs.some(t => t.id === activeTab) ? activeTab : visibleTabs[0].id
  );
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [dismissedWhisperId, setDismissedWhisperId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Local/cloud version history state
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    if (!projectId) return;
    try {
      const stored = localStorage.getItem(`project-versions-${projectId}`);
      if (stored) {
        setVersions(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, [projectId]);

  const { generate, isGenerating, streamedText, abort } = useAiCoWriter();
  const streamingIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!visibleTabs.some(t => t.id === currentTab)) {
      setCurrentTab(visibleTabs[0].id);
    }
  }, [interfaceMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (isGenerating && streamedText && streamingIdRef.current) {
      setMessages(prev =>
        prev.map(m =>
          m.id === streamingIdRef.current
            ? { ...m, content: streamedText, isStreaming: true }
            : m
        )
      );
    }
  }, [streamedText, isGenerating]);

  // Slash command autocomplete matches when user types "/"
  const slashMatches = useMemo(() => {
    const trimmed = chatInput.trim().toLowerCase();
    if (!trimmed.startsWith('/')) return [];
    const q = trimmed.slice(1);
    return INKOS_TOOLS.filter(
      t =>
        t.slashCommand.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.titleBn.toLowerCase().includes(q) ||
        t.keywords.some(k => k.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [chatInput]);

  // Ambient Co-Pilot whisper
  const ambientWhisper = useMemo(() => {
    const w = detectAmbientCoPilotWhisper(content);
    if (!w || w.id === dismissedWhisperId) return null;
    return w;
  }, [content, dismissedWhisperId]);

  const handleTabClick = (tabId: TabId) => {
    setCurrentTab(tabId);
    onTabChange?.(tabId);
  };

  const handleSendMessage = useCallback(async (overrideInput?: string) => {
    const userMessage = (overrideInput || chatInput).trim();
    if (!userMessage || isGenerating) return;
    if (!overrideInput) setChatInput('');

    // Check if the user typed an exact /slash command to directly launch or preview an InkOS tool
    const exactSlashTool = INKOS_TOOLS.find(
      t => userMessage.toLowerCase() === t.slashCommand.toLowerCase()
    );

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: userMessage };
    const streamingId = (Date.now() + 1).toString();

    if (exactSlashTool) {
      const recommendations = recommendInkOsToolsForChat(userMessage, exactSlashTool.description, content);
      const slashReply: ChatMessage = {
        id: streamingId,
        role: 'assistant',
        content: `${exactSlashTool.emoji} **${exactSlashTool.title}** (${exactSlashTool.titleBn})\n${exactSlashTool.description}\n\nClick the Studio card below to open the interactive workbench with your current manuscript:`,
        isStreaming: false,
        suggestedTools: recommendations,
      };
      setMessages(prev => [...prev, userMsg, slashReply]);
      onOpenInkOsTool?.(exactSlashTool.id, content);
      return;
    }

    streamingIdRef.current = streamingId;
    const aiPlaceholder: ChatMessage = { id: streamingId, role: 'assistant', content: '', isStreaming: true };

    setMessages(prev => [...prev, userMsg, aiPlaceholder]);

    const result = await generate({
      currentText: content.substring(0, 2000),
      context: content.substring(0, 500),
      mode: 'instruction',
      instruction: userMessage,
    });

    const finalReply = result || 'Here is a suggested refinement based on your manuscript context. You can also launch the specialized InkOS engines below for deeper analysis.';
    const recommendedTools = recommendInkOsToolsForChat(userMessage, finalReply, content);

    streamingIdRef.current = null;
    setMessages(prev =>
      prev.map(m =>
        m.id === streamingId
          ? {
              ...m,
              content: finalReply,
              isStreaming: false,
              suggestedTools: recommendedTools,
            }
          : m
      )
    );
  }, [chatInput, content, generate, isGenerating, onOpenInkOsTool]);

  // Handle external prompt sent from CenterEditor inline selection pill
  useEffect(() => {
    if (externalChatPrompt && externalChatPrompt.trim()) {
      setCurrentTab('ai');
      handleSendMessage(externalChatPrompt);
      onClearExternalChatPrompt?.();
    }
  }, [externalChatPrompt, handleSendMessage, onClearExternalChatPrompt]);

  const renderTabContent = () => {
    switch (currentTab) {
      case 'insights':
        return <InsightsTab insights={insights} onJump={onJumpToSection} />;

      case 'neuro':
        return <div className="flex-1 overflow-y-auto custom-scrollbar"><NeuralPanel content={content} /></div>;

      case 'nobel':
        return (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <NobelPanel content={content} projectTitle={projectTitle} />
          </div>
        );

      case 'chars':
        return <div className="flex-1 overflow-y-auto custom-scrollbar"><CharacterPanel projectId={projectId} /></div>;

      case 'research':
        return <ResearchTab content={content} />;

      case 'plan':
        return <PlanTab content={content} />;

      case 'critique':
        return <CritiqueTab content={content} />;

      case 'ux':
        return (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <UXAgentPanel content={content} externalResult={uxResult} />
          </div>
        );

      case 'ai':
      default:
        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {interfaceMode === 'advanced' && versions.length > 0 && (
              <div className="border-b border-zinc-200 dark:border-zinc-800">
                <div className="p-2.5 bg-zinc-100/50 dark:bg-zinc-900/20 border-b border-zinc-200 dark:border-zinc-800/50">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2">
                    <History className="w-3 h-3" />
                    Rollback & Versions
                  </h4>
                </div>
                <div className="p-2.5 space-y-2 max-h-[110px] overflow-y-auto custom-scrollbar">
                  {versions.map(version => (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-zinc-800/40 p-2.5 rounded-lg border border-brand/30 bg-brand/5 dark:bg-brand/10 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-semibold text-zinc-500">{version.timestamp}</span>
                        <span className="text-[9px] font-bold text-brand uppercase">Saved</span>
                      </div>
                      <p className="text-[11px] line-clamp-2 text-zinc-600 dark:text-zinc-400">{version.preview}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-900/10">
              <div className="p-3 bg-zinc-100/50 dark:bg-zinc-900/20 border-b border-zinc-200 dark:border-zinc-800/50 flex justify-between items-center shrink-0">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-brand" />
                  {interfaceMode === 'beginner' ? 'AI Co-Writer & Studio Guide' : 'InkOS Co-Writer'}
                </h4>
                {isGenerating && (
                  <button onClick={abort} className="text-[9px] text-destructive font-bold hover:underline">Stop</button>
                )}
              </div>

              {/* Beginner quick-start prompts */}
              {interfaceMode === 'beginner' && messages.length <= 1 && (
                <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 space-y-1.5 shrink-0">
                  {BEGINNER_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(p.prompt)}
                      disabled={isGenerating}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-brand/5 dark:hover:bg-brand/10 border border-zinc-200 dark:border-zinc-700 hover:border-brand/30 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <span className="text-sm">{p.icon}</span>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{p.text}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Message Thread with Embedded InkOS Suggestion Chips */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {messages.map(message => (
                  <div key={message.id} className={cn('flex gap-2', message.role === 'user' ? 'flex-row-reverse' : '')}>
                    <div className={cn(
                      'w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5',
                      message.role === 'user' ? 'bg-zinc-200 dark:bg-zinc-700' : 'bg-brand/20 text-brand'
                    )}>
                      {message.role === 'user' ? (
                        <span className="text-[10px] font-bold">U</span>
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className={cn(
                      'max-w-[88%] p-3 rounded-xl text-xs shadow-xs border space-y-2.5',
                      message.role === 'user'
                        ? 'bg-brand text-white rounded-tr-none border-brand'
                        : 'bg-white dark:bg-zinc-800/90 rounded-tl-none border-zinc-200 dark:border-zinc-700'
                    )}>
                      {message.isStreaming && !message.content ? (
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin text-brand" />
                          <span className="text-zinc-400">Thinking...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      )}

                      {/* 1-Click Insert into Editor button for AI drafts */}
                      {message.role === 'assistant' && !message.isStreaming && message.id !== '1' && onInsertToEditor && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => onInsertToEditor(message.content)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors cursor-pointer"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Insert into Editor</span>
                          </button>
                        </div>
                      )}

                      {/* ✨ Contextual InkOS Tool Suggestions directly inside AI Chat Response */}
                      {message.role === 'assistant' && !message.isStreaming && message.suggestedTools && message.suggestedTools.length > 0 && (
                        <div
                          className="pt-2.5 border-t border-zinc-100 dark:border-zinc-700/70 space-y-1.5"
                          data-testid="chat-inkos-suggestions"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-brand flex items-center gap-1">
                              <Wand2 className="w-2.5 h-2.5" />
                              Suggested InkOS Studio Actions
                            </span>
                            <span className="text-[9px] text-zinc-400">1-Click Launch</span>
                          </div>
                          <div className="space-y-1.5">
                            {message.suggestedTools.map(({ tool, reason }) => (
                              <button
                                key={tool.id}
                                type="button"
                                data-testid={`chat-suggestion-${tool.id}`}
                                onClick={() => onOpenInkOsTool?.(tool.id, message.content)}
                                className="w-full text-left p-2 rounded-lg border border-zinc-200/80 dark:border-zinc-700/80 hover:border-brand/50 bg-zinc-50/80 dark:bg-zinc-900/60 hover:bg-brand/5 dark:hover:bg-brand/15 transition-all group flex items-start justify-between gap-2 cursor-pointer"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm shrink-0">{tool.emoji}</span>
                                    <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-brand truncate">
                                      {tool.title}
                                    </span>
                                    {tool.capabilityNumber && (
                                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-500">
                                        #{tool.capabilityNumber}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                                    {reason}
                                  </p>
                                </div>
                                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-brand/10 text-brand shrink-0 self-center">
                                  {tool.credits === 0 ? 'Free' : `⚡${tool.credits}Cr`}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 💡 Proactive Ambient Co-Pilot Whisper Bar */}
              {ambientWhisper && (
                <div
                  data-testid="ambient-copilot-whisper"
                  className="mx-3 mb-2 p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-500/10 flex flex-col gap-1.5 shrink-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-300 font-medium leading-snug">
                      💡 {ambientWhisper.message}
                    </p>
                    <button
                      type="button"
                      onClick={() => setDismissedWhisperId(ambientWhisper.id)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      title="Dismiss suggestion"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ambientWhisper.tools.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onOpenInkOsTool?.(t.id, content)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white dark:bg-zinc-800 border border-indigo-500/30 text-indigo-500 dark:text-indigo-300 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                      >
                        <span>{t.emoji}</span>
                        <span>{t.shortLabel}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input with /slash Command Autocomplete */}
              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-brand-surface/50 shrink-0 relative">
                {slashMatches.length > 0 && (
                  <div
                    data-testid="slash-command-menu"
                    className="absolute bottom-full left-3 right-3 mb-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden z-30"
                  >
                    <div className="px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 text-[9px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Command className="w-3 h-3 text-brand" />
                        InkOS Slash Commands
                      </span>
                      <span>Click to run</span>
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-48 overflow-y-auto">
                      {slashMatches.map(tool => (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => {
                            setChatInput('');
                            handleSendMessage(tool.slashCommand);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-brand/10 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm">{tool.emoji}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] font-bold text-brand">{tool.slashCommand}</span>
                                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{tool.title}</span>
                              </div>
                              <p className="text-[10px] text-zinc-500 truncate">{tool.description}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-400 shrink-0">
                            {tool.credits === 0 ? 'Free' : `${tool.credits}Cr`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={
                      interfaceMode === 'beginner'
                        ? 'Ask anything or type / for InkOS tools (e.g. /deslop, /dialect)...'
                        : 'Ask Co-Writer or type /deslop, /duet, /audio, /chrono...'
                    }
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs p-3 pr-10 focus:ring-1 focus:ring-brand min-h-[52px] max-h-[100px] resize-none outline-none"
                    rows={2}
                    disabled={isGenerating}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!chatInput.trim() || isGenerating}
                    className="absolute bottom-2 right-2 p-1.5 bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <aside className="w-[380px] border-l border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-brand-surface/40 overflow-hidden shrink-0" data-rightpanel>
      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto bg-zinc-100/30 dark:bg-black/20 shrink-0">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              'px-3 py-3 text-[9px] font-bold uppercase tracking-tight shrink-0 transition-colors whitespace-nowrap',
              currentTab === tab.id
                ? 'text-brand border-b-2 border-brand'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            )}
          >
            {tab.id === 'ai' ? (
              interfaceMode === 'beginner' ? 'Co-Writer 🔥' : 'AI 🔥'
            ) : tab.id === 'neuro' && interfaceMode === 'beginner' ? (
              'Writing Score'
            ) : tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
}

function useTabAI(systemPrompt: string, content: string) {
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const run = useCallback(async (userInstruction: string) => {
    setIsLoading(true);
    setResult('');
    setError('');
    try {
      const res = await fetch('/api/ai-cowriter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentText: content.substring(0, 3000),
          context: systemPrompt,
          mode: 'instruction',
          instruction: userInstruction,
        }),
      });
      if (!res.ok || !res.body) throw new Error('Failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content || parsed.text || parsed.delta || '';
              accumulated += token;
              setResult(accumulated);
            } catch {
              accumulated += data;
              setResult(accumulated);
            }
          }
        }
      }
    } catch {
      setError('Generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [content, systemPrompt]);

  return { result, isLoading, error, run };
}

function ResearchTab({ content }: { content: string }) {
  const [query, setQuery] = useState('');
  const [researchText, setResearchText] = useState('');

  const { isStreaming, activeNode, activeAgent, startStream, error } = useDeerFlowStream({
    onToken: (token) => setResearchText((prev) => prev + token),
  });

  const handleSearch = () => {
    const prompt = query.trim() || 'Find academic citations, sources, and literature for this manuscript.';
    setResearchText('');
    startStream(prompt, 'deep_research', { documentContext: content.slice(0, 1000) });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-brand" />
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
            DeerFlow Deep Research
          </span>
        </div>
        {isStreaming && (
          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-mono font-medium animate-pulse">
            {activeAgent || activeNode || 'Researching...'}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          placeholder="Topic, paper title, or keyword..."
          className="flex-1 px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 outline-none focus:ring-1 focus:ring-brand"
          disabled={isStreaming}
        />
        <button
          onClick={handleSearch}
          disabled={isStreaming}
          className="px-3 py-2 bg-brand text-white text-xs rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-colors flex items-center gap-1"
        >
          {isStreaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!researchText && !isStreaming && (
        <div className="text-center py-6 text-zinc-400">
          <div className="text-2xl mb-2">🔬</div>
          <p className="text-xs">Enter a research question or topic to search academic papers and web sources.</p>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {researchText && (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="bg-white dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3">
            <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {researchText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanTab({ content }: { content: string }) {
  const { result, isLoading, error, run } = useTabAI(
    'You are a writing structure expert. Analyze the provided document and generate a clear, actionable outline or story plan. Use numbered sections with sub-points. If there is existing content, reflect it in the plan and suggest what should come next.',
    content
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand" />
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">Story / Document Plan</span>
        </div>
        <button
          onClick={() => run('Generate a detailed outline and structural plan for this document. Show what exists and what should come next.')}
          disabled={isLoading}
          className="px-3 py-1.5 bg-brand text-white text-xs rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-colors flex items-center gap-1"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {isLoading ? 'Planning…' : 'Generate Plan'}
        </button>
      </div>
      {!result && !isLoading && (
        <div className="text-center py-6 text-zinc-400">
          <div className="text-2xl mb-2">📋</div>
          <p className="text-xs">Click "Generate Plan" to create a structural outline based on your current content.</p>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {result && (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="bg-white dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3">
            <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{result}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CritiqueTab({ content, onApplyFix }: { content: string; onApplyFix?: (fix: string) => void }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <MultiAgentReviewBoard
        chapterContent={content}
        onApplyFix={onApplyFix}
      />
    </div>
  );
}

const INSIGHT_ICONS: Record<InsightType, typeof Lightbulb> = {
  pacing: TrendingUp,
  citation: Quote,
  'empty-section': FileWarning,
  'tone-shift': AlertTriangle,
};

const INSIGHT_COLORS: Record<InsightType, string> = {
  pacing: 'border-brand/40 bg-brand/5 dark:bg-brand/10',
  citation: 'border-brand/40 bg-brand/5 dark:bg-brand/10',
  'empty-section': 'border-destructive/40 bg-destructive/5 dark:bg-destructive/10',
  'tone-shift': 'border-border bg-muted/50',
};

const INSIGHT_ICON_COLORS: Record<InsightType, string> = {
  pacing: 'text-brand',
  citation: 'text-brand',
  'empty-section': 'text-destructive',
  'tone-shift': 'text-muted-foreground',
};

const INSIGHT_TYPE_LABELS: Record<InsightType, string> = {
  pacing: 'Pacing',
  citation: 'Missing Citation',
  'empty-section': 'Empty Section',
  'tone-shift': 'Tone Shift',
};

function InsightsTab({
  insights,
  onJump,
}: {
  insights: Insight[];
  onJump?: (anchor: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
      <div className="flex items-center gap-2 shrink-0">
        <Lightbulb className="w-4 h-4 text-brand" />
        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
          Writing Insights
        </span>
        {insights.length > 0 && (
          <span className="ml-auto text-[9px] font-bold bg-brand text-white rounded-full w-4 h-4 flex items-center justify-center">
            {insights.length}
          </span>
        )}
      </div>

      {insights.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-zinc-400">
          <Lightbulb className="w-8 h-8 mb-3 opacity-30" />
          <p className="text-xs font-medium mb-1">No issues detected</p>
          <p className="text-[11px] opacity-70">
            Insights appear automatically as you write. Analysis runs every 5 seconds.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
          {insights.map(insight => {
            const Icon = INSIGHT_ICONS[insight.type];
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('p-3 rounded-xl border', INSIGHT_COLORS[insight.type])}
              >
                <div className="flex items-start gap-2.5">
                  <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', INSIGHT_ICON_COLORS[insight.type])} />
                  <div className="flex-1 min-w-0">
                    <span className={cn('text-[9px] font-bold uppercase tracking-wider', INSIGHT_ICON_COLORS[insight.type])}>
                      {INSIGHT_TYPE_LABELS[insight.type]}
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                      {insight.message}
                    </p>
                    {insight.anchor && onJump && (
                      <button
                        onClick={() => onJump(insight.anchor!)}
                        className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-brand hover:underline"
                      >
                        Jump to section <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <p className="text-[10px] text-zinc-400 text-center pt-2">Analysis updates every 5 seconds.</p>
        </div>
      )}
    </div>
  );
}
