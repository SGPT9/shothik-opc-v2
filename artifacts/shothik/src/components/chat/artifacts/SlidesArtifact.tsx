"use client";

import { useState, useEffect } from "react";
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  Maximize2,
  Sparkles,
  Layers,
  MessageSquare,
  Share2,
  Palette,
  ExternalLink,
  CheckCircle2,
  Play,
  Copy,
  Check,
  Printer,
  TrendingUp,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VTuberPresentationStage } from "./VTuberPresentationStage";
import { WORDART_PRESETS } from "@/components/presentation/wordartPresets";
import { cn } from "@/lib/utils";

export type SlideLayout = "hero" | "split" | "stats" | "timeline" | "process" | "quote" | "grid";

export interface SlideData {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  layout?: SlideLayout;
  bullets?: string[];
  splitLeft?: { heading: string; points: string[] };
  splitRight?: { heading: string; points: string[] };
  timelineSteps?: { step: string; title: string; desc: string; status: "completed" | "active" | "upcoming" }[];
  processSteps?: { number: string; title: string; desc: string }[];
  quote?: { text: string; author: string; role: string };
  features?: { title: string; desc: string }[];
  metrics?: { label: string; value: string; trend?: string }[];
  speakerNotes: string;
  bgGradient?: string;
  wordart?: string;
}

interface SlidesArtifactProps {
  initialTopic?: string;
  slides?: SlideData[];
  isStreaming?: boolean;
}

const TEMPLATES = [
  { id: "business", label: "Demo Day Pitch", icon: "📊", themeClass: "from-slate-950 via-indigo-950/80 to-slate-950", accent: "text-indigo-400", border: "border-indigo-500/30" },
  { id: "vc_pitch", label: "VC Pitch Premium", icon: "🏆", themeClass: "from-slate-950 via-amber-950/40 to-slate-900", accent: "text-amber-400", border: "border-amber-500/40" },
  { id: "seedstars_asia", label: "South Asia Pitch (Seedstars)", icon: "🚀", themeClass: "from-slate-950 via-sky-950/70 to-slate-900", accent: "text-sky-400", border: "border-sky-500/40" },
  { id: "thesis_defense", label: "University Thesis Defense", icon: "🎓", themeClass: "from-slate-950 via-teal-950/60 to-slate-900", accent: "text-teal-300", border: "border-teal-500/40" },
  { id: "bangla_heritage", label: "Ekushey Heritage", icon: "🏛️", themeClass: "from-red-950/90 via-amber-950/40 to-slate-950", accent: "text-amber-300", border: "border-amber-500/40" },
  { id: "rmg_textile", label: "RMG & Textile ESG", icon: "🧵", themeClass: "from-teal-950 via-slate-900 to-emerald-950/80", accent: "text-emerald-400", border: "border-teal-500/40" },
  { id: "fintech_gold", label: "FinTech & MFS Gold", icon: "💳", themeClass: "from-slate-950 via-yellow-950/40 to-slate-900", accent: "text-yellow-400", border: "border-yellow-500/40" },
  { id: "agritech_green", label: "AgriTech & Rural", icon: "🌾", themeClass: "from-lime-950/80 via-slate-900 to-emerald-950", accent: "text-lime-400", border: "border-lime-500/40" },
  { id: "emerald", label: "Emerald Nature", icon: "🌿", themeClass: "from-emerald-950 via-teal-950/60 to-slate-950", accent: "text-emerald-300", border: "border-emerald-500/30" },
  { id: "obsidian", label: "Obsidian Gradient", icon: "🔮", themeClass: "from-neutral-950 via-purple-950/50 to-neutral-950", accent: "text-purple-300", border: "border-purple-500/30" },
  { id: "cyber_midnight", label: "Cyber Midnight", icon: "⚡", themeClass: "from-black via-cyan-950/50 to-purple-950/40 font-mono", accent: "text-cyan-400", border: "border-cyan-500/40" },
  { id: "blueprint", label: "Blueprint Grid", icon: "📐", themeClass: "from-blue-950/90 via-slate-900 to-blue-950/90", accent: "text-sky-300", border: "border-sky-500/30" },
  { id: "editorial", label: "Editorial Serif", icon: "📰", themeClass: "from-stone-900 via-neutral-900 to-stone-950", accent: "text-amber-300", border: "border-amber-500/30" },
  { id: "minimal", label: "Minimalist Mono", icon: "⬜", themeClass: "from-zinc-900 via-zinc-950 to-black", accent: "text-zinc-300", border: "border-zinc-700/40" },
];

const PIPELINE_STEPS = ["Outline", "Design", "Content", "Formatting", "Review"];

