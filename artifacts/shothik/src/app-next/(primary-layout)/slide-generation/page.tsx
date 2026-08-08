

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

// ─── Config ───────────────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: "professional", name: "Professional", emoji: "💼", accent: "#3b82f6" },
  { id: "creative",     name: "Creative",     emoji: "🎨", accent: "#a855f7" },
  { id: "minimal",      name: "Minimal",      emoji: "⬜", accent: "#6b7280" },
  { id: "educational",  name: "Educational",  emoji: "📚", accent: "#10b981" },
  { id: "business",     name: "Business",     emoji: "📊", accent: "#6366f1" },
  { id: "modern",       name: "Modern",       emoji: "✨", accent: "#f97316" },
  { id: "dark",         name: "Dark Mode",    emoji: "🌑", accent: "#475569" },
];

const STEPS = [
  { id: "outline",    label: "Outline",    description: "Structuring your content" },
  { id: "design",     label: "Design",     description: "Applying your template" },
  { id: "content",    label: "Content",    description: "Writing each slide" },
  { id: "formatting", label: "Formatting", description: "Styling & polish" },
  { id: "review",     label: "Review",     description: "Final quality check" },
];

const STARTER_PROMPTS = [
  "The future of AI in healthcare",
  "How to launch a SaaS product in 90 days",
  "Climate tech investor pitch deck",
  "Quarterly business review: Q3 results",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStepStatus(job: SlideJob | null, stepId: string) {
  if (!job) return "pending";
  const stepIdx    = STEPS.findIndex((s) => s.id === stepId);
  const currentIdx = STEPS.findIndex((s) => s.id === job.currentStep);
  if (stepIdx < currentIdx)  return "completed";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SlideGenerationPage() {
  const { user } = useAuth();
  const [topic,       setTopic]       = useState("");
  const [audience,    setAudience]    = useState("");
  const [slideCount,  setSlideCount]  = useState([10]);
  const [template,    setTemplate]    = useState("professional");
  const [isLoading,   setIsLoading]   = useState(false);
  const [job,         setJob]         = useState<SlideJob | null>(null);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  // Cleanup subscription on unmount
  useEffect(() => () => { unsubscribe?.(); }, [unsubscribe]);

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
          if (updated.status === "completed" || updated.status === "failed") {
            setIsLoading(false);
          }
        },
        (err) => {
          console.error("Progress error:", err);
          setIsLoading(false);
        },
      );
      setUnsubscribe(() => unsub);
    } else {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    unsubscribe?.();
    setJob(null);
    setTopic("");
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!job?.slides) return;
    const slides: Array<{ title?: string; content?: string; speakerNotes?: string }> =
      Array.isArray(job.slides) ? job.slides : Object.values(job.slides);

    const slideHtml = slides
      .map(
        (slide, i) => `
  <section class="slide" id="slide-${i + 1}">
    <div class="slide-number">${i + 1} / ${slides.length}</div>
    <h2>${slide.title ?? `Slide ${i + 1}`}</h2>
    <div class="content">${slide.content ?? ""}</div>
    ${slide.speakerNotes ? `<div class="notes"><strong>Notes:</strong> ${slide.speakerNotes}</div>` : ""}
  </section>`,
      )
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${topic}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #f1f5f9; }
    .controls { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; gap: 12px; z-index: 100; }
    .controls button { padding: 10px 24px; background: #3b82f6; color: #fff; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; }
    .controls button:hover { background: #2563eb; }
    .slide { display: none; min-height: 100vh; padding: 80px 120px 120px; flex-direction: column; justify-content: center; }
    .slide.active { display: flex; }
    .slide-number { position: absolute; top: 24px; right: 32px; font-size: 13px; opacity: 0.4; }
    h2 { font-size: 2.4rem; font-weight: 700; margin-bottom: 32px; color: #60a5fa; }
    .content { font-size: 1.15rem; line-height: 1.8; max-width: 780px; white-space: pre-wrap; }
    .notes { margin-top: 40px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 0.9rem; opacity: 0.6; border-left: 3px solid #3b82f6; }
  </style>
</head>
<body>
${slideHtml}
  <div class="controls">
    <button onclick="prev()">← Prev</button>
    <button onclick="next()">Next →</button>
  </div>
  <script>
    let current = 0;
    const slides = document.querySelectorAll('.slide');
    function show(n) { slides.forEach((s, i) => s.classList.toggle('active', i === n)); current = n; }
    function next() { if (current < slides.length - 1) show(current + 1); }
    function prev() { if (current > 0) show(current - 1); }
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
    });
    show(0);
  <\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${topic.replace(/\s+/g, "_")}_slides.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isIdle      = !job && !isLoading;
  const isRunning   = isLoading || (job && job.status === "running");
  const isCompleted = job?.status === "completed";
  const isFailed    = job?.status === "failed";
  const isPaused    = job?.status === "paused";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-3 py-1 text-xs font-medium text-indigo-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Presentation Builder
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Generate a Slide Deck
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Describe your topic and we'll build a complete, formatted presentation — outline,
            design, content, and speaker notes — in seconds.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ── Left: Input form ── */}
          <div className="space-y-6">

            {/* Topic input */}
            <div>
              <label htmlFor="slide-topic" className="block text-sm font-semibold text-foreground mb-2">
                What's your presentation about?
              </label>
              <Textarea
                id="slide-topic"
                placeholder="e.g. The future of AI in healthcare — for a hospital C-suite audience"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[96px] resize-none rounded-2xl border-border/80 bg-muted/10 text-sm focus:border-indigo-400/60 focus:ring-indigo-400/20 placeholder:text-muted-foreground/60"
                disabled={isRunning}
              />
              {/* Starter prompts */}
              {isIdle && !topic && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTopic(p)}
                      className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] text-muted-foreground hover:border-indigo-400/50 hover:text-foreground hover:bg-indigo-500/5 transition"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Audience */}
            <div>
              <label htmlFor="slide-audience" className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-2">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                Target Audience
                <span className="text-[10px] font-normal text-muted-foreground ml-1">(optional)</span>
              </label>
              <input
                id="slide-audience"
                type="text"
                placeholder="e.g. Executives, Students, Engineers, Investors"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                disabled={isRunning}
                className="w-full rounded-xl border border-border/80 bg-muted/10 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>

            {/* Template picker */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground mb-3">
                <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                Template
              </label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    disabled={isRunning}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition ${
                      template === t.id
                        ? "border-indigo-500/60 bg-indigo-500/10 shadow-sm"
                        : "border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <span className="text-xl leading-none">{t.emoji}</span>
                    <span className={`text-[10px] font-medium leading-tight ${template === t.id ? "text-indigo-400" : "text-muted-foreground"}`}>
                      {t.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slide count */}
            <div>
              <label className="flex items-center justify-between text-sm font-semibold text-foreground mb-3">
                <span className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  Slide Count
                </span>
                <span className="text-sm font-bold text-indigo-400 tabular-nums">{slideCount[0]} slides</span>
              </label>
              <Slider
                value={slideCount}
                onValueChange={setSlideCount}
                min={5}
                max={30}
                step={1}
                disabled={isRunning}
                className="mt-1"
              />
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>5 min</span>
                <span>30 max</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-3 pt-2">
              {isIdle || isCompleted || isFailed ? (
                <Button
                  onClick={handleGenerate}
                  disabled={!topic.trim()}
                  className="h-11 px-6 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-900/30 font-semibold transition"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Generate Slides
                  <ArrowRight className="h-4 w-4 ml-2 opacity-70" />
                </Button>
              ) : isPaused ? (
                <Button
                  onClick={() => job?.id && resumeSlideJob(job.id)}
                  className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              ) : (
                <Button
                  onClick={() => job?.id && pauseSlideJob(job.id)}
                  variant="outline"
                  className="h-11 px-6 rounded-xl border-border/80 font-semibold"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}

              {(job || isLoading) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-11 px-4 rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* ── Right: Progress panel ── */}
          <div className="rounded-3xl border border-border/60 bg-card/60 p-6 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-foreground">Generation Progress</h2>
              {job && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                  isCompleted ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : isFailed  ? "bg-destructive/15 text-destructive border border-destructive/30"
                  : isPaused  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                }`}>
                  {isCompleted && <CheckCircle className="h-3 w-3" />}
                  {isFailed    && <AlertCircle className="h-3 w-3" />}
                  {isRunning   && <Loader2 className="h-3 w-3 animate-spin" />}
                  {job.status}
                </span>
              )}
            </div>

            {/* Empty state */}
            {!job && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40 mb-4">
                  <Presentation className="h-7 w-7 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Fill in the details and click<br />
                  <strong className="text-foreground">Generate Slides</strong> to start.
                </p>
              </div>
            )}

            {/* Progress bar */}
            {job && (
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="font-medium text-foreground capitalize">{job.currentStep || "Starting…"}</span>
                  <span className="tabular-nums font-bold text-indigo-400">{job.progress ?? 0}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${job.progress ?? 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Step list */}
            {(job || isLoading) && (
              <div className="space-y-1.5">
                {STEPS.map((step) => {
                  const status = getStepStatus(job, step.id);
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                        status === "active"    ? "bg-indigo-500/10 border border-indigo-500/20"
                        : status === "completed" ? "bg-emerald-500/5 border border-emerald-500/10"
                        : "border border-transparent opacity-50"
                      }`}
                    >
                      <div className="shrink-0">
                        {status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : status === "active" ? (
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                        ) : (
                          <Layers className="h-4 w-4 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold ${status === "active" ? "text-indigo-300" : status === "completed" ? "text-emerald-300" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Download */}
            {isCompleted && (
              <div className="mt-5 space-y-2">
                <Button
                  onClick={handleDownload}
                  className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-900/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Presentation
                </Button>
                <p className="text-center text-[10px] text-muted-foreground">
                  Saves as a self-contained HTML slideshow
                </p>
              </div>
            )}

            {/* Failed state */}
            {isFailed && (
              <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
                <AlertCircle className="h-5 w-5 text-destructive mx-auto mb-2" />
                <p className="text-xs font-semibold text-destructive mb-1">Generation failed</p>
                <p className="text-[10px] text-muted-foreground mb-3">Something went wrong during generation.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerate}
                  className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Try again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
