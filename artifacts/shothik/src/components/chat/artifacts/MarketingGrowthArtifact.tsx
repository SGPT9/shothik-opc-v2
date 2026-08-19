import React, { useState } from "react";
import { TrendingUp, Sparkles, MessageCircle, DollarSign, CheckCircle2, ShieldCheck, Copy, Check, ArrowUpRight } from "lucide-react";
import { MarketingGrowthEngine, GeneratedMarketingPackage } from "@/lib/agents/marketing-growth-engine";

export function MarketingGrowthArtifact() {
  const [productName, setProductName] = useState("Dhakai Jamdani Saree");
  const [regularPrice, setRegularPrice] = useState(4500);
  const [costPrice, setCostPrice] = useState(2800);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [marketingPackage, setMarketingPackage] = useState<GeneratedMarketingPackage>(() =>
    MarketingGrowthEngine.generateGrowthPackage({
      productName: "Dhakai Jamdani Saree",
      category: "apparel",
      regularPrice: 4500,
      costPrice: 2800,
      targetAudience: "Women aged 22-45 in Dhaka, Chittagong, Sylhet",
      uspBulletPoints: ["100% Handloom Cotton", "Original Tangail Weave", "Fast 24h Delivery"],
    })
  );

  const handleRegenerate = () => {
    const pkg = MarketingGrowthEngine.generateGrowthPackage({
      productName,
      category: "apparel",
      regularPrice,
      costPrice,
      targetAudience: "Bangladeshi F-Commerce Buyers",
      uspBulletPoints: ["Premium Handcrafted", "COD Available", "Moneyback Guarantee"],
    });
    setMarketingPackage(pkg);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-foreground bg-background">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-950/30 border border-pink-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              F-Commerce Marketing & CRO Engine
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 font-bold">
                liustack/marketingskills
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Banglish viral live selling hooks, WhatsApp cart recovery copywriting & dynamic bundle pricing tiers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRegenerate}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-400 shadow-md shadow-pink-500/20 transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Regenerate Strategy
        </button>
      </div>

      {/* Input Parameters Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-card border border-border">
        <div>
          <label className="text-[11px] font-bold text-muted-foreground uppercase">Product Name</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full mt-1 px-3 py-1.5 rounded-xl bg-background border border-input text-xs font-semibold text-foreground focus:outline-hidden"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-muted-foreground uppercase">Regular Selling Price (৳)</label>
          <input
            type="number"
            value={regularPrice}
            onChange={(e) => setRegularPrice(Number(e.target.value))}
            className="w-full mt-1 px-3 py-1.5 rounded-xl bg-background border border-input text-xs font-semibold text-foreground focus:outline-hidden"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-muted-foreground uppercase">Cost Price (৳)</label>
          <input
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(Number(e.target.value))}
            className="w-full mt-1 px-3 py-1.5 rounded-xl bg-background border border-input text-xs font-semibold text-foreground focus:outline-hidden"
          />
        </div>
      </div>

      {/* Output Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Facebook Live & Social Copy */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" /> Facebook Live Viral Hook (Banglish)
            </h3>
            <button
              type="button"
              onClick={() => copyToClipboard(marketingPackage.facebookLiveHook.liveIntroScript, "fb_live")}
              className="text-[11px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === "fb_live" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === "fb_live" ? "Copied!" : "Copy Script"}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 text-xs font-sans text-foreground leading-relaxed">
            <p className="font-bold text-pink-400 mb-1">{marketingPackage.facebookLiveHook.banglishHeadline}</p>
            <p className="text-muted-foreground">{marketingPackage.facebookLiveHook.liveIntroScript}</p>
          </div>

          {/* WhatsApp Cart Recovery Message */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp Cart Recovery Message
              </h4>
              <button
                type="button"
                onClick={() => copyToClipboard(marketingPackage.whatsappCartRecoveryMessage, "whatsapp_copy")}
                className="text-[11px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === "whatsapp_copy" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "whatsapp_copy" ? "Copied!" : "Copy WhatsApp"}
              </button>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 font-mono leading-relaxed">
              {marketingPackage.whatsappCartRecoveryMessage}
            </div>
          </div>
        </div>

        {/* Pricing Tiers & Bundle Strategy */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Dynamic Pricing Tiers & Advance bKash Incentives
          </h3>

          <div className="space-y-2.5">
            {marketingPackage.pricingTiers.map((tier, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-foreground">{tier.tierName}</span>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Advance bKash Discount: <strong className="text-emerald-400">{tier.advanceBkashDiscountPercent}% OFF</strong> · Margin: ~{tier.estimatedMarginPercent}%
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-foreground">৳{tier.bundlePrice.toLocaleString()}</div>
                  <span className="text-[10px] text-muted-foreground">({tier.unitQuantity} Unit)</span>
                </div>
              </div>
            ))}
          </div>

          {/* CRO Diagnostic Recommendations */}
          <div className="pt-2 border-t border-border space-y-2">
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase">CRO Conversion Rate Lift Recommendations</h4>
            {marketingPackage.croChecklist.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{item.recommendation}</strong> (Expected lift: <span className="text-emerald-400 font-bold">+{item.expectedConversionLiftPercent}%</span>)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
