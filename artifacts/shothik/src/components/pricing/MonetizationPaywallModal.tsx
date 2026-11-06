import React, { useState, useEffect } from "react";
import {
  MonetizationPaywallService,
  CREDIT_PACKAGES,
  OUTCOME_PASS_OPTIONS,
  SUBSCRIPTION_TIERS,
  FEATURE_RATE_CARDS,
  type CreditPackage,
} from "@/lib/infrastructure/monetization-paywall-service";

export interface MonetizationPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCredits?: number;
}

export const MonetizationPaywallModal: React.FC<MonetizationPaywallModalProps> = ({
  isOpen,
  onClose,
  userCredits = 550,
}) => {
  const [activeTab, setActiveTab] = useState<"passes" | "subscriptions" | "credits" | "rate_card">("passes");
  const [selectedProvider, setSelectedProvider] = useState<"bkash" | "nagad">("bkash");
  const [liveCredits, setLiveCredits] = useState<number>(userCredits);
  const [topupPayload, setTopupPayload] = useState<{ transactionId: string; paymentUrl: string; creditsAdded: number; totalPaidBdt: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    fetch("/api/v1/subscriptions/credits")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const bal = json?.data?.creditsBalance ?? json?.creditsBalance;
        if (active && typeof bal === "number") {
          setLiveCredits(bal);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePurchase = (pkg: CreditPackage) => {
    const res = MonetizationPaywallService.purchaseCreditPackage(pkg.packageId, selectedProvider);
    setTopupPayload(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>💳</span> Shothik Universal Credits & Outcome Passes
            </h2>
            <p className="text-xs text-slate-400">
              1-Tap Outcome Passes, 4-Persona Plans & Pay-As-You-Go Credits via bKash / Nagad / Card
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-mono font-bold text-emerald-400">
              ⚡ {liveCredits.toLocaleString()} Credits Available
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer">✕</button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab("passes")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${activeTab === "passes" ? "bg-emerald-600 text-white font-bold" : "bg-slate-950 text-slate-400 hover:text-white"}`}
          >
            🎯 30-Day Outcome Passes
          </button>
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${activeTab === "subscriptions" ? "bg-purple-600 text-white font-bold" : "bg-slate-950 text-slate-400 hover:text-white"}`}
          >
            🏢 4-Persona Monthly Plans
          </button>
          <button
            onClick={() => setActiveTab("credits")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${activeTab === "credits" ? "bg-amber-600 text-white font-bold" : "bg-slate-950 text-slate-400 hover:text-white"}`}
          >
            📲 Instant Credit Top-Ups
          </button>
          <button
            onClick={() => setActiveTab("rate_card")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${activeTab === "rate_card" ? "bg-sky-600 text-white font-bold" : "bg-slate-950 text-slate-400 hover:text-white"}`}
          >
            📊 Feature Rate Card
          </button>
        </div>

        {/* Tab 0: 30-Day Outcome Passes */}
        {activeTab === "passes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {OUTCOME_PASS_OPTIONS.map((pass) => (
              <div key={pass.passId} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 relative">
                {pass.badge && (
                  <span className="absolute -top-3 right-4 bg-emerald-500 text-slate-950 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                    {pass.badge}
                  </span>
                )}
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400">{pass.persona}</span>
                  <h3 className="font-bold text-white text-base mt-0.5">{pass.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-emerald-400 font-mono">৳{pass.priceBdt} BDT</p>
                    <span className="text-[11px] text-slate-400">(${pass.priceUsd} · {pass.durationDays} days)</span>
                  </div>
                  <ul className="mt-3 pt-3 border-t border-slate-800 space-y-1 text-xs text-slate-300">
                    {pass.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={`/pricing/checkout?passId=${encodeURIComponent(pass.passId)}`}
                  className="w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors no-underline"
                >
                  Unlock {pass.name} (+{pass.creditsIncluded} Credits) ➔
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Tab 1: Credit Packages */}
        {activeTab === "credits" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Select MFS Payment Provider:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProvider("bkash")}
                  className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${selectedProvider === "bkash" ? "bg-pink-950 border border-pink-500 text-pink-300" : "bg-slate-900 border border-slate-800 text-slate-400"}`}
                >
                  bKash 1-Tap
                </button>
                <button
                  onClick={() => setSelectedProvider("nagad")}
                  className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${selectedProvider === "nagad" ? "bg-orange-950 border border-orange-500 text-orange-300" : "bg-slate-900 border border-slate-800 text-slate-400"}`}
                >
                  Nagad 1-Tap
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <div key={pkg.packageId} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 relative">
                  {pkg.badge && (
                    <span className="absolute -top-3 right-4 bg-emerald-500 text-slate-950 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                      {pkg.badge}
                    </span>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-base">{pkg.name}</h3>
                    <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">৳{pkg.priceBdt} BDT</p>
                    <p className="text-[11px] text-slate-400">(${pkg.priceUsd} USD)</p>

                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-1 text-xs text-slate-200">
                      <p>⚡ Base Credits: <strong className="text-white font-mono">{pkg.credits}</strong></p>
                      <p>🎁 Bonus Credits: <strong className="text-emerald-300 font-mono">+{pkg.bonusCredits}</strong></p>
                      <p className="font-bold text-emerald-400 pt-1 text-xs">Total: {pkg.credits + pkg.bonusCredits} Credits</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    1-Tap Buy via {selectedProvider.toUpperCase()} ➔
                  </button>
                </div>
              ))}
            </div>

            {topupPayload && (
              <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400">bKash / Nagad 1-Tap Top-Up Session Initiated</span>
                  <span className="font-mono text-emerald-300">{topupPayload.transactionId}</span>
                </div>
                <p className="text-slate-300">Total Paid: <strong>৳{topupPayload.totalPaidBdt} BDT</strong> | Credits Added: <strong>+{topupPayload.creditsAdded} Credits</strong></p>
                <a href={topupPayload.paymentUrl} className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs mt-1 no-underline">
                  Complete Checkout ↗
                </a>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: 4-Persona Monthly Subscriptions */}
        {activeTab === "subscriptions" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <div key={tier.tierId} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h3 className="font-bold text-white text-base">{tier.name}</h3>
                  <p className="text-slate-400 text-[11px]">{tier.targetAudience}</p>

                  <p className="text-xl font-bold text-purple-400 font-mono">
                    {tier.priceBdtMonth === 0 ? "FREE" : `৳${tier.priceBdtMonth.toLocaleString()} BDT / mo ($${tier.priceUsdMonth})`}
                  </p>

                  <ul className="space-y-1.5 pt-2 border-t border-slate-800 text-slate-300">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-1.5">
                        <span className="text-purple-400">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {tier.priceBdtMonth > 0 && (
                  <a
                    href={`/pricing/checkout?packageType=${encodeURIComponent(tier.packageType)}`}
                    className="w-full text-center bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2 rounded-xl transition-colors no-underline mt-2"
                  >
                    Choose {tier.name} ➔
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Feature Rate Card */}
        {activeTab === "rate_card" && (
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
            <h3 className="font-bold text-white text-sm mb-2">⚡ Feature Credit Rate Card (Universal Task Credits)</h3>
            <div className="space-y-2">
              {FEATURE_RATE_CARDS.map((rc) => (
                <div key={rc.featureType} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-slate-300">
                  <span>{rc.label}</span>
                  <span className="bg-emerald-950 text-emerald-300 font-mono font-bold px-3 py-1 rounded-full">
                    {rc.creditCost} Credits / Run
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
