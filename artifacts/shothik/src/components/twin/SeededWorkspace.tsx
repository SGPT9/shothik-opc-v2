import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, CheckCircle2, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SeededWorkspace({
  onDismiss,
  chatConversationId
}: {
  onDismiss: () => void;
  chatConversationId?: string;
}) {
  const [companyName, setCompanyName] = useState("Acme SaaS");
  const [summary, setSummary] = useState("A software platform built to solve specific industry problems efficiently.");
  const [tasks, setTasks] = useState([
    { id: 1, title: "Finalize pricing tiers for the initial launch", completed: false },
    { id: 2, title: "List top 5 competitors in the niche", completed: false },
    { id: 3, title: "Draft landing page copy", completed: false },
    { id: 4, title: "Define MVP feature scope", completed: false },
    { id: 5, title: "Set up waitlist form", completed: false },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('twin_seeded_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompanyName(parsed.companyName);
        setSummary(parsed.summary);
        setTasks(parsed.tasks);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('twin_seeded_data', JSON.stringify({ companyName, summary, tasks }));
  }, [companyName, summary, tasks]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 border border-brand/20">
            <Brain className="h-7 w-7 text-brand" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Workspace Initialized</h1>
            <p className="text-base text-muted-foreground mt-1">Your AI Cofounder has prepared the environment.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {chatConversationId && (
            <Link href={`/agents/chat?conversationId=${chatConversationId}`}>
              <Button variant="outline" className="gap-2 font-medium">
                <ArrowLeft className="h-4 w-4" /> Back to Chat
              </Button>
            </Link>
          )}
          <Button onClick={onDismiss} className="gap-2 bg-brand hover:bg-brand/90 text-white font-medium">
            Enter Full Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-brand/20 bg-brand/5 shadow-sm">
            <CardContent className="pt-8 pb-8">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-brand">Company Name</label>
                  <input 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value)}
                    className="mt-2 block w-full bg-transparent text-3xl font-bold text-foreground outline-none border-b border-brand/10 focus:border-brand transition-colors pb-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-brand">One-line Summary</label>
                  <textarea 
                    value={summary} 
                    onChange={e => setSummary(e.target.value)}
                    rows={2}
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
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-2.5 hover:bg-muted/50 rounded-xl transition-colors group cursor-pointer" onClick={() => toggleTask(task.id)}>
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${task.completed ? 'bg-brand border-brand' : 'border-muted-foreground/40 group-hover:border-brand/60'}`}>
                      {task.completed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
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
              <div className="rounded-xl border border-border/60 bg-card p-4 hover:border-indigo-500/40 hover:bg-indigo-500/5 cursor-pointer transition-all shadow-sm group">
                <h4 className="text-sm font-semibold text-foreground group-hover:text-indigo-600 transition-colors">Initial Business Plan</h4>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Auto-generated from your chat discussion context.</p>
                <div className="mt-4 flex items-center justify-between text-xs text-indigo-500 font-bold uppercase tracking-wider">
                  <span>Open Document</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-dashed border-2">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background border shadow-sm mb-4">
                <Brain className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="text-base font-semibold">Ready for more?</h4>
              <p className="text-sm text-muted-foreground mt-1.5 mb-6 max-w-[200px] mx-auto">Your AI Cofounder is waiting in the full dashboard.</p>
              <Button variant="default" className="w-full font-medium" onClick={onDismiss}>
                Open Full Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
