import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { X, ExternalLink, Copy, Check, ChevronUp, ChevronDown, Globe } from "lucide-react";

interface DnsRecord {
  type: string;
  host: string;
  value: string;
  purpose: string;
}

interface ManageDomainsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  polsiaUrl?: string;
  customDomain?: string;
  onReleaseDomain?: () => void;
  onConnectDomain?: (domain: string) => void;
}

const DEFAULT_DNS_RECORDS: DnsRecord[] = [
  {
    type: "CNAME",
    host: "www",
    value: "web.polsia.app",
    purpose: "Points www to your app.",
  },
  {
    type: "ALIAS",
    host: "@",
    value: "www.shothikaddress.com",
    purpose: "Points your domain to your app.",
  },
  {
    type: "CNAME",
    host: "_87d18cb1251900704bd784857debac95.shothikaddress.com.",
    value: "_b078b6f1d5c0e0c36fb087f6d9c1ae72.jkddzztszm.acm-validations.aws.",
    purpose: "SSL certificate validation — keep this record.",
  },
  {
    type: "CNAME",
    host: "_c065d9d952a69104b13e0b61734b09d6.www.shothikaddress.com.",
    value: "_b5809002cd441a1e3677702bf76b4fe6.jkddzztszm.acm-validations.aws.",
    purpose: "SSL certificate validation — keep this record.",
  },
];

