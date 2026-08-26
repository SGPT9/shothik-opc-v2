import React, { useEffect, useRef } from "react";

export interface TurnstileWidgetProps {
  siteKey?: string;
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (error: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "invisible";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
  onSuccess,
  onError,
  onExpire,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // If Turnstile is in dummy/dev mode without real API script
    if (typeof window !== "undefined" && !window.turnstile) {
      // In development or when script is absent, emit dummy pass token
      const timer = setTimeout(() => {
        onSuccess("test_pass_token");
      }, 100);
      return () => clearTimeout(timer);
    }

    if (containerRef.current && window.turnstile && !widgetIdRef.current) {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onSuccess,
        "error-callback": onError,
        "expired-callback": onExpire,
        size: "invisible",
      });
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onSuccess, onError, onExpire]);

  return <div ref={containerRef} data-testid="turnstile-widget" className={className} />;
};
