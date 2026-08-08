"use client";

import { ArrowRight, Bot, Building, FileText, Import, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TwinLandingScreenProps {
  onStartIdea?: () => void;
  onImportChat?: () => void;
  onOpenExisting?: () => void;
}

export function TwinLandingScreen({
  onStartIdea,
  onImportChat,
  onOpenExisting,
}: TwinLandingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center max-w-3xl mx-auto">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-xs font-semibold text-brand mb-6 shadow-sm">
        <Sparkles className="h-4 w-4" />
        <span>AI Cofounder Workspace</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
        Start your company with an <span className="text-brand">AI Cofounder</span>.
      </h1>

      {/* Subtext */}
      <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
        Turn ideas, research, and plans into actionable tasks, structured documents, and autonomous execution.
      </p>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8 text-left">
        <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-3 font-bold">
            <Building className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">Company Setup</h3>
          <p className="text-xs text-muted-foreground">Auto-generate company briefs, starter roadmaps, and initial tasks.</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-3 font-bold">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">Document Vault</h3>
          <p className="text-xs text-muted-foreground">Persist business plans, slides, sheets, and market research.</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-3 font-bold">
            <Bot className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">Autonomous Execution</h3>
          <p className="text-xs text-muted-foreground">Delegate research & task execution to your Second-Me twin.</p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Button
          type="button"
          onClick={onStartIdea}
          className="w-full sm:w-auto h-11 px-6 rounded-2xl bg-brand text-brand-foreground font-semibold text-sm hover:bg-brand/90 transition shadow-md gap-2"
        >
          <span>Start from this idea</span>
          <ArrowRight className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onImportChat}
          className="w-full sm:w-auto h-11 px-6 rounded-2xl border-border hover:bg-muted font-medium text-sm transition gap-2"
        >
          <Import className="h-4 w-4 text-muted-foreground" />
          <span>Import from chat</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onOpenExisting}
          className="w-full sm:w-auto h-11 px-4 rounded-2xl text-muted-foreground hover:text-foreground text-sm font-medium"
        >
          Open existing workspace
        </Button>
      </div>
    </div>
  );
}
