"use client";

import { Paperclip, Send, Square, X, Rocket, Microscope, Briefcase, Moon, Sparkles } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatPersona } from "@/lib/chat/types";

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
  commandHint?: {
    name: string;
    description: string;
  } | null;
  errorMessage?: string | null;
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

  return (
    <div className="border-t bg-background p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {/* AI Partner Persona Selector Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-border/40 mb-1 font-mono">
          <span className="text-[10px] text-muted-foreground uppercase font-bold mr-1 shrink-0">AI Partner:</span>
          <button
            type="button"
            onClick={() => onPersonaChange?.("cofounder")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition shrink-0",
              persona === "cofounder"
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Rocket className="w-3 h-3 text-indigo-400" />
            <span>Co-Founder</span>
          </button>
          <button
            type="button"
            onClick={() => onPersonaChange?.("researcher")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition shrink-0",
              persona === "researcher"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Microscope className="w-3 h-3 text-cyan-400" />
            <span>Co-Researcher</span>
          </button>
          <button
            type="button"
            onClick={() => onPersonaChange?.("coworker")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition shrink-0",
              persona === "coworker"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Briefcase className="w-3 h-3 text-amber-400" />
            <span>Co-Worker</span>
          </button>
        </div>

        {/* Premium Input Container Box */}
        <div className="flex flex-col rounded-3xl border border-border/80 bg-muted/10 p-3 transition-all focus-within:border-brand/40 focus-within:ring-1 focus-within:ring-brand/20">
          
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
            placeholder={placeholder ?? "Ask anything..."}
            disabled={disabled}
            className="min-h-[56px] max-h-40 w-full resize-none border-0 bg-transparent text-sm shadow-none outline-none placeholder:text-muted-foreground/80 focus:ring-0"
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
            
            {/* Left controls: attachment button, model selector, tonight engine toggle */}
            <div className="flex items-center gap-2 flex-wrap">
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

              {/* ChatGPT LiveKit Voice Orb Mode */}
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/voice";
                }}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-medium transition border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 shadow-sm cursor-pointer"
                title="Launch LiveKit ChatGPT Advanced Voice Orb"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>LiveKit Voice</span>
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
