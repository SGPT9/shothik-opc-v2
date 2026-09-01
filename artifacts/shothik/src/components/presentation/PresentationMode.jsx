import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  X,
  Maximize2,
  Minimize2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Grid,
  Monitor,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;

export const PresentationMode = ({ slides, open, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [presenterMode, setPresenterMode] = useState(false); // Toggle Speaker Cockpit
  const [isBlackout, setIsBlackout] = useState(false); // Press 'B' to blackout
  const [showGrid, setShowGrid] = useState(false); // Thumbnail Grid overlay

  // Presenter Timer State
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  const containerRef = useRef(null);

  // Reset state when modal is opened
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setElapsedSeconds(0);
      setIsTimerRunning(true);
      setIsBlackout(false);
      setShowGrid(false);
    }
  }, [open]);

  // Live Clock & Timer Tick
  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

      if (isTimerRunning) {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [open, isTimerRunning]);

  // Format seconds into MM:SS
  const formattedElapsed = `${Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0")}:${(elapsedSeconds % 60).toString().padStart(2, "0")}`;

  // Calculate correct scale for slide to fit container maintaining 16:9 aspect ratio
  const updateScale = useCallback(() => {
    if (open && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const availableWidth = containerRect.width - (presenterMode ? 420 : 40);
      const availableHeight = containerRect.height - (presenterMode ? 140 : 40);

      const scaleX = Math.max(0.1, availableWidth / SLIDE_WIDTH);
      const scaleY = Math.max(0.1, availableHeight / SLIDE_HEIGHT);
      const newScale = Math.min(scaleX, scaleY, 1.4);

      setScale(newScale);
    }
  }, [open, presenterMode]);

  useEffect(() => {
    if (!open) return;
    updateScale();

    const handleResize = () => updateScale();
    window.addEventListener("resize", handleResize);
    const timeoutId = setTimeout(updateScale, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [open, updateScale]);

  // Navigation handlers
  const handleNext = () => {
    if (slides && slides.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }
  };

  const handlePrev = () => {
    if (slides && slides.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key.toLowerCase() === "b") {
        setIsBlackout((prev) => !prev);
      } else if (e.key.toLowerCase() === "p") {
        setPresenterMode((prev) => !prev);
      } else if (e.key.toLowerCase() === "g") {
        setShowGrid((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, slides?.length, onClose]);

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];
  const nextSlide = slides[(currentIndex + 1) % slides.length];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/95 backdrop-blur-md" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex h-screen w-screen max-w-none items-center justify-center overflow-hidden border-0 p-0 outline-none select-none",
            isBlackout ? "bg-black" : "bg-zinc-950 text-white"
          )}
        >
          {isBlackout ? (
            /* Blackout Screen state */
            <div
              onClick={() => setIsBlackout(false)}
              className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-zinc-600 space-y-2 font-mono text-sm"
            >
              <span>Screen Paused (Blackout Active)</span>
              <span className="text-xs text-zinc-700">Press 'B' or Click anywhere to resume presentation</span>
            </div>
          ) : presenterMode ? (
            /* ========================================================================= */
            /* 🎙️ PRESENTER COCKPIT MODE (Speaker Dual View)                             */
            /* ========================================================================= */
            <div ref={containerRef} className="flex h-full w-full flex-col bg-zinc-950 text-white">
              {/* Top Presenter Bar */}
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-6 backdrop-blur">
                <div className="flex items-center gap-6">
                  {/* Timer */}
                  <div className="flex items-center gap-2 font-mono text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    <Clock className="h-4 w-4" />
                    <span>Elapsed: {formattedElapsed}</span>
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="ml-1 text-zinc-400 hover:text-white"
                      title={isTimerRunning ? "Pause timer" : "Resume timer"}
                    >
                      {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => setElapsedSeconds(0)}
                      className="text-zinc-400 hover:text-white ml-0.5"
                      title="Reset timer"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Local Clock */}
                  <div className="text-xs text-zinc-400 font-mono hidden sm:block">
                    Time: {currentTimeStr}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border",
                      showGrid
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                    )}
                  >
                    <Grid className="h-3.5 w-3.5" /> Slide Grid [G]
                  </button>

                  <button
                    onClick={() => setPresenterMode(false)}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                  >
                    <Monitor className="h-3.5 w-3.5" /> Fullscreen [P]
                  </button>

                  <button
                    onClick={onClose}
                    className="rounded-full bg-zinc-800 p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Main Presenter Body */}
              <div className="flex flex-1 overflow-hidden p-6 gap-6">
                {/* Left: Active Slide Canvas */}
                <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800/80 p-4 relative overflow-hidden">
                  <div className="absolute top-3 left-4 text-xs font-bold text-zinc-400 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    CURRENT SLIDE ({currentIndex + 1} / {slides.length})
                  </div>

                  <div
                    className="shadow-2xl rounded-lg overflow-hidden bg-black transition-transform"
                    style={{
                      width: `${SLIDE_WIDTH}px`,
                      height: `${SLIDE_HEIGHT}px`,
                      transform: `scale(${scale * 0.85})`,
                      transformOrigin: "center center",
                    }}
                  >
                    <iframe
                      srcDoc={currentSlide?.body || currentSlide?.html_content || ""}
                      className="pointer-events-none block h-full w-full border-0"
                      title={`Slide ${currentIndex + 1}`}
                    />
                  </div>

                  {/* Slide Stepper Bar */}
                  <div className="absolute bottom-4 flex items-center gap-4">
                    <button
                      onClick={handlePrev}
                      className="rounded-xl bg-zinc-800 p-2 text-zinc-200 hover:bg-zinc-700 border border-zinc-700"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="font-mono text-sm font-bold text-zinc-300">
                      {currentIndex + 1} of {slides.length}
                    </span>
                    <button
                      onClick={handleNext}
                      className="rounded-xl bg-zinc-800 p-2 text-zinc-200 hover:bg-zinc-700 border border-zinc-700"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Right: Next Slide Preview & Speaker Notes */}
                <div className="flex w-96 flex-col gap-4">
                  {/* Next Slide Card */}
                  <div className="flex flex-col rounded-2xl bg-zinc-900 border border-zinc-800 p-4 shrink-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-indigo-400" /> Next Up (Slide {((currentIndex + 1) % slides.length) + 1})
                    </span>
                    <div
                      className="aspect-video w-full rounded-lg bg-black overflow-hidden border border-zinc-800 relative cursor-pointer"
                      onClick={handleNext}
                    >
                      <div
                        style={{
                          width: `${SLIDE_WIDTH}px`,
                          height: `${SLIDE_HEIGHT}px`,
                          transform: `scale(${350 / SLIDE_WIDTH})`,
                          transformOrigin: "top left",
                        }}
                      >
                        <iframe
                          srcDoc={nextSlide?.body || nextSlide?.html_content || ""}
                          className="pointer-events-none block h-full w-full border-0"
                          title="Next Slide Preview"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Private Speaker Notes */}
                  <div className="flex flex-1 flex-col rounded-2xl bg-zinc-900 border border-zinc-800 p-4 overflow-hidden">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-emerald-400" /> Private Speaker Notes
                    </span>
                    <div className="flex-1 overflow-y-auto rounded-lg bg-zinc-950/60 p-3 text-xs leading-relaxed text-zinc-300 font-sans border border-zinc-800/50">
                      {currentSlide?.notes || currentSlide?.speakerNotes ? (
                        <p>{currentSlide.notes || currentSlide.speakerNotes}</p>
                      ) : (
                        <p className="italic text-zinc-500">
                          No private speaker notes attached to this slide. Click to add talking points or transition cues.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* 📺 AUDIENCE FULLSCREEN VIEW                                              */
            /* ========================================================================= */
            <div
              ref={containerRef}
              onClick={handleNext}
              className="relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden outline-none bg-black"
            >
              {/* Top Floating Overlay Menu */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-4 right-4 z-[1000] flex items-center gap-2 rounded-full bg-black/60 p-1.5 backdrop-blur border border-white/10 opacity-30 hover:opacity-100 transition-opacity"
              >
                <button
                  type="button"
                  onClick={() => setPresenterMode(true)}
                  className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white"
                  title="Enter Presenter Cockpit [P]"
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlackout(true)}
                  className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white"
                  title="Blackout Screen [B]"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className="rounded-full p-2 text-white/80 hover:bg-white/20 hover:text-white"
                  title="Slide Grid [G]"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-white/80 hover:bg-red-500 hover:text-white"
                  title="Exit Presentation [Esc]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scaled Slide Iframe */}
              <div
                className="bg-muted shrink-0 shadow-2xl transition-transform duration-300 ease-in-out rounded-lg overflow-hidden"
                style={{
                  width: `${SLIDE_WIDTH}px`,
                  height: `${SLIDE_HEIGHT}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: "center center",
                }}
              >
                <iframe
                  srcDoc={currentSlide?.body || currentSlide?.html_content || ""}
                  className="pointer-events-none block h-full w-full border-0"
                  title={`Slide ${currentIndex + 1}`}
                />
              </div>

              {/* Slide Counter */}
              <span className="text-white bg-black/50 backdrop-blur border border-white/10 absolute bottom-5 left-1/2 z-[1000] -translate-x-1/2 rounded-full px-4 py-1.5 font-mono text-xs">
                {currentIndex + 1} / {slides.length}
              </span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🗂️ THUMBNAIL SLIDE JUMPER GRID MODAL                                      */}
          {/* ========================================================================= */}
          {showGrid && (
            <div
              onClick={() => setShowGrid(false)}
              className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-lg p-10 animate-in fade-in-0"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="max-w-5xl w-full max-h-[80vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-zinc-800 p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Grid className="h-4 w-4 text-indigo-400" /> Jump to Slide
                  </h3>
                  <button
                    onClick={() => setShowGrid(false)}
                    className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {slides.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowGrid(false);
                      }}
                      className={cn(
                        "group relative aspect-video cursor-pointer overflow-hidden rounded-xl border bg-black transition-all hover:scale-105",
                        currentIndex === idx
                          ? "border-emerald-500 ring-2 ring-emerald-500/30"
                          : "border-zinc-800 hover:border-zinc-600"
                      )}
                    >
                      <div
                        style={{
                          width: `${SLIDE_WIDTH}px`,
                          height: `${SLIDE_HEIGHT}px`,
                          transform: `scale(${220 / SLIDE_WIDTH})`,
                          transformOrigin: "top left",
                        }}
                      >
                        <iframe
                          srcDoc={s.body || s.html_content || ""}
                          className="pointer-events-none block h-full w-full border-0"
                          title={`Thumbnail ${idx + 1}`}
                        />
                      </div>
                      <div className="absolute bottom-1.5 left-1.5 rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] text-white">
                        Slide {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default PresentationMode;
