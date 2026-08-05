import { useState } from "react";
import { useLocation } from "wouter";
import { Search, ArrowRight, Clock, FileText, Presentation, CheckCircle2, Loader2, AlertCircle, Sparkles } from "lucide-react";

interface ResearchRun {
  id: string;
  query: string;
  status: "completed" | "running" | "failed";
  date: string;
  outputs: Array<{ type: "report" | "slides" | "sheet"; label: string }>;
}

const MOCK_RUNS: ResearchRun[] = [
  {
    id: "run-1",
    query: "Analysis of Q3 AI startup funding and valuations",
    status: "completed",
    date: "2 hours ago",
    outputs: [{ type: "report", label: "Executive Summary" }, { type: "slides", label: "Q3 Funding Deck" }]
  },
  {
    id: "run-2",
    query: "Competitive landscape of enterprise RAG solutions",
    status: "running",
    date: "In progress",
    outputs: []
  },
  {
    id: "run-3",
    query: "Hardware supply chain vulnerabilities in semiconductor manufacturing",
    status: "failed",
    date: "Yesterday",
    outputs: []
  },
  {
    id: "run-4",
    query: "Historical context of federal interest rate cuts and SaaS spending",
    status: "completed",
    date: "Oct 12, 2024",
    outputs: [{ type: "report", label: "SaaS Spending Analysis" }]
  }
];

export default function DeepResearchPage() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");

  const startResearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLocation(`/agents/chat?conversationId=new_${Date.now()}&mode=deep-research`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="px-8 py-8 shrink-0 border-b border-border bg-muted/10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2 flex items-center gap-3">
          <Search className="w-7 h-7 text-brand" />
          Deep Research
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl mb-8">
          Launch autonomous, multi-step investigations. Deep Research reads extensively, synthesizes sources, and structures final reports over extended timeframes.
        </p>

        <form onSubmit={startResearch} className="relative max-w-3xl">
          <div className="relative flex items-center bg-card border border-border shadow-sm rounded-2xl focus-within:ring-1 focus-within:ring-brand focus-within:border-brand transition-all p-1.5 pr-2">
            <div className="pl-3 pr-2 flex items-center justify-center text-brand">
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
              className="flex items-center gap-1.5 bg-brand text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Research
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-6">Recent Investigations</h2>
        
        <div className="flex flex-col gap-4 max-w-4xl">
          {MOCK_RUNS.map((run) => (
            <div key={run.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer group" onClick={() => setLocation(`/agents/chat?conversationId=${run.id}`)}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 bg-muted border border-border">
                {run.status === "completed" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {run.status === "running" && <Loader2 className="w-5 h-5 text-brand animate-spin" />}
                {run.status === "failed" && <AlertCircle className="w-5 h-5 text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate mb-1">{run.query}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {run.date}
                  </span>
                  {run.outputs.length > 0 && (
                    <>
                      <span>·</span>
                      <div className="flex items-center gap-2">
                        {run.outputs.map((out, i) => (
                          <span key={i} className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded border border-border/50 text-[10px] text-foreground font-medium">
                            {out.type === "report" && <FileText className="w-3 h-3 text-brand" />}
                            {out.type === "slides" && <Presentation className="w-3 h-3 text-indigo-500" />}
                            {out.label}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}