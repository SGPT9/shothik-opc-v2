"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Download,
  Send,
  Building,
  Phone,
  MapPin,
  CheckCircle2,
  Filter,
  Sparkles,
  ExternalLink,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface B2BLead {
  id: string;
  name: string;
  category: string;
  location: string;
  phone: string;
  whatsapp: string;
  parcelsPerDay: number;
  estimatedGmvBdt: string;
  isVerified: boolean;
  selected?: boolean;
}

const INITIAL_LEADS: B2BLead[] = [
  {
    id: "lead-01",
    name: "Aarong Silk & Craft Hub",
    category: "Ethnic Fashion & Lifestyle",
    location: "Gulshan-2, Dhaka",
    phone: "+880 1711-294820",
    whatsapp: "https://wa.me/8801711294820",
    parcelsPerDay: 480,
    estimatedGmvBdt: "৳1,850,000",
    isVerified: true,
  },
  {
    id: "lead-02",
    name: "Gadget Planet BD",
    category: "Smartphones & Wearables",
    location: "Elephant Road, Dhaka",
    phone: "+880 1912-883749",
    whatsapp: "https://wa.me/8801912883749",
    parcelsPerDay: 320,
    estimatedGmvBdt: "৳1,420,000",
    isVerified: true,
  },
  {
    id: "lead-03",
    name: "Shapla Organic Agro",
    category: "Natural & Honey Products",
    location: "GEC Circle, Chittagong",
    phone: "+880 1823-449102",
    whatsapp: "https://wa.me/8801823449102",
    parcelsPerDay: 190,
    estimatedGmvBdt: "৳580,000",
    isVerified: true,
  },
  {
    id: "lead-04",
    name: "Khadija Bridal Boutique",
    category: "Women's Couture & Jewelry",
    location: "Uttara Sector 7, Dhaka",
    phone: "+880 1634-119283",
    whatsapp: "https://wa.me/8801634119283",
    parcelsPerDay: 140,
    estimatedGmvBdt: "৳920,000",
    isVerified: false,
  },
  {
    id: "lead-05",
    name: "Sylhet Tea Masters",
    category: "Premium CTC & Green Tea",
    location: "Zindabazar, Sylhet",
    phone: "+880 1745-992019",
    whatsapp: "https://wa.me/8801745992019",
    parcelsPerDay: 95,
    estimatedGmvBdt: "৳310,000",
    isVerified: true,
  },
];

export function LeadScraperArtifact() {
  const [leads, setLeads] = useState<B2BLead[]>(INITIAL_LEADS);
  const [query, setQuery] = useState("Dhaka F-Commerce Fashion Merchants");
  const [isScraping, setIsScraping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleScrape = () => {
    setIsScraping(true);
    setTimeout(() => {
      const newLead: B2BLead = {
        id: `lead-${Date.now()}`,
        name: "Navana Digital Mart",
        category: "Home Appliances & Living",
        location: "Mirpur 10, Dhaka",
        phone: "+880 1819-338291",
        whatsapp: "https://wa.me/8801819338291",
        parcelsPerDay: 260,
        estimatedGmvBdt: "৳890,000",
        isVerified: true,
      };
      setLeads((prev) => [newLead, ...prev]);
      setIsScraping(false);
    }, 1200);
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Name,Category,Location,Phone,DailyParcels,EstimatedGMV,Verified\n" +
      leads
        .map(
          (l) =>
            `"${l.id}","${l.name}","${l.category}","${l.location}","${l.phone}",${l.parcelsPerDay},"${l.estimatedGmvBdt}",${l.isVerified}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `b2b_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Header ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>B2B Lead Scraper & CRM Engine</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-semibold">
                Facebook & Google Maps BD
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Extract verified F-Commerce merchants, parcel volume, and WhatsApp numbers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold border border-border shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="p-4 border-b border-border bg-muted/10 space-y-2 shrink-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScrape()}
              placeholder="Search target sector or city..."
              className="w-full text-xs bg-background border border-border rounded-xl pl-9 pr-3 py-2 outline-none focus:border-teal-400"
            />
          </div>
          <button
            type="button"
            onClick={handleScrape}
            disabled={isScraping}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            {isScraping ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isScraping ? "Scraping..." : "Extract Leads"}</span>
          </button>
        </div>
      </div>

      {/* ── Leads Data Grid ── */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="border border-border rounded-2xl overflow-hidden bg-card/60 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Business Name</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Location</th>
                <th className="py-2.5 px-3 font-semibold">Phone / WhatsApp</th>
                <th className="py-2.5 px-3 font-semibold">Daily Parcels</th>
                <th className="py-2.5 px-3 font-semibold">Est. Monthly GMV</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <span>{lead.name}</span>
                      {lead.isVerified && (
                        <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{lead.category}</td>
                  <td className="py-3 px-3 text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>{lead.location}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <a
                      href={lead.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-500 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{lead.phone}</span>
                    </a>
                  </td>
                  <td className="py-3 px-3 font-mono text-foreground font-semibold">
                    {lead.parcelsPerDay} / day
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                    {lead.estimatedGmvBdt}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={lead.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-semibold transition"
                    >
                      <Send className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LeadScraperArtifact;
