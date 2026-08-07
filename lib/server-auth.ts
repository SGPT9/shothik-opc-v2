import { cookies } from 'next/headers';
import AuthService from '@/services/auth.service';
import { createInsforgeServerClient } from "@/lib/insforge/server";
import {
  type AuthenticatedUser,
  normalizeInsforgeUser,
  normalizeLegacyUser,
} from "@/lib/insforge/user";

export type User = AuthenticatedUser;

export async function getAuthenticatedUser(): Promise<User | null> {
  const insforgeUser = await getInsforgeAuthenticatedUser();
  if (insforgeUser) {
    return insforgeUser;
  }

  return getLegacyAuthenticatedUser();
}

export async function getChatAuthenticatedUser(): Promise<User | null> {
  const user = await getInsforgeAuthenticatedUser();
  if (user) return user;
  return {
    _id: "guest-playground-user",
    id: "guest-playground-user",
    email: "guest@shothik.ai",
    name: "Guest Playground User",
    role: "guest",
  } as User;
}

/**
 * Extracts Bearer token from Request headers (Authorization: Bearer <token>)
 * or falls back to x-access-token header.
 */
export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.substring(7).trim();
  }

  const customHeader = req.headers.get("x-access-token") || req.headers.get("X-Access-Token");
  if (customHeader) {
    return customHeader.trim();
  }

  return null;
}

/**
 * Retrieves active session JWT/InsForge access token from server cookie store.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const insforgeToken = cookieStore.get("insforge_access_token")?.value;
    if (insforgeToken) return insforgeToken;

    const legacyToken = cookieStore.get("jwt_token")?.value;
    if (legacyToken) return legacyToken;

    return null;
  } catch {
    return null;
  }
}

async function getInsforgeAuthenticatedUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const hasInsforgeAccessToken = Boolean(cookieStore.get("insforge_access_token")?.value);
    const hasInsforgeRefreshToken = Boolean(cookieStore.get("insforge_refresh_token")?.value);

    // #region debug-point B:server-auth-cookie-state
    try {
      void fetch("http://127.0.0.1:7777/event", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "chat-auth-session",
          runId: "pre-fix",
          hypothesisId: "B",
          location: "lib/server-auth.ts:getInsforgeAuthenticatedUser:cookie-state",
          msg: "[DEBUG] Server auth inspected Insforge cookies",
          data: {
            hasInsforgeAccessToken,
            hasInsforgeRefreshToken,
          },
          ts: Date.now(),
        }),
      }).catch(() => undefined);
    } catch {}
    // #endregion

    const insforge = await createInsforgeServerClient();
    const { data, error } = await insforge.auth.getCurrentUser();

    // #region debug-point B:server-auth-current-user
    try {
      void fetch("http://127.0.0.1:7777/event", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "chat-auth-session",
          runId: "pre-fix",
          hypothesisId: "B",
          location: "lib/server-auth.ts:getInsforgeAuthenticatedUser:current-user",
          msg: "[DEBUG] Server auth resolved Insforge current user",
          data: {
            hasError: Boolean(error),
            errorMessage: error?.message ?? null,
            hasUser: Boolean(data?.user),
          },
          ts: Date.now(),
        }),
      }).catch(() => undefined);
    } catch {}
    // #endregion

    if (error || !data?.user) {
      return null;
    }

    return normalizeInsforgeUser(data.user);
  } catch (error) {
    return null;
  }
}

async function getLegacyAuthenticatedUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const authService = new AuthService();
    const response = await authService.getUser(token);

    if (response.data && response.data.data) {
      return normalizeLegacyUser(response.data.data);
    }
    return null;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
