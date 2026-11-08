import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalA11y } from "@/hooks/ui/useModalA11y";
import { extractTemplateVariables, interpolateVariables } from "@/lib/chat/prompt-variables";

export interface PromptVariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptTemplate: string;
  templateTitle?: string;
  onSubmit: (interpolatedText: string) => void;
}

/**
 * Prompt Template Variable Interpolation Modal adapted from LibreChat.
 * Dynamically detects {{variables}} in prompt text and prompts user for inputs.
 */
export function PromptVariableModal({
  isOpen,
  onClose,
  promptTemplate,
  templateTitle = "Prompt Template Variables",
  onSubmit,
}: PromptVariableModalProps) {
  useModalA11y({ isOpen, onClose });

  const variables = React.useMemo(() => extractTemplateVariables(promptTemplate), [promptTemplate]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      variables.forEach((v) => {
        initial[v] = "";
      });
      setFormValues(initial);
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, variables]);

  if (!isOpen || variables.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrompt = interpolateVariables(promptTemplate, formValues);
    onSubmit(finalPrompt);
    onClose();
  };

  const previewText = interpolateVariables(promptTemplate, formValues);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-variable-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 id="prompt-variable-modal-title" className="text-base font-semibold text-foreground">
                {templateTitle}
              </h2>
              <p className="text-xs text-muted-foreground">
                Fill in the template variables below
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 max-h-[50vh] overflow-y-auto px-1 custom-scrollbar">
            {variables.map((variable, idx) => (
              <div key={variable} className="space-y-1.5">
                <label className="text-xs font-medium text-foreground capitalize flex items-center gap-1.5">
                  <span className="font-mono text-brand font-semibold text-[11px]">{`{{${variable}}}`}</span>
                  <span className="text-muted-foreground">variable</span>
                </label>
                <input
                  ref={idx === 0 ? firstInputRef : undefined}
                  type="text"
                  placeholder={`Enter ${variable}...`}
                  value={formValues[variable] || ""}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, [variable]: e.target.value }))}
                  className="w-full rounded-xl border border-border/80 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  required
                />
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Live Preview
            </div>
            <p className="text-xs text-foreground/80 font-mono leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
              {previewText}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            <Button type="button" variant="ghost" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5 text-xs bg-brand text-brand-foreground hover:bg-brand/90">
              <span>Use Prompt</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
