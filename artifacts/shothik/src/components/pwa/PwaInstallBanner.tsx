import { useState, useEffect } from "react";
import { Download, Smartphone, X } from "lucide-react";

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user previously dismissed
      const dismissed = localStorage.getItem("shothik_pwa_dismissed");
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("shothik_pwa_dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-50 p-3.5 rounded-2xl bg-popover/95 backdrop-blur-2xl border border-border/80 shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-foreground">Install Shothik AI App</h4>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded-md"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
            Fast, zero-overhead mobile access with offline sync & parcel tracking.
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Install (1-Tap)</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-2.5 py-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
