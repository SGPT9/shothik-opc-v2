import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export function TwinCtaCard({ conversationId }: { conversationId: string }) {
  const [dismissed, setDismissed] = useState(() =>
    conversationId
      ? Boolean(localStorage.getItem(`twin_cta_dismissed_${conversationId}`))
      : false,
  );

  useEffect(() => {
    if (!conversationId) return;
    setDismissed(Boolean(localStorage.getItem(`twin_cta_dismissed_${conversationId}`)));
  }, [conversationId]);

  if (dismissed || !conversationId) return null;

  const handleDismiss = () => {
    localStorage.setItem(`twin_cta_dismissed_${conversationId}`, 'true');
    setDismissed(true);
  };

  return (
    <div className="my-6 rounded-2xl border border-brand/20 bg-brand/5 p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10">
          <Brain className="h-6 w-6 text-brand" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">Next step</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">Start this in Twin</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Turn this conversation into a company workspace with a plan, tasks, and next steps.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href={`/twin?fromChat=${conversationId}`}>
              <Button size="sm" className="bg-brand text-white hover:bg-brand/90 font-medium">
                Start in Twin <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={handleDismiss} className="font-medium">
              Keep chatting
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
