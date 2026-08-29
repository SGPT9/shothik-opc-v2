import React, { useState } from "react";
import { X, Zap, Check, Copy, RefreshCw, Send, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DeveloperWebhookSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperWebhookSandboxModal: React.FC<DeveloperWebhookSandboxModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [provider, setProvider] = useState<"steadfast" | "bkash" | "pathao">("steadfast");
  const [event, setEvent] = useState<string>("delivered");
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`NLK_INV_${Date.now().toString().slice(-6)}`);
  const [trackingCode, setTrackingCode] = useState<string>(`ST-POD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [amount, setAmount] = useState<number>(450);
  const [loading, setLoading] = useState<boolean>(false);
  const [responsePayload, setResponsePayload] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFireWebhook = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/sandbox/simulate-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          event,
          invoiceNumber,
          trackingCode,
          amount,
        }),
      });
      const data = await res.json();
      setResponsePayload(data);
    } catch (err: any) {
      setResponsePayload({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!responsePayload) return;
    navigator.clipboard.writeText(JSON.stringify(responsePayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Logistics & MFS Webhook Sandbox</h2>
              <p className="text-[11px] text-zinc-400">Simulate real-time inbound payment & delivery webhooks</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* Provider Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Select Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setProvider("steadfast");
                  setEvent("delivered");
                }}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer",
                  provider === "steadfast"
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold shadow-sm"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                )}
              >
                <span>🚚 Steadfast Courier</span>
                <span className="text-[10px] opacity-70">POD Tracking</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider("bkash");
                  setEvent("completed");
                }}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer",
                  provider === "bkash"
                    ? "bg-pink-500/15 border-pink-500/40 text-pink-300 font-bold shadow-sm"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                )}
              >
                <span>🌸 bKash PGW</span>
                <span className="text-[10px] opacity-70">MFS Payouts</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider("pathao");
                  setEvent("delivered");
                }}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer",
                  provider === "pathao"
                    ? "bg-red-500/15 border-red-500/40 text-red-300 font-bold shadow-sm"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                )}
              >
                <span>🏍️ Pathao Logistics</span>
                <span className="text-[10px] opacity-70">Metro Parcel</span>
              </button>
            </div>
          </div>

          {/* Event Trigger Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Webhook Event Trigger
            </label>
            <div className="flex flex-wrap gap-2">
              {provider === "bkash" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setEvent("completed")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-all",
                      event === "completed"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    )}
                  >
                    ✓ Payment Completed (200)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvent("failed")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-all",
                      event === "failed"
                        ? "bg-rose-500/20 border-rose-500 text-rose-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    )}
                  >
                    ✗ Payment Failed (400)
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setEvent("delivered")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-all",
                      event === "delivered"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    )}
                  >
                    📦 Parcel Delivered (COD Settled)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvent("in_transit")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-all",
                      event === "in_transit"
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    )}
                  >
                    🚚 In Transit (Hub Transfer)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvent("return")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-all",
                      event === "return"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    )}
                  >
                    ↩️ Return to Origin (RTO)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-100 font-mono text-xs focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Tracking Code</label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-100 font-mono text-xs focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-400 mb-1 font-mono">Amount (BDT)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-100 font-mono text-xs focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Response Payload Inspector */}
          {responsePayload && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Webhook Simulation Response:
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 font-mono text-[11px] text-emerald-300/90 overflow-x-auto custom-scrollbar">
                {JSON.stringify(responsePayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-900/60">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setInvoiceNumber(`NLK_INV_${Date.now().toString().slice(-6)}`);
              setTrackingCode(`ST-POD-${Math.floor(100000 + Math.random() * 900000)}`);
              setResponsePayload(null);
            }}
            className="h-8 text-xs border-zinc-800 text-zinc-400 hover:text-white gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Regenerate IDs</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onClose} className="h-8 text-xs text-zinc-400 hover:text-white">
              Close
            </Button>
            <Button
              size="sm"
              onClick={handleFireWebhook}
              disabled={loading}
              className="h-8 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 gap-1.5 shadow-md"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Fire Simulated Webhook</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
