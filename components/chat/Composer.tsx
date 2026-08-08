"use client";

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
  Moon,
  Globe,
  FlaskConical,
  Rocket,
  Check,
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
import { ChatPersona } from "@/lib/chat/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComposerAttachment {
  id: string;
  name: string;
  preview?: string;
  status?: "ready" | "uploading" | "error";
  error?: string;
}

export interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  generating?: boolean;
  placeholder?: string;
  modelHandle?: string;
  onModelChange?: (value: string) => void;
  persona?: ChatPersona;
  onPersonaChange?: (persona: ChatPersona) => void;
  isOvernight?: boolean;
  onToggleOvernight?: (enabled: boolean) => void;
  activeSkill?: string;
  onSkillChange?: (skill: string) => void;
  footer?: string;
  attachments?: ComposerAttachment[];
  onAttachFiles?: (files: FileList | File[]) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  commandHint?: { name: string; description: string } | null;
  errorMessage?: string | null;
  /** Opens Research artifact panel (when mode = Web Search) */
  onOpenResearchPanel?: () => void;
  /** Opens the full-screen ChatGPT-style voice overlay */
  onOpenVoice?: () => void;
}

// ─── Mode config ─────────────────────────────────────────────────────────────

const MODES: {
  value: ChatPersona;
  label: string;
  shortLabel: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  description: string;
}[] = [
  {
    value: "cofounder",
    label: "Cofounder",
    shortLabel: "Cofounder",
    Icon: Rocket,
    color: "text-brand",
    bg: "bg-brand/10",
    border: "border-brand/30",
    description: "Strategic AI cofounder & builder",
  },
  {
    value: "coresearcher",
    label: "Web Search",
    shortLabel: "Search",
    Icon: Globe,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    description: "Grounded in live web results",
  },
  {
    value: "coworker",
    label: "ScenarioLab",
    shortLabel: "Scenario",
    Icon: FlaskConical,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    description: "Stress-test & adversarial thinking",
  },
];

// ─── Models ───────────────────────────────────────────────────────────────────

const MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-pro",   label: "Gemini 2.5 Pro"   },
];

// ─── Voice languages for South Asia ──────────────────────────────────────────

