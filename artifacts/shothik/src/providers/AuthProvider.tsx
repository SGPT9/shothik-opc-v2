import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AuthService from "@/services/auth.service";
import { getInsforgeBrowserClient } from "@/lib/insforge/client";
import {
  type AuthenticatedUser,
  normalizeInsforgeUser,
  normalizeLegacyUser,
} from "@/lib/insforge/user";
import store from "@/redux/store";
import {
  loggedIn as reduxLoggedIn,
  setUser as reduxSetUser,
  logout as reduxLogout,
} from "@/redux/slices/auth";

interface AuthContextProps {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    name: string,
    email: string,
    password: string,
    country: string,
  ) => Promise<{ requiresEmailVerification: boolean }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const authService = new AuthService();
const AUTH_PROBE_TIMEOUT_MS = 5000;

export const DEFAULT_GUEST_USER: AuthenticatedUser = {
  _id: "usr_guest_founder_01",
  id: "usr_guest_founder_01",
  email: "guest.founder@shothik.ai",
  name: "Guest Founder",
  role: "enterprise_pro",
  accountType: "Enterprise Pro (Relaxed Auth)",
  authProvider: "guest",
  credits: 550,
};

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

function syncReduxAuthState(resolvedUser: AuthenticatedUser | null, token?: string | null) {
  try {
    if (resolvedUser) {
      if (token) {
        store.dispatch(reduxLoggedIn(token));
      }
      store.dispatch(reduxSetUser(resolvedUser));
    } else {
      store.dispatch(reduxLogout());
    }
  } catch {
    // ignore if store is not initialized in isolated unit test
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const applyAuthenticatedState = (resolvedUser: AuthenticatedUser, token?: string | null) => {
    if (token) {
      localStorage.setItem("jwt_token", token);
      localStorage.setItem("accessToken", token);
    }
    localStorage.setItem("shothik_user", JSON.stringify(resolvedUser));
    localStorage.removeItem("guest_mode_enabled");
    setUser(resolvedUser);
    setIsAuthenticated(true);
    syncReduxAuthState(resolvedUser, token);
  };

  useEffect(() => {
    let cancelled = false;
    const insforge = getInsforgeBrowserClient();

    // Subscribe to live Supabase Auth session changes (OAuth callbacks, token refresh, cross-tab signout)
    let authSubscription: { unsubscribe: () => void } | null = null;
    if (insforge?.auth && typeof insforge.auth.onAuthStateChange === "function") {
      const { data } = insforge.auth.onAuthStateChange(async (event, session) => {
        if (cancelled) return;
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          const sbUser = normalizeInsforgeUser(session?.user ?? null);
          const accessToken = session?.access_token;
          if (sbUser && accessToken) {
            applyAuthenticatedState(sbUser, accessToken);
          }
        } else if (event === "SIGNED_OUT") {
          localStorage.removeItem("jwt_token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("shothik_user");
          syncReduxAuthState(null);
        }
      });
      authSubscription = data?.subscription ?? null;
    }

    async function hydrateAuth() {
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      let resolved = false;

      try {
        // 1. Check active Supabase Auth session first if available
        if (insforge?.auth && typeof insforge.auth.getSession === "function") {
          const sessionRes = await withTimeout(
            insforge.auth.getSession(),
            AUTH_PROBE_TIMEOUT_MS,
          ).catch(() => null);
          const sbSession = sessionRes?.data?.session;
          if (sbSession?.access_token && sbSession?.user) {
            localStorage.setItem("jwt_token", sbSession.access_token);
            localStorage.setItem("accessToken", sbSession.access_token);
          }
        }

        // 2. Verify token with backend /api/auth/session (Dual-Verify Bridge supports both 3-part Supabase JWT & 2-part HMAC)
        const token = localStorage.getItem("jwt_token") || localStorage.getItem("accessToken");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const sessionResponse = await withTimeout(
          fetch("/api/auth/session", {
            credentials: "same-origin",
            cache: "no-store",
            headers,
          }).catch(() => null),
          AUTH_PROBE_TIMEOUT_MS,
        );

        if (sessionResponse?.ok) {
          const sessionPayload = await sessionResponse.json().catch(() => null);
          const sessionUser =
            normalizeInsforgeUser(sessionPayload?.user ?? null) ??
            normalizeLegacyUser(sessionPayload?.user ?? null);

          if (!cancelled && sessionUser?._id) {
            setUser(sessionUser);
            setIsAuthenticated(true);
            setIsLoading(false);
            syncReduxAuthState(sessionUser, token);
            resolved = true;
            return;
          }
        }

        // 3. Direct Supabase Auth user probe if backend session endpoint had no token yet
        if (insforge) {
          const fetchUser = async (): Promise<{ data: { user: any } | null; error: any }> => {
            if (typeof (insforge.auth as any).getUser === "function") {
              return await (insforge.auth as any).getUser();
            }
            if (typeof (insforge.auth as any).getCurrentUser === "function") {
              return await (insforge.auth as any).getCurrentUser();
            }
            return { data: null, error: null };
          };

          const current = await withTimeout(fetchUser(), AUTH_PROBE_TIMEOUT_MS).catch(() => ({
            data: null,
            error: true,
          }));
          const insforgeUser = !current.error
            ? normalizeInsforgeUser(current.data?.user ?? null)
            : null;

          if (!cancelled && insforgeUser?._id) {
            setUser(insforgeUser);
            setIsAuthenticated(true);
            setIsLoading(false);
            syncReduxAuthState(insforgeUser, token);
            resolved = true;
            return;
          }
        }

        // 4. Guest founder fallback when not on /auth/* pages
        if (typeof window !== "undefined") {
          const isAuthPage = window.location.pathname.startsWith("/auth/");
          const storedGuestMode = localStorage.getItem("guest_mode_enabled");

          if (!isAuthPage && (storedGuestMode === "true" || !token)) {
            if (!cancelled) {
              setUser(DEFAULT_GUEST_USER);
              setIsAuthenticated(true);
              setIsLoading(false);
              syncReduxAuthState(DEFAULT_GUEST_USER);
              resolved = true;
              return;
            }
          }
        }
      } catch {
        // Fall back to legacy token validation
      } finally {
        if (resolved) {
          return;
        }

        const token = localStorage.getItem("jwt_token");
        if (!token) {
          if (!cancelled) {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        try {
          const userData = await withTimeout(
            authService.validateToken(token),
            AUTH_PROBE_TIMEOUT_MS,
          );
          const legacyUser = normalizeLegacyUser(userData);

          if (!cancelled && legacyUser) {
            setUser(legacyUser);
            setIsAuthenticated(true);
            setIsLoading(false);
            syncReduxAuthState(legacyUser, token);
            return;
          }

          throw new Error("Invalid token");
        } catch {
          localStorage.removeItem("jwt_token");
          if (!cancelled) {
            setUser(DEFAULT_GUEST_USER);
            setIsAuthenticated(true);
            syncReduxAuthState(DEFAULT_GUEST_USER);
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      }
    }

    void hydrateAuth();

    return () => {
      cancelled = true;
      authSubscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const insforge = getInsforgeBrowserClient();

      // 1. Primary: Authenticate via Supabase Auth (auth.users)
      if (insforge?.auth && typeof insforge.auth.signInWithPassword === "function") {
        const sbResult = await withTimeout(
          insforge.auth.signInWithPassword({ email, password }),
          AUTH_PROBE_TIMEOUT_MS,
        ).catch(() => null);

        if (sbResult?.data?.session?.access_token && sbResult?.data?.user) {
          const accessToken = sbResult.data.session.access_token;
          const syncRes = await fetch("/api/auth/supabase-sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              accessToken,
              userMetadata: sbResult.data.user.user_metadata,
            }),
          }).catch(() => null);

          const syncPayload = syncRes?.ok ? await syncRes.json().catch(() => null) : null;
          const normalized =
            normalizeInsforgeUser(syncPayload?.user ?? sbResult.data.user) ??
            normalizeLegacyUser(syncPayload?.user);

          if (normalized) {
            applyAuthenticatedState(normalized, accessToken);
            return;
          }
        }
      }

      // 2. Bridge Fallback: Authenticate via Express /api/auth/sign-in (supports pre-seeded dev/tester & legacy accounts)
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();

      if (!response.ok || !payload?.user) {
        throw new Error(payload?.message || "Unable to sign in.");
      }

      applyAuthenticatedState(payload.user, payload.token);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = (): void => {
    const insforge = getInsforgeBrowserClient();
    if (insforge?.auth && typeof insforge.auth.signOut === "function") {
      void insforge.auth.signOut().catch(() => undefined);
    }
    void fetch("/api/auth/sign-out", { method: "POST" }).catch(() => undefined);
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("shothik_user");
    localStorage.removeItem("guest_mode_enabled");
    setUser(null);
    setIsAuthenticated(false);
    syncReduxAuthState(null);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    country: string,
  ): Promise<{ requiresEmailVerification: boolean }> => {
    try {
      const insforge = getInsforgeBrowserClient();
      let supabaseToken: string | null = null;
      let supabaseUser: any = null;

      // 1. Primary: Register in Supabase Auth (triggers on_auth_user_created in PostgreSQL)
      if (insforge?.auth && typeof insforge.auth.signUp === "function") {
        const sbSignUp = await withTimeout(
          insforge.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                full_name: name,
                country,
                credits: 500,
                tier: "starter",
              },
            },
          }),
          AUTH_PROBE_TIMEOUT_MS,
        ).catch(() => null);

        if (sbSignUp?.data?.session?.access_token) {
          supabaseToken = sbSignUp.data.session.access_token;
        }
        if (sbSignUp?.data?.user) {
          supabaseUser = sbSignUp.data.user;
        }
      }

      // 2. Mirror registration to Express /api/auth/sign-up for immediate dual-bridge parity
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          country,
        }),
      });
      const payload = await response.json();

      if (!response.ok && !supabaseUser) {
        throw new Error(payload?.message || "Unable to create account.");
      }

      const activeToken = supabaseToken || payload?.token;
      const activeUser =
        payload?.user ||
        normalizeInsforgeUser(supabaseUser) || {
          _id: supabaseUser?.id || `usr_${Date.now()}`,
          id: supabaseUser?.id || `usr_${Date.now()}`,
          name,
          email: email.toLowerCase(),
          country,
          credits: 500,
          tier: "starter",
          authProvider: "supabase",
        };

      applyAuthenticatedState(activeUser, activeToken);

      return {
        requiresEmailVerification: Boolean(payload?.requiresEmailVerification),
      };
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
