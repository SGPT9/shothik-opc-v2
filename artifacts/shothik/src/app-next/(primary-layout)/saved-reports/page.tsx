import { useState } from "react";
import { useLocation } from "wouter";
import { 
  FileText, Presentation, Table as TableIcon, File, Search, 
  Calendar, ArrowUpRight, Share2, PhoneCall, Copy, Check, Download
} from "lucide-react";

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
    id: "r1", title: "Enterprise RAG & Logistics in South Asia", type: "markdown", date: "Aug 14, 2026",
    snippet: "An overview of top enterprise Retrieval-Augmented Generation providers, highlighting Steadfast courier and bKash MFS payment deployment options...",
    chatId: "chat-1"
  },
  {
    id: "r2", title: "Q4 Seedstars Pitch Deck — Shothik AI", type: "slides", date: "Aug 12, 2026",
    snippet: "1. 650M South Asian Emerging Market\n2. 5-Step Agentic Slide Studio\n3. bKash/Nagad Micro-Billing Model",
    chatId: "chat-2"
  },
  {
    id: "r3", title: "F-Commerce Cohort Retention & COD Returns", type: "sheet", date: "Aug 08, 2026",
    snippet: "Grid data spanning 12 months of cohort retention metrics, showing a 5% improvement YoY after automated COD risk filtering.",
    chatId: "chat-3"
  },
  {
    id: "r4", title: "NBR Tax Act 2023 Compliance Brief", type: "pdf", date: "Jul 28, 2026",
    snippet: "Executive summary of Section 78 investment tax rebates and corporate depreciation tables for tech startups.",
    chatId: "chat-4"
  }
];

export default function SavedReportsPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = MOCK_REPORTS.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.snippet.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyLink = (e: React.MouseEvent, report: Report) => {
    e.stopPropagation();
    const url = `${window.location.origin}/agents/chat?conversationId=${report.chatId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(report.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareWhatsApp = (e: React.MouseEvent, report: Report) => {
    e.stopPropagation();
    const shareText = `📑 *${report.title}*\n\n${report.snippet}\n\nView full report on Shothik AI: ${window.location.origin}/agents/chat?conversationId=${report.chatId}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="px-8 py-8 shrink-0">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Saved Reports & Briefs</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Your collection of finalized documents, pitch decks, and financial models. Share directly to clients over WhatsApp or public links.
        </p>
      </div>

      <div className="px-8 pb-6 shrink-0">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
            placeholder="Search reports, pitch decks, tax briefs..."
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

              {/* Action Bar */}
              <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between mt-auto rounded-b-xl">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleShareWhatsApp(e, report)}
                    title="Share via WhatsApp"
                    className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(e, report)}
                    title="Copy Public Share Link"
                    className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition cursor-pointer flex items-center gap-1 text-[11px]"
                  >
                    {copiedId === report.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === report.id ? "Copied" : "Link"}</span>
                  </button>
                </div>

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