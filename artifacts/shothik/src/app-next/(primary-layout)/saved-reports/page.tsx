import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  FileText, Presentation, Table as TableIcon, File, Search, 
  Calendar, ArrowUpRight, Share2, PhoneCall, Copy, Check, Plus
} from "lucide-react";
import { getChatSessions, StoredChatSession } from "@/lib/chat-sessions-store";
import { listOfflineManuscripts, OfflineDocument } from "@/lib/offline/offline-storage";

interface Report {
  id: string;
  title: string;
  type: "markdown" | "slides" | "sheet" | "pdf";
  date: string;
  snippet: string;
  chatId: string;
}

export default function SavedReportsPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const sessions = getChatSessions();
    const manuscripts = listOfflineManuscripts();

    const sessionReports: Report[] = sessions.map((s) => ({
      id: s.id,
      title: s.title || "Untitled Session",
      type: "markdown",
      date: new Date(s.updatedAt || Date.now()).toLocaleDateString(),
      snippet: s.preview || "Active multi-agent session trace and synthesized outputs.",
      chatId: s.id,
    }));

    const manuscriptReports: Report[] = manuscripts.map((m) => ({
      id: m.id,
      title: m.title || "Manuscript Draft",
      type: "markdown",
      date: new Date(m.updatedAt || Date.now()).toLocaleDateString(),
      snippet: m.content ? m.content.slice(0, 140) + "..." : "Saved writing studio draft.",
      chatId: m.id,
    }));

    setReports([...sessionReports, ...manuscriptReports]);
  }, []);

  const filtered = reports.filter(r => 
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
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-border/80 bg-card/40">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted border border-border mb-4 text-muted-foreground">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No Saved Reports Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              {search ? `No reports matching "${search}".` : "Synthesized briefs, financial sheets, and pitch decks from chat and writing studio will automatically appear here."}
            </p>
            <button
              onClick={() => setLocation("/")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Agent Session</span>
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}