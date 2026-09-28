"use client";

import { useState } from "react";
import {
  Users,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  Send,
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Sparkles,
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
import { saveOfflineTask } from "@/lib/offline/offline-storage";

export interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  source: "Cold Email" | "Web Form" | "WhatsApp" | "Meta Ad";
  status: "Prospect" | "Email Sent" | "Opened" | "Replied" | "Converted";
  dealValueBdt: number;
  lastContact: string;
  notes?: string;
}

export interface LeadCrmDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
}

const INITIAL_LEADS: LeadItem[] = [
  {
    id: "lead-1",
    name: "Tanvir Hossain",
    email: "tanvir@bananifashion.bd",
    phone: "8801712345678",
    company: "Banani Fashion House",
    source: "Cold Email",
    status: "Replied",
    dealValueBdt: 12500,
    lastContact: "12m ago",
    notes: "Interested in automated Steadfast courier dispatch and bKash checkout.",
  },
  {
    id: "lead-2",
    name: "Nusrat Jahan",
    email: "nusrat@gulshancare.com",
    phone: "8801819876543",
    company: "Gulshan Wellness Care",
    source: "Web Form",
    status: "Converted",
    dealValueBdt: 25000,
    lastContact: "1h ago",
    notes: "Paid ৳25,000 via bKash Merchant Gateway (TrxID: TRX_BKASH_99812).",
  },
  {
    id: "lead-3",
    name: "Rafiqul Islam",
    email: "rafiq@chaldalpartner.bd",
    phone: "8801911223344",
    company: "Chaldal Merchant Hub",
    source: "Meta Ad",
    status: "Opened",
    dealValueBdt: 8500,
    lastContact: "3h ago",
    notes: "Clicked from Meta Ad ($50/day campaign) on Dhaka Grocery automation.",
  },
  {
    id: "lead-4",
    name: "Sadia Rahman",
    email: "sadia@dhanmondiedu.org",
    phone: "8801615566778",
    company: "Dhanmondi Prep Academy",
    source: "WhatsApp",
    status: "Replied",
    dealValueBdt: 15000,
    lastContact: "5h ago",
    notes: "Requested custom demo for 500 student assignment slide deck generation.",
  },
  {
    id: "lead-5",
    name: "Mahmud Hasan",
    email: "mahmud@uttarab2b.com",
    company: "Uttara B2B Logistics",
    source: "Cold Email",
    status: "Email Sent",
    dealValueBdt: 7500,
    lastContact: "1d ago",
    notes: "Step 1 value hook delivered via EmailOutreachEngine.",
  },
];

