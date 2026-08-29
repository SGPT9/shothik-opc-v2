import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Brain,
  ArrowRight,
  Truck,
  BookOpen,
  Rocket,
  Clock,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { TwinTriggerContext } from "@/components/agents/hooks/useTwinHandoffDetector";

interface TwinCtaCardProps {
  conversationId: string;
  triggerContext?: TwinTriggerContext | null;
}

export function TwinCtaCard({
  conversationId,
  triggerContext,
}: TwinCtaCardProps) {
  const [dismissed, setDismissed] = useState(() =>
    conversationId
      ? Boolean(localStorage.getItem(`twin_cta_dismissed_${conversationId}`))
      : false,
  );

  useEffect(() => {
    if (!conversationId) return;
    setDismissed(
      Boolean(localStorage.getItem(`twin_cta_dismissed_${conversationId}`)),
    );
  }, [conversationId]);

  if (dismissed || !conversationId) return null;

  const handleDismiss = () => {
    localStorage.setItem(`twin_cta_dismissed_${conversationId}`, "true");
    setDismissed(true);
  };

  const title = triggerContext?.title || "Start this in Twin";
  const description =
    triggerContext?.description ||
    "Turn this conversation into a company workspace with a plan, tasks, and next steps.";
  const actionText = triggerContext?.actionText || "Start in Twin";
  const targetUrl =
    triggerContext?.targetUrl || `/twin?fromChat=${conversationId}`;
  const badgeText = triggerContext?.badgeText || "Next Step";

  const renderIcon = () => {
    switch (triggerContext?.triggerType) {
      case "COMMERCE_LOGISTICS":
        return <Truck className="h-6 w-6 text-brand" />;
      case "ACADEMIC_PUBLISHING":
        return <BookOpen className="h-6 w-6 text-brand" />;
      case "VENTURE_OPPORTUNITY":
        return <Rocket className="h-6 w-6 text-brand" />;
      case "REPETITION_WORKFLOW":
        return <Clock className="h-6 w-6 text-brand" />;
      default:
        return <Brain className="h-6 w-6 text-brand" />;
    }
  };

  return (
    <div className="my-6 rounded-2xl border border-brand/20 bg-brand/5 p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10">
          {renderIcon()}
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">
            {badgeText}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href={targetUrl}>
              <Button
                size="sm"
                className="bg-brand text-white hover:bg-brand/90 font-medium cursor-pointer select-none gap-1.5"
              >
                <span>{actionText}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="font-medium cursor-pointer select-none text-muted-foreground hover:text-foreground"
            >
              Keep chatting
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
