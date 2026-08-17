import {
  Paperclip,
  Send,
  Square,
  X,
  Mic,
  MicOff,
  Phone,
  FileText,
  Image,
  FolderOpen,
  Link,
  ChevronDown,
  Globe,
  Zap,
  Rocket,
  Check,
  Sparkles,
  Presentation,
  Table2,
  Code2,
  Search,
  BookOpen,
} from "lucide-react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PerplexityFocusSelector, PERPLEXITY_FOCUS_OPTIONS, type PerplexityFocusMode } from "@/components/perplexity/PerplexityFocusSelector";
import type { ChatPersona } from "@/lib/chat/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContextChip {
  id: string;
  label: string;
  type: 'selection' | 'chapter' | 'character' | 'file';
  preview?: string;
}

export interface ComposerAttachment {
  id: string;
  name: string;
  preview?: string;
  status?: "ready" | "uploading" | "error";
  error?: string;
}

export interface SendPromptPayload {
  text: string;
  attachments?: ComposerAttachment[];
}

export type ComposerAction =
  | { type: "SEND_MESSAGE"; payload: SendPromptPayload }
  | { type: "STOP_STREAM" }
  | { type: "OPEN_TOOL"; tool: "research" | "swarm" | "slides" | "sheet" | "code" | "synthesizer" | "browser" | "voice" }
  | { type: "OPEN_ARTIFACT"; tab: "slides" | "research" | "sheet" | "code" | "synthesizer" }
  | { type: "SET_FOCUS"; focus: PerplexityFocusMode }
  | { type: "SET_MODEL"; model: string }
  | { type: "ATTACH_FILES"; files: FileList | File[] }
  | { type: "REMOVE_ATTACHMENT"; attachmentId: string }
  | { type: "REMOVE_CONTEXT_CHIP"; chipId: string };

export interface ComposerProps {
  value?: string;
  onChange?: (value: string) => void;
  /** Consolidated Deep Module Action Dispatch Seam */
  onAction?: (action: ComposerAction) => void | Promise<void>;
  onSubmit?: () => void;
  onSend?: (text: string) => void | Promise<void>;
  onVoiceClick?: () => void;
  persona?: any;
  onPersonaChange?: (persona: ChatPersona) => void;
  activeSkill?: any;
  onSkillChange?: (skill: any) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  generating?: boolean;
  placeholder?: string;
  modelHandle?: string;
  onModelChange?: (value: string) => void;
  mode?: "cofounder" | "web-search" | "scenario-testing";
  onModeChange?: (mode: "cofounder" | "web-search" | "scenario-testing") => void;
  isOvernight?: boolean;
  onToggleOvernight?: (enabled: boolean) => void;
  footer?: string;
  attachments?: ComposerAttachment[];
  onAttachFiles?: (files: FileList | File[]) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  contextChips?: ContextChip[];
  onRemoveContextChip?: (chipId: string) => void;
  commandHint?: { name: string; description: string } | null;
  errorMessage?: string | null;
  /** Opens artifact dual-pane canvas (slides, research, sheet, code, synthesizer) */
  onOpenArtifact?: (tab: "slides" | "research" | "sheet" | "code" | "synthesizer") => void;
  /** Opens Research artifact panel (when mode = Web Search) */
  onOpenResearchPanel?: () => void;
  /** Opens ChatGPT Advanced Voice Mode Orb */
  onVoiceOrbClick?: () => void;
  /** Opens the full-screen ChatGPT-style voice overlay */
  onOpenVoice?: () => void;
  /** Opens specialized tools */
  onOpenTool?: (tool: "research" | "swarm" | "slides" | "sheet" | "code" | "synthesizer" | "browser" | "voice") => void;
}

// ─── Models ───────────────────────────────────────────────────────────────────

const MODELS = [
  { value: "gemini-3.7-flash",  label: "Gemini 3.7 Flash",  badge: "✨ Default", desc: "Frontier Hybrid Reasoning · High Speed" },
  { value: "deepseek-v4-flash", label: "DeepSeek V4 Flash", badge: "⚡ Fast", desc: "Ultra-low cost MoE · Instant Reasoning" },
  { value: "deepseek-v4-pro",   label: "DeepSeek V4 Pro",   badge: "🧠 Flagship", desc: "1M Context MoE · Deep Reasoning" },
  { value: "gemini-2.5-pro",    label: "Gemini 2.5 Pro",    badge: "🔬 Complex", desc: "Deep Thinking Engine" },
];

