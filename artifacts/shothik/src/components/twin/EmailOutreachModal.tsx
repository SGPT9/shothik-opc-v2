"use client";

import { useState } from "react";
import {
  Mail,
  Send,
  Users,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
  ShieldCheck,
  Play,
  RotateCcw,
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
import {
  EmailOutreachEngine,
  type OutreachLead,
  type EmailSequenceStep,
  type OutreachCampaignStats,
} from "@/lib/marketing/email-outreach-engine";

export interface EmailOutreachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailOutreachModal({ open, onOpenChange }: EmailOutreachModalProps) {
  const [leads, setLeads] = useState<OutreachLead[]>(EmailOutreachEngine.getLeads());
  const [sequence, setSequence] = useState<EmailSequenceStep[]>(EmailOutreachEngine.getSequence());
  const [stats, setStats] = useState<OutreachCampaignStats>(EmailOutreachEngine.getStats());
  const [activeTab, setActiveTab] = useState<"leads" | "sequence">("leads");

  // New Lead Inputs
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const handleAddLead = () => {
    if (!newEmail.trim() || !newCompany.trim()) return;
    const created = EmailOutreachEngine.addLead({
      name: newName.trim() || "Founder",
      email: newEmail.trim(),
      company: newCompany.trim(),
    });
    setLeads(EmailOutreachEngine.getLeads());
    setStats(EmailOutreachEngine.getStats());
    setNewName("");
    setNewEmail("");
    setNewCompany("");
  };

  const handleStartSequence = async () => {
    setIsDispatching(true);
    setDispatchSuccess(false);
    await EmailOutreachEngine.dispatchNextBatch();
    setLeads(EmailOutreachEngine.getLeads());
    setStats(EmailOutreachEngine.getStats());
    setIsDispatching(false);
    setDispatchSuccess(true);
    setTimeout(() => setDispatchSuccess(false), 4000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-4xl bg-[#0b101b] border-slate-800 text-slate-100 p-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Cold Email Outreach Autopilot</span>
                <Badge variant="outline" className="border-purple-500/40 text-purple-400 font-mono text-[10px]">
                  3-Step Cadence Active
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Automated customer prospecting, personalized value hooks, and high-converting sequence execution.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center rounded-lg border border-slate-800 p-0.5 bg-slate-950">
            <button
              type="button"
              onClick={() => setActiveTab("leads")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === "leads" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Prospects ({leads.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sequence")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                activeTab === "sequence" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              3-Step Sequence ({sequence.length})
            </button>
          </div>
        </div>

        {/* Campaign Analytics Bar */}
        <div className="grid grid-cols-4 gap-3 p-6 bg-slate-950/80 border-b border-slate-800 font-mono text-center">
          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Total Leads</span>
            <p className="text-base font-bold text-slate-100 mt-0.5">{stats.totalLeads}</p>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Emails Sent</span>
            <p className="text-base font-bold text-indigo-400 mt-0.5">{stats.sentCount}</p>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Open Rate</span>
            <p className="text-base font-bold text-emerald-400 mt-0.5">{stats.openRatePct}%</p>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Reply Rate</span>
            <p className="text-base font-bold text-purple-400 mt-0.5">{stats.replyRatePct}%</p>
          </div>
        </div>

        {/* Tab 1: Leads Management */}
        {activeTab === "leads" && (
          <div className="p-6 space-y-6">
            {/* Add Lead Quick Bar */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-purple-400" /> Add Prospect to Sequence
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500"
                  data-testid="input-lead-name"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500"
                  data-testid="input-lead-email"
                />
                <input
                  type="text"
                  placeholder="Company Name *"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500"
                  data-testid="input-lead-company"
                />
                <Button
                  onClick={handleAddLead}
                  disabled={!newEmail.trim() || !newCompany.trim()}
                  className="h-8 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                  data-testid="button-add-lead"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Lead
                </Button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Active Prospect Queue</span>
                <Button
                  size="sm"
                  onClick={handleStartSequence}
                  disabled={isDispatching}
                  className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  data-testid="button-dispatch-batch"
                >
                  {dispatchSuccess ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Dispatched!
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" /> Dispatch Queued Leads
                    </>
                  )}
                </Button>
              </div>

              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-4 py-2.5">Lead / Company</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Sequence Step</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Last Touch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-200">{lead.name}</div>
                        <div className="text-[11px] text-slate-400">{lead.company}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">{lead.email}</td>
                      <td className="px-4 py-3 font-mono text-indigo-400 font-bold">
                        {lead.step > 0 ? `Step ${lead.step} / 3` : "Queued"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            lead.status === "replied"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : lead.status === "opened"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                              : lead.status === "sent"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {lead.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500">
                        {lead.lastContacted || "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: 3-Step Sequence */}
        {activeTab === "sequence" && (
          <div className="p-6 space-y-4">
            {sequence.map((step) => (
              <div
                key={step.stepNumber}
                className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold font-mono">
                      {step.stepNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      Step {step.stepNumber}: {step.stepNumber === 1 ? "Signal Hook" : step.stepNumber === 2 ? "Case Study Proof" : "Breakup / CTA"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Delay: {step.delayDays === 0 ? "Immediate" : `+${step.delayDays} days`}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={step.subject}
                    readOnly
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">
                    Email Copy Template
                  </label>
                  <textarea
                    rows={4}
                    value={step.body}
                    readOnly
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 font-mono resize-none leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
