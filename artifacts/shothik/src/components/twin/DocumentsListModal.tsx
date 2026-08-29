import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { X, FileText, Search, BookOpen } from "lucide-react";

export interface DocumentItem {
  id: string;
  title: string;
  timeAgo: string;
  type: "document" | "report";
  content?: string;
}

interface DocumentsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDoc: (doc: DocumentItem) => void;
  docs?: DocumentItem[];
}

export const FULL_DOCUMENT_ARCHIVE: DocumentItem[] = [
  {
    id: "doc-roadmap",
    title: "Product Roadmap",
    timeAgo: "23H AGO",
    type: "document",
    content: `# Product Roadmap

### Now
- **Add /docs/identity-verification page** covering NID adapter usage and error codes
- **Add /docs/aml-verification page** covering OpenSanctions screening, match fields, and error handling
- **Add POST /v1/webhooks/:id/ping** test-ping endpoint for pre-production validation

### Next
- **Add /docs/otp-verification page** summarising the Bangladesh OTP vendor shortlist findings and recommended integration path
- **Add POST /v1/verify/phone endpoint** wiring a Bangladesh SMS OTP provider into the standard verification result shape
- **Add /docs/webhooks page** with curl examples for subscribe, list, ping, redeliver, and unsubscribe

### Later
- **Live selfie/liveness check** to replace manual ID-vs-face comparison at account opening
- **Cross-bank fraud signal sharing layer** across VerifiQ customers
- **Native BB e-KYC adapter** so banks can hand off entire onboarding flows to a single call`,
  },
  {
    id: "doc-day-42",
    title: "Day 42 — CEO Report",
    timeAgo: "1D AGO",
    type: "report",
    content: `# Day 42 — CEO Report

### Compliance Export
- \`GET /v1/audit/export?format=csv\` — Streams a well-formed CSV with columns \`verification_id\`, \`type\`, \`status\`, \`reason\`, \`tenant_id\`, \`created_at\`. Accepts the same \`since\` / \`until\` params as \`/v1/audit/verifications\`. Response carries \`Content-Type: text/csv\` and \`Content-Disposition: attachment\` — curl-able with an API key and ready to hand to a regulator or open in Excel.

### Live Data Providers (confirmed carried forward from Day 41, no regressions)
- \`POST /v1/verify/identity\` — Surepass NID adapter live; all stubs retired. \`SUREPASS_API_KEY\` from env.
- \`POST /v1/verify/aml\` — OpenSanctions screening live; key stored as server-side secret, not in code. Graceful degradation on rate-limit or timeout.

### Self-Serve Key Rotation
- \`POST /v1/admin/customers/:id/keys/:key_id/rotate\` — Mints replacement key preserving \`vq_pr_\` / \`vq_sb_\` prefix, stamps \`rotated_at\` on old key, writes rotation event to audit log.

### Webhook Surface (complete)
- \`POST /v1/webhooks/deliveries/:id/redeliver\` — Re-POSTs logged delivery with same HMAC path, writes new row with parent linkage, original row unchanged.
- \`GET /v1/webhooks/deliveries\` — Tenant-scoped delivery log with \`since\` / \`until\` filtering.`,
  },
  {
    id: "doc-day-41",
    title: "Day 41 — CEO Report",
    timeAgo: "2D AGO",
    type: "report",
    content: `# Day 41 — CEO Report\n\n### Multi-Tenant PostgREST Isolation\n- Implemented verified RLS policies on PostgreSQL tenant tables.\n- Retired all mock verification keys.\n\n### Surepass Production Adapter\n- Verified Bangladesh national identity card OCR and validation test suite.`,
  },
  {
    id: "doc-otp-research",
    title: "Research: Research Bangladesh mobile OTP providers for compliance-grade phone verification",
    timeAgo: "2D AGO",
    type: "document",
    content: `# Research: Bangladesh Mobile OTP Providers

### Providers Evaluated
1. **Grameenphone Direct SMS Gateway**: Lowest latency (<800ms delivery), DLT registration required.
2. **SSL Wireless**: Aggregated fallback across Robi, Banglalink, Teletalk.
3. **Infobip / Twilio (Global Route)**: High cost per SMS (৳3.20 vs ৳0.35 local), but instant sandbox provisioning.

### Recommendation
Start with SSL Wireless for sandbox tests, contract direct routes with GP & Robi once monthly volume exceeds 50,000 verifications.`,
  },
  { id: "doc-day-40", title: "Day 40 — CEO Report", timeAgo: "3D AGO", type: "report" },
  { id: "doc-day-39", title: "Day 39 — CEO Report", timeAgo: "4D AGO", type: "report" },
  { id: "doc-day-38", title: "Day 38 — CEO Report", timeAgo: "5D AGO", type: "report" },
  { id: "doc-day-37", title: "Day 37 — CEO Report", timeAgo: "6D AGO", type: "report" },
  { id: "doc-day-36", title: "Day 36 — CEO Report", timeAgo: "AUG 7", type: "report" },
  { id: "doc-day-35", title: "Day 35 — CEO Report", timeAgo: "AUG 6", type: "report" },
  { id: "doc-day-34", title: "Day 34 — CEO Report", timeAgo: "AUG 5", type: "report" },
  { id: "doc-day-33", title: "Day 33 — CEO Report", timeAgo: "AUG 4", type: "report" },
  { id: "doc-day-32", title: "Day 32 — CEO Report", timeAgo: "AUG 3", type: "report" },
  { id: "doc-day-31", title: "Day 31 — CEO Report", timeAgo: "AUG 2", type: "report" },
  { id: "doc-day-30", title: "Day 30 — CEO Report", timeAgo: "JUL 31", type: "report" },
];

