"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Presentation,
  Loader2,
  Play,
  Pause,
  Download,
  CheckCircle,
  AlertCircle,
  Layers,
  Sparkles,
  Palette,
  Users,
  Hash,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import {
  createSlideJob,
  subscribeToJobProgress,
  pauseSlideJob,
  resumeSlideJob,
  SlideJob,
} from "@/services/slide-generation";

const TEMPLATES = [
  { id: "professional", name: "Pro",      emoji: "💼" },
  { id: "creative",     name: "Creative", emoji: "🎨" },
  { id: "minimal",      name: "Minimal",  emoji: "⬜" },
  { id: "educational",  name: "Edu",      emoji: "📚" },
  { id: "business",     name: "Biz",      emoji: "📊" },
  { id: "modern",       name: "Modern",   emoji: "✨" },
  { id: "dark",         name: "Dark",     emoji: "🌑" },
];

const STEPS = [
  { id: "outline",    label: "Outline",    description: "Structuring content" },
  { id: "design",     label: "Design",     description: "Applying template" },
  { id: "content",    label: "Content",    description: "Writing slides" },
  { id: "formatting", label: "Formatting", description: "Styling & polish" },
  { id: "review",     label: "Review",     description: "Final check" },
];

const STARTER_PROMPTS = [
  "The future of AI in healthcare",
  "How to launch a SaaS in 90 days",
  "Climate tech investor pitch deck",
];

