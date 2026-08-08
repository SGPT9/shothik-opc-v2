

import { useState, useMemo } from "react";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit3, 
  Globe, 
  Table, 
  Presentation, 
  BookOpen, 
  Clock, 
  MoreVertical,
  ChevronRight,
  Sparkles
} from "lucide-react";
export interface ChatSidebarItem {
  _id: string;
  title: string;
  _creationTime?: number;
  updatedAt?: number;
  pinned?: boolean;
  modelHandle?: string;
  lastMessageSnippet?: string;
  messageCount?: number;
}

export interface ChatSidebarProps {
  conversations: ChatSidebarItem[];
  activeConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onDeleteConversation?: (id: string) => void;
  onPinConversation?: (id: string, pinned: boolean) => void;
  onOpenParallelSpace?: () => void;
  onOpenDataSheet?: () => void;
  onOpenSlideDeck?: () => void;
  onOpenWritingStudio?: () => void;
  /** Called before switching conversation so the caller can abort any in-flight stream. */
  onAbortStream?: () => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onPinConversation,
  onOpenParallelSpace,
  onOpenDataSheet,
  onOpenSlideDeck,
  onOpenWritingStudio,
  onAbortStream,
}: ChatSidebarProps) {
  // Wrapped handlers that abort any in-flight stream before navigating
  const handleSelectConversation = (id: string) => {
    onAbortStream?.();
    onSelectConversation(id);
  };
  const handleNewChat = () => {
    onAbortStream?.();
    onNewChat();
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [isWritingSuiteOpen, setIsWritingSuiteOpen] = useState(false);

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase().trim();
    return conversations.filter(c => c.title.toLowerCase().includes(query));
  }, [conversations, searchQuery]);

  // Group conversations by date (Today, Yesterday, Previous 7 Days, Older)
  const groupedConversations = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const today: ChatSidebarItem[] = [];
    const yesterday: ChatSidebarItem[] = [];
    const past7Days: ChatSidebarItem[] = [];
    const older: ChatSidebarItem[] = [];

    filteredConversations.forEach(chat => {
      const updatedAt = chat.updatedAt || chat._creationTime || now;
      const diffDays = (now - updatedAt) / oneDayMs;

      if (diffDays < 1) today.push(chat);
      else if (diffDays < 2) yesterday.push(chat);
      else if (diffDays < 7) past7Days.push(chat);
      else older.push(chat);
    });

    return { today, yesterday, past7Days, older };
  }, [filteredConversations]);

  return (
    <div className="flex flex-col h-full w-64 sm:w-72 bg-slate-950 border-r border-slate-800 text-slate-100 font-sans transition-all duration-300 select-none">
      
      {/* Header & New Chat Button */}
      <div className="p-3 border-b border-slate-800 space-y-2">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-md shadow-emerald-950/50 transition group"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Chat Session</span>
          </span>
          <Sparkles className="w-3.5 h-3.5 opacity-80" />
        </button>

        {/* Twin AI Cofounder Direct Link */}
        <a
          href="/twin"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-brand/10 hover:bg-brand/20 border border-brand/30 text-brand text-xs font-semibold transition no-underline shadow-sm"
        >
          <span className="flex items-center gap-2">
            <span>🏢 Twin AI Cofounder</span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-brand" />
        </a>

        {/* Quick Search Bar */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-500 font-mono"
          />
        </div>
      </div>

      {/* Grouped Session List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        
        {/* Helper Group Renderer */}
        {renderGroup("Today", groupedConversations.today)}
        {renderGroup("Yesterday", groupedConversations.yesterday)}
        {renderGroup("Previous 7 Days", groupedConversations.past7Days)}
        {renderGroup("Older", groupedConversations.older)}

        {filteredConversations.length === 0 && (
          <div className="text-center py-8 px-4 text-slate-500 text-xs">
            No chat sessions found
          </div>
        )}
      </div>

      {/* Quick Agentic Workspace Shortcuts Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-1 text-xs">
        <span className="text-[10px] font-mono text-slate-500 uppercase px-2 font-semibold">Agent Workspaces</span>

        {onOpenParallelSpace && (
          <button
            onClick={onOpenParallelSpace}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Parallel Web Space</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
          </button>
        )}

        {onOpenDataSheet && (
          <button
            onClick={onOpenDataSheet}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          >
            <span className="flex items-center gap-2">
              <Table className="w-3.5 h-3.5 text-indigo-400" />
              <span>Data Sheet Canvas</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
          </button>
        )}

        {onOpenSlideDeck && (
          <button
            onClick={onOpenSlideDeck}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
          >
            <span className="flex items-center gap-2">
              <Presentation className="w-3.5 h-3.5 text-rose-400" />
              <span>Slide Generator</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
          </button>
        )}

        {/* Collapsible Writing Suite (8 Tools) */}
        <div className="space-y-1">
          <button
            onClick={() => setIsWritingSuiteOpen(!isWritingSuiteOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-200">Writing Suite</span>
            </span>
            <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${isWritingSuiteOpen ? "rotate-90" : ""}`} />
          </button>
          
          {isWritingSuiteOpen && (
            <div className="pl-6 space-y-1 text-[11px] text-slate-400 border-l border-slate-800 ml-3 py-1">
              <a href="/writing-studio" className="block py-0.5 hover:text-cyan-300 transition">✍️ Paraphraser</a>
              <a href="/writing-studio?tool=grammar" className="block py-0.5 hover:text-cyan-300 transition">📝 Grammar Fixer</a>
              <a href="/ai-detector" className="block py-0.5 hover:text-cyan-300 transition">🤖 AI Detector</a>
              <a href="/ai-detector?mode=humanize" className="block py-0.5 hover:text-cyan-300 transition">👤 Humanize GPT</a>
              <a href="/plagiarism-checker" className="block py-0.5 hover:text-cyan-300 transition">🔍 Plagiarism Checker</a>
              <a href="/writing-studio?tool=summarizer" className="block py-0.5 hover:text-cyan-300 transition">📑 Text Summarizer</a>
              <a href="/writing-studio?tool=translator" className="block py-0.5 hover:text-cyan-300 transition">🌐 Translator</a>
              <a href="/plagiarism-checker?mode=citations" className="block py-0.5 hover:text-cyan-300 transition">📚 Citation Generator</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function renderGroup(title: string, list: ChatSidebarItem[]) {
    if (list.length === 0) return null;
    return (
      <div className="space-y-1">
        <div className="px-2 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
          {title} ({list.length})
        </div>
        <div className="space-y-0.5">
          {list.map(chat => {
            const isActive = activeConversationId === String(chat._id);
            const isHovered = hoveredChatId === String(chat._id);

            return (
              <div
                key={String(chat._id)}
                onMouseEnter={() => setHoveredChatId(String(chat._id))}
                onMouseLeave={() => setHoveredChatId(null)}
                className="relative group"
              >
                <button
                  onClick={() => handleSelectConversation(String(chat._id))}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition ${
                    isActive
                      ? "bg-slate-800/90 text-white font-medium shadow-sm border border-slate-700/60"
                      : "text-slate-300 hover:bg-slate-900 hover:text-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                    <span className="truncate">{chat.title || "Untitled Chat"}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {chat.pinned && (
                      <Pin className="w-3 h-3 text-amber-400 shrink-0 ml-1" />
                    )}
                    {isHovered && onDeleteConversation && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(String(chat._id));
                        }}
                        className="p-1 hover:text-rose-400 text-slate-500 transition cursor-pointer"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </button>

                {/* Hover Preview Card */}
                {isHovered && (
                  <div className="absolute left-full top-0 ml-2 z-50 w-56 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl space-y-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-[11px] font-semibold text-slate-200 truncate">{chat.title}</span>
                      <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800">
                        {chat.modelHandle || "Hermes 3"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {chat.lastMessageSnippet || "No preview text available..."}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1 border-t border-slate-800/50">
                      <span>{chat.messageCount || 1} messages</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> Active
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
