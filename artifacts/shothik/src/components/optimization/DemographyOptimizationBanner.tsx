import React, { useState } from "react";
import { LowRamPwaService, type MfsDeepLinkResult, type WhatsAppDispatchResult } from "@/lib/infrastructure/low-ram-pwa-service";

export interface DemographyOptimizationBannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemographyOptimizationBanner: React.FC<DemographyOptimizationBannerProps> = ({ isOpen, onClose }) => {
  const [customerMobile, setCustomerMobile] = useState("8801712345678");
  const [amountBdt, setAmountBdt] = useState(1200);
  const [trackingCode, setTrackingCode] = useState("BD_STEADFAST_755448");

  const [swStatus, setSwStatus] = useState<string>("Active (48MB DOM Limit)");
  const [deepLink, setDeepLink] = useState<MfsDeepLinkResult | null>(null);
  const [waDispatch, setWaDispatch] = useState<WhatsAppDispatchResult | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  if (!isOpen) return null;

  const handleGenerateDeepLink = (provider: "bkash" | "nagad") => {
    const link = LowRamPwaService.generateNativeMfsDeepLink({
      provider,
      amountBdt,
      merchantPhone: "01712345678",
      orderId: "ord_demo_9901",
    });
    setDeepLink(link);
  };

  const handleDispatchWhatsApp = async () => {
    setIsDispatching(true);
    const result = await LowRamPwaService.dispatchWhatsAppOrderReceipt({
      customerMobile,
      customerName: "Tanvir Ahmed",
      orderId: "ord_demo_9901",
      amountBdt,
      trackingCode,
    });
    setWaDispatch(result);
    setIsDispatching(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🇧🇩</span> Demography-Aware 2GB RAM & MFS Suite
            </h2>
            <p className="text-xs text-slate-400">Low-Spec Android PWA Cache, 1-Tap Native MFS Deep Links & WhatsApp Dispatch</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center">✕</button>
        </div>

        {/* Section 1: 2GB RAM PWA Service Worker Status */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-400">📱 2GB RAM Smartphone Offline Service Worker</span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-semibold">
              {swStatus}
            </span>
          </div>
          <p className="text-slate-400">Stale-while-revalidate strategy eliminates 3G mobile latency for rural Bangladesh users.</p>
        </div>

        {/* Section 2: Native MFS App Deep-Link Launcher */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <h3 className="font-semibold text-purple-400">📲 1-Tap Native Smartphone App Deep-Linking</h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={amountBdt}
              onChange={(e) => setAmountBdt(Number(e.target.value))}
              placeholder="Amount in BDT"
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs w-32"
            />
            <button
              onClick={() => handleGenerateDeepLink("bkash")}
              className="bg-pink-600 hover:bg-pink-500 text-white px-3.5 py-2 rounded-xl font-bold transition-colors"
            >
              Generate bKash Deep Link
            </button>
            <button
              onClick={() => handleGenerateDeepLink("nagad")}
              className="bg-orange-600 hover:bg-orange-500 text-white px-3.5 py-2 rounded-xl font-bold transition-colors"
            >
              Generate Nagad Deep Link
            </button>
          </div>

          {deepLink && (
            <div className="bg-slate-900 p-3 rounded-xl border border-purple-500/40 space-y-1 font-mono text-[11px]">
              <p className="text-purple-300 font-bold">Native URI Scheme: {deepLink.nativeDeepLink}</p>
              <p className="text-slate-400">Web Fallback: {deepLink.webFallbackUrl}</p>
              <a
                href={deepLink.nativeDeepLink}
                className="inline-block bg-purple-600 text-white px-3 py-1 rounded-lg text-xs font-sans mt-1"
              >
                Launch Native {deepLink.provider} App 🚀
              </a>
            </div>
          )}
        </div>

        {/* Section 3: WhatsApp Pipedream Order & Tracking Dispatch */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <h3 className="font-semibold text-emerald-400">💬 WhatsApp Business Pipedream Order Dispatch</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Customer Mobile #</label>
              <input
                type="text"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Steadfast Tracking Code</label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleDispatchWhatsApp}
            disabled={isDispatching}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            {isDispatching ? "Dispatching WhatsApp Message..." : "💬 Dispatch WhatsApp Receipt & Steadfast Link"}
          </button>

          {waDispatch && (
            <div className="bg-emerald-950/80 p-3.5 rounded-xl border border-emerald-500/50 space-y-1">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>WhatsApp Message Delivered ✅</span>
                <span className="font-mono text-[10px]">{waDispatch.whatsappMessageId}</span>
              </div>
              <p className="text-slate-300">Recipient: <strong className="text-white font-mono">{waDispatch.customerMobile}</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
