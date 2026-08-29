import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, ArrowRight, Clock, FileText, Presentation, CheckCircle2, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { getChatSessions, StoredChatSession } from "@/lib/chat-sessions-store";

interface ResearchRun {
  id: string;
  query: string;
  status: "completed" | "running" | "failed";
  date: string;
  outputs: Array<{ type: "report" | "slides" | "sheet"; label: string }>;
}

export default function DeepResearchPage() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [runs, setRuns] = useState<ResearchRun[]>([]);

  useEffect(() => {
    const sessions = getChatSessions();
    const researchRuns: ResearchRun[] = sessions.map((s) => ({
      id: s.id,
      query: s.title || "Multi-source research investigation",
      status: "completed",
      date: new Date(s.updatedAt || Date.now()).toLocaleDateString(),
      outputs: [{ type: "report", label: "Research Synthesis" }],
    }));
    setRuns(researchRuns);
  }, []);

  const startResearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLocation(`/?conversationId=new_${Date.now()}&q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="px-8 py-8 shrink-0 border-b border-border bg-muted/10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2 flex items-center gap-3">
          <Search className="w-7 h-7 text-emerald-500" />
          Deep Research
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl mb-8">
          Launch autonomous, multi-step investigations. Deep Research reads extensively, synthesizes sources, and structures final reports over extended timeframes.
        </p>

        <form onSubmit={startResearch} className="relative max-w-3xl">
          <div className="relative flex items-center bg-card border border-border shadow-sm rounded-2xl focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all p-1.5 pr-2">
            <div className="pl-3 pr-2 flex items-center justify-center text-emerald-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <input 
              type="text"
              placeholder="What would you like to investigate?"
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2.5 outline-none placeholder:text-muted-foreground/70"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!query.trim()}
              className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Research
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-6">Recent Investigations</h2>
        
        {runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border/80 bg-card/30 max-w-4xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-muted border border-border mb-3 text-muted-foreground">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No Deep Research Runs Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Type an investigation topic above to start a deep multi-source research run with citations and evidence verification.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-4xl">
            {runs.map((run) => (
              <div key={run.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer group" onClick={() => setLocation(`/?conversationId=${run.id}`)}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 bg-muted border border-border">
                  {run.status === "completed" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {run.status === "running" && <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />}
                  {run.status === "failed" && <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-emerald-500 transition-colors">{run.query}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {run.date}
                    </span>
                    {run.outputs.length > 0 && <span className="text-muted-foreground/40 text-xs">•</span>}
                    {run.outputs.map((out, idx) => (
                      <span key={idx} className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">
                        {out.type === "report" ? <FileText className="w-2.5 h-2.5" /> : <Presentation className="w-2.5 h-2.5" />}
                        {out.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors shrink-0">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}