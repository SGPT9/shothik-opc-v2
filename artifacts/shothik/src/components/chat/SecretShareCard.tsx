"use client";

import React, { useState } from "react";
import { KeyRound, Eye, EyeOff, Send, X } from "lucide-react";

interface SecretShareCardProps {
  /** Optional checkpoint ID for orchestrator control layer tracking */
  checkpointId?: string;
  /** What the secret is needed for */
  purpose: string;
  /** Label for the input (e.g., "API Key", "Password") */
  label: string;
  /** Placeholder text */
  placeholder?: string;
  /** Called with the secret value when submitted */
  onSubmit?: (value: string) => void;
  /** Called when user cancels */
  onCancel?: () => void;
  /** Whether the secret has been submitted */
  submitted?: boolean;
}

/**
 * SecretShareCard — DeepSeek-close spec secure credential input.
 *
 * Provides a dedicated secure-sharing path with masked values and clear purpose.
 * Secrets are never pasted into normal transcript content.
 * Visually distinct from regular chat messages.
 */
export function SecretShareCard({
  purpose,
  label,
  placeholder = "Paste your secret here…",
  onSubmit,
  onCancel,
  submitted = false,
}: SecretShareCardProps) {
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState(false);

  // ── Collapsed post-submission record ──
  if (submitted) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs">
        <KeyRound className="h-3.5 w-3.5 text-brand shrink-0" />
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">{label}</span> securely shared for{" "}
          <span className="font-medium text-foreground">{purpose}</span>
        </span>
        <span className="ml-auto font-mono text-muted-foreground/60">••••••••</span>
      </div>
    );
  }

  // ── Active secret input ──
  return (
    <div className="rounded-2xl border border-brand/20 bg-brand/5 backdrop-blur-sm p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
          <KeyRound className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground leading-snug">
            Secure Credential Required
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {purpose}
          </p>
        </div>
      </div>

      {/* Masked input */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type={revealed ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && value.trim()) {
                  e.preventDefault();
                  onSubmit?.(value.trim());
                }
              }}
              placeholder={placeholder}
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-lg border border-border/80 bg-card/60 px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition"
            />
            <button
              type="button"
              onClick={() => setRevealed((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer select-none"
              title={revealed ? "Hide" : "Reveal"}
            >
              {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            if (value.trim()) onSubmit?.(value.trim());
          }}
          disabled={!value.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-brand hover:bg-brand/90 px-4 py-2 text-xs font-semibold text-white shadow-sm transition cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-3.5 w-3.5" />
          Share securely
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted/80 px-4 py-2 text-xs font-semibold text-foreground transition cursor-pointer select-none"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>

      {/* Security notice */}
      <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
        🔒 This value is transmitted securely and will not appear in the chat transcript.
      </p>
    </div>
  );
}

export default SecretShareCard;
