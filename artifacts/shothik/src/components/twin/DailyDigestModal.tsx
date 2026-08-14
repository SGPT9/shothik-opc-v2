"use client";

import { useState } from "react";
import {
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Server,
  Layers,
  Settings,
  X,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DailyDigestService, type DailyDigestSummary } from "@/lib/marketing/daily-digest-service";

export interface DailyDigestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
}

export function DailyDigestModal({
  open,
  onOpenChange,
  companyName = "VerifiQ AI",
}: DailyDigestModalProps) {
  const [recipientEmail, setRecipientEmail] = useState("founder@shothikgpt.com");
  const [deliveryTime, setDeliveryTime] = useState("08:00 AM");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSentSuccess, setTestSentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "settings">("preview");

  const digestSummary: DailyDigestSummary = DailyDigestService.generateDigest(companyName);

  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    setTestSentSuccess(false);
    await DailyDigestService.sendDigest(recipientEmail);
    setIsSendingTest(false);
    setTestSentSuccess(true);
    setTimeout(() => setTestSentSuccess(false), 4000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl bg-[#0b101b] border-slate-800 text-slate-100 p-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Daily CEO Morning Email Briefing</span>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 font-mono text-[10px]">
                  08:00 AM Active
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Automated overnight deliverables, P&L cash flow, and unblocked Wayfinder decisions sent directly to your inbox.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-800 p-0.5 bg-slate-950">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  activeTab === "preview" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                HTML Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  activeTab === "settings" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Schedule & Config
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: HTML Preview */}
        {activeTab === "preview" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <span className="text-slate-500">To:</span>
                <span className="text-indigo-400 font-semibold">{recipientEmail}</span>
                <span className="text-slate-500">· Schedule:</span>
                <span className="text-emerald-400 font-semibold">{deliveryTime} Asia/Dhaka</span>
              </div>
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                disabled={isSendingTest}
                onClick={handleSendTestEmail}
                data-testid="button-send-test-digest"
              >
                {testSentSuccess ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Test Dispatched!
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" /> Send Test Email Now
                  </>
                )}
              </Button>
            </div>

            {/* Email Canvas Preview */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 overflow-hidden shadow-2xl space-y-5 text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                  SHOTHIK TWIN · DAILY CEO BRIEFING
                </span>
                <span className="text-xs text-slate-400 font-mono">{digestSummary.date}</span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white">
                  ☀️ Good Morning! Here is what Shothik shipped overnight for {companyName}
                </h3>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-3 font-mono text-center">
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                  <span className="text-[10px] text-slate-400 uppercase">Tasks Done</span>
                  <p className="text-base font-bold text-sky-400 mt-1">{digestSummary.completedTasksCount} Completed</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                  <span className="text-[10px] text-slate-400 uppercase">Net Margin</span>
                  <p className="text-base font-bold text-emerald-400 mt-1">{digestSummary.netMarginPct}%</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                  <span className="text-[10px] text-slate-400 uppercase">Docker RAM</span>
                  <p className="text-base font-bold text-purple-400 mt-1">{digestSummary.containerMemoryMb} MB</p>
                </div>
              </div>

              {/* Overnight Tasks */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-100">🚀 Overnight Completed Deliverables</h4>
                <div className="text-xs text-slate-300 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>✓ Bootstrap Next.js standalone container on Dokploy PaaS</span>
                    <span className="text-purple-400">5 Credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✓ Configure InsForge BaaS database schema & RLS security</span>
                    <span className="text-purple-400">5 Credits</span>
                  </div>
                </div>
              </div>

              {/* P&L Snapshot */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between font-bold text-emerald-400 mb-1">
                  <span>💳 30-Day Cash Flow & P&L Snapshot</span>
                  <span>Live Reconciliation</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Gross Revenue:</span>
                  <span className="text-slate-100 font-bold">৳{digestSummary.grossRevenueBdt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>bKash Fee (1.85% MFS):</span>
                  <span className="text-rose-400">-৳832.50</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Meta Ads ($50/day):</span>
                  <span className="text-rose-400">-৳6,000</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                  <span>Net Monthly Profit:</span>
                  <span className="text-emerald-400">৳{digestSummary.netProfitBdt.toLocaleString()}</span>
                </div>
              </div>

              {/* Wayfinder Call to Action */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-indigo-300">⚡ 1 Decision Needed Today</h4>
                  <p className="text-[11px] text-indigo-200/80">
                    "Integrate 1-Tap bKash payment webhooks" requires credential approval.
                  </p>
                </div>
                <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white">
                  Approve in Twin
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Settings */}
        {activeTab === "settings" && (
          <div className="p-6 space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  data-testid="input-recipient-email"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Delivery Time
                  </label>
                  <select
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <option value="07:00 AM">07:00 AM (Early Bird)</option>
                    <option value="08:00 AM">08:00 AM (Recommended)</option>
                    <option value="09:00 AM">09:00 AM (Standard)</option>
                    <option value="10:00 AM">10:00 AM (Late)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Timezone
                  </label>
                  <select
                    defaultValue="Asia/Dhaka"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <option value="Asia/Dhaka">Asia/Dhaka (BST, UTC+6)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
                    <option value="America/New_York">America/New_York (EST, UTC-5)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Include Cash Flow & P&L Snapshot</p>
                    <p className="text-[11px] text-slate-400">Reconciles gross sales, bKash 1.85% fee, and Meta ad spend</p>
                  </div>
                  <Switch defaultChecked />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Include Dokploy Container Telemetry</p>
                    <p className="text-[11px] text-slate-400">Shows container memory &lt;88MB and Let's Encrypt SSL status</p>
                  </div>
                  <Switch defaultChecked />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <Button
                onClick={() => onOpenChange(false)}
                className="rounded-xl px-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