export function LeadCrmDrawer({
  open,
  onOpenChange,
  companyName = "VerifiQ AI",
}: LeadCrmDrawerProps) {
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [filterSource, setFilterSource] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);

  // New Lead Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newValue, setNewValue] = useState(10000);

  const filteredLeads = leads.filter((l) => {
    const matchesSource = filterSource === "All" || l.source === filterSource;
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesSearch;
  });

  const totalPipelineValue = leads.reduce((acc, l) => acc + l.dealValueBdt, 0);
  const convertedCount = leads.filter((l) => l.status === "Converted").length;
  const repliedCount = leads.filter((l) => l.status === "Replied").length;

  const handleAddLead = () => {
    if (!newName || !newEmail) return;
    const newLead: LeadItem = {
      id: `lead-${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone || "8801700000000",
      company: newCompany || "New Prospect Ltd",
      source: "Web Form",
      status: "Prospect",
      dealValueBdt: Number(newValue) || 10000,
      lastContact: "Just now",
      notes: "Manually captured lead via Twin CRM.",
    };

    setLeads((prev) => [newLead, ...prev]);
    saveOfflineTask({
      id: `lead-task-${Date.now()}`,
      title: `Added prospect ${newName} (${newCompany}) to ${companyName} CRM pipeline`,
      category: "Marketing",
      status: "completed",
      cost: "0 Credits",
      updatedAt: Date.now(),
    });

    setNewName("");
    setNewEmail("");
    setNewCompany("");
    setNewPhone("");
    setShowNewLeadModal(false);
  };

  const handleStatusChange = (leadId: string, nextStatus: LeadItem["status"]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l))
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] xl:max-w-6xl bg-[#0b101b] border-slate-800 text-slate-100 p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Unified Customer Prospecting & Lead CRM</span>
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 font-mono text-[10px]">
                  Pipeline Active
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Manage inbound inquiries, cold email replies, and 1-tap WhatsApp conversions for {companyName}.
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowNewLeadModal(true)}
              className="h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
              data-testid="button-add-lead-crm"
            >
              <Plus className="h-3.5 w-3.5" /> Add Lead
            </Button>
          </div>
        </div>

        {/* Pipeline Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-950/80 border-b border-slate-800 font-mono text-center shrink-0">
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Total Pipeline</span>
            <p className="text-base font-bold text-cyan-400 mt-0.5">৳{totalPipelineValue.toLocaleString()} BDT</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Active Leads</span>
            <p className="text-base font-bold text-slate-100 mt-0.5">{leads.length} Prospects</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Hot Replies</span>
            <p className="text-base font-bold text-amber-400 mt-0.5">{repliedCount} Ready</p>
          </div>
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-[10px] text-slate-400 uppercase">Converted / Paid</span>
            <p className="text-base font-bold text-emerald-400 mt-0.5">{convertedCount} Customers</p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-mono">
            {["All", "Cold Email", "Web Form", "WhatsApp", "Meta Ad"].map((src) => (
              <button
                key={src}
                onClick={() => setFilterSource(src)}
                className={`px-3 py-1 rounded-lg border transition text-[11px] ${
                  filterSource === src
                    ? "border-cyan-500/80 bg-cyan-500/10 text-cyan-300 font-bold"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900"
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search name, company, email..."
              aria-label="Search name, company, email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Main Leads Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
                <tr>
                  <th className="px-4 py-3">Lead & Contact</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Channel Source</th>
                  <th className="px-4 py-3">Pipeline Status</th>
                  <th className="px-4 py-3">Deal Value</th>
                  <th className="px-4 py-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/60 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-200">{lead.name}</div>
                      <div className="text-[10px] text-slate-400">{lead.email}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-300">
                      {lead.company}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          lead.source === "Cold Email"
                            ? "border-cyan-500/40 text-cyan-400"
                            : lead.source === "WhatsApp"
                            ? "border-emerald-500/40 text-emerald-400"
                            : lead.source === "Meta Ad"
                            ? "border-amber-500/40 text-amber-400"
                            : "border-indigo-500/40 text-indigo-400"
                        }`}
                      >
                        {lead.source}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadItem["status"])}
                        className={`text-[10px] rounded-lg px-2 py-1 border font-bold bg-slate-950 focus:outline-none ${
                          lead.status === "Converted"
                            ? "border-emerald-500 text-emerald-400"
                            : lead.status === "Replied"
                            ? "border-amber-500 text-amber-400"
                            : "border-slate-700 text-slate-300"
                        }`}
                      >
                        <option value="Prospect">Prospect</option>
                        <option value="Email Sent">Email Sent</option>
                        <option value="Opened">Opened</option>
                        <option value="Replied">Hot Replied</option>
                        <option value="Converted">Paid / Converted</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">
                      ৳{lead.dealValueBdt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone}?text=Salam%20${encodeURIComponent(
                              lead.name
                            )},%20following%20up%20from%20${encodeURIComponent(companyName)}.`}
                            target="_blank"
                            rel="noreferrer"
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer"
                            title="Open WhatsApp Chat"
                            aria-label={`Open WhatsApp Chat with ${lead.name}`}
                          >
                            <Smartphone className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <a
                          href={`mailto:${lead.email}?subject=Follow%20up%20from%20${encodeURIComponent(companyName)}`}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                          title="Send Email"
                          aria-label={`Send Email to ${lead.name}`}
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add New Lead */}
        {showNewLeadModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-lead-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0b101b] p-6 space-y-4 shadow-2xl">
              <h3 id="new-lead-title" className="text-sm font-bold text-slate-100 font-mono">Add New Prospect Lead</h3>
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Tanvir Hasan"
                    aria-label="Lead Full Name"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Company Name</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Dhaka Tech Ltd"
                    aria-label="Lead Company Name"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. tanvir@dhakatech.bd"
                    aria-label="Lead Email Address"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Estimated Deal Value (৳)</label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    aria-label="Estimated Deal Value"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-emerald-400 font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewLeadModal(false)}
                  className="text-xs min-h-[38px] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddLead}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white min-h-[38px] cursor-pointer"
                >
                  Save Lead
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
