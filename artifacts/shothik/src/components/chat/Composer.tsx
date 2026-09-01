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
  Flame,
  FileCheck,
  Compass,
  Truck,
  Brain,
  Cpu,
  RefreshCw,
  Plus,
  Database,
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
import { RagKnowledgeVaultModal } from "./RagKnowledgeVaultModal";
import { CourierTrackingModal } from "@/components/common/CourierTrackingModal";
import { AgentMentionOverlay, type AgentOption } from "./AgentMentionOverlay";
import { SlashCommandOverlay, type SlashCommandOption } from "./SlashCommandOverlay";
import { ContextUsageIndicator } from "./ContextUsageIndicator";
import { ConversationIntelligencePanel, type FollowUpSuggestion } from "./ConversationIntelligencePanel";

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

import { PROMPT_PROFILES, type PromptProfile } from "@/lib/chat/prompt-profile-registry";

// ─── Prompt-Level Models (User-Facing UI Profiles) ───────────────────────────

const MODELS = PROMPT_PROFILES.map((p) => ({
  value: p.id,
  label: p.name,
  badge: p.badge,
  desc: p.description,
  recommendedBackend: p.recommendedBackendModel,
}));

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
    const [voiceLangOpen, setVoiceLangOpen] = useState(false);
    const [ollamaInfo, setOllamaInfo] = useState<{
      online: boolean;
      models: string[];
      latencyMs?: number;
    }>({ online: false, models: [] });

    // Dynamic Ollama hardware and model discovery
    useEffect(() => {
      fetch("/api/ollama/status")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            setOllamaInfo({
              online: data.connected ?? false,
              models: data.installedModels || ["deepseek-r1:latest", "deepseek-coder:6.7b", "qwen2.5-coder:32b"],
              latencyMs: data.latencyMs,
            });
          }
        })
        .catch(() => {});
    }, []);

    const [attachMenuOpen, setAttachMenuOpen] = useState(false);
    const [modelMenuOpen, setModelMenuOpen] = useState(false);
    const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
    const [focusMenuOpen, setFocusMenuOpen] = useState(false);
    const [isVaultOpen, setIsVaultOpen] = useState(false);
    const [isTrackingOpen, setIsTrackingOpen] = useState(false);
    const [perplexityFocus, setPerplexityFocus] = useState<PerplexityFocusMode>("all");
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const lastPromptRef = useRef<string>("");

    const [isFocused, setIsFocused] = useState(false);
    const hasContent = textValue.length > 0 || attachments.length > 0 || contextChips.length > 0;
    const isExpanded = isFocused || hasContent;

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
      const maxHeight = 144; // Approx 6 lines
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
        let isFinal = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) isFinal = true;
        }
        if (transcript.trim()) {
          const updated = textValue ? `${textValue} ${transcript}` : transcript;
          if (onChangeProp) onChangeProp(updated);
          else setLocalValue(updated);

          // If speech fragment is final, normalize Banglish commerce terms asynchronously
          if (isFinal) {
            fetch("/api/v1/voice/transcribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: updated, language: voiceLang }),
            })
              .then((r) => (r.ok ? r.json() : null))
              .then((res) => {
                if (res?.normalizedText && res.normalizedText !== updated) {
                  if (onChangeProp) onChangeProp(res.normalizedText);
                  else setLocalValue(res.normalizedText);
                }
              })
              .catch(() => {});
          }
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

      lastPromptRef.current = trimmed;

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

    // Global Escape key dismissals for open dropdown menus
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setToolsMenuOpen(false);
          setFocusMenuOpen(false);
          setModelMenuOpen(false);
          setAttachMenuOpen(false);
        }
      };
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }, []);

    // Global / key focus listener for composer
    useEffect(() => {
      const handleGlobalSlash = (e: KeyboardEvent) => {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (e.key === "/" && activeTag !== "input" && activeTag !== "textarea") {
          e.preventDefault();
          textareaRef.current?.focus();
        }
      };
      window.addEventListener("keydown", handleGlobalSlash);
      return () => window.removeEventListener("keydown", handleGlobalSlash);
    }, [textareaRef]);

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

    const dispatchArtifact = useCallback((tab: string) => {
      if (onAction) {
        onAction({ type: "OPEN_ARTIFACT", tab } as any);
      } else if (onOpenArtifact) {
        onOpenArtifact(tab as any);
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

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (e.clipboardData.files && e.clipboardData.files.length > 0) {
        dispatchAttachFiles(e.clipboardData.files);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        dispatchAttachFiles(e.dataTransfer.files);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        dispatchAttachFiles(e.target.files);
        e.target.value = "";
      }
    };

    const [paletteIndex, setPaletteIndex] = useState(0);

    const isSlashMenuVisible = textValue.startsWith("/") && !textValue.includes(" ");
    const isMentionMenuVisible = textValue.startsWith("@") && !textValue.includes(" ");

    const matchingSlashCommands = [
      { cmd: "/doc", label: "Draft Document / Agreement", desc: "Multi-section legal agreement, PRD, or executive briefing", Icon: FileText, tab: "doc" as const },
      { cmd: "/research", label: "Deep Research", desc: "Comprehensive web & academic investigation", Icon: Search, tab: "research" as const },
      { cmd: "/slides", label: "Slide Studio", desc: "Investor pitch decks & Marp visual slides", Icon: Presentation, tab: "slides" as const },
      { cmd: "/sheet", label: "Financial Model", desc: "Interactive revenue forecasting & spreadsheets", Icon: Table2, tab: "sheet" as const },
      { cmd: "/code", label: "Code Engine", desc: "Fullstack code generation & sandbox runner", Icon: Code2, tab: "code" as const },
      { cmd: "/swarm", label: "Swarm Debate", desc: "3-agent adversarial critique & fact-check", Icon: Zap, tool: "swarm" as const },
      { cmd: "/boimela", label: "BoiMela 3D", desc: "6×9 Royal Demy book formatting & 3D preview", Icon: BookOpen, action: () => { window.location.href = "/writing-studio"; } },
      { cmd: "/grill-me", label: "Grill Me", desc: "Relentless adversarial interview to stress-test your plan", Icon: Flame, action: () => { if (onSend) onSend("Please grill me relentlessly about my plan to find edge cases and hidden assumptions."); else if (onAction) onAction({ type: "SEND_MESSAGE", payload: { text: "Please grill me relentlessly about my plan to find edge cases and hidden assumptions." } }); } },
      { cmd: "/review", label: "Code Review", desc: "Audit code against repository standards and specs", Icon: FileCheck, action: () => { if (onSend) onSend("Please run a thorough code review against documented standards and specifications."); else if (onAction) onAction({ type: "SEND_MESSAGE", payload: { text: "Please run a thorough code review against documented standards and specifications." } }); } },
      { cmd: "/prd", label: "PRD Generator", desc: "Turn raw ideas into structured Product Requirement Documents", Icon: FileText, action: () => { if (onSend) onSend("Please convert my notes into a structured Product Requirement Document (PRD)."); else if (onAction) onAction({ type: "SEND_MESSAGE", payload: { text: "Please convert my notes into a structured Product Requirement Document (PRD)." } }); } },
      { cmd: "/browser", label: "Web Automation", desc: "Autonomous browser subagent & live web interaction", Icon: Compass, tool: "browser" as const },
      { cmd: "/commerce", label: "Commerce & MFS", desc: "Steadfast & Pathao courier logistics and bKash/Nagad", Icon: Truck, action: () => { if (onSend) onSend("Track courier status across Steadfast and Pathao, and calculate bKash/Nagad MFS settlement fees."); else if (onAction) onAction({ type: "SEND_MESSAGE", payload: { text: "Track courier status across Steadfast and Pathao, and calculate bKash/Nagad MFS settlement fees." } }); } },
      { cmd: "/learn", label: "Rule Learning", desc: "Persist custom agent behavior and architectural rules", Icon: Brain, action: () => { if (onSend) onSend("Please analyze our recent work and propose a new persistent rule/skill for future sessions."); else if (onAction) onAction({ type: "SEND_MESSAGE", payload: { text: "Please analyze our recent work and propose a new persistent rule/skill for future sessions." } }); } },
    ].filter((c) => c.cmd.toLowerCase().startsWith(textValue.toLowerCase()));

    const matchingMentions = [
      { tag: "@researcher", name: "Deep Research Specialist", desc: "Grounded web index & academic search", Icon: Search, persona: "researcher" },
      { tag: "@architect", name: "System Architect", desc: "Distributed systems & scalable design", Icon: Cpu, persona: "architect" },
      { tag: "@financial-analyst", name: "Financial Modeler", desc: "DCF valuations, unit economics & runway", Icon: Table2, persona: "financial-analyst" },
      { tag: "@legal-counsel", name: "Legal & Regulatory Counsel", desc: "Contracts, NDAs & compliance policies", Icon: FileText, persona: "legal-counsel" },
      { tag: "@designer", name: "Slide & UI Designer", desc: "Presentations, branding & design systems", Icon: Presentation, persona: "designer" },
      { tag: "@twin", name: "SecondMe Digital Twin", desc: "Autonomous co-founder cognitive persona", Icon: Sparkles, persona: "twin" },
    ].filter((m) => m.tag.toLowerCase().startsWith(textValue.toLowerCase()));

    const activeListLength = isSlashMenuVisible ? matchingSlashCommands.length : isMentionMenuVisible ? matchingMentions.length : 0;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Slash or Mention palette navigation
      if ((isSlashMenuVisible || isMentionMenuVisible) && activeListLength > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setPaletteIndex((prev) => (prev + 1) % activeListLength);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setPaletteIndex((prev) => (prev - 1 + activeListLength) % activeListLength);
          return;
        }
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          if (isSlashMenuVisible && matchingSlashCommands[paletteIndex]) {
            const selected = matchingSlashCommands[paletteIndex];
            if (selected.action) selected.action();
            else if (selected.tab) dispatchArtifact(selected.tab);
            else if (selected.tool) dispatchTool(selected.tool);
            if (onChangeProp) onChangeProp("");
            else setLocalValue("");
            return;
          }
          if (isMentionMenuVisible && matchingMentions[paletteIndex]) {
            const selected = matchingMentions[paletteIndex];
            const updated = `${selected.tag} `;
            if (onChangeProp) onChangeProp(updated);
            else setLocalValue(updated);
            return;
          }
        }
        if (e.key === "Escape") {
          e.preventDefault();
          if (onChangeProp) onChangeProp("");
          else setLocalValue("");
          return;
        }
      }

      // Up-arrow prompt history recall when textarea is empty
      if (e.key === "ArrowUp" && !textValue && lastPromptRef.current) {
        e.preventDefault();
        if (onChangeProp) onChangeProp(lastPromptRef.current);
        else setLocalValue(lastPromptRef.current);
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleTextSubmit();
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

        {/* Outer Composer Container — High Contrast Shothik Surface */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative w-full max-w-3xl mx-auto flex flex-col rounded-2xl border transition-all duration-150 bg-white dark:bg-zinc-900 shadow-sm border-zinc-200 dark:border-zinc-800 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-400/20",
            isDraggingOver ? "border-dashed border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/20" : "border-zinc-200 dark:border-zinc-800"
          )}
        >
          {/* Drag and Drop Active Overlay */}
          {isDraggingOver && (
            <div className="absolute inset-0 z-40 flex items-center justify-center rounded-2xl bg-background/80 backdrop-blur-md text-brand font-semibold text-xs animate-in fade-in pointer-events-none">
              <span>📂 Drop files to attach instantly</span>
            </div>
          )}

          {/* Slash Commands Autocomplete Popup */}
          {isSlashMenuVisible && matchingSlashCommands.length > 0 && (
            <div className="absolute bottom-full left-4 mb-2 z-50 w-80 max-h-72 overflow-y-auto custom-scrollbar rounded-2xl border border-border/80 bg-popover shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-bold flex items-center justify-between">
                <span>Slash Workflows & Skills</span>
                <span className="text-[9px] text-brand font-normal">{matchingSlashCommands.length} skills</span>
              </div>
              <div className="space-y-0.5 mt-0.5">
                {matchingSlashCommands.map((c, idx) => {
                  const Icon = c.Icon;
                  const isSelected = idx === paletteIndex;
                  return (
                    <button
                      key={c.cmd}
                      type="button"
                      onClick={() => {
                        if (c.action) {
                          c.action();
                        } else if (c.tab) {
                          dispatchArtifact(c.tab);
                        } else if (c.tool) {
                          dispatchTool(c.tool);
                        }
                        if (onChangeProp) onChangeProp("");
                        else setLocalValue("");
                      }}
                      className={cn(
                        "flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl text-left transition cursor-pointer",
                        isSelected ? "bg-brand/15 text-brand font-semibold shadow-xs border border-brand/30" : "hover:bg-muted/70 text-foreground"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isSelected ? "text-brand" : "text-muted-foreground")} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold">{c.cmd}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">· {c.label}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{c.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Agent Mentions (@) Autocomplete Popup */}
          {isMentionMenuVisible && matchingMentions.length > 0 && (
            <div className="absolute bottom-full left-4 mb-2 z-50 w-80 max-h-72 overflow-y-auto custom-scrollbar rounded-2xl border border-border/80 bg-popover shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-bold flex items-center justify-between">
                <span>Agent Roles & Personas</span>
                <span className="text-[9px] text-brand font-normal">{matchingMentions.length} agents</span>
              </div>
              <div className="space-y-0.5 mt-0.5">
                {matchingMentions.map((m, idx) => {
                  const Icon = m.Icon;
                  const isSelected = idx === paletteIndex;
                  return (
                    <button
                      key={m.tag}
                      type="button"
                      onClick={() => {
                        const updated = `${m.tag} `;
                        if (onChangeProp) onChangeProp(updated);
                        else setLocalValue(updated);
                      }}
                      className={cn(
                        "flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl text-left transition cursor-pointer",
                        isSelected ? "bg-brand/15 text-brand font-semibold shadow-xs border border-brand/30" : "hover:bg-muted/70 text-foreground"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isSelected ? "text-brand" : "text-muted-foreground")} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold">{m.tag}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">· {m.name}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{m.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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

          {/* ── Live Audio Dictation Waveform Visualizer ── */}
          {isListening && (
            <div className="flex items-center justify-between px-4 py-2 bg-blue-500/10 border-b border-blue-500/20 text-blue-500 text-xs font-mono rounded-t-2xl animate-in fade-in">
              <div className="flex items-center gap-2">
                <Mic className="w-3.5 h-3.5 animate-pulse text-blue-500" />
                <span className="font-semibold">{voiceLang === "bn-BD" ? "কথা শুনছি (বাংলা)..." : "Listening (English)..."}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-5 bg-blue-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]" />
                <span className="w-1 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:450ms]" />
                <button
                  type="button"
                  onClick={stopListening}
                  className="ml-2 px-2 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 text-[10px] font-semibold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* ── Textarea Input Box ── */}
          <div className="px-3.5 pt-3 pb-2">
            <textarea
              ref={textareaRef}
              id="composer-chat-input"
              name="prompt"
              aria-label="Message prompt input"
              value={textValue}
              onChange={(e) => {
                if (onChangeProp) onChangeProp(e.target.value);
                else setLocalValue(e.target.value);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                // Slight delay to allow clicking buttons in the toolbar before it hides
                setTimeout(() => setIsFocused(false), 200);
              }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              disabled={disabled || activeStreaming}
              placeholder={placeholder}
              rows={isExpanded ? 2 : 1}
              className="w-full bg-transparent resize-none outline-none text-base sm:text-sm leading-relaxed text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 custom-scrollbar max-h-36 transition-all duration-200"
            />
          </div>

          {/* ── Bottom Toolbar (Always Visible & Stably Positioned) ── */}
          <div className="flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 border-t border-zinc-100 dark:border-zinc-800/80 mt-0.5 transition-colors duration-200 gap-1.5">
            {/* Left Controls: Attach + Voice Input + Tools Dropdown + Focus Selector */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {/* ➕ Unified Action & Attachment Menu */}
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
                  aria-label="Add attachment or open workspace"
                  title="Attach file or open workspace (+)"
                  className="flex items-center justify-center h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition cursor-pointer"
                >
                  <Plus className={cn("h-4 w-4 transition-transform duration-200", attachMenuOpen && "rotate-45")} />
                </button>

                {attachMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-2 z-50 w-64 max-w-[calc(100vw-24px)] rounded-2xl border border-border/80 bg-popover/95 shadow-2xl p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-left">
                    <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Upload
                    </div>
                    {[
                      { Icon: FileText, label: "Document (.pdf, .docx, .md)", action: () => pdfInputRef.current?.click() },
                      { Icon: Image, label: "Image / Screenshot", action: () => imageInputRef.current?.click() },
                      { Icon: FolderOpen, label: "Project Folder", action: () => folderInputRef.current?.click() },
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
                        className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted/70 rounded-xl transition cursor-pointer"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{label}</span>
                      </button>
                    ))}

                    <div className="px-2.5 pt-2 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-t border-border/50 mt-1">
                      Canvas Workspaces
                    </div>
                    {[
                      { Icon: Presentation, label: "Presentation Slides (16:9)", action: () => dispatchArtifact("slides"), color: "text-indigo-400" },
                      { Icon: Table2, label: "Smart Spreadsheet", action: () => dispatchArtifact("sheet"), color: "text-cyan-400" },
                      { Icon: Search, label: "Deep Research", action: () => dispatchArtifact("research"), color: "text-violet-400" },
                      { Icon: Code2, label: "Code Assistant", action: () => dispatchArtifact("code"), color: "text-emerald-400" },
                      { Icon: BookOpen, label: "বই ও প্রকাশনা (BoiMela)", action: () => dispatchArtifact("boimela"), color: "text-rose-400" },
                      { Icon: Database, label: "RAG Knowledge Vault", action: () => setIsVaultOpen(true), color: "text-cyan-400" },
                      { Icon: Truck, label: "Steadfast Parcel Tracker", action: () => setIsTrackingOpen(true), color: "text-amber-400" },
                    ].map(({ Icon, label, action, color }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          action();
                          setAttachMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-xs text-foreground hover:bg-muted/70 rounded-xl transition cursor-pointer"
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", color)} />
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
                title={isListening ? "Listening... Click to stop voice typing" : "Voice Input (Speech-to-Text)"}
                className={cn(
                  "relative flex items-center justify-center h-8 w-8 rounded-full transition cursor-pointer",
                  isListening
                    ? "bg-blue-500/20 text-blue-500 border border-blue-500/40 shadow-xs ring-2 ring-blue-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {isListening ? (
                  <>
                    <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping opacity-60 pointer-events-none" />
                    <MicOff className="h-4 w-4 text-blue-500 relative z-10" />
                  </>
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>

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
                  className="flex items-center gap-1 h-8 px-1.5 sm:px-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                  title="Select web reasoning & research focus mode"
                >
                  <Globe className="h-3.5 w-3.5 text-brand shrink-0" />
                  <span className="text-[11px] font-medium hidden md:inline">
                    {PERPLEXITY_FOCUS_OPTIONS.find((f) => f.value === perplexityFocus)?.label || "Web & AI"}
                  </span>
                  <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                </button>

                {focusMenuOpen && (
                  <div className="absolute bottom-full left-0 mb-1.5 z-50 w-60 sm:w-64 max-w-[calc(100vw-24px)] max-h-[60vh] overflow-y-auto custom-scrollbar rounded-2xl border border-border/80 bg-popover shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 text-left">
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
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Token / Character Count for Long Documents */}
              {textValue.length > 500 && (
                <span className="hidden md:inline text-[9px] font-mono text-muted-foreground/60 mr-1 select-none" title="Estimated character and token length">
                  {textValue.length.toLocaleString()} chars · ~{Math.round(textValue.length / 4)} tok
                </span>
              )}

              {/* Keyboard Shortcut Hint */}
              <span className="hidden lg:inline text-[9px] font-mono text-muted-foreground/40 mr-0.5 select-none" title="Press Enter to send, Shift+Enter for new line">
                ↵ Send
              </span>

              {/* Model Selector */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setModelMenuOpen((o) => !o);
                    setAttachMenuOpen(false);
                    setToolsMenuOpen(false);
                    setFocusMenuOpen(false);
                  }}
                  disabled={disabled || activeStreaming}
                  className="flex items-center gap-1 h-8 px-1.5 sm:px-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                >
                  <span className="hidden sm:inline">{activeModel.label}</span>
                  <span className="sm:hidden text-xs">⚡</span>
                  <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                </button>

                {modelMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-1.5 z-50 w-60 sm:w-64 max-w-[calc(100vw-24px)] max-h-[60vh] overflow-y-auto custom-scrollbar rounded-2xl border border-border/80 bg-popover shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left">
                    <div className="px-3 py-1.5 border-b border-border/50 text-[10px] font-mono text-muted-foreground font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full", ollamaInfo.online ? "bg-emerald-400 animate-pulse" : "bg-cyan-400")} />
                        {ollamaInfo.online ? "OLLAMA GPU" : "HYBRID MOE"}
                      </span>
                      <span className="text-emerald-400 text-[9px] font-mono">
                        {ollamaInfo.online ? `${ollamaInfo.models.length} Local` : "⚡ Fast"}
                      </span>
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

              {/* Send / Stop / Voice Mode Orb Button (ChatGPT Pattern) */}
              {activeStreaming ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 sm:h-8 sm:w-8 rounded-xl border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10 transition cursor-pointer"
                  onClick={dispatchStop}
                  aria-label="Stop generating"
                >
                  <Square className="h-4 w-4 sm:h-3.5 sm:w-3.5 fill-current" />
                </Button>
              ) : textValue.trim() || attachments.length > 0 ? (
                <Button
                  type="button"
                  size="icon"
                  className="h-8 w-8 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all duration-150 cursor-pointer shadow-2xs font-medium"
                  onClick={handleTextSubmit}
                  disabled={disabled}
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onVoiceOrbClick) onVoiceOrbClick();
                    else dispatchTool("voice");
                  }}
                  disabled={disabled}
                  aria-label="Start Voice Mode"
                  title="Start Realtime Conversational Voice Mode"
                  className="flex items-center justify-center h-8 w-8 rounded-xl bg-muted/60 hover:bg-muted border border-border/60 text-muted-foreground hover:text-foreground transition-all duration-150 cursor-pointer"
                >
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
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

        {/* Knowledge & Logistics Modals */}
        <RagKnowledgeVaultModal
          isOpen={isVaultOpen}
          onClose={() => setIsVaultOpen(false)}
        />
        <CourierTrackingModal
          isOpen={isTrackingOpen}
          onClose={() => setIsTrackingOpen(false)}
        />
      </div>
    );
  }
);

export default Composer;