export function buildDynamicDeck(topicTitle: string): SlideData[] {
  const cleanTopic = topicTitle || "Next-Gen Autonomous Platform";
  const lower = cleanTopic.toLowerCase();

  if ((lower.includes("seedstars") || lower.includes("accelerator") || lower.includes("accelerating asia") || lower.includes("pitch deck")) && !lower.includes("fintech") && !lower.includes("health") && !lower.includes("rmg") && !lower.includes("logistics") && !lower.includes("agri") && !lower.includes("edtech")) {
    return [
      {
        id: 1,
        layout: "hero",
        tag: "Opportunity & Mission",
        title: cleanTopic,
        subtitle: "Unlocking the $3.2B Next-Billion Consumer & Merchant Economy in South Asia",
        bullets: [
          "170M+ population transitioning rapidly from cash-in-hand to mobile financial rails (bKash/Nagad)",
          "AI-first automated operating company model reducing merchant operating overhead by 70%",
          "Proprietary low-resource NLP tailored for Banglish, Romanized Urdu, and regional commerce intent",
        ],
        metrics: [
          { label: "Regional TAM", value: "$3.2B", trend: "+28% YoY" },
          { label: "Software Margin", value: "81.4%", trend: "Capital Efficient" },
          { label: "MoM Growth", value: "+24%", trend: "Organic Inflow" },
        ],
        speakerNotes: "Good afternoon investors and committee members. Today we are presenting how we tap the explosive South Asian digital consumer market using specialized vernacular AI workflows.",
      },
      {
        id: 2,
        layout: "split",
        tag: "Problem vs Solution",
        title: "The Massive Emerging Market Friction",
        subtitle: "Why Legacy Global Software Tools Fail in South Asia",
        bullets: [],
        splitLeft: {
          heading: "⚠️ High-Friction Realities",
          points: [
            "Credit Card Penetration: < 4% across urban and rural demographics",
            "Complex Regulatory & Tax Hurdles: Manual NBR, TDS and VAT withholding",
            "Delivery Failure: 20%+ COD parcel return rate on courier drops",
          ],
        },
        splitRight: {
          heading: "🚀 Our Regional Unfair Advantage",
          points: [
            "Native bKash & Nagad MFS gateway with instant SMS TrxID settlement",
            "Built-in statutory tax, VAT rebate & NBR 2023 compliance engines",
            "Automated Pathao/Steadfast courier booking with delivery predictive scoring",
          ],
        },
        speakerNotes: "Global software lacks localization for local payment rails like bKash and local tax laws. Our architecture natively bridges these barriers.",
      },
      {
        id: 3,
        layout: "stats",
        tag: "Unit Economics & Payback",
        title: "Superior Capital Efficiency & Payback",
        subtitle: "Disciplined Growth with Unmatched Operating Leverage",
        bullets: [
          "Blended customer acquisition cost (CAC) recovered within 2.3 months",
          "High annual net revenue retention (NRR) driven by multi-agent autonomy",
        ],
        metrics: [
          { label: "Annual GMV", value: "$4.8M", trend: "Run Rate" },
          { label: "Blended CAC", value: "৳450", trend: "$3.75 USD" },
          { label: "LTV / CAC", value: "5.8x", trend: "Top Quartile" },
          { label: "Cash Payback", value: "2.3 Mo", trend: "Fast Re-investment" },
        ],
        speakerNotes: "Our unit economics prove exceptional capital efficiency: 5.8x LTV to CAC with payback in under 70 days.",
      },
      {
        id: 4,
        layout: "timeline",
        tag: "18-Month Scaling Roadmap",
        title: "Seed Capital Allocation & Regional Expansion",
        subtitle: "Milestones Backed by Institutional Governance",
        bullets: [],
        timelineSteps: [
          { step: "Phase 1", title: "Domestic Scale", desc: "Scale to 50,000 active SMEs across Dhaka & Chittagong", status: "active" },
          { step: "Phase 2", title: "Regional Gateway", desc: "Expand remittance & cross-border trade corridors with Singapore & UAE", status: "upcoming" },
          { step: "Phase 3", title: "Enterprise API", desc: "Power tier-1 banks and telecom micro-lending risk models", status: "upcoming" },
          { step: "Phase 4", title: "Series-A Round", desc: "Target $5M ARR and regional institutional expansion", status: "upcoming" },
        ],
        speakerNotes: "With this seed raise, we will scale from domestic dominance to cross-border remittances and enterprise banking integrations.",
      },
    ];
  }

  if (lower.includes("thesis") || lower.includes("defense") || lower.includes("dissertation") || lower.includes("academic") || lower.includes("buet") || lower.includes("university")) {
    return [
      {
        id: 1,
        layout: "hero",
        tag: "Academic Defense",
        title: cleanTopic,
        subtitle: "Dissertation Defense & Empirical Evaluation Protocol",
        bullets: [
          "Investigating novel algorithmic formulations and low-latency inference architectures",
          "Comprehensive empirical benchmark against state-of-the-art baselines on real-world datasets",
          "Rigorous ablation studies validating mathematical guarantees and computational bounds",
        ],
        metrics: [
          { label: "Sample Size", value: "100K+", trend: "Benchmark Dataset" },
          { label: "Accuracy Gain", value: "+14.6%", trend: "p < 0.001" },
          { label: "Latency", value: "18ms", trend: "3.2x Speedup" },
        ],
        speakerNotes: "Honorable committee members and supervisor, welcome to the thesis defense. Today I present our findings on algorithmic optimization and empirical evaluation.",
      },
      {
        id: 2,
        layout: "split",
        tag: "Literature Review & Gap",
        title: "Theoretical Framework & Identified Research Gaps",
        subtitle: "Overcoming Constraints in Existing Computational Literature",
        bullets: [],
        splitLeft: {
          heading: "📚 Prior Art Limitations",
          points: [
            "High computational complexity O(n^2) preventing real-time edge deployment",
            "Lack of robustness against non-stationary distributions and out-of-domain drift",
            "Absence of verifiable provenance in multi-agent consensus protocols",
          ],
        },
        splitRight: {
          heading: "💡 Proposed Novel Contribution",
          points: [
            "Linear time O(n) approximation using quantized state embeddings",
            "Formal ZK-proof verification guaranteeing state execution integrity",
            "Empirical validation across 5 standard benchmark testbeds",
          ],
        },
        speakerNotes: "Prior literature suffered from quadratic complexity and lack of verification. Our method introduces linear approximation with formal zero-knowledge guarantees.",
      },
      {
        id: 3,
        layout: "stats",
        tag: "Experimental Results",
        title: "Empirical Validation & Benchmark Comparison",
        subtitle: "Quantitative Proof of Convergence and Efficiency",
        bullets: [
          "Statistically significant improvement demonstrated across all evaluation dimensions",
          "Zero memory degradation or numerical drift over 10,000 continuous benchmark cycles",
        ],
        metrics: [
          { label: "F1 Score", value: "96.2%", trend: "+8.4% vs Baseline" },
          { label: "Memory Footprint", value: "142 MB", trend: "-45% Reduction" },
          { label: "Throughput", value: "1,250 op/s", trend: "Real-Time Scale" },
          { label: "Error Margin", value: "±0.04%", trend: "95% Confidence" },
        ],
        speakerNotes: "Our experimental results show a 96.2% F1 score, a 45% reduction in memory footprint, and 1,250 operations per second throughput with 95% statistical confidence.",
      },
      {
        id: 4,
        layout: "timeline",
        tag: "Contributions & Future Work",
        title: "Summary of Contributions & Academic Impact",
        subtitle: "Publications, Reproducibility & Next Research Horizons",
        bullets: [],
        timelineSteps: [
          { step: "Published", title: "Peer-Reviewed Paper", desc: "Accepted in IEEE/ACM conference proceedings with full open-source artifacts", status: "completed" },
          { step: "Artifact", title: "Open Benchmark", desc: "Reproducible Docker container and raw test vectors deposited on Zenodo/GitHub", status: "completed" },
          { step: "Next Step", title: "Distributed Scalability", desc: "Extending the mathematical formulation to multi-tenant Byzantine clusters", status: "active" },
          { step: "Future", title: "Hardware Synthesis", desc: "FPGA & ASIC hardware acceleration for sub-millisecond edge execution", status: "upcoming" },
        ],
        speakerNotes: "To conclude, this thesis provides peer-reviewed contributions with open reproducible artifacts, paving the way for distributed multi-tenant scalability.",
      },
    ];
  }

  if (lower.includes("health") || lower.includes("med") || lower.includes("clinic") || lower.includes("doctor")) {
    return [
      {
        id: 1,
        layout: "hero",
        tag: "Executive Vision",
        title: cleanTopic,
        subtitle: "Transforming Healthcare Access & Automated Diagnostics across Emerging Markets",
        bullets: [
          "AI-driven preliminary triage & prescription verification for underserved regions",
          "Telemedicine consultation integrated with local pharmacy fulfillment",
          "Secure HIPAA/GDPR compliant electronic health records (EHR) on edge devices",
        ],
        metrics: [
          { label: "Target Patients", value: "120M+", trend: "+22% YoY" },
          { label: "Diagnostic Accuracy", value: "98.4%", trend: "Clinical Grade" },
          { label: "Consultation Cost", value: "৳250 BDT", trend: "$2.10 USD" },
        ],
        speakerNotes: "Begin with the critical healthcare infrastructure deficit and how digital triage expands primary care reach.",
      },
      {
        id: 2,
        layout: "split",
        tag: "Clinical Problem vs Solution",
        title: "Overcoming Diagnostic Bottlenecks",
        subtitle: "Bridging the Specialist Shortage in Rural & Peri-Urban Clinics",
        bullets: [],
        splitLeft: {
          heading: "⚠️ Traditional Healthcare Friction",
          points: [
            "Doctor-Patient Ratio: 1:1,800 leading to 4+ hour waiting times",
            "Counterfeit Medication: 15% of retail drugs lack verifiable supply chains",
            "Fragmented Paper Records: Lost patient history and adverse drug interactions",
          ],
        },
        splitRight: {
          heading: "✅ Our Digital Health Solution",
          points: [
            "Instant AI-assisted symptom triage resolving 70% of non-emergency visits",
            "Batch barcode authentication on all dispensed prescriptions",
            "Unified digital patient wallet accessible offline via SMS / QR code",
          ],
        },
        speakerNotes: "Highlight how our platform reduces doctor burnout while elevating patient diagnostic precision.",
      },
      {
        id: 3,
        layout: "stats",
        tag: "Market Opportunity",
        title: "South Asian Digital Health TAM",
        subtitle: "A $6.8B Market Accelerating at 28.2% CAGR",
        bullets: [
          "Rapid growth in out-of-pocket health expenditure seeking transparent pricing",
          "Government digital health initiatives encouraging public-private API integration",
        ],
        metrics: [
          { label: "Total Addressable Market", value: "$6.8B", trend: "+28.2% CAGR" },
          { label: "Partner Clinics", value: "1,450+", trend: "Networked" },
          { label: "Monthly Tele-visits", value: "85,000+", trend: "+40% MoM" },
          { label: "Average Patient Savings", value: "62%", trend: "Per Episode" },
        ],
        speakerNotes: "Present the immense addressable market and explosive growth in digital health consultations.",
      },
      {
        id: 4,
        layout: "timeline",
        tag: "Clinical Milestones",
        title: "Clinical Rollout & Hospital Integration",
        subtitle: "Phased Deployment across Secondary & Tertiary Care Networks",
        bullets: [],
        timelineSteps: [
          { step: "Phase 1", title: "Diagnostic MVP", desc: "Launch AI symptom checker & prescription OCR", status: "completed" },
          { step: "Phase 2", title: "Pharmacy Rails", desc: "Doorstep delivery integration with verified distributors", status: "active" },
          { step: "Phase 3", title: "Insurance Direct", desc: "Instant cashless micro-insurance claim settlements", status: "upcoming" },
          { step: "Phase 4", title: "Regional Hubs", desc: "Cross-border specialist second-opinion network", status: "upcoming" },
        ],
        speakerNotes: "Walk through the four-phase deployment plan from mobile triage to regional hospital integration.",
      },
      {
        id: 5,
        layout: "split",
        tag: "Clinical Architecture",
        title: "AI Symptom Triage & Electronic Health Records (EHR)",
        subtitle: "HIPAA-Compliant Encrypted Cloud Infrastructure",
        bullets: [],
        splitLeft: {
          heading: "🩺 Patient Mobile Experience",
          points: [
            "Bengali voice-enabled symptom intake with dial-in audio triage",
            "Instant digital prescription storage and lab report OCR parsing",
            "Integrated doorstep medicine delivery in under 90 minutes",
          ],
        },
        splitRight: {
          heading: "🏥 Doctor Clinical Workbench",
          points: [
            "Automated clinical decision support with drug-interaction alerts",
            "Structured ICD-10 diagnostic coding with 1-click audio dictation",
            "Instant bKash/Nagad fee disbursement per consultation",
          ],
        },
        speakerNotes: "Explain the patient intake workflow and the doctor EHR workbench that eliminates administrative charting overhead.",
      },
      {
        id: 6,
        layout: "stats",
        tag: "Unit Economics",
        title: "High-Margin Tele-consultation & Medicine Dispatch",
        subtitle: "Rapid Payback & Defensible Operating Contributions",
        bullets: [
          "Gross margin on tele-consultation platform fee exceeds 78%",
          "Pharmacy retail fulfillment margin delivers 22% net contribution",
        ],
        metrics: [
          { label: "Consultation Fee", value: "৳350", trend: "Per Session" },
          { label: "Gross Platform Margin", value: "78.4%", trend: "Software Model" },
          { label: "Patient LTV", value: "৳4,800", trend: "14-Month Cohort" },
          { label: "CAC Payback", value: "2.1 Mo", trend: "Highly Capital Efficient" },
        ],
        speakerNotes: "Detail the unit economics: ৳350 consultation fee with 78% software gross margin and 2.1 month payback.",
      },
      {
        id: 7,
        layout: "split",
        tag: "Defensibility",
        title: "Regulatory Compliance & Network Effects",
        subtitle: "BMDC Certified Clinical Protocol & Local Defensibility",
        bullets: [],
        splitLeft: {
          heading: "📜 Regulatory Compliance",
          points: [
            "100% verified BMDC doctor registration checks via automated API",
            "End-to-end encrypted medical tele-consultation data sovereignty",
            "Directorate General of Drug Administration (DGDA) certified pharmacies",
          ],
        },
        splitRight: {
          heading: "🛡️ Defensible Flywheel",
          points: [
            "Exclusive partnerships with 1,450+ grassroots rural diagnostic hubs",
            "Proprietary Bengali speech-to-text medical translation dataset",
            "Zero-data-cost operator partnership for low-income patients",
          ],
        },
        speakerNotes: "Highlight regulatory compliance and our proprietary Bengali medical speech dataset as our core defensible moat.",
      },
      {
        id: 8,
        layout: "timeline",
        tag: "Funding & Execution",
        title: "Seed Investment & Strategic Milestones",
        subtitle: "Deploying Capital for Nationwide Distribution",
        bullets: [],
        timelineSteps: [
          { step: "Q1", title: "Scale Dhaka & Sylhet", desc: "Reach 50,000 monthly active tele-consultations", status: "active" },
          { step: "Q2", title: "Launch Micro-Insurance", desc: "Deploy ৳50/month health micro-coverage with bKash", status: "upcoming" },
          { step: "Q3", title: "Enterprise B2B Triage", desc: "Onboard 40 RMG factory worker health programs", status: "upcoming" },
          { step: "Q4", title: "Series-A Readiness", desc: "Hit $2.5M ARR with positive operating cash flow", status: "upcoming" },
        ],
        speakerNotes: "Present the capital allocation roadmap: scaling Dhaka and Sylhet, launching bKash micro-insurance, and reaching $2.5M ARR.",
      },
    ];
  }

  if (lower.includes("rmg") || lower.includes("textile") || lower.includes("garment") || lower.includes("apparel") || lower.includes("knitwear") || lower.includes("fob")) {
    return [
      {
        id: 1,
        layout: "hero",
        tag: "Executive Vision",
        title: cleanTopic,
        subtitle: "Decarbonizing & Automating the $47B Bangladesh RMG & Global Apparel Supply Chain",
        bullets: [
          "AI-driven Fabric Yield & Cut-Order Planning reducing textile wastage by 14%",
          "Automated ESG & LEED Certification audit logging with real-time worker safety telemetry",
          "Direct FOB & Cost of Making (CM) quotation generator with real-time yarn & raw material pricing",
        ],
        metrics: [
          { label: "Apparel Export TAM", value: "$47.4B", trend: "Global #2" },
          { label: "Fabric Scrap Reduction", value: "14.2%", trend: "Cost Saver" },
          { label: "Audit Readiness", value: "99.8%", trend: "EU/US Compliant" },
        ],
        speakerNotes: "Open by highlighting Bangladesh's position as the world's 2nd largest garment exporter and how AI automation protects margins amid rising labor and energy costs.",
      },
      {
        id: 2,
        layout: "split",
        tag: "Industry Friction vs Solution",
        title: "Overcoming RMG Margin Compression",
        subtitle: "Eliminating Blind Spots in High-Volume Fast-Fashion Manufacturing",
        bullets: [],
        splitLeft: {
          heading: "⚠️ Traditional Factory Inefficiencies",
          points: [
            "Manual Marker Making: 8%-12% excess fabric waste per 10,000-piece cut",
            "Slow CM Costing: 3-5 days to deliver FOB quotations to European buyers",
            "Fragmented Compliance: Paper records failing sudden buyer ESG/accord audits",
          ],
        },
        splitRight: {
          heading: "✅ Our AI-Powered Factory OS",
          points: [
            "Computer Vision Fabric Nesting achieving 91.4% fabric utilization rate",
            "Instant 60-Second CM Quotations factoring live cotton, yarn, and freight rates",
            "Automated Digital Twin of factory floors with immutable compliance logs",
          ],
        },
        speakerNotes: "Emphasize how fast buyers make purchase decisions today and how 60-second quotation turnaround secures tier-1 contracts.",
      },
      {
        id: 3,
        layout: "stats",
        tag: "Market Scale",
        title: "Massive Global Sourcing TAM",
        subtitle: "Capturing the $47B Export Sector & 4,200+ Tier-1 Factories",
        bullets: [
          "Over 4,200 active BGMEA and BKMEA registered export manufacturing units",
          "European Union Due Diligence Act mandating end-to-end supply chain transparency",
        ],
        metrics: [
          { label: "Annual Export Volume", value: "$47.4B", trend: "+12.4% YoY" },
          { label: "Tier-1 Factories", value: "4,200+", trend: "Nationwide" },
          { label: "Workforce Employed", value: "4.4M+", trend: "Direct Labor" },
          { label: "Green LEED Factories", value: "215+", trend: "World #1" },
        ],
        speakerNotes: "Frame the macro context: Bangladesh holds the highest concentration of LEED Platinum green garment factories globally.",
      },
      {
        id: 4,
        layout: "process",
        tag: "Operational Architecture",
        title: "End-to-End Factory Intelligence Workflow",
        subtitle: "From Buyer Tech Pack Ingestion to Port of Chittagong Bill of Lading",
        bullets: [],
        processSteps: [
          { number: "01", title: "Tech Pack Parsing", desc: "Extract measurements, fabric specs & BOM in 15 seconds" },
          { number: "02", title: "Automated CM Costing", desc: "Calculate knitting, dyeing, CMT & FOB in USD and BDT" },
          { number: "03", title: "Floor Line Balancing", desc: "Distribute 80-operator sewing line tasks for maximum SMV" },
          { number: "04", title: "Export Clearance", desc: "Generate customs documentation & bill of lading automatically" },
        ],
        speakerNotes: "Walk through the four operational stages, highlighting our proprietary tech pack parser and automated floor line balancing.",
      },
      {
        id: 5,
        layout: "quote",
        tag: "Buyer Validation",
        title: "Proven Production Impact",
        subtitle: "Tier-1 Composite Knitwear Manufacturer Testimonial",
        bullets: [],
        quote: {
          text: "Integrating Shothik RMG intelligence cut our sample approval cycle from 14 days down to 48 hours. We recovered $180,000 in fabric scrap savings in our first quarter alone.",
          author: "Managing Director",
          role: "Top-5 Gazipur Composite Knitwear Group (32,000 Workers)",
        },
        speakerNotes: "Share this real-world quote showing tangible ROI in fabric savings and dramatic reduction in buyer sample cycle time.",
      },
      {
        id: 6,
        layout: "grid",
        tag: "Product Capabilities",
        title: "Enterprise RMG Feature Matrix",
        subtitle: "Purpose-Built for Industrial Scale & Real-Time Production Lines",
        bullets: [],
        features: [
          { title: "Smart Marker Nesting", desc: "Optimized fabric cutting curves saving up to 4% yarn weight per run" },
          { title: "Real-Time SMV Tracking", desc: "Standard Minute Value analytics per sewing station to prevent bottlenecking" },
          { title: "ESG & Carbon Tracker", desc: "Calculates CO2 footprint and water consumption per finished garment unit" },
          { title: "Back-to-Back LC Ledger", desc: "Reconciles raw material import LCs against export proceeds and bank margins" },
        ],
        speakerNotes: "Review the key capabilities: smart marker nesting, real-time SMV tracking, ESG tracking, and back-to-back LC reconciliation.",
      },
      {
        id: 7,
        layout: "split",
        tag: "Moat & Defensibility",
        title: "Why Competitors Cannot Replicate",
        subtitle: "Domain Data Depth & Factory ERP Integration",
        bullets: [],
        splitLeft: {
          heading: "📊 Proprietary Data Assets",
          points: [
            "Trained on 45,000+ real tech packs, wash recipes & pattern grading matrices",
            "Direct integration with leading industrial circular knitting & sewing hardware",
            "Native Bengali & Sylheti voice interface for floor supervisors and line managers",
          ],
        },
        splitRight: {
          heading: "🔒 Enterprise Stickiness",
          points: [
            "Deep integration with commercial banking back-to-back LC clearance APIs",
            "Certified for EU Digital Product Passport (DPP) compliance regulations",
            "Over 98% annual customer retention among tier-1 industrial clients",
          ],
        },
        speakerNotes: "Explain our structural competitive advantages: proprietary tech pack datasets and deep integration into commercial trade banking.",
      },
      {
        id: 8,
        layout: "timeline",
        tag: "Roadmap & Scaling",
        title: "Growth & Global Sourcing Milestones",
        subtitle: "Expanding from Dhaka & Chittagong to Vietnam & Cambodia",
        bullets: [],
        timelineSteps: [
          { step: "Phase 1", title: "Dhaka & Gazipur Scale", desc: "Deploy across 250 composite knitwear & woven facilities", status: "active" },
          { step: "Phase 2", title: "Chittagong Port & EPZ", desc: "Integrate customs automation with Port of Chittagong", status: "upcoming" },
          { step: "Phase 3", title: "EU Digital Passport", desc: "Launch mandatory EU DPP QR traceability for fashion brands", status: "upcoming" },
          { step: "Phase 4", title: "Regional Expansion", desc: "Enter Vietnam and Cambodia apparel manufacturing corridors", status: "upcoming" },
        ],
        speakerNotes: "Conclude with our growth trajectory: scaling in Dhaka/Gazipur, integrating Chittagong port logistics, and expanding regionally.",
      },
    ];
  }

  if (lower.includes("fintech") || lower.includes("mfs") || lower.includes("bkash") || lower.includes("nagad") || lower.includes("banking") || lower.includes("payment") || lower.includes("wallet")) {
    return [
      {
        id: 1,
        layout: "hero",
        tag: "Executive Vision",
        title: cleanTopic,
        subtitle: "Next-Gen AI Micro-Credit, Merchant Settlement & MFS Infrastructure for 120M+ Wallets",
        bullets: [
          "Instant automated bKash, Nagad & Bangla QR reconciliation with 0.1s settlement verification",
          "Alternative credit scoring engine evaluating transactional velocity for unbanked micro-merchants",
          "AI fraud detection preventing SIM-swap scams and unauthorized cash-out disputes",
        ],
        metrics: [
          { label: "MFS Annual Volume", value: "$145B", trend: "+26.8% YoY" },
          { label: "Registered Wallets", value: "120M+", trend: "Nationwide" },
          { label: "Settlement Speed", value: "0.12s", trend: "Real-Time" },
        ],
        speakerNotes: "Open by highlighting Bangladesh's status as a world leader in mobile financial services ($145B annual throughput) and our platform's infrastructure role.",
      },
      {
        id: 2,
        layout: "split",
        tag: "FinTech Problem vs Solution",
        title: "Modernizing Merchant Settlement & Credit",
        subtitle: "Eliminating High-Risk Manual Reconciliation & Predatory Informal Lending",
        bullets: [],
        splitLeft: {
          heading: "⚠️ Current Merchant Pain Points",
          points: [
            "Manual TrxID Verification: 3-5% payment loss from fake SMS receipts",
            "Lack of Working Capital: Micro-merchants forced into 10%-15% monthly informal debt",
            "Fragmented PGW Integrations: High integration barrier across individual MFS rails",
          ],
        },
        splitRight: {
          heading: "✅ Our FinTech Infrastructure",
          points: [
            "Unified Multi-Rail PGW: Single webhook for bKash, Nagad, Upay & Visa/Mastercard",
            "Algorithmic Micro-Lending: Instant ৳5,000-৳50,000 working capital loans via AI scoring",
            "Automated NBR Tax Withholding: 100% compliant VAT/AIT deduction certificates",
          ],
        },
        speakerNotes: "Contrast the vulnerability of manual SMS checking with our automated cryptographic TrxID verification and unified merchant SDK.",
      },
      {
        id: 3,
        layout: "stats",
        tag: "Market Opportunity",
        title: "The $145 Billion Digital Payment Wave",
        subtitle: "Capturing Merchant Fees & Credit Spreads in South Asia's Fastest Growing MFS Hub",
        bullets: [
          "Over 3.2 million registered retail and f-commerce merchants accepting mobile payments",
          "Bangladesh Bank Smart Bangladesh Vision targeting 100% cashless retail by 2031",
        ],
        metrics: [
          { label: "Total MFS Flow", value: "$145B", trend: "+26.8% CAGR" },
          { label: "Active Merchants", value: "3.2M+", trend: "Retail & F-Comm" },
          { label: "Avg Transaction", value: "৳1,850", trend: "BDT" },
          { label: "Credit Gap", value: "$12.8B", trend: "Unmet MSME Need" },
        ],
        speakerNotes: "Present the market volume data: $145B moving across MFS rails annually, with a massive $12.8B unmet micro-credit gap.",
      },
      {
        id: 4,
        layout: "process",
        tag: "Payment Architecture",
        title: "Sub-Second Transaction Lifecycle",
        subtitle: "From Consumer QR Scan to Merchant Automated Bank Settlement",
        bullets: [],
        processSteps: [
          { number: "01", title: "Dynamic QR / Intent", desc: "Generate encrypted payment intent with custom invoice metadata" },
          { number: "02", title: "MFS Rail Routing", desc: "Execute transaction over bKash, Nagad or Bangla QR rails" },
          { number: "03", title: "AI Fraud Scoring", desc: "Verify device signature, velocity limits & TrxID authenticity" },
          { number: "04", title: "Instant Auto-Payout", desc: "Credit merchant ledger with automated VAT & fee reconciliation" },
        ],
        speakerNotes: "Walk through the four payment lifecycle steps, showing sub-second speed and integrated fraud screening.",
      },
      {
        id: 5,
        layout: "quote",
        tag: "Enterprise Impact",
        title: "Trusted by Fast-Growing Merchants",
        subtitle: "Dhanmondi Retail Chain Founder Testimonial",
        bullets: [],
        quote: {
          text: "Switching to Shothik FinTech rails dropped our transaction dispute rate to zero. The automated bKash reconciliation alone saves our accounting team 45 hours every week.",
          author: "Head of Digital Commerce",
          role: "Lifestyle & Apparel Chain (18 Outlets across Dhaka & Chittagong)",
        },
        speakerNotes: "Highlight this case study proving immediate operational savings in accounting overhead and dispute elimination.",
      },
      {
        id: 6,
        layout: "grid",
        tag: "Platform Capabilities",
        title: "Comprehensive FinTech Suite",
        subtitle: "Engineered for High-Concurrency & Zero-Downtime Reliability",
        bullets: [],
        features: [
          { title: "Bangla QR Integration", desc: "Interoperable QR payment standard compatible with all major banks & MFS apps" },
          { title: "Instant Cashout Engine", desc: "Automated BEFTN/NPSB batch payouts to merchant commercial bank accounts" },
          { title: "Alternative Credit Scoring", desc: "Evaluates invoice velocity and courier delivery rates to grant working capital" },
          { title: "PCI-DSS Level 1 Security", desc: "Bank-grade hardware encryption for all stored tokens and financial keys" },
        ],
        speakerNotes: "Review our four core FinTech pillars: Bangla QR, instant cashouts, credit scoring, and PCI-DSS Level 1 compliance.",
      },
      {
        id: 7,
        layout: "split",
        tag: "Unit Economics",
        title: "High-Margin Recurring Revenue",
        subtitle: "Monetizing Transaction Volume, SaaS Subscriptions & Lending Spreads",
        bullets: [],
        splitLeft: {
          heading: "💰 Revenue Streams",
          points: [
            "0.8% - 1.2% Merchant Discount Rate (MDR) on processed transaction volume",
            "৳1,499 - ৳9,900 / mo SaaS tier for automated accounting & inventory sync",
            "3.5% - 5.0% origination fee on disbursed micro-merchant credit lines",
          ],
        },
        splitRight: {
          heading: "📈 Unit Economics",
          points: [
            "Customer Acquisition Cost (CAC): ৳1,200 BDT per onboarded merchant",
            "Lifetime Value (LTV): ৳18,400 BDT (LTV:CAC Ratio of 15.3x)",
            "Gross Margin: 78.4% with negative net revenue churn across pro tiers",
          ],
        },
        speakerNotes: "Demonstrate our exceptional 15.3x LTV:CAC ratio and diversified revenue across transaction fees, SaaS, and credit origination.",
      },
      {
        id: 8,
        layout: "timeline",
        tag: "Strategic Milestones",
        title: "Scale & Capital Deployment Roadmap",
        subtitle: "Expanding Financial Inclusion across Bangladesh & South Asia",
        bullets: [],
        timelineSteps: [
          { step: "Q1", title: "100k Active Wallets", desc: "Reach $10M monthly processed GMV across Dhaka retailers", status: "active" },
          { step: "Q2", title: "Micro-Credit Rollout", desc: "Disburse ৳25M BDT in algorithmic working capital loans", status: "upcoming" },
          { step: "Q3", title: "Cross-Border Remittance", desc: "Integrate GCC-to-Bangladesh real-time remittance rails", status: "upcoming" },
          { step: "Q4", title: "Digital Bank Sandbox", desc: "Secure Bangladesh Bank Digital Banking infrastructure partnership", status: "upcoming" },
        ],
        speakerNotes: "Conclude by outlining the expansion into micro-credit, GCC remittance corridors, and digital banking infrastructure.",
      },
    ];
  }

  if (lower.includes("agri") || lower.includes("krishi") || lower.includes("farmer") || lower.includes("agriculture") || lower.includes("crop") || lower.includes("harvest")) {
    return [
      {
        id: 1,
        layout: "hero",
        tag: "Executive Vision",
        title: cleanTopic,
        subtitle: "Digitizing Farm-to-Fork Supply Chains & Climate-Resilient AgriTech for 35M+ Farmers",
        bullets: [
          "Direct farmer-to-retail procurement cutting middleman markups by 35%",
          "IoT cold storage monitoring & predictive spoilage alerts for perishable produce",
          "Satellite & computer vision crop health analysis for localized yield optimization",
        ],
        metrics: [
          { label: "Agri Sector GDP", value: "৳3.2T BDT", trend: "11.6% of GDP" },
          { label: "Farmer Base", value: "35M+", trend: "Direct Impact" },
          { label: "Post-Harvest Waste", value: "-22%", trend: "Cold Chain" },
        ],
        speakerNotes: "Open by highlighting Bangladesh's massive ৳3.2 Trillion agriculture sector and how digital supply chains empower 35M smallholder farmers.",
      },
      {
        id: 2,
        layout: "split",
        tag: "Agri Friction vs Solution",
        title: "Fixing the Broken Agricultural Value Chain",
        subtitle: "Eliminating 5 Layers of Intermediaries & 30% Perishable Spoilage",
        bullets: [],
        splitLeft: {
          heading: "⚠️ Traditional Supply Chain Flaws",
          points: [
            "Middleman Exploitation: Farmers receive only 35% of retail consumer price",
            "High Perishable Loss: 25%-30% fruit & vegetable spoilage in transit",
            "Lack of Input Pricing Transparency: 20% price markup on fertilizers & seeds",
          ],
        },
        splitRight: {
          heading: "✅ The Direct Digital Advantage",
          points: [
            "Direct B2B Market Linkage: Farmers capture 65%+ of retail value via mobile app",
            "Temperature-Controlled Micro-Hubs: Solar-powered cold storage near harvest clusters",
            "Direct Input Sourcing: Bulk quality seeds & inputs at 15% discount to market",
          ],
        },
        speakerNotes: "Contrast the 5 layers of intermediaries with our direct-to-retail digital procurement network and solar cold chain.",
      },
      {
        id: 3,
        layout: "stats",
        tag: "Market Opportunity",
        title: "Huge Unpenetrated AgriTech TAM",
        subtitle: "Transforming 8.8 Million Hectares of Arable Land into High-Yield Digital Nodes",
        bullets: [
          "Over 35 million rural citizens engaged in crop, poultry, dairy, and fisheries production",
          "Rapid smartphone & 4G mobile penetration across rural union parishads",
        ],
        metrics: [
          { label: "Total Market Size", value: "$38.5B", trend: "Annual Agri Economy" },
          { label: "Digital Penetration", value: "<4%", trend: "Massive White Space" },
          { label: "Avg Farmer Income", value: "+38%", trend: "On-Platform" },
          { label: "Partner Hubs", value: "1,200+", trend: "Upazila Level" },
        ],
        speakerNotes: "Highlight the massive white space: less than 4% digital penetration across a $38.5B agricultural economy.",
      },
      {
        id: 4,
        layout: "process",
        tag: "Farm-to-Fork Flow",
        title: "Seamless Direct Supply Chain Lifecycle",
        subtitle: "From Village Harvest Aggregation to Supermarket Shelf in Under 12 Hours",
        bullets: [],
        processSteps: [
          { number: "01", title: "Harvest Forecast", desc: "Farmer logs crop readiness via Bengali voice interface" },
          { number: "02", title: "Micro-Hub Weighing", desc: "Digital grading & quality certification at village hub" },
          { number: "03", title: "Cold Logistics", desc: "Dispatched in monitored temperature vehicles to metro centers" },
          { number: "04", title: "Instant MFS Payout", desc: "Farmer receives full bKash/Nagad payment upon delivery" },
        ],
        speakerNotes: "Walk through the 12-hour journey from village harvesting to supermarket shelf, highlighting instant MFS farmer settlement.",
      },
      {
        id: 5,
        layout: "quote",
        tag: "Farmer Testimonial",
        title: "Transforming Grassroots Lives",
        subtitle: "Bogra Potato & Vegetable Grower Testimonial",
        bullets: [],
        quote: {
          text: "Previously the local brokers took 40% of my potato profit. With Shothik Agri, I sold directly to Dhaka grocery chains and got paid on my bKash account the very same afternoon.",
          author: "Abdul Karim",
          role: "Farmer & Cooperative Leader (Shibganj, Bogra — 12 Acres)",
        },
        speakerNotes: "Share this authentic testimonial demonstrating instant livelihood improvement for rural farming communities.",
      },
      {
        id: 6,
        layout: "grid",
        tag: "Technology Stack",
        title: "AgriTech Innovation Matrix",
        subtitle: "Deep-Tech Tailored for Low-Bandwidth Rural Connectivity",
        bullets: [],
        features: [
          { title: "Voice-First Bengali AI", desc: "Dial-in automated voice assistant allowing illiterate farmers to log crop data" },
          { title: "Computer Vision Grading", desc: "Smartphone camera pest identification & vegetable grading in 2 seconds" },
          { title: "Micro-Climate Weather Radar", desc: "Hyper-local rainfall & flood alerts delivered 48 hours in advance via SMS" },
          { title: "Crop-Backed Micro-Loans", desc: "Pre-harvest financing with automatic loan deduction at produce sale" },
        ],
        speakerNotes: "Detail our rural-first technologies: voice AI, computer vision pest diagnostics, and crop-backed micro-loans.",
      },
      {
        id: 7,
        layout: "split",
        tag: "Impact & Sustainability",
        title: "ESG & Food Security Leadership",
        subtitle: "Building Climate-Resilient Agricultural Systems for South Asia",
        bullets: [],
        splitLeft: {
          heading: "🌱 Environmental Impact",
          points: [
            "22% reduction in perishable food wastage preventing methane landfill emissions",
            "Precision fertilizer guidance reducing chemical groundwater runoff by 18%",
            "Solar-powered micro cold storage running 100% off-grid in remote unions",
          ],
        },
        splitRight: {
          heading: "👥 Social & Economic Impact",
          points: [
            "Over 38% average increase in take-home income for participating farmers",
            "Empowering 25,000+ female backyard poultry & dairy micro-entrepreneurs",
            "Stabilizing urban food inflation by cutting speculative hoarding",
          ],
        },
        speakerNotes: "Highlight our dual ESG impact: cutting food waste while increasing smallholder farmer incomes by 38%.",
      },
      {
        id: 8,
        layout: "timeline",
        tag: "Execution Roadmap",
        title: "Nationwide Agricultural Expansion",
        subtitle: "Scaling from Northern Crop Belts to Southern Coastal Aquaculture",
        bullets: [],
        timelineSteps: [
          { step: "Phase 1", title: "North Bengal Belts", desc: "Scale Bogra, Rangpur & Rajshahi vegetable/grain corridors", status: "active" },
          { step: "Phase 2", title: "Southern Aquaculture", desc: "Deploy shrimp & fish cold chain across Khulna & Barisal", status: "upcoming" },
          { step: "Phase 3", title: "Fertilizer Direct B2B", desc: "Partner with BCIC for transparent digital input distribution", status: "upcoming" },
          { step: "Phase 4", title: "Regional Export", desc: "Export high-value fresh mango & betel leaf to EU & Middle East", status: "upcoming" },
        ],
        speakerNotes: "Conclude with our expansion plan: North Bengal grain hubs, southern aquaculture, and regional exports to the Middle East.",
      },
    ];
  }

  if (lower.includes("bangla") || lower.includes("heritage") || lower.includes("ekushey") || lower.includes("boimela") || lower.includes("book") || lower.includes("author") || lower.includes("publish") || lower.includes("literature")) {
    return [
      {
        id: 1,
        layout: "hero",
        tag: "Executive Vision",
        title: cleanTopic,
        subtitle: "Amar Ekushey Boi Mela: AI-Powered Literary Studio & 1-Click Nilkhet Print-on-Demand",
        bullets: [
          "End-to-end Bengali AI authoring engine with poetic meter & literary grammar refinement",
          "Interactive 3D Page-Flip book preview with authentic hardbound cloth & gold-foil rendering",
          "1-Click Nilkhet physical print fulfillment with automated Steadfast & Pathao nationwide courier delivery",
        ],
        metrics: [
          { label: "Boi Mela Annual Sales", value: "৳600M+ BDT", trend: "Ekushey Hub" },
          { label: "Digital-to-Print Time", value: "48 Hours", trend: "Nilkhet POD" },
          { label: "Author Royalties", value: "70%", trend: "vs 15% Legacy" },
        ],
        speakerNotes: "Open by honoring Bangladesh's legendary literary heritage (Ekushey Boi Mela) and showing how Shothik empowers every Bengali storyteller.",
      },
      {
        id: 2,
        layout: "split",
        tag: "Publishing Friction vs Solution",
        title: "Democratizing Bangladeshi Publishing",
        subtitle: "Eliminating Legacy Gatekeepers, High Minimum Print Runs & Royalties Exploitation",
        bullets: [],
        splitLeft: {
          heading: "⚠️ Traditional Publishing Barriers",
          points: [
            "Exorbitant Upfront Cost: Minimum 1,000-copy print runs costing ৳80,000+ BDT",
            "Publisher Gatekeeping: 95% of aspiring authors rejected by traditional presses",
            "Meager Royalties: Authors receive only 10%-15% after 12-month payment delays",
          ],
        },
        splitRight: {
          heading: "✅ Shothik 1-Click POD Revolution",
          points: [
            "Zero Upfront Inventory: Print-on-demand starting from a single book copy (৳180 BDT)",
            "Instant 3D Virtual Proof: Authors review realistic page-turns and cover binding online",
            "70% Net Author Earnings: Automated bKash royalty payouts upon Steadfast courier delivery",
          ],
        },
        speakerNotes: "Contrast the traditional 1,000-copy barrier with Shothik's 1-copy Nilkhet POD engine and 70% author royalties.",
      },
      {
        id: 3,
        layout: "stats",
        tag: "Market Scale",
        title: "The 300M Bengali Speaking Demographic",
        subtitle: "Capturing the 7th Most Spoken Language on Earth across Bangladesh & Global Diaspora",
        bullets: [
          "Over 300 million native Bengali speakers across Bangladesh, West Bengal, and global diaspora",
          "Ekushey Boi Mela attracting over 5 million physical visitors every February in Dhaka",
        ],
        metrics: [
          { label: "Global Bengali TAM", value: "300M+", trend: "7th World Lang" },
          { label: "Annual Book Titles", value: "85,000+", trend: "Printed" },
          { label: "Diaspora Spending", value: "$45M+", trend: "UK, US, Middle East" },
          { label: "Avg Delivery Time", value: "48h", trend: "64 Districts" },
        ],
        speakerNotes: "Highlight the immense cultural TAM: 300 million Bengali speakers and an eager global diaspora.",
      },
      {
        id: 4,
        layout: "process",
        tag: "Creation to Delivery",
        title: "The 4-Step Self-Publishing Journey",
        subtitle: "From Raw Idea to Hardcover Book on the Reader's Bookshelf",
        bullets: [],
        processSteps: [
          { number: "01", title: "AI Literary Drafting", desc: "Collaborate with specialized Bengali character, plot & rhyme agents" },
          { number: "02", title: "3D BoiMela Proofing", desc: "Inspect realistic 3D page turns, paper textures & gold-embossed covers" },
          { number: "03", title: "Nilkhet Print Hub", desc: "Automated press queue printing, folding, binding & matte lamination" },
          { number: "04", title: "Steadfast Courier COD", desc: "Doorstep delivery across all 64 districts with automated bKash collection" },
        ],
        speakerNotes: "Walk through the four seamless stages: AI drafting, 3D proofing, Nilkhet physical printing, and Steadfast courier delivery.",
      },
      {
        id: 5,
        layout: "quote",
        tag: "Author Spotlight",
        title: "Empowering Independent Voices",
        subtitle: "Debut Fiction Novelist & Boi Mela Creator",
        bullets: [],
        quote: {
          text: "Publishing my first historical novel through Shothik was magical. I designed the cover in 3D, printed 50 copies in Nilkhet for under ৳10,000, and delivered them to readers across Chittagong and Sylhet in 2 days.",
          author: "Nusrat Jahan",
          role: "Independent Author (Ekushey Boi Mela 2026)",
        },
        speakerNotes: "Share this inspiring author testimonial proving how democratized POD creates independent literary success.",
      },
      {
        id: 6,
        layout: "grid",
        tag: "Studio Innovations",
        title: "Boi Mela 3D Studio Features",
        subtitle: "The Most Comprehensive Bengali Digital Publishing Suite",
        bullets: [],
        features: [
          { title: "Bangla Grammar & Chhanda", desc: "Deep phonetic verification for Matra, Juktakkhor, and classical poetic meters" },
          { title: "BoiMela 3D Canvas", desc: "WebGL interactive page-flip viewer with authentic paper weight & spine lighting" },
          { title: "Nilkhet POD Integration", desc: "Direct API dispatch to verified Nilkhet printing presses with live job queues" },
          { title: "Steadfast Courier Sync", desc: "Instant barcode generation, parcel tracking, and Cash-on-Delivery settlement" },
        ],
        speakerNotes: "Review the four studio pillars: grammatical verification, WebGL 3D preview, Nilkhet API, and Steadfast courier sync.",
      },
      {
        id: 7,
        layout: "split",
        tag: "Author Monetization",
        title: "Transparent & Fair Economics",
        subtitle: "Empowering Authors to Earn a Sustainable Living from Creative Craft",
        bullets: [],
        splitLeft: {
          heading: "📊 Cost Breakdown (200-Page Book)",
          points: [
            "Nilkhet Offset POD Printing (80 GSM paper): ৳140 BDT",
            "Full Color Matte/Gloss Laminated Cover: ৳40 BDT",
            "Steadfast Courier Delivery (Inside Dhaka): ৳60 BDT (৳120 Outside)",
          ],
        },
        splitRight: {
          heading: "💰 Author Earnings (৳450 Retail Price)",
          points: [
            "Total Production & Logistics Cost: ৳240 BDT",
            "Author Net Royalty: ৳210 BDT per copy sold (46.7% net margin)",
            "Direct weekly bKash / Nagad wallet deposit with zero payment delays",
          ],
        },
        speakerNotes: "Demonstrate the clear unit economics: an author earns ৳210 net profit on every ৳450 book sold with zero upfront inventory risk.",
      },
      {
        id: 8,
        layout: "timeline",
        tag: "Vision & Expansion",
        title: "The Future of Bengali Literature",
        subtitle: "Preserving Heritage While Scaling Global Digital Distribution",
        bullets: [],
        timelineSteps: [
          { step: "Phase 1", title: "Ekushey Boi Mela Scale", desc: "Onboard 1,000 independent authors for the February book fair", status: "active" },
          { step: "Phase 2", title: "Audiobook AI Studio", desc: "Generate multi-voice dramatic audiobooks in authentic Bengali accents", status: "upcoming" },
          { step: "Phase 3", title: "Diaspora POD Network", desc: "Print locally in London, New York & Toronto for diaspora communities", status: "upcoming" },
          { step: "Phase 4", title: "Heritage Archive", desc: "Digitize 50,000 rare historical manuscripts with automated OCR", status: "upcoming" },
        ],
        speakerNotes: "Conclude with our visionary roadmap: scaling at Boi Mela, launching AI audiobooks, and printing locally in global diaspora hubs.",
      },
    ];
  }

  // Default consulting-grade investor deck for commerce, SaaS, and technology
  return [
    {
      id: 1,
      layout: "hero",
      tag: "Executive Vision",
      title: cleanTopic,
      subtitle: "Unlocking Autonomous Commerce, MFS Settlement & Next-Gen Intelligence across Emerging Markets",
      bullets: [
        "Democratizing venture creation for 650M+ South Asian digital consumers",
        "Unified operator platform replacing 5 fragmented subscriptions",
        "Prepaid local credit wallets with instant bKash, Nagad & UPI checkout",
      ],
      metrics: [
        { label: "Target Market", value: "650M+", trend: "+18% YoY" },
        { label: "Gross Margin", value: "76.6%", trend: "Unit Profitable" },
        { label: "Payback Period", value: "3.2 Mo", trend: "High Efficiency" },
      ],
      speakerNotes: "Open the pitch by framing the $10B market opportunity across South Asia and how Shothik unifies fragmented tooling.",
    },
    {
      id: 2,
      layout: "split",
      tag: "Problem vs Solution",
      title: "The Fragmented Tooling Crisis",
      subtitle: "Why Western Subscriptions Fail in Emerging Markets",
      bullets: [],
      splitLeft: {
        heading: "⚠️ Current Reality (Friction)",
        points: [
          "USD Credit Card Barrier: <3% dual-currency card penetration in South Asia",
          "High Subscription Stack: Paying $120+/mo across 5 separate point tools",
          "High COD Return Friction: 18%-25% parcel dropouts without automated verification",
        ],
      },
      splitRight: {
        heading: "✅ The Shothik Edge (Operator)",
        points: [
          "Native bKash & Nagad MFS micro-passes starting at ৳100 BDT ($0.85 USD)",
          "Unified workspace: Search, Slides, Financial Models & Book Studio in one",
          "1-Click Steadfast & Pathao courier dispatch with automated WhatsApp DMs",
        ],
      },
      speakerNotes: "Highlight the contrast between expensive Western USD tools and Shothik's hyper-localized BDT infrastructure.",
    },
    {
      id: 3,
      layout: "stats",
      tag: "Market Scale",
      title: "Massive Emerging Market TAM",
      subtitle: "Capturing the Digital Commerce Surge across Bangladesh & South Asia",
      bullets: [
        "Rapidly urbanizing demographic with 74% smartphone adoption among merchants",
        "Over $480M e-commerce parcel delivery volume growing at 24.5% annual CAGR",
      ],
      metrics: [
        { label: "Total Addressable Market", value: "$10.4B", trend: "+24.5% CAGR" },
        { label: "Daily Active Merchants", value: "320,000+", trend: "+34% YoY" },
        { label: "Digital MFS Volume", value: "$145B", trend: "Annual Flow" },
        { label: "Logistics Parcels / Day", value: "180k+", trend: "Nationwide" },
      ],
      speakerNotes: "Present the macroeconomic tailwinds: 650M consumer TAM and exploding MFS mobile payment adoption.",
    },
    {
      id: 4,
      layout: "stats",
      tag: "Unit Economics",
      title: "Scalable Margins & Profitability",
      subtitle: "3-Scenario Financial Projection (Base vs Aggressive)",
      bullets: [
        "High LTV/CAC Ratio driven by organic viral WhatsApp sharing loops",
        "Sub-second container deployment via Dokploy PaaS running <88MB memory footprints",
      ],
      metrics: [
        { label: "LTV / CAC", value: "12 : 1", trend: "Top Quartile" },
        { label: "ARPU (Monthly)", value: "৳990 BDT", trend: "$8.50 USD" },
        { label: "Net Profit Margin", value: "38.5%", trend: "Post COD Buffer" },
        { label: "Cloud Cost / Slot", value: "<$0.50 / mo", trend: "Dokploy PaaS" },
      ],
      speakerNotes: "Demonstrate strong unit economics and low infrastructure overhead running on standalone containers.",
    },
    {
      id: 5,
      layout: "hero",
      tag: "Product Architecture",
      title: "Unified Agentic Operating Engine",
      subtitle: "Replacing Point Solutions with an All-in-One Autonomous Platform",
      bullets: [
        "Multi-Agent Swarm: Deep research, financial modeling, and slide synthesis",
        "Local First & Offline GPU: Instant Ollama fallback for 100% data privacy",
        "Integrated Commerce Rail: Instant bKash/Nagad webhook reconciliation and dispatch",
      ],
      metrics: [
        { label: "Latency", value: "<250ms", trend: "SSE Stream" },
        { label: "GPU Inference", value: "Local + Cloud", trend: "Hybrid Mesh" },
        { label: "Uptime SLA", value: "99.98%", trend: "Edge Ready" },
      ],
      speakerNotes: "Explain the technical moat: hybrid local-cloud agentic execution with sub-second SSE streaming.",
    },
    {
      id: 6,
      layout: "split",
      tag: "Competitive Moat",
      title: "Unfair Distribution & Localized Defensibility",
      subtitle: "How Shothik Creates an Unassailable Network Effect",
      bullets: [],
      splitLeft: {
        heading: "🌐 Global Competitors (US/EU)",
        points: [
          "No local MFS payment rails (bKash/Nagad/UPI blocked)",
          "No integration with Bangladesh couriers (Steadfast, Pathao, Paperfly)",
          "Monolithic pricing ($20-$50/month) unaffordable for local SMBs",
        ],
      },
      splitRight: {
        heading: "🛡️ Shothik Defensibility",
        points: [
          "Micro-pass billing in BDT matched to local purchasing power",
          "Automated courier API reconciliation preventing return losses",
          "Banglish & Bengali dialect NLP context memory",
        ],
      },
      speakerNotes: "Articulate the local defensibility: courier partnerships, micro-billing, and dialect NLP.",
    },
    {
      id: 7,
      layout: "timeline",
      tag: "Execution Roadmap",
      title: "Strategic Growth & Deployment Milestones",
      subtitle: "From Regional MVP to Pan-South Asian Scale",
      bullets: [],
      timelineSteps: [
        { step: "Q1", title: "Core Platform", desc: "Launch unified Search, Slide Studio & bKash rails", status: "completed" },
        { step: "Q2", title: "Logistics Hub", desc: "Steadfast & Pathao automated parcel dispatch API", status: "active" },
        { step: "Q3", title: "Regional Expansion", desc: "India (UPI) & Pakistan (Easypaisa) rollout", status: "upcoming" },
        { step: "Q4", title: "Creator Marketplace", desc: "Prompt & Agent monetization with direct MFS cashout", status: "upcoming" },
      ],
      speakerNotes: "Walk through quarterly milestones from Bangladesh market leadership to regional pan-South Asian expansion.",
    },
    {
      id: 8,
      layout: "hero",
      tag: "The Ask & Summary",
      title: "Fueling the Next Decade of Commerce",
      subtitle: "Raising Seed Round to Accelerate Developer & Merchant Adoption",
      bullets: [
        "Target Seed Raise: Accelerating engineering, merchant integrations & regional rollout",
        "Use of Funds: 60% Core Engineering, 25% Go-To-Market, 15% Strategic Partnerships",
        "Contact: Founders Office (founders@shothik.ai) · Polsia OPC Master Suite",
      ],
      metrics: [
        { label: "Target Round", value: "$1.5M", trend: "Seed Stage" },
        { label: "Runway", value: "24 Months", trend: "Capital Efficient" },
        { label: "Projected ARR", value: "$4.2M", trend: "Year 2 Target" },
      ],
      speakerNotes: "Close with a clear, confident investment ask, use of funds, and contact channels.",
    },
  ];
}