export function ManageDomainsModal({
  open,
  onOpenChange,
  polsiaUrl = "https://verifiq-3.polsia.app",
  customDomain = "shothikaddress.com",
  onReleaseDomain,
  onConnectDomain,
}: ManageDomainsModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editingUrl, setEditingUrl] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(polsiaUrl);
  const [connectInputOpen, setConnectInputOpen] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState("");
  const [buyDomainOpen, setBuyDomainOpen] = useState(false);
  const [domainSearchQuery, setDomainSearchQuery] = useState("");

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const beveledBtnClass =
    "px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-950 dark:text-zinc-50 border border-zinc-300 dark:border-zinc-700 font-mono font-semibold text-[11px] uppercase tracking-wider shadow-xs active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer rounded-md select-none";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[620px] bg-white text-slate-900 border border-slate-300 p-8 rounded-none shadow-2xl font-serif dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-transparent">
          <DialogTitle className="text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
            Manage Domains
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
        <DialogDescription className="text-xs font-serif text-slate-700 dark:text-zinc-300 leading-relaxed pb-3">
          Publish your project to custom domains.
        </DialogDescription>

        <div className="space-y-6 pt-1 font-serif">
          {/* ── Section 1: Shothik URL ── */}
          <div className="space-y-2.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Shothik URL
            </h3>

            <div className="p-3 border border-slate-300 dark:border-zinc-800 bg-[#fcfcfc] dark:bg-zinc-900/60 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 font-mono text-xs overflow-hidden text-ellipsis">
                <span>🔗</span>
                {editingUrl ? (
                  <input
                    type="text"
                    value={currentUrl}
                    onChange={(e) => setCurrentUrl(e.target.value)}
                    className="bg-white dark:bg-zinc-950 border border-slate-400 dark:border-zinc-700 px-2 py-0.5 font-mono text-xs outline-none"
                  />
                ) : (
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-black dark:text-white font-semibold underline hover:opacity-80 transition-opacity"
                  >
                    {currentUrl}
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setEditingUrl(!editingUrl)}
                className={beveledBtnClass}
              >
                {editingUrl ? "SAVE URL" : "EDIT URL"}
              </button>
            </div>
          </div>

          {/* ── Section 2: Custom domains ── */}
          <div className="space-y-2.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Custom domains
            </h3>

            {/* Custom Domain Card */}
            <div className="p-4 border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm space-y-4">
              {/* Header inside domain card */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-black dark:text-white">
                    {customDomain}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    External domain
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 border border-emerald-500 text-emerald-700 dark:text-emerald-400 rounded-full font-mono text-[11px] font-bold tracking-wider">
                    Live
                  </span>
                  <span className="text-slate-400 text-xs">▴</span>
                  <a
                    href={`https://${customDomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 text-xs font-semibold hover:underline flex items-center gap-0.5"
                  >
                    <span>Visit</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-zinc-800 pt-2 grid grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block uppercase">Added</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">Aug 5, 2026</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block uppercase">Last checked</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">Aug 6, 2026, 12:01 AM</span>
                </div>
              </div>

              {/* DNS Records */}
              <div className="space-y-2 pt-2">
                <h5 className="font-serif font-bold text-sm text-black dark:text-white">
                  DNS records
                </h5>
                <p className="font-serif text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Add these records at your domain registrar, then choose &quot;Refresh status&quot;. SSL is issued automatically once they resolve (usually minutes, up to 48h).
                </p>

                {/* DNS Records Table */}
                <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 mt-2">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-[10px] uppercase font-bold text-slate-600 dark:text-zinc-400">
                      <tr>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Host</th>
                        <th className="p-2.5">Value</th>
                        <th className="p-2.5">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-900">
                      {DEFAULT_DNS_RECORDS.map((rec, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/40">
                          <td className="p-2.5 font-bold">{rec.type}</td>
                          <td className="p-2.5 break-all max-w-[140px] text-slate-800 dark:text-zinc-200">
                            {rec.host}
                          </td>
                          <td className="p-2.5 break-all max-w-[180px] text-slate-800 dark:text-zinc-200">
                            {rec.value}
                          </td>
                          <td className="p-2.5 font-serif text-[11px] text-slate-600 dark:text-zinc-400">
                            {rec.purpose}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Release Domain Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to release ${customDomain}?`)) {
                        onReleaseDomain?.();
                        onOpenChange(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-gradient-to-b from-red-50 to-red-100 hover:from-white hover:to-red-100 text-red-600 font-mono font-bold text-[10px] uppercase tracking-wider border border-red-400 dark:border-red-800 dark:from-red-950/40 dark:to-red-900/40 dark:text-red-400 shadow-sm rounded-none transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Release domain
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 3: Connect existing domain ── */}
          <div className="p-4 border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-serif font-bold text-sm text-black dark:text-white">
                Connect existing domain
              </h4>
              <p className="font-serif text-xs text-slate-600 dark:text-zinc-400">
                Connect a domain you own from any provider.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setConnectInputOpen(!connectInputOpen)}
              className={beveledBtnClass}
            >
              CONNECT DOMAIN
            </button>
          </div>

          {connectInputOpen && (
            <div className="p-4 border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 space-y-3 animate-in fade-in">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Domain Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  placeholder="yourbrand.com"
                  className="flex-1 p-2 border border-slate-400 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newDomainInput.trim()) {
                      onConnectDomain?.(newDomainInput.trim());
                      setConnectInputOpen(false);
                      setNewDomainInput("");
                    }
                  }}
                  className={beveledBtnClass}
                >
                  ADD
                </button>
              </div>
            </div>
          )}

          {/* ── Section 4: Buy a new domain ── */}
          <div className="p-4 border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="font-serif font-bold text-sm text-black dark:text-white">
                Buy a new domain
              </h4>
              <p className="font-serif text-xs text-slate-600 dark:text-zinc-400">
                Search and register one without leaving Shothik.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setBuyDomainOpen(!buyDomainOpen)}
              className={beveledBtnClass}
            >
              BUY DOMAIN
            </button>
          </div>

          {buyDomainOpen && (
            <div className="p-4 border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 space-y-3 animate-in fade-in">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Search Domain Availability
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={domainSearchQuery}
                  onChange={(e) => setDomainSearchQuery(e.target.value)}
                  placeholder="e.g. verifiq.io"
                  className="flex-1 p-2 border border-slate-400 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => alert(`Checking availability for ${domainSearchQuery}... Available: $12.99/year`)}
                  className={beveledBtnClass}
                >
                  CHECK
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