// ─── Voice languages for South Asia ──────────────────────────────────────────

const VOICE_LANGS = [
  { code: "bn-BD", label: "বাংলা (BD)" },
  { code: "en-US", label: "English (US)" },
];

export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(
  function Composer(
    {
      value = "",
      onChange: onChangeProp,
      onAction,
      onSubmit,
      onSend,
      onStop,
      disabled = false,
      isStreaming = false,
      generating = false,
      placeholder = "Ask anything, analyze a market, paste a GitHub repo, or start a project…",
      modelHandle = "deepseek-v4-flash",
      onModelChange,
      footer,
      attachments = [],
      onAttachFiles,
      onRemoveAttachment,
      contextChips = [],
      onRemoveContextChip,
      commandHint,
      errorMessage,
      onOpenArtifact,
      onVoiceOrbClick,
      onOpenTool,
    },
    ref,
  ) {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
    const [localValue, setLocalValue] = useState(value);
    const textValue = onChangeProp ? value : localValue;

    const [isListening, setIsListening] = useState(false);
    const [voiceLang, setVoiceLang] = useState("bn-BD");
    const [attachMenuOpen, setAttachMenuOpen] = useState(false);
    const [modelMenuOpen, setModelMenuOpen] = useState(false);
    const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
    const [focusMenuOpen, setFocusMenuOpen] = useState(false);
    const [perplexityFocus, setPerplexityFocus] = useState<PerplexityFocusMode>("all");

    const recognitionRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    const activeStreaming = isStreaming || generating;

    // Auto-resize textarea
    useEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "auto";
      const maxHeight = 200;
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }, [textValue, textareaRef]);

    // Speech-to-text voice dictation setup
    useEffect(() => {
      if (typeof window === "undefined") return;
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          const updated = textValue ? `${textValue} ${transcript}` : transcript;
          if (onChangeProp) onChangeProp(updated);
          else setLocalValue(updated);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;

      return () => {
        try {
          recognition.abort();
        } catch {}
      };
    }, [voiceLang, onChangeProp, textValue]);

    const startListening = useCallback(() => {
      if (!recognitionRef.current) return;
      try {
        recognitionRef.current.lang = voiceLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch {}
    }, [voiceLang]);

    const stopListening = useCallback(() => {
      if (!recognitionRef.current) return;
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch {}
    }, []);

    const handleTextSubmit = useCallback(() => {
      if (activeStreaming || disabled) return;
      const trimmed = textValue.trim();
      if (!trimmed && attachments.length === 0) return;

      if (onAction) {
        onAction({
          type: "SEND_MESSAGE",
          payload: { text: trimmed, attachments },
        });
      } else if (onSend) {
        onSend(trimmed);
      } else if (onSubmit) {
        onSubmit();
      }

      if (onChangeProp) onChangeProp("");
      else setLocalValue("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }, [activeStreaming, disabled, textValue, attachments, onAction, onSend, onSubmit, onChangeProp, textareaRef]);

    const dispatchStop = useCallback(() => {
      if (onAction) {
        onAction({ type: "STOP_STREAM" });
      } else if (onStop) {
        onStop();
      }
    }, [onAction, onStop]);

    const dispatchTool = useCallback((tool: "research" | "swarm" | "slides" | "sheet" | "code" | "synthesizer" | "browser" | "voice") => {
      if (onAction) {
        onAction({ type: "OPEN_TOOL", tool });
      } else if (onOpenTool) {
        onOpenTool(tool);
      }
    }, [onAction, onOpenTool]);

    const dispatchArtifact = useCallback((tab: "slides" | "research" | "sheet" | "code" | "synthesizer") => {
      if (onAction) {
        onAction({ type: "OPEN_ARTIFACT", tab });
      } else if (onOpenArtifact) {
        onOpenArtifact(tab);
      }
    }, [onAction, onOpenArtifact]);

    const dispatchModel = useCallback((model: string) => {
      if (onAction) {
        onAction({ type: "SET_MODEL", model });
      } else if (onModelChange) {
        onModelChange(model);
      }
    }, [onAction, onModelChange]);

    const dispatchFocus = useCallback((focus: PerplexityFocusMode) => {
      setPerplexityFocus(focus);
      if (onAction) {
        onAction({ type: "SET_FOCUS", focus });
      }
    }, [onAction]);

    const dispatchAttachFiles = useCallback((files: FileList | File[]) => {
      if (onAction) {
        onAction({ type: "ATTACH_FILES", files });
      } else if (onAttachFiles) {
        onAttachFiles(files);
      }
    }, [onAction, onAttachFiles]);

    const dispatchRemoveAttachment = useCallback((attachmentId: string) => {
      if (onAction) {
        onAction({ type: "REMOVE_ATTACHMENT", attachmentId });
      } else if (onRemoveAttachment) {
        onRemoveAttachment(attachmentId);
      }
    }, [onAction, onRemoveAttachment]);

    const dispatchRemoveContextChip = useCallback((chipId: string) => {
      if (onAction) {
        onAction({ type: "REMOVE_CONTEXT_CHIP", chipId });
      } else if (onRemoveContextChip) {
        onRemoveContextChip(chipId);
      }
    }, [onAction, onRemoveContextChip]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleTextSubmit();
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        dispatchAttachFiles(e.target.files);
        e.target.value = "";
      }
    };

    const activeModel = MODELS.find((m) => m.value === modelHandle) || MODELS[0];

    return (
      <div className="w-full relative px-4 pb-4">
        {/* Hidden file inputs */}
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
        <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
        <input ref={pdfInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.md" multiple className="hidden" onChange={handleFileChange} />
        <input ref={folderInputRef} type="file" {...({ webkitdirectory: "", directory: "" } as any)} className="hidden" onChange={handleFileChange} />

        {/* Outer Composer Container */}
        <div className="w-full max-w-3xl mx-auto flex flex-col rounded-2xl border border-border/80 bg-card/90 shadow-xl backdrop-blur-xl transition-all duration-200 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/10">
          {/* ── Context Chips (if any) ── */}
          {contextChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-3.5 pt-3 pb-1 border-b border-border/30">
              {contextChips.map((chip) => (
                <div
                  key={chip.id}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground/80 border border-border/60"
                >
                  <span className="truncate max-w-[180px]">{chip.label}</span>
                  {(onAction || onRemoveContextChip) && (
                    <button
                      type="button"
                      onClick={() => dispatchRemoveContextChip(chip.id)}
                      className="hover:text-destructive transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Attachment Previews ── */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3.5 pt-3 pb-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="relative group flex items-center gap-2 p-1.5 pr-2 rounded-xl bg-muted/60 border border-border text-xs"
                >
                  {att.preview ? (
                    <img src={att.preview} alt={att.name} className="h-8 w-8 object-cover rounded-lg" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground ml-1" />
                  )}
                  <span className="max-w-[120px] truncate text-[11px] font-medium">{att.name}</span>
                  {(onAction || onRemoveAttachment) && (
                    <button
                      type="button"
                      onClick={() => dispatchRemoveAttachment(att.id)}
                      className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Textarea Input Box ── */}
          <div className="px-3.5 pt-3 pb-2">
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={(e) => {
                if (onChangeProp) onChangeProp(e.target.value);
                else setLocalValue(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              disabled={disabled || activeStreaming}
              placeholder={placeholder}
              rows={2}
              className="w-full bg-transparent resize-none outline-none text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 custom-scrollbar max-h-48"
            />
          </div>

          {/* ── Bottom Toolbar ── */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border/40 mt-1">
            {/* Left Controls: Attach + Voice Input + Tools Dropdown + Focus Selector */}
            <div className="flex items-center gap-1.5">
              {/* 📎 Attach Button & Dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setAttachMenuOpen((o) => !o);
                    setToolsMenuOpen(false);
                    setModelMenuOpen(false);
                    setFocusMenuOpen(false);
                  }}
                  disabled={disabled || activeStreaming}
                  aria-label="Attach files"
                  className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                {attachMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-1.5 z-50 w-48 rounded-xl border border-border/80 bg-popover shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150">
                    {[
                      { Icon: FileText, label: "Document (.pdf, .docx, .md)", action: () => pdfInputRef.current?.click() },
                      { Icon: Image, label: "Image / Screenshot", action: () => imageInputRef.current?.click() },
                      { Icon: FolderOpen, label: "Local Project Folder", action: () => folderInputRef.current?.click() },
                      {
                        Icon: Link,
                        label: "URL / GitHub Link",
                        action: () => {
                          const url = window.prompt("Paste a URL or GitHub repository:");
                          if (url?.trim()) {
                            const updated = textValue ? `${textValue}\n${url.trim()}` : url.trim();
                            if (onChangeProp) onChangeProp(updated);
                            else setLocalValue(updated);
                          }
                        },
                      },
                    ].map(({ Icon, label, action }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          action();
                          setAttachMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted/70 transition cursor-pointer"
                      >
                        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 🎤 Voice Input (Dictation) */}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={disabled || activeStreaming}
                aria-label={isListening ? "Stop voice dictation" : "Start voice dictation"}
                title={isListening ? "Stop voice typing" : "Voice Input (Speech-to-Text)"}
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-lg transition cursor-pointer",
                  isListening
                    ? "bg-rose-500 text-white animate-pulse shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              {/* 🧰 Tools Menu (Unified Launcher for Advanced Workflows) */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setToolsMenuOpen((o) => !o);
                    setAttachMenuOpen(false);
                    setModelMenuOpen(false);
                    setFocusMenuOpen(false);
                  }}
                  disabled={disabled || activeStreaming}
                  className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border/70 bg-muted/40 hover:bg-muted/70 text-xs font-semibold text-foreground/90 transition cursor-pointer"
                  title="Open advanced multi-agent workflows"
                >
                  <Sparkles className="h-3.5 w-3.5 text-brand" />
                  <span>Tools</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {toolsMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-1.5 z-50 w-72 rounded-2xl border border-border/80 bg-popover shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150 text-left">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                      Advanced Workflows
                    </div>

                    {/* Research Section */}
                    <div className="mt-1 space-y-0.5">
                      <div className="px-2 pt-1 pb-0.5 text-[10px] font-semibold text-brand uppercase tracking-wider">
                        Research
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          dispatchArtifact("research");
                          setToolsMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted/70 transition cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground block">Deep Research</span>
                          <span className="text-[10px] text-muted-foreground truncate block">Multi-source web & academic intelligence</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          dispatchTool("swarm");
                          setToolsMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted/70 transition cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground block">Swarm Debate</span>
                          <span className="text-[10px] text-muted-foreground truncate block">3-agent adversarial debate & critique</span>
                        </div>
                      </button>
                    </div>

                    {/* Create Section */}
                    <div className="mt-2 space-y-0.5 border-t border-border/40 pt-1">
                      <div className="px-2 pt-1 pb-0.5 text-[10px] font-semibold text-brand uppercase tracking-wider">
                        Create
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          dispatchArtifact("slides");
                          setToolsMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted/70 transition cursor-pointer"
                      >
                        <Presentation className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground block">Slide Studio</span>
                          <span className="text-[10px] text-muted-foreground truncate block">Investor pitch decks & visual slides</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          dispatchArtifact("sheet");
                          setToolsMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted/70 transition cursor-pointer"
                      >
                        <Table2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground block">Financial Model</span>
                          <span className="text-[10px] text-muted-foreground truncate block">Spreadsheet models & scenario forecasting</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          dispatchArtifact("code");
                          setToolsMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted/70 transition cursor-pointer"
                      >
                        <Code2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground block">Code Engine</span>
                          <span className="text-[10px] text-muted-foreground truncate block">Fullstack engineering & sandbox runner</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = "/writing-studio";
                          setToolsMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted/70 transition cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground block">BoiMela 3D Studio</span>
                          <span className="text-[10px] text-muted-foreground truncate block">6×9 Royal Demy book formatting & 3D flip</span>
                        </div>
                      </button>
                    </div>

                    {/* Web & Voice Section */}
                    <div className="mt-2 space-y-0.5 border-t border-border/40 pt-1">
                      <div className="px-2 pt-1 pb-0.5 text-[10px] font-semibold text-brand uppercase tracking-wider">
                        Automation & Perception
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          dispatchTool("browser");
                          setToolsMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted/70 transition cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground block">Web Automation</span>
                          <span className="text-[10px] text-muted-foreground truncate block">Autonomous browser form filling & actions</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onVoiceOrbClick) onVoiceOrbClick();
                          else dispatchTool("voice");
                          setToolsMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs hover:bg-muted/70 transition cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground block">Voice Mode</span>
                          <span className="text-[10px] text-muted-foreground truncate block">Realtime conversational voice session</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 🌐 Focus Mode Selector (Clean Bottom Toolbar Dropdown) */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setFocusMenuOpen((o) => !o);
                    setToolsMenuOpen(false);
                    setAttachMenuOpen(false);
                    setModelMenuOpen(false);
                  }}
                  disabled={disabled || activeStreaming}
                  className="flex items-center gap-1 h-8 px-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                  title="Select web reasoning & research focus mode"
                >
                  <Globe className="h-3.5 w-3.5 text-brand" />
                  <span className="text-[11px] font-medium hidden md:inline">
                    {PERPLEXITY_FOCUS_OPTIONS.find((f) => f.value === perplexityFocus)?.label || "Web & AI"}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {focusMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-1.5 z-50 w-64 rounded-2xl border border-border/80 bg-popover shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 text-left">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                      Reasoning Focus Mode
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {PERPLEXITY_FOCUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setPerplexityFocus(option.value);
                            setFocusMenuOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-start gap-2 px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer text-left",
                            perplexityFocus === option.value
                              ? "bg-brand/15 text-brand font-semibold"
                              : "hover:bg-muted/70 text-foreground"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="block">{option.label}</span>
                            <span className="text-[10px] text-muted-foreground block truncate">{option.description}</span>
                          </div>
                          {perplexityFocus === option.value && <Check className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Controls: Model Selector + Send/Stop Button */}
            <div className="flex items-center gap-2">
              {/* Model Selector */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setModelMenuOpen((o) => !o);
                    setAttachMenuOpen(false);
                    setToolsMenuOpen(false);
                  }}
                  disabled={disabled || activeStreaming}
                  className="flex items-center gap-1 h-8 px-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                >
                  <span className="hidden sm:inline">{activeModel.label}</span>
                  <span className="sm:hidden">Model</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {modelMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-1.5 z-50 w-64 rounded-2xl border border-border/80 bg-popover shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left">
                    <div className="px-3 py-1 border-b border-border/50 text-[10px] font-mono text-muted-foreground font-semibold flex items-center justify-between">
                      <span>REASONING ENGINE</span>
                      <span className="text-emerald-400">⚡ 1.8¢/job</span>
                    </div>
                    {MODELS.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => {
                          dispatchModel(m.value);
                          setModelMenuOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-start justify-between px-3 py-2 text-left hover:bg-muted/70 transition cursor-pointer",
                          modelHandle === m.value ? "bg-muted/40" : ""
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground">{m.label}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                              {m.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{m.desc}</p>
                        </div>
                        {modelHandle === m.value && <Check className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Send / Stop Button */}
              {activeStreaming ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10 transition"
                  onClick={dispatchStop}
                  aria-label="Stop generating"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-xl transition-all duration-150",
                    textValue.trim() || attachments.length > 0
                      ? "bg-brand text-white hover:bg-brand/90 shadow-md shadow-brand/25 scale-100 hover:scale-105 cursor-pointer"
                      : "bg-muted/40 text-muted-foreground/40 cursor-not-allowed"
                  )}
                  onClick={handleTextSubmit}
                  disabled={disabled || (!textValue.trim() && attachments.length === 0)}
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Dictation Banner */}
        {isListening && (
          <div className="max-w-3xl mx-auto mt-2 flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-400 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>
                Listening in <strong>{VOICE_LANGS.find((l) => l.code === voiceLang)?.label}</strong> — speak freely…
              </span>
            </div>
            <button
              onClick={() => setVoiceLang(voiceLang === "bn-BD" ? "en-US" : "bn-BD")}
              className="text-[10px] font-mono font-bold bg-rose-500/20 px-2 py-0.5 rounded text-rose-300 hover:bg-rose-500/30 transition cursor-pointer"
            >
              Switch to {voiceLang === "bn-BD" ? "English" : "বাংলা"}
            </button>
          </div>
        )}

        {/* Command hint */}
        {commandHint && (
          <div className="max-w-3xl mx-auto mt-2 flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2 text-xs text-foreground">
            <span className="rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand">/{commandHint.name}</span>
            <span>{commandHint.description}</span>
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <div
            role="alert"
            className="max-w-3xl mx-auto mt-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
          >
            {errorMessage}
          </div>
        )}

        {footer && <p className="text-center text-[10px] text-muted-foreground/70 mt-1">{footer}</p>}
      </div>
    );
  }
);

export default Composer;
