import { useCallback, useEffect, useState } from "react";

export const CREDITS_CHANGED_EVENT = "shothik:credits-changed";

/** Call after any purchase/spend so every credit badge refreshes immediately. */
export function notifyCreditsChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CREDITS_CHANGED_EVENT));
}

/**
 * Live credit balance from /api/v1/subscriptions/credits.
 * Returns `fallback` until the first response (or if the API is unreachable),
 * so badges never show a stale hard-coded number once the backend answers.
 */
export function useCreditBalance(fallback?: number): number | undefined {
  const [balance, setBalance] = useState<number | undefined>(fallback);

  const refresh = useCallback(() => {
    fetch("/api/v1/subscriptions/credits")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const n = Number(d?.creditsBalance);
        if (Number.isFinite(n)) setBalance(n);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(CREDITS_CHANGED_EVENT, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(CREDITS_CHANGED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  return balance;
}