const VOICE_LANGS = [
  { code: "bn-BD", label: "বাংলা (BD)" },
  { code: "en-US", label: "English" },
  { code: "ur-PK", label: "اردو" },
  { code: "hi-IN", label: "हिन्दी" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(
  function Composer(
    {
      value,
      onChange,
      onSubmit,
      onStop,
      disabled,
      isStreaming,
      generating,
      placeholder,
      modelHandle = "gemini-2.5-flash",
      onModelChange,
      persona = "cofounder",
      onPersonaChange,
      isOvernight = false,
      onToggleOvernight,
      activeSkill = "general",
      onSkillChange,
      footer,
      attachments = [],
      onAttachFiles,
      onRemoveAttachment,
      commandHint,
      errorMessage,
      onOpenResearchPanel,
      onOpenVoice,
    }: ComposerProps,
    ref,
  ) {
    const textareaRef    = useRef<HTMLTextAreaElement>(null);
    const pdfInputRef    = useRef<HTMLInputElement>(null);
    const imageInputRef  = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    const [attachMenuOpen, setAttachMenuOpen] = useState(false);
    const [modeMenuOpen,   setModeMenuOpen]   = useState(false);
    const [modelMenuOpen,  setModelMenuOpen]  = useState(false);
    const [isListening,    setIsListening]    = useState(false);
    const [voiceLang,      setVoiceLang]      = useState("bn-BD");
    const [voiceLangOpen,  setVoiceLangOpen]  = useState(false);

    const recognitionRef = useRef<any>(null);
    const activeStreaming = isStreaming ?? generating ?? false;

    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement, []);

    // Auto-resize textarea
    useEffect(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }, [value]);

    // Close menus on outside click
    useEffect(() => {
      const handler = () => {
        setAttachMenuOpen(false);
        setModeMenuOpen(false);
        setModelMenuOpen(false);
        setVoiceLangOpen(false);
      };
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }, []);

    // ── Voice dictation ──────────────────────────────────────────────────────

    const startListening = useCallback(() => {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Voice input is not supported in this browser. Try Chrome or Edge.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      let finalTranscript = "";

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interim = transcript;
          }
        }
        onChange(value + finalTranscript + interim);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    }, [voiceLang, value, onChange]);

    const stopListening = useCallback(() => {
      recognitionRef.current?.stop();
      setIsListening(false);
    }, []);

    // ── Mode change with panel trigger ───────────────────────────────────────

    const handleModeChange = (mode: ChatPersona) => {
      onPersonaChange?.(mode);
      setModeMenuOpen(false);
      if (mode === "coresearcher") {
        onOpenResearchPanel?.();
      }
    };

    const activeMode = MODES.find((m) => m.value === persona) ?? MODES[0];
    const activeModel = MODELS.find((m) => m.value === modelHandle) ?? MODELS[0];

    return (
      <div className="border-t bg-background px-4 pt-3 pb-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">

          {/* ── Main input container ── */}
          <div className="flex flex-col rounded-3xl border border-border/80 bg-muted/10 px-4 pt-3 pb-2 transition-all focus-within:border-brand/40 focus-within:ring-1 focus-within:ring-brand/20">

            {/* Hidden file inputs */}
            <input ref={pdfInputRef} type="file" multiple className="hidden"
              accept=".pdf,.txt,.md,.doc,.docx,application/pdf,text/plain,text/markdown"
              onChange={(e) => { if (e.target.files?.length) onAttachFiles?.(e.target.files); e.target.value = ""; }} />
            <input ref={imageInputRef} type="file" multiple className="hidden"
              accept="image/*"
              onChange={(e) => { if (e.target.files?.length) onAttachFiles?.(e.target.files); e.target.value = ""; }} />
            <input ref={folderInputRef} type="file" multiple className="hidden"
              {...({ webkitdirectory: "" } as any)}
              onChange={(e) => { if (e.target.files?.length) onAttachFiles?.(e.target.files); e.target.value = ""; }} />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); }
              }}
              placeholder={placeholder ?? "Ask anything — strategy, research, code, slides…"}
              disabled={disabled}
              className="min-h-[52px] max-h-40 w-full resize-none border-0 bg-transparent text-sm shadow-none outline-none placeholder:text-muted-foreground/60 focus:ring-0"
            />

            {/* Attachment pills */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                {attachments.map((att) => (
                  <div key={att.id}
                    className={cn(
                      "flex max-w-[180px] items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[11px] shadow-sm",
                      att.status === "error"
                        ? "border-destructive/40 bg-destructive/5 text-destructive"
                        : "border-border/60 bg-background/80 text-foreground",
                    )}>
                    <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{att.name}</span>
                    {onRemoveAttachment && (
                      <button type="button" onClick={() => onRemoveAttachment(att.id)}
                        className="ml-0.5 text-muted-foreground hover:text-foreground transition rounded-full p-0.5 hover:bg-muted/80"
                        aria-label={`Remove ${att.name}`}>
                        <X className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Bottom toolbar ── */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/30">

              {/* LEFT group */}
              <div className="flex items-center gap-1 flex-1 flex-wrap">

                {/* 📎 Attach dropdown */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button type="button"
                    onClick={() => { setAttachMenuOpen((o) => !o); setModeMenuOpen(false); setModelMenuOpen(false); }}
                    disabled={disabled || activeStreaming}
                    aria-label="Attach files"
                    className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition border border-transparent hover:border-border/60">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Attach</span>
                    <ChevronDown className="h-2.5 w-2.5 opacity-60" />
                  </button>

                  {attachMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-1 z-50 w-44 rounded-2xl border border-border/80 bg-popover shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150">
                      {[
                        { Icon: FileText, label: "PDF / Document", action: () => pdfInputRef.current?.click()   },
                        { Icon: Image,    label: "Image / Photo",  action: () => imageInputRef.current?.click()  },
                        { Icon: FolderOpen, label: "Folder",       action: () => folderInputRef.current?.click() },
                        { Icon: Link,     label: "URL / Link",     action: () => {
                            const url = window.prompt("Paste a URL:");
                            if (url?.trim()) onChange(value + `\n${url.trim()}`);
                          }},
                      ].map(({ Icon, label, action }) => (
                        <button key={label} type="button"
                          onClick={() => { action(); setAttachMenuOpen(false); }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-muted/60 transition">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 🎤 Voice dictation */}
                <div className="relative flex items-center" onClick={(e) => e.stopPropagation()}>
                  <button type="button"
                    onClick={isListening ? stopListening : startListening}
                    disabled={disabled || activeStreaming}
                    aria-label={isListening ? "Stop voice input" : "Start voice input"}
                    className={cn(
                      "flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium transition border",
                      isListening
                        ? "bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border-transparent hover:border-border/60",
                    )}>
                    {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{isListening ? "Stop" : "Voice"}</span>
                  </button>

                  {/* Language selector — tiny pill next to mic */}
                  <button type="button"
                    onClick={() => { setVoiceLangOpen((o) => !o); setAttachMenuOpen(false); }}
                    className="flex items-center h-5 px-1.5 rounded-md text-[9px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted/60 transition ml-0.5">
                    {VOICE_LANGS.find(l => l.code === voiceLang)?.code.split("-")[0].toUpperCase() ?? "EN"}
                    <ChevronDown className="h-2 w-2 ml-0.5 opacity-60" />
                  </button>

                  {voiceLangOpen && (
                    <div className="absolute bottom-full left-0 mb-1 z-50 w-36 rounded-2xl border border-border/80 bg-popover shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150">
                      {VOICE_LANGS.map((l) => (
                        <button key={l.code} type="button"
                          onClick={() => { setVoiceLang(l.code); setVoiceLangOpen(false); }}
                          className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-foreground hover:bg-muted/60 transition">
                          <span>{l.label}</span>
                          {voiceLang === l.code && <Check className="h-3 w-3 text-brand" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 📞 Advanced Voice (ChatGPT-style full overlay) */}
                {onOpenVoice && (
                  <button type="button"
                    onClick={onOpenVoice}
                    disabled={disabled || activeStreaming}
                    aria-label="Open voice mode"
                    className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition border border-transparent hover:border-emerald-500/30">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Voice</span>
                  </button>
                )}

                {/* 🌙 Tonight Engine */}
                {onToggleOvernight && (
                  <button type="button"
                    onClick={() => onToggleOvernight(!isOvernight)}
                    className={cn(
                      "flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium transition border",
                      isOvernight
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm"
                        : "text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/60 hover:border-border/60",
                    )}>
                    <Moon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Tonight</span>
                  </button>
                )}
              </div>

              {/* CENTER: Mode badge */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button type="button"
                  onClick={() => { setModeMenuOpen((o) => !o); setAttachMenuOpen(false); setModelMenuOpen(false); }}
                  disabled={disabled || activeStreaming}
                  className={cn(
                    "flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-semibold transition border shadow-sm",
                    activeMode.bg, activeMode.color, activeMode.border,
                  )}>
                  <activeMode.Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{activeMode.shortLabel}</span>
                  <ChevronDown className="h-2.5 w-2.5 opacity-60" />
                </button>

                {modeMenuOpen && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 w-56 rounded-2xl border border-border/80 bg-popover shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150">
                    {MODES.map((m) => (
                      <button key={m.value} type="button"
                        onClick={() => handleModeChange(m.value)}
                        className={cn(
                          "flex w-full items-start gap-3 px-3 py-2.5 text-left transition hover:bg-muted/60",
                          persona === m.value ? "bg-muted/40" : "",
                        )}>
                        <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg", m.bg)}>
                          <m.Icon className={cn("h-3.5 w-3.5", m.color)} />
                        </div>
                        <div>
                          <p className={cn("text-xs font-semibold", persona === m.value ? m.color : "text-foreground")}>
                            {m.label}
                            {persona === m.value && <Check className="inline h-3 w-3 ml-1.5 opacity-70" />}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{m.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: Model + Send */}
              <div className="flex items-center gap-1.5">

                {/* Model selector */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button type="button"
                    onClick={() => { setModelMenuOpen((o) => !o); setAttachMenuOpen(false); setModeMenuOpen(false); }}
                    disabled={disabled || activeStreaming}
                    className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition border border-transparent hover:border-border/60">
                    <span className="hidden md:inline">{activeModel.label}</span>
                    <span className="md:hidden">Model</span>
                    <ChevronDown className="h-2.5 w-2.5 opacity-60" />
                  </button>

                  {modelMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-1 z-50 w-44 rounded-2xl border border-border/80 bg-popover shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150">
                      {MODELS.map((m) => (
                        <button key={m.value} type="button"
                          onClick={() => { onModelChange?.(m.value); setModelMenuOpen(false); }}
                          className="flex w-full items-center justify-between px-3 py-2 text-xs text-foreground hover:bg-muted/60 transition">
                          <span>{m.label}</span>
                          {modelHandle === m.value && <Check className="h-3 w-3 text-brand" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send / Stop */}
                {activeStreaming ? (
                  <Button type="button" variant="outline" size="icon"
                    className="h-8 w-8 rounded-xl border-border/80 hover:bg-muted transition"
                    onClick={onStop} aria-label="Stop generating">
                    <Square className="h-3.5 w-3.5 fill-foreground text-foreground" />
                  </Button>
                ) : (
                  <Button type="button" size="icon"
                    className={cn(
                      "h-8 w-8 rounded-xl transition shadow-sm",
                      value.trim()
                        ? "bg-brand text-white hover:bg-brand/90"
                        : "bg-muted/50 text-muted-foreground cursor-not-allowed",
                    )}
                    onClick={onSubmit}
                    disabled={disabled || !value.trim()}
                    aria-label="Send message">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Voice listening indicator */}
          {isListening && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-400 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1 rounded-full bg-rose-400 animate-bounce"
                    style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <span>Listening in <strong>{VOICE_LANGS.find(l => l.code === voiceLang)?.label}</strong> — speak now</span>
            </div>
          )}

          {/* Command hint */}
          {commandHint && (
            <div className="flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2 text-xs text-foreground animate-in fade-in slide-in-from-bottom-1 duration-200">
              <span className="rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand">/{commandHint.name}</span>
              <span>{commandHint.description}</span>
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <div role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive animate-in fade-in slide-in-from-bottom-1 duration-200">
              {errorMessage}
            </div>
          )}

          {footer && <p className="text-center text-[10px] text-muted-foreground/70 mt-0.5">{footer}</p>}
        </div>
      </div>
    );
  },
);
