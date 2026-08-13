import React, { useState } from "react";
import { MerchantOnboardingWizardService, type ScrapedCatalogItem, type MerchantStoreLaunchResult } from "@/lib/infrastructure/merchant-onboarding-wizard";

export interface MerchantOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MerchantOnboardingWizard: React.FC<MerchantOnboardingWizardProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form States
  const [fbUrl, setFbUrl] = useState("https://facebook.com/jamdani_crafts");
  const [merchantName, setMerchantName] = useState("Jamdani Crafts Dhaka");
  const [customDomain, setCustomDomain] = useState("jamdanicrafts.com.bd");
  const [bkashPhone, setBkashPhone] = useState("01712345678");
  const [nagadPhone, setNagadPhone] = useState("01812345678");
  const [ownerEmail, setOwnerEmail] = useState("owner@jamdanicrafts.com.bd");

  // Scraped Items & Launch Result
  const [products, setProducts] = useState<ScrapedCatalogItem[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [launchResult, setLaunchResult] = useState<MerchantStoreLaunchResult | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  if (!isOpen) return null;

  const handleScrapeCatalog = async () => {
    if (!fbUrl.trim()) return;
    setIsScraping(true);
    const catalog = await MerchantOnboardingWizardService.scrapeFacebookCatalog(fbUrl);
    setProducts(catalog);
    setIsScraping(false);
    setStep(2);
  };

  const handleLaunchStore = async () => {
    setIsLaunching(true);
    const result = await MerchantOnboardingWizardService.launchMerchantStore({
      merchantName,
      facebookPageUrl: fbUrl,
      customDomain,
      bkashMerchantPhone: bkashPhone,
      nagadMerchantPhone: nagadPhone,
      ownerEmail,
    });
    setLaunchResult(result);
    setIsLaunching(false);
    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>⚡</span> 1-Click F-Commerce Store Onboarding Wizard
            </h2>
            <p className="text-xs text-slate-400">Transform your Facebook Page into an InsForge-powered E-Commerce store</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center">✕</button>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold border-b border-slate-800 pb-3">
          <span className={step === 1 ? "text-emerald-400 font-bold border-b-2 border-emerald-400 pb-1" : "text-slate-500"}>1. FB URL</span>
          <span className={step === 2 ? "text-emerald-400 font-bold border-b-2 border-emerald-400 pb-1" : "text-slate-500"}>2. Catalog Preview</span>
          <span className={step === 3 ? "text-emerald-400 font-bold border-b-2 border-emerald-400 pb-1" : "text-slate-500"}>3. Domain & MFS</span>
          <span className={step === 4 ? "text-emerald-400 font-bold border-b-2 border-emerald-400 pb-1" : "text-slate-500"}>4. Store Live</span>
        </div>

        {/* Step 1: Facebook Page URL Input */}
        {step === 1 && (
          <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold text-emerald-400">Step 1: Enter your Facebook Page URL</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Facebook Page Link</label>
              <input
                type="text"
                value={fbUrl}
                onChange={(e) => setFbUrl(e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleScrapeCatalog}
              disabled={isScraping}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2.5 rounded-xl transition-colors"
            >
              {isScraping ? "ScrapeGraphAI Parsing Catalog..." : "Parse Catalog with ScrapeGraphAI ➔"}
            </button>
          </div>
        )}

        {/* Step 2: Scraped Catalog Preview */}
        {step === 2 && (
          <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-emerald-400">Step 2: Scraped Catalog Preview ({products.length} Products)</h3>
              <button onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-white">← Edit URL</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {products.map((p) => (
                <div key={p.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1 text-xs">
                  <div className="w-full h-20 bg-slate-800 rounded-lg flex items-center justify-center text-xl">🛍️</div>
                  <h4 className="font-semibold text-white truncate">{p.title}</h4>
                  <p className="text-emerald-400 font-mono font-bold">৳{p.priceBdt} BDT</p>
                  <span className="text-[10px] text-slate-400 block">Stock: {p.stockCount} pcs</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2.5 rounded-xl transition-colors"
            >
              Configure Domain & MFS Payments ➔
            </button>
          </div>
        )}

        {/* Step 3: Domain & MFS Setup */}
        {step === 3 && (
          <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold text-purple-400">Step 3: Custom Domain & MFS Checkout Config</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Store / Business Name</label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Custom .com.bd Domain</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">bKash Merchant Mobile</label>
                <input
                  type="text"
                  value={bkashPhone}
                  onChange={(e) => setBkashPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Nagad Merchant Mobile</label>
                <input
                  type="text"
                  value={nagadPhone}
                  onChange={(e) => setNagadPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
            <button
              onClick={handleLaunchStore}
              disabled={isLaunching}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs py-2.5 rounded-xl transition-colors"
            >
              {isLaunching ? "Launching Store on InsForge BaaS..." : "🚀 Launch Merchant Store Now"}
            </button>
          </div>
        )}

        {/* Step 4: Store Live Confirmation */}
        {step === 4 && launchResult && (
          <div className="space-y-4 bg-emerald-950/80 border border-emerald-500/50 p-5 rounded-2xl text-xs">
            <div className="flex items-center justify-between text-emerald-400 font-bold text-sm">
              <span>🎉 Congratulations! Your Store is LIVE!</span>
              <span className="font-mono text-xs">{launchResult.storeWorkspaceId}</span>
            </div>
            <div className="space-y-1.5 text-slate-200">
              <p>Store Name: <strong className="text-white">{launchResult.merchantName}</strong></p>
              <p>Live Store URL: <a href={launchResult.liveStoreUrl} target="_blank" rel="noreferrer" className="text-purple-400 underline font-mono">{launchResult.liveStoreUrl} ↗</a></p>
              <p>Products Loaded: <strong className="text-white">{launchResult.scrapedProductsCount} items</strong></p>
              <p>bKash & Nagad 1-Tap Checkout: <strong className="text-emerald-400">ACTIVE ✅</strong></p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2.5 rounded-xl transition-colors"
            >
              Open Merchant Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
