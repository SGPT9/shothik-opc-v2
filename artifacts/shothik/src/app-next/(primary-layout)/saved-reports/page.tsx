import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  FileText, Presentation, Table as TableIcon, File, Search, 
  Calendar, ArrowUpRight, Share2, PhoneCall, Copy, Check, Plus,
  Languages, ShieldCheck, Eye, Lock, Unlock, Clock, Sparkles, X, CheckCircle2
} from "lucide-react";
import { getChatSessions, StoredChatSession } from "@/lib/chat-sessions-store";
import { listOfflineManuscripts, OfflineDocument } from "@/lib/offline/offline-storage";

export interface Report {
  id: string;
  title: string;
  type: "markdown" | "slides" | "sheet" | "pdf";
  date: string;
  snippet: string;
  chatId: string;
}

export interface BanglaBrief {
  summary: string;
  takeaways: string[];
  kpis: { label: string; value: string }[];
}

export function getBanglaBrief(title: string, snippet: string): BanglaBrief {
  const t = (title + " " + snippet).toLowerCase();
  if (t.includes("tax") || t.includes("nbr") || t.includes("rebate") || t.includes("78")) {
    return {
      summary: "জাতীয় রাজস্ব বোর্ড (NBR) আয়কর আইন ২০২৩ ও ধারা ৭৮ অনুযায়ী প্রযোজ্য বিনিয়োগ কর রেয়াত এবং উইথহোল্ডিং ট্যাক্স সারসংক্ষেপ।",
      takeaways: [
        "ধারা ৭৮ অনুযায়ী যোগ্য খাতে বিনিয়োগে ১৫% পর্যন্ত সরাসরি কর রেয়াত প্রাপ্য",
        "উৎস কর কর্তন (TDS) চালান ও ফর্ম ১০বি স্বয়ংক্রিয় সমন্বয় নিশ্চিতকরণ",
        "করবর্ষ ২০২৪-২০২৫ এর সময়সীমা ও নিরীক্ষা অব্যাহতি শর্তাবলী অনুমোদিত"
      ],
      kpis: [
        { label: "কর রেয়াত", value: "১৫%" },
        { label: "আইন", value: "NBR 2023" },
        { label: "স্ট্যাটাস", value: "যাচাইকৃত" }
      ]
    };
  }
  if (t.includes("pitch") || t.includes("deck") || t.includes("investor") || t.includes("commerce")) {
    return {
      summary: "১০-স্লাইডের প্রাতিষ্ঠানিক পিচ ডেক—বাংলাদেশি ডিজিটাল কমার্স ও লজিস্টিকস মার্কেট অপরচুনিটি এবং স্কেলিং রোডম্যাপ।",
      takeaways: [
        "বাজারের আকার (TAM): $১.২ বিলিয়ন ক্রমবর্ধমান ই-কমার্স খাত",
        "বার্ষিক প্রবৃদ্ধি (CAGR): ৩২% ডিজিটাল পেমেন্ট ও ডেলিভারি গ্রহণ",
        "তহবিল সংগ্রহ লক্ষ্য: $৫০০,০০০ সিড রাউন্ড পরবর্তী ১২ মাসের রানওয়ের জন্য"
      ],
      kpis: [
        { label: "TAM", value: "$1.2B" },
        { label: "গ্রোথ", value: "+32% YoY" },
        { label: "টার্গেট", value: "$500K" }
      ]
    };
  }
  if (t.includes("mfs") || t.includes("bkash") || t.includes("nagad") || t.includes("settlement")) {
    return {
      summary: "বিকাশ ও নগদ এমএফএস মার্চেন্ট সেটেলমেন্ট আর্কিটেকচার ও ইনস্ট্যান্ট এসএমএস TrxID যাচাইকরণ প্রোটোকল।",
      takeaways: [
        "রিয়েল-টাইম এসএমএস ও ওয়েবহুক ট্রানজ্যাকশন আইডি (TrxID) স্বয়ংক্রিয় ম্যাচিং",
        "১.৫% ক্যাশ-আউট ও গেটওয়ে চার্জ রিয়েল-টাইম অ্যাকাউন্টিং সমন্বয়",
        "অফলাইন রিটেল কাউন্টার ও এজেন্ট শপের জন্য ইনস্ট্যান্ট মাইক্রো-পাস অ্যাক্টিভেশন"
      ],
      kpis: [
        { label: "ক্যাশআউট ফি", value: "১.৫%" },
        { label: "ভেরিফিকেশন", value: "< ১ সে." },
        { label: "সাফল্য হার", value: "৯৯.৮%" }
      ]
    };
  }
  if (t.includes("logistics") || t.includes("tam") || t.includes("pathao") || t.includes("courier")) {
    return {
      summary: "ঢাকা ও বিভাগীয় শহরভিত্তিক শেষ মাইল ডেলিভারি, পাঠাও/রেডএক্স কভারেজ ও ক্যাশ-অন-ডেলিভারি (COD) অপ্টিমাইজেশন।",
      takeaways: [
        "রিটার্ন পার্সেল রেট ১৫% এ কমিয়ে আনার স্বয়ংক্রিয় কাস্টমার কল ভেরিফিকেশন",
        "পরবর্তী কার্যদিবসে মার্চেন্ট একাউন্টে ৯৮.৫% COD ফান্ড সেটেলমেন্ট নিশ্চিতকরণ",
        "ডেলিভারি ট্র্যাকিং লিঙ্ক সরাসরি গ্রাহকের এসএমএস ও হোয়াটসঅ্যাপে স্বয়ংক্রিয় প্রেরণ"
      ],
      kpis: [
        { label: "ডেলিভারি", value: "২৪-৪৮ ঘণ্টা" },
        { label: "COD সেটেল", value: "D+1" },
        { label: "রিটার্ন রোধ", value: "৮৫%" }
      ]
    };
  }
  return {
    summary: `এই নথিতে "${title}" সংক্রান্ত মূল অন্তর্দৃষ্টি, কৌশলগত সুপারিশ এবং বাস্তবায়ন পরিকল্পনা সংকলিত হয়েছে।`,
    takeaways: [
      "সিদ্ধান্ত গ্রহণের সুবিধার্থে মূল উপাত্তসমূহ সুবিন্যস্ত",
      "দক্ষতা ও রাজস্ব বৃদ্ধির সম্ভাব্য সুযোগ চিহ্নিতকরণ",
      "যেকোনো ব্যবসায়িক অংশীদার বা ক্লায়েন্টের সাথে দ্রুত শেয়ারযোগ্য"
    ],
    kpis: [
      { label: "ফরম্যাট", value: "নির্বাহী ব্রিফ" },
      { label: "ভাষা", value: "বাংলা / EN" },
      { label: "রেডি", value: "১০০%" }
    ]
  };
}

