"use client";

import { useState } from "react";
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  Download,
  Copy,
  Check,
  Globe,
  Award,
  Code2,
  FileText,
  TrendingUp,
  Share2,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
}

export interface CareerProfile {
  fullName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  summaryEn: string;
  summaryBn: string;
  atsScore: number;
  skills: { category: string; items: string[] }[];
  experience: WorkExperience[];
  education: { degree: string; institution: string; year: string; gpa?: string }[];
}

const DEFAULT_PROFILE: CareerProfile = {
  fullName: "তানভীর আহমেদ (Tanvir Ahmed)",
  title: "Senior Full-Stack AI Engineer & Distributed Systems Lead",
  location: "Dhaka, Bangladesh · Remote (US/EU Timezones)",
  email: "tanvir.ahmed@shothik.ai",
  phone: "+880 1711-000000",
  portfolioUrl: "https://tanvir.dev",
  githubUrl: "https://github.com/tanvir-ai",
  linkedinUrl: "https://linkedin.com/in/tanvir-ahmed-ai",
  summaryEn:
    "Product-minded Full-Stack AI Engineer with 6+ years specializing in TypeScript, Next.js, Postgres (InsForge), Docker microservices, and LLM edge inference (Ollama, vLLM). Architected high-throughput MFS fintech payment gateways processing $10M+ annual transaction volume with 99.98% uptime.",
  summaryBn:
    "৬+ বছরের অভিজ্ঞতাসম্পন্ন সিনিয়র ফুল-স্ট্যাক এআই ইঞ্জিনিয়ার। নেক্সট.জেএস, টাইপস্ক্রিপ্ট, পোস্টগ্রেস এবং অন-ডিভাইস এলএলএম ইনফারেন্স-এ পারদর্শী। মোবাইল ফিনটেক ও কুরিয়ার লজিস্টিক্সে উচ্চ ক্ষমতার ডিস্ট্রিবিউটেড সিস্টেম আর্কিটেকচার বাস্তবায়নে দক্ষ।",
  atsScore: 94,
  skills: [
    { category: "Frontend & UI/UX", items: ["React 19", "Next.js 15", "TypeScript", "Tailwind CSS v4", "Lucide Icons", "Framer Motion"] },
    { category: "Backend & Systems", items: ["Node.js 20", "Express", "PostgreSQL", "InsForge BaaS", "Docker", "Cloudflare Workers", "Redis"] },
    { category: "AI & LLM Infra", items: ["Ollama API", "DeepSeek-R1", "Qwen 2.5 Coder", "LangChain", "Vector RAG", "Speech-to-Text"] },
    { category: "Fintech & Emerging Markets", items: ["bKash PGW", "Nagad MFS", "Steadfast Courier API", "WhatsApp Business API", "Idempotency"] },
  ],
  experience: [
    {
      id: "exp-1",
      role: "Lead Systems Architect",
      company: "Shothik Hermes Technologies",
      location: "Dhaka / Remote",
      period: "2023 - Present",
      highlights: [
        "Architected multi-agent swarm fleet reducing enterprise market research turnaround time from 4 days to 45 seconds.",
        "Integrated tokenized bKash and Nagad payment gateways achieving 99.98% transaction success rate across 120k+ monthly active users.",
        "Engineered mobile hardware-accelerated Work Canvas UI running smoothly on 2GB RAM budget Android smartphones.",
      ],
    },
    {
      id: "exp-2",
      role: "Senior Software Engineer",
      company: "Emerging Market FinTech Corp",
      location: "Dhaka, Bangladesh",
      period: "2020 - 2023",
      highlights: [
        "Led a squad of 8 engineers delivering real-time courier status webhooks for Pathao and Steadfast.",
        "Scaled Postgres database read replicas and Redis caching layers to handle 15,000 requests/sec during Flash Sale campaigns.",
        "Implemented automated CI/CD pipelines deploying Docker containers to multi-region cloud clusters.",
      ],
    },
  ],
  education: [
    {
      degree: "B.Sc. in Computer Science & Engineering",
      institution: "Bangladesh University of Engineering and Technology (BUET)",
      year: "2016 - 2020",
      gpa: "CGPA 3.88 / 4.00",
    },
  ],
};

