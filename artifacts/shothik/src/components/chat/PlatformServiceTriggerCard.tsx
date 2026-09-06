import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  ArrowRight,
  Truck,
  BookOpen,
  Rocket,
  Clock,
  Sparkles,
  Code2,
  CreditCard,
  PenTool,
  Mic,
  LayoutGrid,
  X,
} from "lucide-react";
import type { TwinTriggerContext } from "@/components/agents/hooks/useTwinHandoffDetector";

export interface PlatformServiceTriggerCardProps {
  conversationId: string;
  triggerContext?: TwinTriggerContext | null;
  onOpenPlatformServices?: () => void;
  className?: string;
}

export function PlatformServiceTriggerCard({
  conversationId,
  triggerContext,
  onOpenPlatformServices,
  className = "",
}: PlatformServiceTriggerCardProps) {
  const [dismissed, setDismissed] = useState(() =>
    conversationId
      ? Boolean(localStorage.getItem(`service_trigger_dismissed_${conversationId}`))
      : false,
  );

  useEffect(() => {
    if (!conversationId) return;
    setDismissed(
      Boolean(localStorage.getItem(`service_trigger_dismissed_${conversationId}`)),
    );
  }, [conversationId]);

  if (dismissed || !conversationId || !triggerContext?.eligible) return null;

  const handleDismiss = () => {
    localStorage.setItem(`service_trigger_dismissed_${conversationId}`, "true");
    setDismissed(true);
  };

  const serviceId = triggerContext.serviceId || 1;
  const pillarName = triggerContext.pillarName || "Platform Service";
  const triad = triggerContext.triad || "twin";
  const title = triggerContext.title || "Execute with Shothik Platform";
  const description = triggerContext.description || "Turn this conversation into automated execution.";
  const actionText = triggerContext.actionText || "Start Execution";
  const targetUrl = triggerContext.targetUrl || `/twin?fromChat=${conversationId}`;
  const badgeText = triggerContext.badgeText || "AI Execution";

  const getTriadLabel = () => {
    switch (triad) {
      case "writing":
        return "✍️ Writing Suite";
      case "creative":
        return "🎨 Creative Studio";
      default:
        return "🏛️ Twin Business Layer";
    }
  };

  const renderIcon = () => {
    switch (triggerContext.triggerType) {
      case "DEVELOPER_TWIN":
        return <Code2 className="h-6 w-6 text-emerald-400" />;
      case "FINTECH_MFS":
        return <CreditCard className="h-6 w-6 text-pink-400" />;
      case "COMMERCE_LOGISTICS":
        return <Truck className="h-6 w-6 text-amber-400" />;
      case "ACADEMIC_PUBLISHING":
        return <BookOpen className="h-6 w-6 text-sky-400" />;
      case "VENTURE_OPPORTUNITY":
        return <Rocket className="h-6 w-6 text-rose-400" />;
      case "WRITING_CONTENT":
        return <PenTool className="h-6 w-6 text-blue-400" />;
      case "CONVERSATIONAL_VOICE":
        return <Mic className="h-6 w-6 text-teal-400" />;
      case "REPETITION_WORKFLOW":
        return <Clock className="h-6 w-6 text-violet-400" />;
      default:
        return <Sparkles className="h-6 w-6 text-cyan-400" />;
    }
  };

  return (
    <div
      data-testid="platform-service-trigger-card"
      className={`my-6 rounded-2xl border border-slate-700/80 bg-slate-900/90 text-slate-100 p-5 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
          {renderIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] font-mono font-bold tracking-wider uppercase border-violet-500/40 text-violet-400 bg-violet-950/20"
            >
              PILLAR {serviceId} · {pillarName}
            </Badge>
            <span className="text-[11px] font-mono text-slate-400">
              {getTriadLabel()}
            </span>
            <span className="ml-auto text-[10px] font-mono text-emerald-400 hidden sm:inline">
              100% OPERATIONAL
            </span>
          </div>

          <h3 className="mt-2 text-base sm:text-lg font-bold text-slate-100 leading-snug">
            {title}
          </h3>

          <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <Link href={targetUrl}>
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold gap-1.5 cursor-pointer shadow-md"
              >
                <span>{actionText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>

            {onOpenPlatformServices && (
              <Button
                size="sm"
                variant="outline"
                onClick={onOpenPlatformServices}
                className="border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-slate-100 font-mono text-xs gap-1.5 cursor-pointer"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>All 12 Services</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 cursor-pointer ml-auto"
            >
              Keep chatting
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
