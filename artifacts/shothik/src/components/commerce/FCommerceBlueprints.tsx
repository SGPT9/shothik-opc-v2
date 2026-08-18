"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Zap,
  Truck,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck
} from "lucide-react";
import { LiquidGlassCard } from "@/components/chat/LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface FCommerceBlueprint {
  id: string;
  title: string;
  badge: string;
  category: "Sale" | "Logistics" | "Negotiation";
  description: string;
  roi: string;
  configSchema: {
    label: string;
    value: string;
    type: "text" | "number" | "toggle";
  }[];
}

const BLUEPRINTS: FCommerceBlueprint[] = [
  {
    id: "bp-flash-sale",
    title: "⚡ Flash Sale & Stock-Lock Automator",
    badge: "Most Popular",
    category: "Sale",
    description: "Locks high-demand stock for 10 minutes upon customer checkout and releases inventory instantly upon bKash/Nagad TrxID SMS confirmation.",
    roi: "+28% Checkout Conversion",
    configSchema: [
      { label: "Lock Duration (Minutes)", value: "10", type: "number" },
      { label: "Discount %", value: "20", type: "number" },
      { label: "Auto-Send SMS Reminder", value: "true", type: "toggle" },
    ],
  },
  {
    id: "bp-carrier-router",
    title: "🚚 Smart Multi-Carrier Logistics Router",
    badge: "Cost Saver",
    category: "Logistics",
    description: "Evaluates Steadfast (৳60), Pathao (৳70), and RedX (৳65) in real-time, picking the optimal carrier by destination pincode and delivery SLA.",
    roi: "-৳18/parcel Delivery Cost",
    configSchema: [
      { label: "Primary Metro Provider", value: "Steadfast", type: "text" },
      { label: "Inter-District Fallback", value: "Pathao", type: "text" },
      { label: "Max COD Charge Threshold", value: "1%", type: "text" },
    ],
  },
  {
    id: "bp-banglish-bot",
    title: "💬 Banglish D2C Negotiation Agent",
    badge: "AI Growth",
    category: "Negotiation",
    description: "Handles Facebook Page Messenger inquiries in natural Banglish (*'koto porbe vai?'*), negotiates within pre-approved discount ranges, and auto-generates invoice links.",
    roi: "3.4x Faster Order Capture",
    configSchema: [
      { label: "Max Auto-Discount BDT", value: "৳150", type: "text" },
      { label: "Tone", value: "Polite Merchant (Bangla/Banglish)", type: "text" },
      { label: "Require Admin Approval over ৳5,000", value: "true", type: "toggle" },
    ],
  },
];

export function FCommerceBlueprints({
  onDeployBlueprint,
}: {
  onDeployBlueprint?: (blueprintId: string) => void;
}) {
  const [selectedBp, setSelectedBp] = useState<string>("bp-flash-sale");
  const [deployed, setDeployed] = useState<Record<string, boolean>>({});

  const handleDeploy = (id: string) => {
    setDeployed((prev) => ({ ...prev, [id]: true }));
    if (onDeployBlueprint) onDeployBlueprint(id);
  };

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Cloudflare OS-Style F-Commerce Blueprints</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Instantiate private autonomous commerce workflows with 1-click Gatekeeper execution
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {BLUEPRINTS.map((bp) => {
          const isSelected = selectedBp === bp.id;
          const isDeployed = deployed[bp.id];

          return (
            <LiquidGlassCard
              key={bp.id}
              palette={isSelected ? "bkash" : "indigo"}
              onClick={() => setSelectedBp(bp.id)}
              className={cn(
                "p-4 space-y-3 cursor-pointer transition-all border",
                isSelected ? "border-brand/60 shadow-lg" : "border-border/40 hover:border-border/80"
              )}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-foreground">{bp.title}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {bp.badge}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {bp.description}
              </p>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40 font-mono">
                <span className="text-emerald-400 font-bold">{bp.roi}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeploy(bp.id);
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1",
                    isDeployed
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-brand text-brand-foreground hover:opacity-90"
                  )}
                >
                  {isDeployed ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <span>Deploy</span>
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            </LiquidGlassCard>
          );
        })}
      </div>
    </div>
  );
}

export default FCommerceBlueprints;
