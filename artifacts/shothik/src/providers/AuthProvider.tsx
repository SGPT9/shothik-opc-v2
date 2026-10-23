

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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrateAuth() {
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      let resolved = false;



      try {
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
          const sessionUser = normalizeInsforgeUser(
            sessionPayload?.user ?? null,
          ) ?? normalizeLegacyUser(sessionPayload?.user ?? null);

          if (!cancelled && sessionUser?._id) {
            setUser(sessionUser);
            setIsAuthenticated(true);
            setIsLoading(false);
            resolved = true;
            return;
          }
        }

        if (typeof window !== "undefined") {
          const isAuthPage = window.location.pathname.startsWith("/auth/");
          const storedGuestMode = localStorage.getItem("guest_mode_enabled");
          
          // Don't auto-authenticate as guest if user is deliberately on an auth screen (/auth/login, /auth/register)
          if (!isAuthPage && (storedGuestMode === "true" || !token)) {
            if (!cancelled) {
              setUser(DEFAULT_GUEST_USER);
              setIsAuthenticated(true);
              setIsLoading(false);
              resolved = true;
              return;
            }
          }
        }

        const insforge = getInsforgeBrowserClient();
        if (insforge) {
        const resolveInsforgeUser = async () => {
          const current = await withTimeout(
            insforge.auth.getCurrentUser(),
            AUTH_PROBE_TIMEOUT_MS,
          );
          let resolvedUser = !current.error
            ? normalizeInsforgeUser(current.data?.user ?? null)
            : null;

          if (resolvedUser?._id) {
            return {
              user: resolvedUser,
              error: current.error,
              refreshed: false,
            };
          }

          const refreshResponse = await withTimeout(
            fetch("/api/auth/refresh", {
              method: "POST",
              cache: "no-store",
            }).catch(() => null),
            AUTH_PROBE_TIMEOUT_MS,
          );

          if (!refreshResponse?.ok) {
            return {
              user: null,
              error: current.error,
              refreshed: false,
            };
          }

          const refreshed = await withTimeout(
            insforge.auth.getCurrentUser(),
            AUTH_PROBE_TIMEOUT_MS,
          );
          resolvedUser = !refreshed.error
            ? normalizeInsforgeUser(refreshed.data?.user ?? null)
            : null;

          return {
            user: resolvedUser,
            error: refreshed.error ?? current.error,
            refreshed: true,
          };
        };

        const { user: insforgeUser } = await resolveInsforgeUser();

        if (!cancelled && insforgeUser) {
          localStorage.removeItem("jwt_token");
          setUser(insforgeUser);
          setIsAuthenticated(true);
          setIsLoading(false);
          resolved = true;
          return;
        }
        }
      } catch (error) {
        // Fall back to the legacy bridge while the rest of auth is still migrating.
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
            return;
          }

          throw new Error("Invalid token");
        } catch (error) {
          localStorage.removeItem("jwt_token");
          if (!cancelled) {
            setUser(DEFAULT_GUEST_USER);
            setIsAuthenticated(true);
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
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
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

      if (payload.token) {
        localStorage.setItem("jwt_token", payload.token);
        localStorage.setItem("accessToken", payload.token);
      }
      localStorage.setItem("shothik_user", JSON.stringify(payload.user));
      localStorage.removeItem("guest_mode_enabled");
      setUser(payload.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = (): void => {
    void fetch("/api/auth/sign-out", { method: "POST" }).catch(() => undefined);
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("shothik_user");
    localStorage.removeItem("guest_mode_enabled");
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    country: string,
  ): Promise<{ requiresEmailVerification: boolean }> => {
    try {
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

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to create account.");
      }

      if (payload.token) {
        localStorage.setItem("jwt_token", payload.token);
        localStorage.setItem("accessToken", payload.token);
      }
      if (payload.user) {
        localStorage.setItem("shothik_user", JSON.stringify(payload.user));
        setUser(payload.user);
        setIsAuthenticated(true);
      }
      localStorage.removeItem("guest_mode_enabled");

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