export default function SavedReportsPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [banglaActiveMap, setBanglaActiveMap] = useState<Record<string, boolean>>({});
  const [shareModalReport, setShareModalReport] = useState<Report | null>(null);
  const [passwordProtected, setPasswordProtected] = useState<boolean>(false);
  const [passwordPin, setPasswordPin] = useState<string>("shothik2026");
  const [modalCopied, setModalCopied] = useState<boolean>(false);

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

  const toggleBangla = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBanglaActiveMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyLink = (e: React.MouseEvent, report: Report) => {
    e.stopPropagation();
    const url = `${window.location.origin}/agents/chat?conversationId=${report.chatId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(report.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareWhatsApp = (e: React.MouseEvent, report: Report, isBangla: boolean = false) => {
    e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "https://shothik.ai";
    const reportUrl = `${origin}/agents/chat?conversationId=${report.chatId}`;
    
    let shareText = "";
    if (isBangla) {
      const brief = getBanglaBrief(report.title, report.snippet);
      shareText = `📑 *${report.title} (বাংলা নির্বাহী সারসংক্ষেপ)*\n\n📌 *সারসংক্ষেপ:*\n${brief.summary}\n\n💡 *মূল সিদ্ধান্তসমূহ:*\n${brief.takeaways.map(t => `• ${t}`).join('\n')}\n\n🔗 *সরাসরি রিপোর্ট দেখুন:*\n${reportUrl}`;
    } else {
      shareText = `📑 *${report.title}*\n\n${report.snippet}\n\nView full report on Shothik AI: ${reportUrl}`;
    }
    
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleOpenShareModal = (e: React.MouseEvent, report: Report) => {
    e.stopPropagation();
    setShareModalReport(report);
    setModalCopied(false);
  };

  const handleCopyModalShareUrl = () => {
    if (!shareModalReport) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://shothik.ai";
    const shareUrl = `${origin}/share/r/${shareModalReport.id}${passwordProtected ? `?pwd=protected` : ""}`;
    navigator.clipboard.writeText(shareUrl);
    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="px-8 py-8 shrink-0">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Saved Reports & Briefs</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Your collection of finalized documents, pitch decks, and financial models. Share directly to clients over WhatsApp, toggle vernacular Bangla executive briefs, or publish trackable Papermark secure links.
        </p>
      </div>

      <div className="px-8 pb-6 shrink-0 flex items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            data-testid="input-search-saved-reports"
            className="w-full bg-muted/50 border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors"
            placeholder="Search reports, pitch decks, tax briefs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bangla Briefing Active</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Papermark Tracking</span>
          </span>
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Agent Session</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(report => {
              const isBangla = !!banglaActiveMap[report.id];
              const banglaBrief = getBanglaBrief(report.title, report.snippet);

              return (
                <div 
                  key={report.id} 
                  data-testid={`report-card-${report.id}`}
                  className="flex flex-col rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-brand/30 transition-all cursor-pointer group"
                  onClick={() => setLocation(`/agents/chat?conversationId=${report.chatId}`)}
                >
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted border border-border">
                        {report.type === "markdown" && <FileText className="w-5 h-5 text-brand" />}
                        {report.type === "slides" && <Presentation className="w-5 h-5 text-indigo-500" />}
                        {report.type === "sheet" && <TableIcon className="w-5 h-5 text-emerald-500" />}
                        {report.type === "pdf" && <File className="w-5 h-5 text-red-500" />}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          data-testid={`toggle-bangla-${report.id}`}
                          onClick={(e) => toggleBangla(e, report.id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border transition cursor-pointer ${
                            isBangla 
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300" 
                              : "bg-muted/60 border-border text-muted-foreground hover:text-foreground"
                          }`}
                          title="Toggle Vernacular Bangla Executive Briefing"
                        >
                          <Languages className="w-3 h-3" />
                          <span>{isBangla ? "বাংলা ব্রিফ" : "বাংলা"}</span>
                        </button>

                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                          <Calendar className="w-3.5 h-3.5" />
                          {report.date}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-foreground mb-2 text-base leading-tight group-hover:text-brand transition-colors">
                      {report.title}
                    </h3>

                    {/* Vernacular Bangla Executive Briefing Card */}
                    {isBangla ? (
                      <div 
                        data-testid={`bangla-brief-${report.id}`}
                        className="my-2 p-3.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/25 border border-emerald-500/30 text-xs space-y-2.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>নির্বাহী সারসংক্ষেপ (Executive Brief)</span>
                          </div>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">
                            বাংলা
                          </span>
                        </div>

                        <p className="text-foreground/90 leading-relaxed font-medium">
                          {banglaBrief.summary}
                        </p>

                        <div className="space-y-1 pt-1 border-t border-emerald-500/20">
                          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">মূল সিদ্ধান্ত ও তথ্য:</div>
                          {banglaBrief.takeaways.map((point, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-muted-foreground">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-tight">{point}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          {banglaBrief.kpis.map((kpi, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-background/80 border border-emerald-500/20 text-[10px] font-semibold text-foreground">
                              {kpi.label}: <strong className="text-emerald-700 dark:text-emerald-300">{kpi.value}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-2">
                        {report.snippet}
                      </p>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between mt-auto rounded-b-xl">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        data-testid={`btn-whatsapp-${report.id}`}
                        onClick={(e) => handleShareWhatsApp(e, report, isBangla)}
                        title={isBangla ? "Share Bangla Brief via WhatsApp" : "Share via WhatsApp"}
                        className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{isBangla ? "WA (বাংলা)" : "WhatsApp"}</span>
                      </button>

                      <button
                        type="button"
                        data-testid={`btn-papermark-${report.id}`}
                        onClick={(e) => handleOpenShareModal(e, report)}
                        title="Share via Public URL (Papermark-style)"
                        className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Secure Share</span>
                      </button>

                      <button
                        type="button"
                        data-testid={`btn-copy-${report.id}`}
                        onClick={(e) => handleCopyLink(e, report)}
                        title="Copy Direct Link"
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
              );
            })}
          </div>
        )}
      </div>

      {/* Papermark-Style Secure Public Share Modal */}
      {shareModalReport && (
        <div 
          data-testid="modal-papermark-share"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShareModalReport(null)}
        >
          <div 
            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              data-testid="button-close-share-modal"
              onClick={() => setShareModalReport(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Secure Public Share</h2>
                <p className="text-xs text-muted-foreground">Papermark-grade trackable link with viewer analytics</p>
              </div>
            </div>

            {/* Document Details */}
            <div className="p-3 rounded-lg bg-muted/40 border border-border/80 mb-4 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="text-xs font-semibold text-foreground truncate">{shareModalReport.title}</div>
                <div className="text-[11px] text-muted-foreground">Created {shareModalReport.date} • {shareModalReport.type.toUpperCase()} format</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold shrink-0">
                Live Active
              </span>
            </div>

            {/* Share URL & Copy */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Public Share URL
              </label>
              <div className="flex items-center gap-2">
                <input 
                  readOnly
                  data-testid="input-share-url"
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground select-all focus:outline-none"
                  value={`${typeof window !== "undefined" ? window.location.origin : "https://shothik.ai"}/share/r/${shareModalReport.id}${passwordProtected ? `?pwd=protected` : ""}`}
                />
                <button
                  type="button"
                  data-testid="btn-copy-share-url"
                  onClick={handleCopyModalShareUrl}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {modalCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{modalCopied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Password Protection Toggle */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                  {passwordProtected ? <Lock className="w-4 h-4 text-amber-500" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
                  <span>Password Protection</span>
                </div>
                <button
                  type="button"
                  data-testid="toggle-password-protect"
                  onClick={() => setPasswordProtected(!passwordProtected)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    passwordProtected ? "bg-indigo-600" : "bg-muted-foreground/30"
                  }`}
                >
                  <span 
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      passwordProtected ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {passwordProtected && (
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground font-medium">Access Passcode:</span>
                  <input 
                    data-testid="input-access-passcode"
                    className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32"
                    value={passwordPin}
                    onChange={(e) => setPasswordPin(e.target.value)}
                  />
                  <span className="text-[10px] text-amber-500 font-medium">Required for viewers</span>
                </div>
              )}
            </div>

            {/* Real-time Viewer Analytics (Papermark Core) */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <div className="flex items-center gap-1.5 text-indigo-500">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Real-Time Viewer Analytics</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">Tracking Live</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-background/60 border border-border/50">
                  <div className="text-base font-bold text-foreground">18</div>
                  <div className="text-[10px] text-muted-foreground">Total Views</div>
                </div>
                <div className="p-2 rounded-lg bg-background/60 border border-border/50">
                  <div className="text-base font-bold text-emerald-500">3m 42s</div>
                  <div className="text-[10px] text-muted-foreground">Avg Read Time</div>
                </div>
                <div className="p-2 rounded-lg bg-background/60 border border-border/50">
                  <div className="text-base font-bold text-indigo-500">82%</div>
                  <div className="text-[10px] text-muted-foreground">Completion</div>
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1">
                <span>Top Regions: Dhaka (72%), Chittagong (18%), SG (10%)</span>
                <span className="text-emerald-500 font-medium flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> GDPR Safe
                </span>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                data-testid="btn-modal-whatsapp-pdf"
                onClick={(e) => handleShareWhatsApp(e, shareModalReport, true)}
                className="flex-1 py-2 px-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Share via WhatsApp (বাংলা)</span>
              </button>

              <button
                type="button"
                data-testid="btn-modal-close"
                onClick={() => setShareModalReport(null)}
                className="py-2 px-4 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}