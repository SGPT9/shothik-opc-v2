import type { ReactNode } from "react";
import { LogtoProvider, type LogtoConfig } from "@logto/react";

const endpoint = import.meta.env.VITE_LOGTO_ENDPOINT as string | undefined;
const appId = import.meta.env.VITE_LOGTO_APP_ID as string | undefined;

/** True when Logto is configured via VITE_LOGTO_ENDPOINT + VITE_LOGTO_APP_ID. */
export const logtoEnabled = Boolean(endpoint && appId);

/** Full redirect URI for the Logto sign-in callback (base-path aware). */
export function logtoCallbackUri(): string {
  const base = import.meta.env.BASE_URL || "/";
  return new URL(
    `${base.endsWith("/") ? base : `${base}/`}auth/logto-callback`.replace(/^\/+/, "/"),
    window.location.origin,
  ).toString();
}

/**
 * Wraps children in LogtoProvider when configured; otherwise renders children
 * unchanged so the app works without Logto env vars.
 */
export default function LogtoAuthProvider({ children }: { children: ReactNode }) {
  if (!logtoEnabled) return <>{children}</>;
  const config: LogtoConfig = { endpoint: endpoint!, appId: appId! };
  return <LogtoProvider config={config}>{children}</LogtoProvider>;
}
