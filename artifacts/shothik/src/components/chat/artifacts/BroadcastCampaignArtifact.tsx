"use client";

import { useState } from "react";
import {
  Send,
  MessageCircle,
  Users,
  CheckCircle2,
  Clock,
  Flame,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface BroadcastContact {
  id: string;
  name: string;
  phone: string;
  district: string;
  orderStatus: string;
  deliveryFee: number;
}

const SAMPLE_RECIPIENTS: BroadcastContact[] = [
  {
    id: "c-1",
    name: "Mahmudul Hasan",
    phone: "+8801711928374",
    district: "Dhaka (Dhanmondi)",
    orderStatus: "Ready to Dispatch",
    deliveryFee: 70,
  },
  {
    id: "c-2",
    name: "Shadia Rahman",
    phone: "+8801819283741",
    district: "Chittagong (GEC)",
    orderStatus: "Advance Fee Pending",
    deliveryFee: 130,
  },
  {
    id: "c-3",
    name: "Tanvir Ahmed",
    phone: "+8801912938475",
    district: "Sylhet (Zindabazar)",
    orderStatus: "Ready to Dispatch",
    deliveryFee: 130,
  },
  {
    id: "c-4",
    name: "Rifat Hossain",
    phone: "+8801552839481",
    district: "Rajshahi (Shaheb Bazar)",
    orderStatus: "Advance Fee Pending",
    deliveryFee: 130,
  },
];

export function BroadcastCampaignArtifact() {
  const [recipients, setRecipients] = useState<BroadcastContact[]>(SAMPLE_RECIPIENTS);
  const [templateText, setTemplateText] = useState(
    "প্রিয় {{customer_name}}, আপনার অর্ডারটি প্যাকেজিং সম্পন্ন হয়েছে! ট্র্যাকিং কোড: {{tracking_code}}। ডেলিভারি চার্জ ৳{{delivery_fee}} অগ্রিম দিয়ে অর্ডার কনফার্ম করুন: https://pay.shothik.com/inv/{{tracking_code}}"
  );
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);

  const handleLaunchBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastDone(true);
      setTimeout(() => setBroadcastDone(false), 4000);
    }, 1800);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Top Header ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>WhatsApp & SMS Broadcast Campaign Manager</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                64 Districts Ingress
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Personalized Banglish template injection, anti-spam pacing, and Steadfast parcel tracking links
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLaunchBroadcast}
            disabled={isBroadcasting}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-xs transition cursor-pointer",
              broadcastDone
                ? "bg-emerald-600"
                : "bg-emerald-600 hover:bg-emerald-500"
            )}
          >
            {isBroadcasting ? (
              <>
                <Zap className="w-3.5 h-3.5 animate-spin" />
                <span>Pacing 4 Messages/sec...</span>
              </>
            ) : broadcastDone ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Broadcast Delivered!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Launch Broadcast ({recipients.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Viewport Grid ── */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Left Column: Template Editor */}
        <div className="md:col-span-5 flex flex-col h-full bg-card/40 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase font-mono">
              Banglish Dynamic Message Template
            </label>
            <textarea
              rows={6}
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              className="w-full text-xs font-mono font-medium bg-background border border-border rounded-xl p-3 outline-none focus:border-emerald-400 leading-relaxed resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs">
            <span className="font-bold text-[10px] uppercase font-mono text-muted-foreground block">
              Available Dynamic Variables:
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {"{{customer_name}}"}
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {"{{tracking_code}}"}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {"{{delivery_fee}}"}
              </span>
            </div>
          </div>

          {/* Campaign Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-card border border-border text-center">
              <span className="text-[10px] font-mono text-muted-foreground block">Recipients</span>
              <span className="text-sm font-bold text-foreground font-mono">{recipients.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-border text-center">
              <span className="text-[10px] font-mono text-muted-foreground block">Throughput</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">4 msg/s</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-border text-center">
              <span className="text-[10px] font-mono text-muted-foreground block">DND Filter</span>
              <span className="text-sm font-bold text-indigo-400 font-mono">Active</span>
            </div>
          </div>
        </div>

        {/* Right Column: Audience Recipients Table */}
        <div className="md:col-span-7 flex flex-col h-full bg-background overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase font-mono">
              Target Audience ({recipients.length} Contacts)
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              ● All MSISDNs Verified
            </span>
          </div>

          <div className="border border-border rounded-2xl overflow-hidden bg-card/60 shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Recipient</th>
                  <th className="py-2.5 px-3 font-semibold">District</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Advance Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono text-xs">
                {recipients.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-foreground">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground">{c.phone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground font-sans text-xs">
                      {c.district}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border/80">
                        {c.orderStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      ৳{c.deliveryFee}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BroadcastCampaignArtifact;
