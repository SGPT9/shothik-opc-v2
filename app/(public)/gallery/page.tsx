import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Template Gallery — Shothik AI",
  description: "Explore curated 1-click business blueprints for South Asian single-person companies (OPCs), cloud kitchens, boutiques, and exporters.",
};

export default function BusinessGalleryPage() {
  const templates = [
    {
      slug: "jamdani-boutique-dhaka",
      title: "Dhaka Jamdani Saree Boutique",
      location: "Mirpur, Dhaka 🇧🇩",
      category: "E-Commerce & Fashion",
      desc: "Autonomously source Jamdani weavers, sync Facebook shop, verify bKash payments, and dispatch Pathao courier riders.",
      icon: "👗",
    },
    {
      slug: "jaipur-brassware-export",
      title: "Jaipur Handcrafted Brassware Export",
      location: "Jaipur, Rajasthan 🇮🇳",
      category: "Export & Wholesale",
      desc: "Cross-border Shopify sync, UPI payment verification, automated DHL customs documentation, and wholesale re-order triggers.",
      icon: "🏺",
    },
    {
      slug: "lahore-auto-parts-trader",
      title: "Lahore Motorcycle Parts Dealer",
      location: "Sultanpura, Lahore 🇵🇰",
      category: "Automotive & Retail",
      desc: "WhatsApp voice note price quote negotiation, EasyPaisa ledger verification, and hyper-local inventory auto-restock.",
      icon: "🏍️",
    },
    {
      slug: "sylhet-cloud-kitchen",
      title: "Sylhet Artisan Catering Cloud Kitchen",
      location: "Zindabazar, Sylhet 🇧🇩",
      category: "Food & Beverage",
      desc: "Daily pre-order batching, Steadfast delivery routing, WhatsApp customer updates, and daily food margin analytics.",
      icon: "🍲",
    },
    {
      slug: "bogura-agro-trader",
      title: "Bogura Organic Agro Wholesale",
      location: "Bogura Sadar 🇧🇩",
      category: "Agro-Trade",
      desc: "B2B bulk crop pricing, Nagad payment verification, logistics truck booking, and credit ledger management.",
      icon: "🌾",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
            <span>✨ 1-Click Business Blueprints</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            South Asian Micro-Enterprise Template Gallery
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Select a pre-seeded business model powered by Shothik Autonomous 24/7 AI Cofounder.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tmpl) => (
            <div
              key={tmpl.slug}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg hover:border-purple-500/40 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{tmpl.icon}</span>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {tmpl.location}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">
                    {tmpl.category}
                  </span>
                  <h3 className="text-lg font-bold text-white leading-snug">{tmpl.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{tmpl.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <Link
                  href={`/p/${tmpl.slug}`}
                  className="text-xs font-medium text-slate-300 hover:text-white transition"
                >
                  View Blueprint ➔
                </Link>
                <Link
                  href="/agents/chat"
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition shadow-sm"
                >
                  Launch 🚀
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
