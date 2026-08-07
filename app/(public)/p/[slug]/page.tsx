import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export interface PseoTopicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PseoTopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const formattedTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${formattedTitle} — Shothik AI Business Guide`,
    description: `Complete step-by-step guide for South Asian micro-enterprises: ${formattedTitle}. Powered by Shothik Autonomous AI Cofounder.`,
    openGraph: {
      title: `${formattedTitle} — Shothik AI`,
      description: `Autonomous business blueprint and execution guide for ${formattedTitle}.`,
    },
  };
}

export default async function PseoTopicPage({ params }: PseoTopicPageProps) {
  const { slug } = await params;
  const formattedTitle = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link href="/gallery" className="hover:text-white transition">Gallery</Link>
          <span>/</span>
          <span className="text-purple-400 font-medium">{slug}</span>
        </div>

        {/* Hero Section */}
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">
            <span>🚀 Programmatic Business Blueprint</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {formattedTitle}
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl">
            Autonomous 5-step execution guide for South Asian single-person companies (OPCs), micro-merchants, and boutique creators.
          </p>
        </div>

        {/* 5-Step Sequential Earning Guide */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Execution Sequence & Strategy Matrix</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              {
                step: "01",
                title: "Hyper-Local Market Validation",
                desc: "Analyze local demand in target region (Dhaka, Chittagong, Sylhet, Karachi, Jaipur) and query competitor pricing via Web Agent.",
              },
              {
                step: "02",
                title: "Catalog & Pricing Optimization",
                desc: "Run ScenarioLab simulation matrix to determine high-LTV price points with optimal margin buffers.",
              },
              {
                step: "03",
                title: "Multi-Channel Catalog Sync",
                desc: "Auto-sync products to Google Business Profile, Facebook Shop, and WhatsApp Business catalog.",
              },
              {
                step: "04",
                title: "Payment Fraud Protection",
                desc: "Verify incoming bKash, Nagad, UPI, and EasyPaisa SMS receipts via OpenSearch-VL OCR vision agent.",
              },
              {
                step: "05",
                title: "1-Click Courier Rider Dispatch",
                desc: "Book automated parcel pickup via Steadfast, Pathao, RedX, or Delhivery with tracking updates.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:border-purple-500/30 transition"
              >
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                  {item.step}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Launch Banner */}
        <div className="bg-gradient-to-r from-purple-900/40 to-slate-900 border border-purple-500/30 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <h3 className="text-2xl font-bold text-white">Ready to execute this business in 1 click?</h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto">
            Launch your autonomous 24/7 AI Cofounder workspace pre-seeded with this exact business blueprint.
          </p>
          <div className="pt-2">
            <Link
              href="/agents/chat"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg transition"
            >
              Launch in AI Cofounder Workspace ➔
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