export function CareerStudioArtifact() {
  const [profile, setProfile] = useState<CareerProfile>(DEFAULT_PROFILE);
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"resume" | "ats_audit" | "remote_tips">("resume");

  const handleCopyMarkdown = () => {
    const md = `# ${profile.fullName}
**${profile.title}**
📍 ${profile.location} | ✉️ ${profile.email} | 🌐 [Portfolio](${profile.portfolioUrl}) | 🐙 [GitHub](${profile.githubUrl})

---

## 📌 Executive Summary
${language === "en" ? profile.summaryEn : profile.summaryBn}

---

## 🛠️ Technical Skills
${profile.skills.map((s) => `- **${s.category}:** ${s.items.join(", ")}`).join("\n")}

---

## 💼 Work Experience
${profile.experience
  .map(
    (exp) => `### ${exp.role} — ${exp.company}
*${exp.location} | ${exp.period}*
${exp.highlights.map((h) => `- ${h}`).join("\n")}`
  )
  .join("\n\n")}

---

## 🎓 Education
${profile.education.map((edu) => `### ${edu.degree}\n*${edu.institution} (${edu.year})* — ${edu.gpa}`).join("\n\n")}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.fullName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-resume.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Top Header Toolbar ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>AI Career & Global Remote CV Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                ATS Score: {profile.atsScore}%
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Optimized for US/EU Remote Tech Roles & South Asian Tech Ecosystem
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border text-xs">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                language === "en" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage("bn")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                language === "bn" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              বাংলা
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-xs font-semibold text-foreground border border-border transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy MD"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="px-4 py-2 border-b border-border/60 bg-muted/20 flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("resume")}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5",
            activeTab === "resume" ? "bg-brand text-brand-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Interactive Resume</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ats_audit")}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5",
            activeTab === "ats_audit" ? "bg-brand text-brand-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>ATS Keyword Audit (94%)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("remote_tips")}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5",
            activeTab === "remote_tips" ? "bg-brand text-brand-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Global Remote Playbook</span>
        </button>
      </div>

      {/* ── Content Viewport ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {activeTab === "resume" && (
          <div className="max-w-3xl mx-auto bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            {/* Header / Contact Info */}
            <div className="border-b border-border/60 pb-6 space-y-2">
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full text-2xl font-black text-foreground bg-transparent outline-none border-b border-transparent hover:border-border/60 focus:border-brand transition"
              />
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full text-sm font-semibold text-indigo-400 bg-transparent outline-none border-b border-transparent hover:border-border/60 focus:border-brand transition"
              />
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                <span>📍 {profile.location}</span>
                <span>✉️ {profile.email}</span>
                <span>📱 {profile.phone}</span>
                <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline flex items-center gap-0.5">
                  GitHub <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-0.5">
                  LinkedIn <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>Executive Summary ({language === "en" ? "English" : "বাংলা"})</span>
              </h3>
              <textarea
                value={language === "en" ? profile.summaryEn : profile.summaryBn}
                onChange={(e) =>
                  language === "en"
                    ? setProfile({ ...profile, summaryEn: e.target.value })
                    : setProfile({ ...profile, summaryBn: e.target.value })
                }
                rows={3}
                className="w-full text-xs text-foreground/90 leading-relaxed bg-muted/20 border border-border/40 rounded-xl p-3 outline-none focus:border-brand transition resize-none"
              />
            </div>

            {/* Technical Skills */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-brand" />
                <span>Technical Skills & Core Stack</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.skills.map((skillGroup, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-1.5">
                    <span className="text-xs font-bold text-foreground">{skillGroup.category}</span>
                    <div className="flex flex-wrap gap-1">
                      {skillGroup.items.map((item, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary/80 text-secondary-foreground border border-border/40"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Experience */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-brand" />
                <span>Professional Experience</span>
              </h3>
              <div className="space-y-4">
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-xl bg-muted/10 border border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{exp.role}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{exp.period}</span>
                    </div>
                    <div className="text-xs font-semibold text-brand">{exp.company} · {exp.location}</div>
                    <ul className="space-y-1.5 pt-1">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-brand font-bold">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-brand" />
                <span>Education & Credentials</span>
              </h3>
              {profile.education.map((edu, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-foreground">{edu.degree}</div>
                    <div className="text-[11px] text-muted-foreground">{edu.institution}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-mono font-semibold text-brand">{edu.gpa}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{edu.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "ats_audit" && (
          <div className="max-w-3xl mx-auto space-y-4">
            <LiquidGlassCard glowColor="rgba(16, 185, 129, 0.15)">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground">ATS Resume Match Breakdown</h3>
                    <p className="text-xs text-muted-foreground">Evaluated against 1,200+ Silicon Valley & Remote AI job descriptions</p>
                  </div>
                  <div className="text-3xl font-black text-emerald-400 font-mono">94 / 100</div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>High-Impact Action Verbs & Metrics</span>
                      <span className="text-emerald-400">98% Match</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[98%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Core Tech Stack Density (Next.js, TypeScript, LLMs)</span>
                      <span className="text-indigo-400">95% Match</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-[95%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Distributed Systems & Cloud Scale (Docker, Postgres, Edge)</span>
                      <span className="text-amber-400">90% Match</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[90%]" />
                    </div>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        )}

        {activeTab === "remote_tips" && (
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LiquidGlassCard glowColor="rgba(99, 102, 241, 0.15)">
              <div className="p-5 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Timezone Alignment</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Explicitly state 4+ hours of synchronous overlap with US Eastern (EST) or European (CET) working hours.
                </p>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard glowColor="rgba(16, 185, 129, 0.15)">
              <div className="p-5 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-foreground">Quantified Business Impact</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Always use metric formulas: <em>"Increased transaction throughput by 42% while cutting latency to 120ms."</em>
                </p>
              </div>
            </LiquidGlassCard>
          </div>
        )}
      </div>
    </div>
  );
}

export default CareerStudioArtifact;