export function DocumentsListModal({ open, onOpenChange, onSelectDoc, docs }: DocumentsListModalProps) {
  const [tab, setTab] = useState<"all" | "documents" | "reports">("all");

  const documentPool = docs && docs.length > 0 ? docs : FULL_DOCUMENT_ARCHIVE;

  const filtered = documentPool.filter((d) => {
    if (tab === "documents") return d.type === "document";
    if (tab === "reports") return d.type === "report";
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-[640px] bg-white text-slate-900 border border-slate-300 p-8 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800 max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-3 border-b border-transparent shrink-0">
          <DialogTitle className="text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
            Documents
          </DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogClose>
        </div>
        <DialogDescription className="sr-only">Full archive of executive reports and roadmap documents</DialogDescription>

        {/* Filter Tabs */}
        <div className="flex items-center gap-6 font-mono text-[11px] font-bold tracking-wider uppercase border-b border-slate-200 dark:border-zinc-800 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`pb-1 transition-colors cursor-pointer ${
              tab === "all" ? "text-black dark:text-white border-b-2 border-black dark:border-white font-extrabold" : "text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
            }`}
          >
            ALL
          </button>
          <button
            type="button"
            onClick={() => setTab("documents")}
            className={`pb-1 transition-colors cursor-pointer ${
              tab === "documents" ? "text-black dark:text-white border-b-2 border-black dark:border-white font-extrabold" : "text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
            }`}
          >
            DOCUMENTS
          </button>
          <button
            type="button"
            onClick={() => setTab("reports")}
            className={`pb-1 transition-colors cursor-pointer ${
              tab === "reports" ? "text-black dark:text-white border-b-2 border-black dark:border-white font-extrabold" : "text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
            }`}
          >
            REPORTS
          </button>
        </div>

        {/* Scrollable Document List */}
        <div className="flex-1 overflow-y-auto space-y-1 my-3 pr-2 font-serif text-xs">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              onClick={() => {
                onSelectDoc(doc);
                onOpenChange(false);
              }}
              className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-100 dark:hover:bg-zinc-900 border-b border-slate-100 dark:border-zinc-900 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3 pr-4">
                <FileText className="w-4 h-4 text-slate-400 group-hover:text-black dark:group-hover:text-white shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-zinc-100 group-hover:underline">
                  {doc.title}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 uppercase shrink-0">
                {doc.timeAgo}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