function getStepStatus(job: SlideJob | null, stepId: string) {
  if (!job) return "pending";
  const stepIdx    = STEPS.findIndex((s) => s.id === stepId);
  const currentIdx = STEPS.findIndex((s) => s.id === job.currentStep);
  if (stepIdx < currentIdx)   return "completed";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

interface Props {
  /** Pre-fill the topic from a chat message handoff */
  initialTopic?: string;
}

export function SlidesArtifact({ initialTopic }: Props) {
  const { user } = useAuth();
  const [topic,       setTopic]       = useState(initialTopic ?? "");
  const [audience,    setAudience]    = useState("");
  const [slideCount,  setSlideCount]  = useState([10]);
  const [template,    setTemplate]    = useState("professional");
  const [isLoading,   setIsLoading]   = useState(false);
  const [job,         setJob]         = useState<SlideJob | null>(null);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  useEffect(() => () => { unsubscribe?.(); }, [unsubscribe]);

  // Update topic if parent passes a new one (chat handoff)
  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
  }, [initialTopic]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setJob(null);

    const result = await createSlideJob({
      topic,
      slideCount: slideCount[0],
      template,
      targetAudience: audience,
      userId: user?.id ?? "anonymous",
    });

    if (result?.jobId) {
      const unsub = subscribeToJobProgress(
        result.jobId,
        (updated) => {
          setJob(updated);
          if (updated.status === "completed" || updated.status === "failed") setIsLoading(false);
        },
        (err) => { console.error("Progress error:", err); setIsLoading(false); },
      );
      setUnsubscribe(() => unsub);
    } else {
      setIsLoading(false);
    }
  };

  const handleReset = () => { unsubscribe?.(); setJob(null); setTopic(""); setIsLoading(false); };

  const handleDownload = () => {
    if (!job?.slides) return;
    const slides: Array<{ title?: string; content?: string; speakerNotes?: string }> =
      Array.isArray(job.slides) ? job.slides : Object.values(job.slides);

    const slideHtml = slides.map((slide, i) => `
  <section class="slide" id="slide-${i + 1}">
    <div class="slide-number">${i + 1} / ${slides.length}</div>
    <h2>${slide.title ?? `Slide ${i + 1}`}</h2>
    <div class="content">${slide.content ?? ""}</div>
    ${slide.speakerNotes ? `<div class="notes"><strong>Notes:</strong> ${slide.speakerNotes}</div>` : ""}
  </section>`).join("\n");

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${topic}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',sans-serif;background:#0f172a;color:#f1f5f9}
.slide{display:none;min-height:100vh;padding:80px 120px 120px;flex-direction:column;justify-content:center}
.slide.active{display:flex}.slide-number{position:absolute;top:24px;right:32px;font-size:13px;opacity:.4}
h2{font-size:2.4rem;font-weight:700;margin-bottom:32px;color:#60a5fa}
.content{font-size:1.15rem;line-height:1.8;max-width:780px;white-space:pre-wrap}
.notes{margin-top:40px;padding:16px;background:rgba(255,255,255,.05);border-radius:8px;font-size:.9rem;opacity:.6;border-left:3px solid #3b82f6}
.controls{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);display:flex;gap:12px;z-index:100}
.controls button{padding:10px 24px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:15px;cursor:pointer}
</style></head><body>${slideHtml}
<div class="controls"><button onclick="prev()">← Prev</button><button onclick="next()">Next →</button></div>
<script>let c=0;const s=document.querySelectorAll('.slide');
function show(n){s.forEach((x,i)=>x.classList.toggle('active',i===n));c=n}
function next(){if(c<s.length-1)show(c+1)}function prev(){if(c>0)show(c-1)}
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowDown')next();if(e.key==='ArrowLeft'||e.key==='ArrowUp')prev()});
show(0);<\/script></body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${topic.replace(/\s+/g, "_")}_slides.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const isIdle      = !job && !isLoading;
  const isRunning   = isLoading || (job && job.status === "running");
  const isCompleted = job?.status === "completed";
  const isFailed    = job?.status === "failed";
  const isPaused    = job?.status === "paused";

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4 text-sm">
      {/* Topic */}
      <div>
        <label htmlFor="sa-topic" className="block text-xs font-semibold text-foreground mb-1.5">
          What&apos;s your presentation about?
        </label>
        <Textarea
          id="sa-topic"
          placeholder="e.g. AI in healthcare for hospital executives"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="min-h-[72px] resize-none rounded-xl border-border/80 bg-muted/10 text-sm placeholder:text-muted-foreground/60"
          disabled={!!isRunning}
        />
        {isIdle && !topic && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {STARTER_PROMPTS.map((p) => (
              <button key={p} type="button" onClick={() => setTopic(p)}
                className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:border-indigo-400/50 transition">
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Audience */}
      <div>
        <label htmlFor="sa-audience" className="flex items-center gap-1 text-xs font-semibold text-foreground mb-1.5">
          <Users className="h-3 w-3 text-muted-foreground" /> Audience
          <span className="text-[10px] font-normal text-muted-foreground">(optional)</span>
        </label>
        <input id="sa-audience" type="text" placeholder="e.g. Investors, Students"
          value={audience} onChange={(e) => setAudience(e.target.value)} disabled={!!isRunning}
          className="w-full rounded-xl border border-border/80 bg-muted/10 px-3 py-2 text-sm placeholder:text-muted-foreground/60 outline-none focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/20" />
      </div>

      {/* Template */}
      <div>
        <label className="flex items-center gap-1 text-xs font-semibold text-foreground mb-1.5">
          <Palette className="h-3 w-3 text-muted-foreground" /> Template
        </label>
        <div className="grid grid-cols-7 gap-1">
          {TEMPLATES.map((t) => (
            <button key={t.id} type="button" onClick={() => setTemplate(t.id)} disabled={!!isRunning}
              className={`flex flex-col items-center gap-1 rounded-xl border p-1.5 transition ${template === t.id ? "border-indigo-500/60 bg-indigo-500/10" : "border-border/60 bg-muted/20 hover:bg-muted/40"}`}>
              <span className="text-base leading-none">{t.emoji}</span>
              <span className={`text-[9px] font-medium ${template === t.id ? "text-indigo-400" : "text-muted-foreground"}`}>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slide count */}
      <div>
        <label className="flex items-center justify-between text-xs font-semibold text-foreground mb-1.5">
          <span className="flex items-center gap-1"><Hash className="h-3 w-3 text-muted-foreground" /> Slides</span>
          <span className="text-xs font-bold text-indigo-400">{slideCount[0]}</span>
        </label>
        <Slider value={slideCount} onValueChange={setSlideCount} min={5} max={30} step={1} disabled={!!isRunning} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isIdle || isCompleted || isFailed ? (
          <Button onClick={handleGenerate} disabled={!topic.trim()}
            className="flex-1 h-9 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold">
            <Play className="h-3.5 w-3.5 mr-1.5" /> Generate <ArrowRight className="h-3.5 w-3.5 ml-1 opacity-70" />
          </Button>
        ) : isPaused ? (
          <Button onClick={() => job?.id && resumeSlideJob(job.id)}
            className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold">
            <Play className="h-3.5 w-3.5 mr-1.5" /> Resume
          </Button>
        ) : (
          <Button onClick={() => job?.id && pauseSlideJob(job.id)} variant="outline"
            className="flex-1 h-9 rounded-xl text-xs font-semibold">
            <Pause className="h-3.5 w-3.5 mr-1.5" /> Pause
          </Button>
        )}
        {(job || isLoading) && (
          <Button variant="ghost" size="sm" onClick={handleReset}
            className="h-9 px-3 rounded-xl text-muted-foreground hover:text-foreground text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Progress */}
      {job && (
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium capitalize text-foreground">{job.currentStep || "Starting…"}</span>
            <span className="font-bold text-indigo-400 tabular-nums">{job.progress ?? 0}%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${job.progress ?? 0}%` }} />
          </div>
          <div className="space-y-1 pt-1">
            {STEPS.map((step) => {
              const status = getStepStatus(job, step.id);
              return (
                <div key={step.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                  status === "active" ? "bg-indigo-500/10" : status === "completed" ? "bg-emerald-500/5" : "opacity-40"}`}>
                  {status === "completed" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    : status === "active" ? <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400 shrink-0" />
                    : <Layers className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
                  <span className={`text-[11px] font-medium ${status === "active" ? "text-indigo-300" : status === "completed" ? "text-emerald-300" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Download */}
      {isCompleted && (
        <Button onClick={handleDownload}
          className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold">
          <Download className="h-3.5 w-3.5 mr-1.5" /> Download Slides (.html)
        </Button>
      )}

      {/* Error */}
      {isFailed && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-center">
          <AlertCircle className="h-4 w-4 text-destructive mx-auto mb-1" />
          <p className="text-xs text-destructive font-semibold mb-2">Generation failed</p>
          <Button size="sm" variant="outline" onClick={handleGenerate}
            className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 text-xs">
            <RotateCcw className="h-3 w-3 mr-1" /> Try again
          </Button>
        </div>
      )}
    </div>
  );
}
