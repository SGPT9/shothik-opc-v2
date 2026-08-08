import React from "react";
import { Sparkles, Bot, ChevronDown, Cpu, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ChatHeaderProps {
  currentPersona?: string;
  onSelectPersona?: (persona: string) => void;
  executionMode?: "realtime" | "colibri_async" | "airllm_frontier" | "deepthink_async";
}

export function ChatHeader({
  currentPersona = "general",
  onSelectPersona,
  executionMode = "realtime",
}: ChatHeaderProps) {
  return (
    <div className="flex h-12 w-full items-center justify-between border-b border-border/80 bg-background/95 px-4 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-foreground">Shothik AI Cofounder Agent</h2>
          <p className="text-[10px] text-muted-foreground font-mono">
            Mode: {executionMode.replace("_", " ").toUpperCase()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="hidden sm:inline-flex items-center gap-1 font-mono text-[9px] border-indigo-500/30 text-indigo-400 py-0.5 px-2"
        >
          <Cpu className="h-3 w-3 text-indigo-400" /> Colibri MoE + AirLLM Ready
        </Badge>
      </div>
    </div>
  );
}
