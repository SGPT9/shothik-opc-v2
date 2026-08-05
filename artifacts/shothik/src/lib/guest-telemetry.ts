/**
 * Guest Telemetry & Funnel Analytics
 * Privacy-compliant anonymous event tracking for guest engagement and conversion.
 */

export type GuestEventName =
  | "guest_playground_entry"
  | "guest_first_message_sent"
  | "guest_lens_toggled"
  | "guest_click_sign_in_cta"
  | "guest_rate_limit_triggered";

export function trackGuestEvent(eventName: GuestEventName, metadata?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  const eventPayload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    sessionType: "anonymous_guest",
    ...metadata,
  };

  // Log to client console in dev
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Guest Telemetry] ${eventName}`, eventPayload);
  }

  // Dispatch custom browser event for analytics integrations (e.g. PostHog / Plausible)
  try {
    window.dispatchEvent(new CustomEvent("shothik_guest_telemetry", { detail: eventPayload }));
  } catch {}
}
