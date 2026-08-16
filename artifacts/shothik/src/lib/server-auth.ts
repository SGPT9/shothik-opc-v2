import { cookies } from "next/headers";
import { createInsforgeServerClient } from "@/lib/insforge/server";
import AuthService from "@/services/auth.service";
import { normalizeInsforgeUser, normalizeLegacyUser } from "@/lib/insforge/user";

export function extractBearerToken(req: Request | Headers | any): string | null {
  if (!req) return null;
  const headers = req instanceof Headers ? req : (req.headers || req);
  const getHeader = (name: string) => {
    if (typeof headers.get === "function") return headers.get(name);
    return headers[name] || headers[name.toLowerCase()] || null;
  };

  const authHeader = getHeader("authorization");
  if (authHeader && typeof authHeader === "string") {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1].trim();
    return authHeader.trim();
  }

  const xAccessToken = getHeader("x-access-token");
  if (xAccessToken && typeof xAccessToken === "string") {
    return xAccessToken.trim();
  }

  return null;
}

export async function getAuthToken(req: Request | Headers | any): Promise<string | null> {
  return extractBearerToken(req);
}

export async function getAuthenticatedUser() {
  try {
    const insforge = await createInsforgeServerClient();
    const { data, error } = await insforge.auth.getCurrentUser();
    if (data?.user && !error) {
      return normalizeInsforgeUser(data.user);
    }
  } catch (err) {
    console.error("InsForge session error:", err);
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jwt_token")?.value;
    if (token) {
      const authService = new AuthService();
      const res = await authService.getUser(token);
      const rawUser = res?.data?.data || res?.data || res;
      if (rawUser) {
        return normalizeLegacyUser(rawUser);
      }
    }
  } catch (err) {
    console.error("Legacy auth fallback error:", err);
  }

  return null;
}

export async function getChatAuthenticatedUser() {
  try {
    const insforge = await createInsforgeServerClient();
    const { data, error } = await insforge.auth.getCurrentUser();
    if (data?.user && !error) {
      return normalizeInsforgeUser(data.user);
    }
  } catch (err) {
    console.error("InsForge session error in chat:", err);
  }
  return {
    _id: "guest-playground-user",
    id: "guest-playground-user",
    email: "guest@shothik.ai",
    name: "Guest User",
    authProvider: "guest",
  };
}

export default {
  extractBearerToken,
  getAuthToken,
  getAuthenticatedUser,
  getChatAuthenticatedUser,
};
