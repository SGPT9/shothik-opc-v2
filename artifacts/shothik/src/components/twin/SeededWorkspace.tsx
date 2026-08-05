import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  Brain,
  CheckCircle2,
  FileText,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  RefreshCcw,
} from 'lucide-react';
import { getGuestDeviceId } from '@/lib/chat/guest-device-id';
import { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SeedTask {
  id: number;
  title: string;
  completed: boolean;
}

interface SeedData {
  companyName: string;
  summary: string;
  businessPlan: string;
  tasks: SeedTask[];
}

const DEFAULT_SEED: SeedData = {
  companyName: 'Acme SaaS',
  summary: 'A software platform built to solve specific industry problems efficiently.',
  businessPlan: '',
  tasks: [
    { id: 1, title: 'Finalize pricing tiers for the initial launch', completed: false },
    { id: 2, title: 'List top 5 competitors in the niche', completed: false },
    { id: 3, title: 'Draft landing page copy', completed: false },
    { id: 4, title: 'Define MVP feature scope', completed: false },
    { id: 5, title: 'Set up waitlist form', completed: false },
  ],
};

const LEGACY_STORAGE_KEY = 'twin_seeded_data';

function storageKeyFor(conversationId?: string) {
  return conversationId ? `${LEGACY_STORAGE_KEY}:${conversationId}` : LEGACY_STORAGE_KEY;
}

function loadCachedSeed(conversationId?: string): SeedData | null {
  try {
    const raw = localStorage.getItem(storageKeyFor(conversationId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.companyName !== 'string' || !Array.isArray(parsed.tasks)) {
      return null;
    }
    return {
      companyName: parsed.companyName,
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      businessPlan: typeof parsed.businessPlan === 'string' ? parsed.businessPlan : '',
      tasks: parsed.tasks,
    };
  } catch {
    return null;
  }
}

interface TranscriptMessage {
  role: string;
  content: string;
}

/**
 * Find the conversation's messages. Chat history is mirrored to localStorage
 * (`shothik:chat-local-history:<userId>:<surface>`), so scan those snapshots
 * first, then fall back to the chat API.
 */
async function loadConversationMessages(conversationId: string): Promise<TranscriptMessage[]> {
  const local: TranscriptMessage[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('shothik:chat-local-history')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const state = JSON.parse(raw);
      const snapshot = (state?.conversations ?? []).find(
        (entry: { summary?: { _id?: string } }) => entry?.summary?._id === conversationId,
      );
      if (snapshot?.messages?.length) {
        for (const m of snapshot.messages) {
          if (m && typeof m.role === 'string' && typeof m.content === 'string') {
            local.push({ role: m.role, content: m.content });
          }
        }
        break;
      }
    }
  } catch {
    // Ignore malformed local history and try the API below.
  }
  if (local.length) return local;

  const res = await fetch(`/api/chat/conversations/${conversationId}/messages?limit=200`, {
    credentials: 'same-origin',
  });
  if (!res.ok) {
    throw new Error('Could not load the originating conversation.');
  }
  const json = await res.json().catch(() => null);
  const messages = (json as { data?: TranscriptMessage[] } | null)?.data;
  if (!Array.isArray(messages)) {
    throw new Error('Could not load the originating conversation.');
  }
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

async function generateSeed(conversationId: string): Promise<SeedData> {
  const messages = await loadConversationMessages(conversationId);
  const usable = messages.filter(
    (m) => (m.role === 'user' || m.role === 'assistant') && m.content?.trim(),
  );
  if (!usable.length) {
    throw new Error('The originating conversation has no messages to build a workspace from.');
  }

  const deviceId = getGuestDeviceId();
  const res = await fetch('/api/twin/seed', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(deviceId ? { 'x-chat-device-id': deviceId } : {}),
    },
    body: JSON.stringify({ conversationId, messages: usable }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (json as { error?: string } | null)?.error ||
        'Could not generate the workspace from your conversation.',
    );
  }

  const data = (json as {
    data?: { companyName: string; summary: string; businessPlan: string; tasks: string[] };
  }).data;
  if (!data) {
    throw new Error('The workspace generator returned an empty result.');
  }

  return {
    companyName: data.companyName,
    summary: data.summary,
    businessPlan: data.businessPlan,
    tasks: data.tasks.map((title, index) => ({ id: index + 1, title, completed: false })),
  };
}

export default function SeededWorkspace({
  onDismiss,
  chatConversationId,
}: {
  onDismiss: () => void;
  chatConversationId?: string;
}) {
  const [seed, setSeed] = useState<SeedData>(() => loadCachedSeed(chatConversationId) ?? DEFAULT_SEED);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const hydratedRef = useRef(false);

  const { companyName, summary, businessPlan, tasks } = seed;

  const runGeneration = useCallback(async (conversationId: string) => {
    setGenerating(true);
    setGenerationError(null);
    try {
      const generated = await generateSeed(conversationId);
      setSeed(generated);
      hydratedRef.current = true;
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : 'Could not generate the workspace.',
      );
    } finally {
      setGenerating(false);
    }
  }, []);

  // On entry from a chat, generate real seed content from that conversation
  // (unless we already generated and cached it for this conversation).
  useEffect(() => {
    if (!chatConversationId) return;
    const cached = loadCachedSeed(chatConversationId);
    if (cached) {
      setSeed(cached);
      hydratedRef.current = true;
      return;
    }
    void runGeneration(chatConversationId);
  }, [chatConversationId, runGeneration]);

  // Persist edits — but never overwrite a conversation's cache with the
  // placeholder defaults before generation has produced/loaded real content.
  useEffect(() => {
    if (chatConversationId && !hydratedRef.current) return;
    localStorage.setItem(storageKeyFor(chatConversationId), JSON.stringify(seed));
  }, [seed, chatConversationId]);

  const updateSeed = (patch: Partial<SeedData>) => setSeed((s) => ({ ...s, ...patch }));

  const toggleTask = (id: number) => {
    updateSeed({
      tasks: tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    });
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20">
            <Brain className="h-7 w-7 text-brand" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {generating ? 'Setting up your workspace…' : 'Workspace Initialized'}
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              {generating
                ? 'Your AI Cofounder is reading your conversation and drafting a plan.'
                : 'Your AI Cofounder has prepared the environment.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {chatConversationId && (
            <Link href={`/agents/chat?conversationId=${chatConversationId}`}>
              <Button variant="outline" className="gap-2 font-medium" data-testid="button-back-to-chat">
                <ArrowLeft className="h-4 w-4" /> Back to Chat
              </Button>
            </Link>
          )}
          <Button onClick={onDismiss} className="gap-2 bg-brand hover:bg-brand/90 text-white font-medium">
            Enter Full Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {generationError && (
        <div
          className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
          data-testid="banner-seed-error"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Couldn't generate your workspace from the conversation
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{generationError}</p>
          </div>
          {chatConversationId && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 shrink-0"
              onClick={() => void runGeneration(chatConversationId)}
              data-testid="button-retry-seed"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Retry
            </Button>
          )}
        </div>
      )}

      {generating ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card py-24 text-center"
          data-testid="state-seed-generating"
        >
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="mt-4 text-base font-medium text-foreground">Reading your chat…</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Drafting a company name, business plan, and starter tasks tailored to your idea. This
            takes a few seconds.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-brand/20 bg-brand/5 shadow-sm">
              <CardContent className="pt-8 pb-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-brand">Company Name</label>
                    <input
                      value={companyName}
                      onChange={(e) => updateSeed({ companyName: e.target.value })}
                      data-testid="input-company-name"
                      className="mt-2 block w-full bg-transparent text-3xl font-bold text-foreground outline-none border-b border-brand/10 focus:border-brand transition-colors pb-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-brand">One-line Summary</label>
                    <textarea
                      value={summary}
                      onChange={(e) => updateSeed({ summary: e.target.value })}
                      rows={2}
                      data-testid="input-summary"
                      className="mt-2 block w-full resize-none bg-transparent text-lg text-foreground outline-none border-b border-brand/10 focus:border-brand transition-colors pb-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-4 border-b border-border/40">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand" /> Starter Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-2.5 hover:bg-muted/50 rounded-xl transition-colors group cursor-pointer"
                      onClick={() => toggleTask(task.id)}
                      data-testid={`task-item-${task.id}`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${task.completed ? 'bg-brand border-brand' : 'border-muted-foreground/40 group-hover:border-brand/60'}`}
                      >
                        {task.completed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <span
                        className={`text-sm font-medium transition-colors ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                      >
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-4 border-b border-border/40">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" /> Draft Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                {businessPlan ? (
                  <div
                    className="rounded-xl border border-border/60 bg-card p-4 hover:border-indigo-500/40 hover:bg-indigo-500/5 cursor-pointer transition-all shadow-sm group"
                    onClick={() => setPlanOpen(true)}
                    data-testid="card-business-plan"
                  >
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-indigo-600 transition-colors">
                      Initial Business Plan
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      Auto-generated from your chat discussion context.
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-indigo-500 font-bold uppercase tracking-wider">
                      <span>Open Document</span>
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4"
                    data-testid="card-business-plan-empty"
                  >
                    <h4 className="text-sm font-semibold text-muted-foreground">No draft plan yet</h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {chatConversationId
                        ? 'The business plan could not be generated. Use Retry above to try again.'
                        : 'Start Twin from a chat conversation to auto-generate a business plan.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted/30 border-dashed border-2">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background border shadow-sm mb-4">
                  <Brain className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="text-base font-semibold">Ready for more?</h4>
                <p className="text-sm text-muted-foreground mt-1.5 mb-6 max-w-[200px] mx-auto">
                  Your AI Cofounder is waiting in the full dashboard.
                </p>
                <Button variant="default" className="w-full font-medium" onClick={onDismiss}>
                  Open Full Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl" data-testid="dialog-business-plan">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" /> Initial Business Plan — {companyName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Draft business plan generated from your chat conversation
          </DialogDescription>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{businessPlan}</ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
