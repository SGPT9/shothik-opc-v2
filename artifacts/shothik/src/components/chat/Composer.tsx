

import { Paperclip, Send, Square, X, Brain, Globe, Search, ChevronDown, Check } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MODES = [
  {
    id: "cofounder",
    label: "Cofounder",
    icon: Brain,
    description: "Shape the idea, plan the business, and figure out next steps."
  },
  {
    id: "web-search",
    label: "Web Search",
    icon: Globe,
    description: "Look up market facts, competitors, and real-world signals."
  },
  {
    id: "scenario-testing",
    label: "Scenario Testing",
    icon: Search,
    description: "Test options, risks, and possible outcomes before you move."
  }
];

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
  mode?: "cofounder" | "web-search" | "scenario-testing";
  onModeChange?: (mode: "cofounder" | "web-search" | "scenario-testing") => void;
  isOvernight?: boolean;
  onToggleOvernight?: (enabled: boolean) => void;
  footer?: string;
  attachments?: ComposerAttachment[];
  onAttachFiles?: (files: FileList | File[]) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  commandHint?: {
    name: string;
    description: string;
  } | null;
  errorMessage?: string | null;
  onVoiceClick?: () => void;
}

export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  disabled,
  isStreaming,
  generating,
  placeholder,
  modelHandle,
  onModelChange,
  mode = "cofounder",
  onModeChange,
  isOvernight = false,
  onToggleOvernight,
  footer,
  attachments = [],
  onAttachFiles,
  onRemoveAttachment,
  commandHint,
  errorMessage,
  onVoiceClick,
}: ComposerProps, ref) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeStreaming = isStreaming ?? generating ?? false;

  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  const currentMode = MODES.find(m => m.id === mode) || MODES[0];
  const ModeIcon = currentMode.icon;

  return (
    <div className="border-t bg-background p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {/* Premium Input Container Box */}
        <div className="flex flex-col rounded-3xl border border-border/80 bg-muted/10 p-3 transition-all focus-within:border-brand/40 focus-within:ring-1 focus-within:ring-brand/20 shadow-sm">
          
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf"
            className="hidden"
            onChange={(event) => {
              if (!event.target.files?.length) return;
              onAttachFiles?.(event.target.files);
              event.target.value = "";
            }}
          />

          {/* Text input area */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSubmit();
              }
            }}
<<<<<<< HEAD:components/chat/Composer.tsx
            placeholder={placeholder ?? "What are you building? Describe your idea, product, or company plan..."}
=======
            placeholder={placeholder ?? "What are you building?"}
