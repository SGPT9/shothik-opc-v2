

import { useEffect } from "react";
import { usePathname, useSearchParams } from "@/lib/navigation";
import posthog from "posthog-js";
import { initPostHog } from "@/lib/posthog";

export default function PostHogProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    if (!import.meta.env.VITE_POSTHOG_KEY || typeof window === "undefined")
      return;
    const url = window.origin + pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}
