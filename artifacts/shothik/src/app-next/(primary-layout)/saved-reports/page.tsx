import { useState } from "react";
import { useLocation } from "wouter";
import { FileText, Presentation, Table as TableIcon, File, Search, Calendar, ArrowUpRight } from "lucide-react";

interface Report {
  id: string;
  title: string;
  type: "markdown" | "slides" | "sheet" | "pdf";
  date: string;
  snippet: string;
  chatId: string;
}

const MOCK_REPORTS: Report[] = [
  {
    id: "r1", title: "Enterprise RAG Solutions", type: "markdown", date: "Oct 26, 2024",
    snippet: "An overview of top enterprise Retrieval-Augmented Generation providers, highlighting deployment options...",
    chatId: "chat-1"
  },
  {
    id: "r2", title: "Q4 Strategic Goals", type: "slides", date: "Oct 25, 2024",
    snippet: "1. Expand into APAC\n2. Launch unified API\n3. Reduce infrastructure costs",
    chatId: "chat-2"
  },
  {
    id: "r3", title: "User Churn Analysis", type: "sheet", date: "Oct 22, 2024",
    snippet: "Grid data spanning 12 months of cohort retention metrics, showing a 5% improvement YoY.",
    chatId: "chat-3"
  },
  {
    id: "r4", title: "Security Audit Summary", type: "pdf", date: "Oct 15, 2024",
    snippet: "Executive summary of the Q3 penetration test, noting zero critical vulnerabilities.",
    chatId: "chat-4"
  }
];

export default function SavedReportsPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const filtered = MOCK_REPORTS.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.snippet.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="px-8 py-8 shrink-0">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Saved Reports</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Your collection of finalized documents, slide decks, and data sheets generated across all conversations and deep research runs.
        </p>
      </div>

      <div className="px-8 pb-6 shrink-0">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(report => (
            <div 
              key={report.id} 
              className="flex flex-col rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-brand/30 transition-all cursor-pointer group"
              onClick={() => setLocation(`/agents/chat?conversationId=${report.chatId}`)}
            >
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted border border-border">
                    {report.type === "markdown" && <FileText className="w-5 h-5 text-brand" />}
                    {report.type === "slides" && <Presentation className="w-5 h-5 text-indigo-500" />}
                    {report.type === "sheet" && <TableIcon className="w-5 h-5 text-emerald-500" />}
                    {report.type === "pdf" && <File className="w-5 h-5 text-red-500" />}
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                    <Calendar className="w-3.5 h-3.5" />
                    {report.date}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-base leading-tight group-hover:text-brand transition-colors">{report.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {report.snippet}
                </p>
              </div>
              <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between mt-auto rounded-b-xl">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {report.type}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-200">
                  Open in Chat
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}