>>>>>>> origin/main:artifacts/shothik/src/components/chat/Composer.tsx
            disabled={disabled}
            className="min-h-[56px] max-h-40 w-full resize-none border-0 bg-transparent text-sm shadow-none outline-none placeholder:text-muted-foreground/80 focus:ring-0 mt-1"
          />

          {/* Attachments rendering inside the card if present */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={cn(
                    "flex max-w-xs items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-left text-[11px] shadow-sm transition",
                    attachment.status === "error"
                      ? "border-destructive/40 bg-destructive/5 text-destructive"
                      : "border-border/60 bg-background/80 text-foreground",
                  )}
                >
                  <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{attachment.name}</p>
                  </div>
                  {onRemoveAttachment && (
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground transition-colors ml-1 p-0.5 rounded-full hover:bg-muted/80"
                      onClick={() => onRemoveAttachment(attachment.id)}
                      aria-label={`Remove ${attachment.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bottom Controls Row */}
          <div className="flex items-center justify-between gap-2 mt-2 border-t border-border/40 pt-2.5">
            
            {/* Left controls: Mode Selector, attachment, voice */}
            <div className="flex items-center gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 rounded-xl border-border/60 bg-background/50 hover:bg-muted text-xs font-medium pr-2 shadow-sm"
                    disabled={disabled || activeStreaming}
                  >
                    <ModeIcon className="h-3.5 w-3.5 text-brand" />
                    {currentMode.label}
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72 rounded-xl p-1 shadow-lg">
                  {MODES.map((m) => (
                    <DropdownMenuItem
                      key={m.id}
                      onClick={() => onModeChange?.(m.id as any)}
                      className={cn(
                        "flex items-start gap-3 rounded-lg p-2.5 cursor-pointer transition-colors focus:bg-muted focus:text-foreground",
                        mode === m.id ? "bg-muted/50" : ""
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border shadow-sm">
                        <m.icon className="h-4 w-4 text-brand" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none">{m.label}</p>
                          {mode === m.id && <Check className="h-4 w-4 text-brand" />}
                        </div>
                        <p className="text-xs text-muted-foreground leading-snug">{m.description}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || activeStreaming}
                aria-label="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </Button>

<<<<<<< HEAD:components/chat/Composer.tsx
              {/* 3 Core Chat Modes Dropdown Selector */}
              <div className="relative">
                <select
                  value={persona ?? "cofounder"}
                  onChange={(event) => onPersonaChange?.(event.target.value as ChatPersona)}
                  className="bg-brand/10 text-brand border border-brand/30 rounded-xl px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition outline-none h-8 appearance-none pr-6 pl-2.5 shadow-sm"
                  disabled={disabled || activeStreaming}
                >
                  <option value="cofounder">🚀 Cofounder (Default)</option>
                  <option value="coresearcher">🔍 Web Search Mode</option>
                  <option value="coworker">🧪 Scenario Testing (ScenarioLab)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-brand">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>

              {/* Stylish Model Selector Dropdown Pill */}
              <div className="relative">
                <select
                  value={modelHandle ?? "gemini-2.5-flash"}
                  onChange={(event) => onModelChange?.(event.target.value)}
                  className="bg-muted/80 hover:bg-muted text-foreground border border-border/60 rounded-xl px-2.5 py-1 text-[11px] font-medium cursor-pointer transition outline-none h-8 appearance-none pr-6 pl-2.5"
                  disabled={disabled || activeStreaming}
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-foreground">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>

              {/* Stylish Skill Selector Dropdown Pill */}
              <div className="relative">
                <select
                  value={activeSkill ?? "general"}
                  onChange={(event) => onSkillChange?.(event.target.value)}
                  className="bg-muted/80 hover:bg-muted text-foreground border border-border/60 rounded-xl px-2.5 py-1 text-[11px] font-medium cursor-pointer transition outline-none h-8 appearance-none pr-6 pl-2.5"
                  disabled={disabled || activeStreaming}
                >
                  <option value="general">🛠️ General Agent</option>
                  <option value="github-fixer">💻 GitHub Auto-Fixer</option>
                  <option value="cloud-deployer">🚀 Cloud Deployer</option>
                  <option value="db-migrator">🗄️ Database Migrator</option>
                  <option value="researcher">🔬 Twin Researcher</option>
                  <option value="ui-designer">🎨 UI Designer</option>
                  <option value="security-auditor">🛡️ Security Auditor</option>
                  <option value="product-manager">📋 Product Manager</option>
                  <option value="test-automator">🧪 Test Automator</option>
                  <option value="seo-specialist">🔎 SEO Specialist</option>
                  <option value="content-creator">📝 Content Creator</option>
                  <option value="sales-outreach">🎯 Sales Outreach</option>
                  <option value="technical-writer">📚 Technical Writer</option>
                  <option value="sre-architect">🛡️ SRE Architect</option>
                  <option value="ux-architect">🏛️ UX Architect</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-foreground">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>

              {/* Tonight Engine Toggle Mode */}
              {onToggleOvernight && (
                <button
                  type="button"
                  onClick={() => onToggleOvernight(!isOvernight)}
                  className={cn(
                    "flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-medium transition border cursor-pointer",
                    isOvernight
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm animate-pulse"
                      : "bg-muted/60 text-muted-foreground border-border/60 hover:bg-muted"
                  )}
                >
                  <Moon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tonight Engine</span>
                </button>
              )}

              {/* Open-LLM-VTuber Omni Voice Presenter */}
              <button
                type="button"
                onClick={() => {
                  fetch("/api/hermes/vtuber/session", { method: "POST" })
                    .then(res => res.json())
                    .then(data => {
                      if (data.data?.websocketUrl) {
                        window.location.href = `/voice?session=${data.data.sessionId}`;
                      } else {
                        window.location.href = "/voice";
                      }
                    })
                    .catch(() => {
                      window.location.href = "/voice";
                    });
                }}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-medium transition border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 shadow-sm cursor-pointer"
                title="Launch Open-LLM-VTuber Live Voice Presenter"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Omni Voice</span>
              </button>

              {/* ChatGPT LiveKit Voice Orb Mode */}
=======
              {/* Voice Button */}
>>>>>>> origin/main:artifacts/shothik/src/components/chat/Composer.tsx
              <button
                type="button"
                onClick={onVoiceClick}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-medium transition border border-indigo-500/40 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 shadow-sm cursor-pointer"
                title="Start Voice Session"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                <span>Voice</span>
              </button>
            </div>

            {/* Right controls: Submit or Stop Button */}
            <div className="flex items-center">
              {activeStreaming ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-xl border-border/80 hover:bg-muted transition" 
                  onClick={onStop} 
                  aria-label="Stop generating"
                >
                  <Square className="h-3.5 w-3.5 fill-foreground text-foreground" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-xl transition shadow-sm",
                    value.trim() 
                      ? "bg-brand text-white hover:bg-brand/90" 
                      : "bg-muted/50 text-muted-foreground hover:bg-muted cursor-not-allowed"
                  )}
                  onClick={onSubmit}
                  disabled={disabled || !value.trim()}
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

          </div>

        </div>

        {commandHint && (
          <div className="flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2 text-xs text-foreground animate-in fade-in slide-in-from-bottom-1 duration-200">
            <span className="rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand">
              /{commandHint.name}
            </span>
            <span>{commandHint.description}</span>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive animate-in fade-in slide-in-from-bottom-1 duration-200"
          >
            {errorMessage}
          </div>
        )}

        {footer && <p className="text-center text-[10px] text-muted-foreground/80 mt-1">{footer}</p>}
      </div>
    </div>
  );
});