export function SlidesArtifact({ initialTopic, slides: customSlides, isStreaming }: SlidesArtifactProps) {
  const topicTitle = initialTopic || "AI-Powered E-Commerce & Logistics in South Asia";
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTemplate, setActiveTemplate] = useState("business");
  const [showNotes, setShowNotes] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVTuberStage, setShowVTuberStage] = useState(false);
  const [showPapermarkModal, setShowPapermarkModal] = useState(false);
  const [papermarkLink, setPapermarkLink] = useState<{ id: string; shareUrl: string; customSlug: string } | null>(null);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState(false);

  const handleCreatePapermarkLink = async () => {
    setShowPapermarkModal(true);
    if (papermarkLink) return;

    setIsCreatingLink(true);
    try {
      const res = await fetch("/api/v1/papermark/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "usr_default",
          title: topicTitle,
          documentType: "pitch_deck",
          allowDownload: true,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setPapermarkLink({
            id: json.data.id,
            shareUrl: json.data.shareUrl,
            customSlug: json.data.customSlug,
          });
          setIsCreatingLink(false);
          return;
        }
      }
    } catch {
      // Offline fallback
    }

    const fallbackSlug = `deck-${topicTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}`;
    setPapermarkLink({
      id: `pm_link_${Date.now()}`,
      shareUrl: `https://papermark.shothik.app/view/${fallbackSlug}`,
      customSlug: fallbackSlug,
    });
    setIsCreatingLink(false);
  };

  const [slideList, setSlideList] = useState<SlideData[]>(() => customSlides || buildDynamicDeck(topicTitle));

  // Listen for VTuber toggle events
  useEffect(() => {
    const handleToggle = () => setShowVTuberStage((prev) => !prev);
    window.addEventListener("shothik_toggle_vtuber", handleToggle);
    return () => window.removeEventListener("shothik_toggle_vtuber", handleToggle);
  }, []);

  // Sync with prop changes
  useEffect(() => {
    if (customSlides && customSlides.length > 0) {
      setSlideList(customSlides);
      setCurrentSlide(0);
    } else if (initialTopic) {
      setSlideList(buildDynamicDeck(initialTopic));
      setCurrentSlide(0);
    }
  }, [customSlides, initialTopic]);

  const active = slideList[currentSlide] || slideList[0];
  const currentTemplate = TEMPLATES.find((t) => t.id === activeTemplate) || TEMPLATES[0];

  // In-Place Slide Editing Handlers
  const handleUpdateActiveSlide = (updater: Partial<SlideData>) => {
    setSlideList((prev) =>
      prev.map((s, idx) => (idx === currentSlide ? { ...s, ...updater } : s))
    );
  };

  const handleAddSlide = () => {
    const newSlide: SlideData = {
      id: Date.now(),
      layout: "hero",
      tag: "Deep Dive",
      title: "New Strategic Slide",
      subtitle: "Click here to edit subtitle and key narrative points",
      bullets: ["First core breakthrough point", "Second actionable metric or strategic goal"],
      speakerNotes: "Presenter narration notes for this new slide.",
    };
    setSlideList((prev) => [...prev, newSlide]);
    setCurrentSlide(slideList.length);
  };

  const handleDeleteCurrentSlide = () => {
    if (slideList.length <= 1) return;
    setSlideList((prev) => prev.filter((_, idx) => idx !== currentSlide));
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleSpeakCurrentSlide = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const narrationText = `${active.title}. ${active.subtitle}. ${active.speakerNotes}`;
    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleExportHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${topicTitle} - Shothik Slides</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .font-mono { font-family: 'JetBrains+Mono', monospace; }
  </style>
</head>
<body class="bg-zinc-950 text-white min-h-screen flex flex-col items-center justify-center p-6">
  <div class="w-full max-w-4xl space-y-8">
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-extrabold tracking-tight">${topicTitle}</h1>
      <p class="text-sm text-zinc-400">Generated by Shothik Operator Suite · Open Design Presentation</p>
    </div>
    <div class="space-y-6">
      ${slideList
        .map(
          (s, i) => `
        <div class="aspect-[16/9] rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 flex flex-col justify-between shadow-2xl">
          <div class="flex justify-between items-center">
            <span class="text-xs font-mono px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold uppercase">${s.tag}</span>
            <span class="text-xs font-mono text-zinc-500">Slide ${i + 1} / ${slideList.length}</span>
          </div>
          <div class="my-auto space-y-4">
            <h2 class="text-2xl font-bold">${s.title}</h2>
            <p class="text-sm text-zinc-300">${s.subtitle}</p>
            ${(s.bullets || []).length > 0 ? `<ul class="space-y-2 text-sm text-zinc-300">${s.bullets.map((b) => `<li class="flex gap-2"><span class="text-indigo-400 font-bold">•</span>${b}</li>`).join("")}</ul>` : ""}
          </div>
          <div class="pt-3 border-t border-zinc-800 flex justify-between text-xs font-mono text-zinc-500">
            <span>SHOTHIK OPERATOR SUITE</span>
            <span>POLSIA OPC MASTER</span>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}-deck.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarp = () => {
    const marpHeader = `---
marp: true
theme: uncover
class: invert
paginate: true
header: '${topicTitle} — Shothik Studio'
footer: 'CONFIDENTIAL & PROPRIETARY'
---
`;
    const marpSlides = slideList
      .map(
        (s, i) =>
          `<!-- _class: lead -->\n` +
          `# ${s.title}\n` +
          `### ${s.subtitle}\n\n` +
          (s.bullets || []).map((b) => `- ${b}`).join("\n") +
          `\n\n<!--\nSpeaker Notes:\n${s.speakerNotes}\n-->`
      )
      .join("\n\n---\n\n");

    const fullMarp = marpHeader + marpSlides;
    const blob = new Blob([fullMarp], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.marp.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPPTX = async () => {
    setIsExportingPPTX(true);
    try {
      const PptxGenJS = (await import("pptxgenjs")).default;
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_16x9";
      pptx.title = topicTitle;

      slideList.forEach((s) => {
        const slide = pptx.addSlide();
        slide.background = { color: "090D16" };

        slide.addText((s.tag || "SLIDE").toUpperCase(), {
          x: 0.8,
          y: 0.6,
          fontSize: 10,
          color: "818CF8",
          bold: true,
          fontFace: "Arial",
        });

        slide.addText(s.title, {
          x: 0.8,
          y: 1.1,
          w: 8.4,
          fontSize: 22,
          color: "FFFFFF",
          bold: true,
          fontFace: "Arial",
        });

        if (s.subtitle) {
          slide.addText(s.subtitle, {
            x: 0.8,
            y: 1.8,
            w: 8.4,
            fontSize: 13,
            color: "94A3B8",
            fontFace: "Arial",
          });
        }

        if (s.layout === "split" && (s.splitLeft || s.splitRight)) {
          if (s.splitLeft) {
            slide.addText(s.splitLeft.heading, { x: 0.8, y: 2.5, w: 4.0, fontSize: 13, color: "F87171", bold: true, fontFace: "Arial" });
            const leftBullets = s.splitLeft.points.map((p) => ({ text: p, options: { bullet: true, color: "CBD5E1", fontSize: 11, breakLine: true } }));
            slide.addText(leftBullets, { x: 0.8, y: 3.0, w: 4.0, h: 2.5, fontFace: "Arial" });
          }
          if (s.splitRight) {
            slide.addText(s.splitRight.heading, { x: 5.2, y: 2.5, w: 4.0, fontSize: 13, color: "34D399", bold: true, fontFace: "Arial" });
            const rightBullets = s.splitRight.points.map((p) => ({ text: p, options: { bullet: true, color: "CBD5E1", fontSize: 11, breakLine: true } }));
            slide.addText(rightBullets, { x: 5.2, y: 3.0, w: 4.0, h: 2.5, fontFace: "Arial" });
          }
        } else if (s.layout === "stats" && s.metrics && s.metrics.length > 0) {
          const colWidth = 8.4 / Math.min(s.metrics.length, 4);
          s.metrics.slice(0, 4).forEach((m, idx) => {
            const posX = 0.8 + idx * colWidth;
            slide.addText(m.label, { x: posX, y: 2.7, w: colWidth - 0.2, fontSize: 11, color: "94A3B8", fontFace: "Arial" });
            slide.addText(m.value, { x: posX, y: 3.2, w: colWidth - 0.2, fontSize: 20, color: "818CF8", bold: true, fontFace: "Arial" });
            if (m.trend) {
              slide.addText(m.trend, { x: posX, y: 3.9, w: colWidth - 0.2, fontSize: 10, color: "34D399", fontFace: "Arial" });
            }
          });
        } else if (s.layout === "timeline" && s.timelineSteps && s.timelineSteps.length > 0) {
          const colWidth = 8.4 / Math.min(s.timelineSteps.length, 4);
          s.timelineSteps.slice(0, 4).forEach((st, idx) => {
            const posX = 0.8 + idx * colWidth;
            slide.addText(st.step, { x: posX, y: 2.6, w: colWidth - 0.2, fontSize: 10, color: "C084FC", bold: true, fontFace: "Arial" });
            slide.addText(st.title, { x: posX, y: 3.0, w: colWidth - 0.2, fontSize: 12, color: "FFFFFF", bold: true, fontFace: "Arial" });
            slide.addText(st.desc, { x: posX, y: 3.5, w: colWidth - 0.2, h: 1.8, fontSize: 10, color: "94A3B8", fontFace: "Arial" });
          });
        } else if (s.layout === "process" && s.processSteps && s.processSteps.length > 0) {
          const colWidth = 8.4 / Math.min(s.processSteps.length, 4);
          s.processSteps.slice(0, 4).forEach((p, idx) => {
            const posX = 0.8 + idx * colWidth;
            slide.addText(p.number, { x: posX, y: 2.6, w: colWidth - 0.2, fontSize: 12, color: "818CF8", bold: true, fontFace: "Arial" });
            slide.addText(p.title, { x: posX, y: 3.0, w: colWidth - 0.2, fontSize: 12, color: "FFFFFF", bold: true, fontFace: "Arial" });
            slide.addText(p.desc, { x: posX, y: 3.5, w: colWidth - 0.2, h: 1.8, fontSize: 10, color: "94A3B8", fontFace: "Arial" });
          });
        } else if (s.layout === "quote" && s.quote) {
          slide.addText(`"${s.quote.text}"`, { x: 1.2, y: 2.8, w: 7.6, fontSize: 15, color: "E2E8F0", italic: true, fontFace: "Georgia" });
          slide.addText(`${s.quote.author} — ${s.quote.role}`, { x: 1.2, y: 4.3, w: 7.6, fontSize: 11, color: "94A3B8", bold: true, fontFace: "Arial" });
        } else if (s.layout === "grid" && s.features && s.features.length > 0) {
          s.features.slice(0, 4).forEach((f, idx) => {
            const posX = 0.8 + (idx % 2) * 4.4;
            const posY = 2.6 + Math.floor(idx / 2) * 1.4;
            slide.addText(f.title, { x: posX, y: posY, w: 4.0, fontSize: 12, color: "FFFFFF", bold: true, fontFace: "Arial" });
            slide.addText(f.desc, { x: posX, y: posY + 0.35, w: 4.0, h: 0.9, fontSize: 10, color: "94A3B8", fontFace: "Arial" });
          });
        } else if (s.bullets && s.bullets.length > 0) {
          const bulletList = s.bullets.map((b) => ({
            text: b,
            options: { bullet: true, color: "CBD5E1", fontSize: 13, breakLine: true },
          }));
          slide.addText(bulletList, {
            x: 0.8,
            y: 2.6,
            w: 8.4,
            h: 3.0,
            fontFace: "Arial",
          });
        }

        if (s.speakerNotes) {
          slide.addNotes(s.speakerNotes);
        }
      });

      await pptx.writeFile({
        fileName: `${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pptx`,
      });
    } catch (clientErr) {
      console.warn("Client PPTX export failed, trying serverless API export:", clientErr);
      try {
        const response = await fetch("/api/v1/publishing/export-pptx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: topicTitle,
            slides: slideList.map((s) => ({
              title: s.title,
              subtitle: s.subtitle,
              bullets: s.bullets || [],
              notes: s.speakerNotes,
            })),
          }),
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pptx`;
          a.click();
          URL.revokeObjectURL(url);
          return;
        }
      } catch (serverErr) {
        console.error("Server PPTX export failed, falling back to HTML", serverErr);
      }
      handleExportHTML();
    } finally {
      setIsExportingPPTX(false);
    }
  };

  const handleCopyMarkdown = () => {
    const md = slideList
      .map(
        (s, i) =>
          `---\n## Slide ${i + 1}: ${s.title}\n### ${s.subtitle}\n\n` +
          (s.bullets || []).map((b) => `- ${b}`).join("\n") +
          `\n\n> **Speaker Notes:** ${s.speakerNotes}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const [slideTouchStart, setSlideTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleSlideTouchStart = (e: React.TouchEvent) => {
    setSlideTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleSlideTouchEnd = (e: React.TouchEvent) => {
    if (!slideTouchStart) return;
    const deltaX = e.changedTouches[0].clientX - slideTouchStart.x;
    const deltaY = e.changedTouches[0].clientY - slideTouchStart.y;
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped Left ➔ Next Slide
        setCurrentSlide((prev) => Math.min(slideList.length - 1, prev + 1));
      } else {
        // Swiped Right ➔ Previous Slide
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      }
    }
    setSlideTouchStart(null);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(slideList.length - 1, prev + 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrentSlide(slideList.length - 1);
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slideList.length, isFullscreen]);

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden select-none transition-colors duration-200">
      {/* ── Top Suite Header Bar ── */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 backdrop-blur-md px-3.5 py-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Presentation className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-foreground truncate">{topicTitle}</h3>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              Slide {currentSlide + 1} of {slideList.length} · 16:9 Presentation Stage
            </p>
          </div>
        </div>

        {/* Consolidated Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Theme Dropdown */}
          <div className="relative flex items-center">
            <select
              value={activeTemplate}
              onChange={(e) => setActiveTemplate(e.target.value)}
              className="h-7 pl-2 pr-6 rounded-lg text-[10px] font-semibold bg-muted/60 text-muted-foreground border border-border/40 hover:text-foreground focus:outline-none focus:ring-1 focus:ring-brand/40 transition cursor-pointer appearance-none"
              aria-label="Select slide theme"
            >
              {TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.icon} {tpl.label}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 text-muted-foreground absolute right-1.5 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={handleSpeakCurrentSlide}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer",
              isSpeaking
                ? "bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse"
                : "bg-muted/40 border-border/50 text-foreground hover:bg-muted"
            )}
            title="Read aloud speaker notes"
          >
            <span>{isSpeaking ? "⏹️" : "🔊"}</span>
            <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Narrate"}</span>
          </button>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("shothik_toggle_vtuber"))}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] shadow-sm shadow-emerald-500/20 transition cursor-pointer"
            title="Launch Fullscreen Presenter Mode"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Present</span>
          </button>

          <button
            type="button"
            onClick={handleCreatePapermarkLink}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-bold shadow-sm transition cursor-pointer"
            title="Generate trackable Papermark investor link with page heatmaps"
            data-testid="slides-trackable-link-btn"
          >
            <Share2 className="h-3 w-3 text-indigo-400" />
            <span>Trackable Link</span>
          </button>

          {/* Quick Actions (Add Slide, Fullscreen, PPTX, Marp, Download) */}
          <button
            type="button"
            onClick={handleAddSlide}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border border-border/50 bg-muted/40 hover:bg-muted text-foreground text-[11px] font-medium transition cursor-pointer"
            title="Add a new slide"
          >
            <span>+ Slide</span>
          </button>

          <button
            type="button"
            data-testid="btn-export-pptx"
            disabled={isExportingPPTX}
            onClick={handleExportPPTX}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-bold transition cursor-pointer disabled:opacity-50"
            title="Export native 16:9 PowerPoint Presentation (.pptx)"
          >
            {isExportingPPTX ? (
              <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" />
            ) : (
              <Download className="h-3 w-3" />
            )}
            <span>{isExportingPPTX ? "Exporting..." : "PPTX"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarp}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[11px] font-bold transition cursor-pointer"
            title="Export Marp Markdown Slide Deck (.marp.md)"
          >
            <span>Marp</span>
          </button>

          <button
            type="button"
            onClick={handleExportHTML}
            className="p-1.5 rounded-lg border border-border/50 bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer"
            title="Download Standalone HTML Presentation"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-border/50 bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Main 16:9 Presentation Stage ── */}
      <div className={cn(
        "flex-1 min-h-0 flex flex-col items-center justify-center p-3 sm:p-4 bg-zinc-950 transition-all gap-4 overflow-y-auto",
        isFullscreen && "fixed inset-0 z-50 p-8 sm:p-12 bg-black/95 backdrop-blur-xl"
      )}>
        {showVTuberStage && (
          <div className="w-full max-w-2xl">
            <VTuberPresentationStage
              currentSlideIndex={currentSlide + 1}
              totalSlides={slideList.length}
              slideTitle={active.title}
              narrationScript={`${active.title}. ${active.subtitle}. ${active.speakerNotes}`}
              onNextSlide={() => setCurrentSlide((prev) => Math.min(slideList.length - 1, prev + 1))}
              onPrevSlide={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            />
          </div>
        )}

        <div
          onTouchStart={handleSlideTouchStart}
          onTouchEnd={handleSlideTouchEnd}
          className={cn(
            "relative w-full max-w-2xl aspect-[16/9] rounded-2xl border shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden bg-gradient-to-br transition-all duration-300 shrink-0 select-none",
            isFullscreen && "max-w-4xl text-base shadow-indigo-500/10",
            currentTemplate.themeClass,
            currentTemplate.border
          )}
        >
          {/* Top Tag & Slide Number */}
          <div className="flex items-center justify-between shrink-0">
            <span className={cn("text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/[0.1] border border-white/[0.15]", currentTemplate.accent)}>
              {active.tag}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-zinc-400">
                {currentSlide + 1} / {slideList.length}
              </span>
              {isFullscreen && (
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="text-xs font-mono text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-white/10"
                >
                  ESC
                </button>
              )}
            </div>
          </div>

          {/* ── Polymorphic Layout Renderers (Full In-Place Editing) ── */}
          <div className="my-auto space-y-3">
            {/* 1. HERO LAYOUT */}
            {(!active.layout || active.layout === "hero") && (
              <div className="space-y-2.5">
                <input
                  type="text"
                  value={active.title}
                  onChange={(e) => handleUpdateActiveSlide({ title: e.target.value })}
                  className="w-full bg-transparent text-xl sm:text-2xl font-bold text-white tracking-tight outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400 transition"
                />
                <input
                  type="text"
                  value={active.subtitle}
                  onChange={(e) => handleUpdateActiveSlide({ subtitle: e.target.value })}
                  className="w-full bg-transparent text-xs text-zinc-300 leading-relaxed outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400 transition"
                />
                <ul className="space-y-1.5 pt-1 text-xs text-zinc-200">
                  {active.bullets?.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={cn("font-bold mt-0.5", currentTemplate.accent)}>•</span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const updated = [...(active.bullets || [])];
                          updated[idx] = e.target.value;
                          handleUpdateActiveSlide({ bullets: updated });
                        }}
                        className="w-full bg-transparent text-xs text-zinc-200 outline-none border-b border-transparent hover:border-white/10 focus:border-indigo-400/50 transition"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 2. SPLIT 2-COLUMN LAYOUT */}
            {active.layout === "split" && (
              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    value={active.title}
                    onChange={(e) => handleUpdateActiveSlide({ title: e.target.value })}
                    className="w-full bg-transparent text-lg sm:text-xl font-bold text-white tracking-tight outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    value={active.subtitle}
                    onChange={(e) => handleUpdateActiveSlide({ subtitle: e.target.value })}
                    className="w-full bg-transparent text-[11px] text-zinc-300 outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-xs space-y-1.5">
                    <p className="font-bold text-red-400">{active.splitLeft?.heading}</p>
                    <ul className="space-y-1 text-[11px] text-zinc-300">
                      {active.splitLeft?.points.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-red-400 font-bold shrink-0">✕</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-1.5">
                    <p className="font-bold text-emerald-400">{active.splitRight?.heading}</p>
                    <ul className="space-y-1 text-[11px] text-zinc-300">
                      {active.splitRight?.points.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 3. STATS CALLOUT LAYOUT */}
            {active.layout === "stats" && (
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={active.title}
                    onChange={(e) => handleUpdateActiveSlide({ title: e.target.value })}
                    className="w-full bg-transparent text-lg sm:text-xl font-bold text-white tracking-tight outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    value={active.subtitle}
                    onChange={(e) => handleUpdateActiveSlide({ subtitle: e.target.value })}
                    className="w-full bg-transparent text-[11px] text-zinc-300 outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {active.metrics?.map((m, idx) => (
                    <div key={idx} className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-center space-y-0.5">
                      <p className="text-[10px] text-zinc-400">{m.label}</p>
                      <p className={cn("text-base font-bold font-mono", currentTemplate.accent)}>{m.value}</p>
                      {m.trend && <p className="text-[9px] text-emerald-400 flex items-center justify-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" /> {m.trend}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. TIMELINE ROADMAP LAYOUT */}
            {active.layout === "timeline" && (
              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    value={active.title}
                    onChange={(e) => handleUpdateActiveSlide({ title: e.target.value })}
                    className="w-full bg-transparent text-lg sm:text-xl font-bold text-white tracking-tight outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    value={active.subtitle}
                    onChange={(e) => handleUpdateActiveSlide({ subtitle: e.target.value })}
                    className="w-full bg-transparent text-[11px] text-zinc-300 outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {active.timelineSteps?.map((s, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-purple-400">{s.step}</span>
                        <span className="text-[8px] uppercase px-1 py-0.2 rounded bg-white/10 text-zinc-300">{s.status}</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">{s.title}</p>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. PROCESS WORKFLOW LAYOUT */}
            {active.layout === "process" && (
              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    value={active.title}
                    onChange={(e) => handleUpdateActiveSlide({ title: e.target.value })}
                    className="w-full bg-transparent text-lg sm:text-xl font-bold text-white tracking-tight outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    value={active.subtitle}
                    onChange={(e) => handleUpdateActiveSlide({ subtitle: e.target.value })}
                    className="w-full bg-transparent text-[11px] text-zinc-300 outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {active.processSteps?.map((p, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-1 text-left relative overflow-hidden">
                      <div className="text-xs font-mono font-bold text-indigo-400">{p.number}</div>
                      <p className="text-xs font-bold text-white truncate">{p.title}</p>
                      <p className="text-[10px] text-zinc-400 leading-snug">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. QUOTE / TESTIMONIAL LAYOUT */}
            {active.layout === "quote" && (
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={active.title}
                    onChange={(e) => handleUpdateActiveSlide({ title: e.target.value })}
                    className="w-full bg-transparent text-lg sm:text-xl font-bold text-white tracking-tight outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    value={active.subtitle}
                    onChange={(e) => handleUpdateActiveSlide({ subtitle: e.target.value })}
                    className="w-full bg-transparent text-[11px] text-zinc-300 outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                </div>
                {active.quote && (
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-left">
                    <p className="text-xs sm:text-sm italic text-zinc-200 leading-relaxed font-serif">"{active.quote.text}"</p>
                    <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white">{active.quote.author}</span>
                      <span className="text-zinc-400">{active.quote.role}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. GRID FEATURE MATRIX LAYOUT */}
            {active.layout === "grid" && (
              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    value={active.title}
                    onChange={(e) => handleUpdateActiveSlide({ title: e.target.value })}
                    className="w-full bg-transparent text-lg sm:text-xl font-bold text-white tracking-tight outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    value={active.subtitle}
                    onChange={(e) => handleUpdateActiveSlide({ subtitle: e.target.value })}
                    className="w-full bg-transparent text-[11px] text-zinc-300 outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {active.features?.map((f, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-0.5 text-left">
                      <p className="text-xs font-bold text-white truncate">{f.title}</p>
                      <p className="text-[10px] text-zinc-400 leading-tight">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Logo */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] text-zinc-500 font-mono shrink-0">
            <span>SHOTHIK OPERATOR SUITE</span>
            <span>POLSIA OPC MASTER</span>
          </div>
        </div>

        {/* ── Slide Layout & WordArt Control Strip ── */}
        <div className="flex items-center justify-between w-full max-w-2xl px-1 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Layout:</span>
            {(["hero", "split", "stats", "timeline", "process", "quote", "grid"] as SlideLayout[]).map((lyt) => (
              <button
                key={lyt}
                type="button"
                onClick={() => handleUpdateActiveSlide({ layout: lyt })}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold transition cursor-pointer border",
                  active.layout === lyt
                    ? "bg-indigo-500/20 border-indigo-500/60 text-indigo-300"
                    : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                )}
              >
                {lyt}
              </button>
            ))}
          </div>

          {/* WordArt Preset Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <select
              value={active.wordart || "default"}
              onChange={(e) => handleUpdateActiveSlide({ wordart: e.target.value })}
              className="appearance-none bg-zinc-900 border border-zinc-700/60 text-zinc-200 text-[10px] font-medium rounded px-2 py-0.5 outline-none cursor-pointer"
              title="Select WordArt Typographic Preset"
            >
              <option value="default">Default Text</option>
              {WORDART_PRESETS.map((wa) => (
                <option key={wa.id} value={wa.id}>
                  {wa.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Filmstrip & Slide Operations ── */}
        <div className="flex items-center gap-2 mt-2 w-full max-w-2xl px-1">
          <Button
            size="sm"
            variant="outline"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            className="h-7 w-7 p-0 rounded-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white shrink-0 cursor-pointer"
            title="Previous Slide (←)"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {slideList.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className={cn(
                  "group/thumb relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-medium transition cursor-pointer shrink-0",
                  currentSlide === idx
                    ? "bg-indigo-500/20 border-indigo-500/60 text-white shadow-sm"
                    : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.08]"
                )}
                onClick={() => setCurrentSlide(idx)}
              >
                <span className="font-mono text-[9px] opacity-70">#{idx + 1}</span>
                <span className="truncate max-w-[80px]">{slide.tag || slide.title}</span>

                {/* Hover Reorder / Duplicate / Delete Actions */}
                <div className="hidden group-hover/thumb:flex items-center gap-1 ml-1 pl-1 border-l border-white/20">
                  {idx > 0 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = [...slideList];
                        const temp = next[idx - 1];
                        next[idx - 1] = next[idx];
                        next[idx] = temp;
                        setSlideList(next);
                        setCurrentSlide(idx - 1);
                      }}
                      className="hover:text-cyan-400 text-zinc-400 text-[9px]"
                      title="Move Left"
                    >
                      ◀
                    </span>
                  )}
                  {idx < slideList.length - 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = [...slideList];
                        const temp = next[idx + 1];
                        next[idx + 1] = next[idx];
                        next[idx] = temp;
                        setSlideList(next);
                        setCurrentSlide(idx + 1);
                      }}
                      className="hover:text-cyan-400 text-zinc-400 text-[9px]"
                      title="Move Right"
                    >
                      ▶
                    </span>
                  )}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      const clone = { ...slide, id: Date.now() };
                      const next = [...slideList.slice(0, idx + 1), clone, ...slideList.slice(idx + 1)];
                      setSlideList(next);
                      setCurrentSlide(idx + 1);
                    }}
                    className="hover:text-indigo-400 text-zinc-400 text-[9px]"
                    title="Duplicate Slide"
                  >
                    ⧉
                  </span>
                  {slideList.length > 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = slideList.filter((_, i) => i !== idx);
                        setSlideList(next);
                        setCurrentSlide(Math.min(currentSlide, next.length - 1));
                      }}
                      className="hover:text-rose-400 text-zinc-400 text-[9px]"
                      title="Delete Slide"
                    >
                      ✕
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            disabled={currentSlide === slideList.length - 1}
            onClick={() => setCurrentSlide((prev) => Math.min(slideList.length - 1, prev + 1))}
            className="h-7 w-7 p-0 rounded-full border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white shrink-0 cursor-pointer"
            title="Next Slide (→)"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Presenter Speaker Notes Accordion (Editable) ── */}
      <div className="border-t border-zinc-200 dark:border-white/[0.06] bg-zinc-100/90 dark:bg-[#111214] p-3 shrink-0">
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center justify-between w-full text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Presenter Lip-Sync Narration Notes</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">{showNotes ? "Hide" : "Show"}</span>
        </button>

        {showNotes && (
          <textarea
            value={active.speakerNotes}
            onChange={(e) => handleUpdateActiveSlide({ speakerNotes: e.target.value })}
            className="mt-2 w-full text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed font-mono bg-white dark:bg-white/[0.02] p-2.5 rounded-lg border border-zinc-200 dark:border-white/[0.04] outline-none hover:border-white/20 focus:border-indigo-400 resize-none h-16 transition"
            placeholder="Enter presenter narration script..."
          />
        )}
      </div>

      {/* Papermark Trackable Link Modal */}
      {showPapermarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200 select-text">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                  Papermark Integration
                </span>
                <h3 className="text-base font-bold text-foreground mt-1">Trackable Presentation Link</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Share this deck with investors to track page-by-page read time & heatmaps.
                </p>
              </div>
              <button
                onClick={() => setShowPapermarkModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>

            {isCreatingLink ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                <p className="text-xs text-muted-foreground">Generating secure trackable link...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-muted/40 p-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-indigo-400 truncate flex-1 select-all">
                    {papermarkLink?.shareUrl}
                  </span>
                  <button
                    onClick={() => {
                      if (papermarkLink) {
                        navigator.clipboard.writeText(papermarkLink.shareUrl);
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 2000);
                      }
                    }}
                    className="flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition cursor-pointer shrink-0"
                    data-testid="copy-papermark-modal-btn"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Page Attention Heatmap</span>
                    <span className="text-emerald-400 font-medium">Active (Real-Time)</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>PDF Download Protection</span>
                    <span className="text-foreground">Enabled</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border">
                  <a
                    href="/account/settings?section=share"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:underline"
                  >
                    <span>View Analytics in Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <button
                    onClick={() => setShowPapermarkModal(false)}
                    className="rounded-lg bg-muted px-4 py-2 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
