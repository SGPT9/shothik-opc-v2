
import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "./AuthProvider";
import { getSanitizedConvexUrl } from "@/lib/convex-url";

// Only initialise a real client when a valid Convex URL is configured.
// A valid Convex URL looks like https://<name>.convex.cloud
const convexUrl = getSanitizedConvexUrl();
const isValidConvexUrl =
  convexUrl &&
  /^https?:\/\/.+\.convex\.cloud/.test(convexUrl) &&
  !convexUrl.includes("placeholder");

let convex = null;
try {
  convex = new ConvexReactClient(convexUrl);
} catch (e) {
  console.warn("[ConvexClientProvider] Failed to init Convex client:", e);
}

function useAuthFromAuthProvider() {
  const { user: authUser, isAuthenticated: authIsAuthenticated, isLoading: authIsLoading } = useAuth();
  const reduxAccessToken = useSelector((state) => state.auth?.accessToken);
  const reduxUser = useSelector((state) => state.auth?.user);

  const user = authUser || reduxUser;
  const isAuthenticated = authIsAuthenticated || (!!reduxAccessToken && !!reduxUser?._id);
  const accessToken = reduxAccessToken || (authUser ? "insforge-authenticated-session" : null);

  const [convexToken, setConvexToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastTokenRef = useRef(null);


  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      setConvexToken(null);
      lastTokenRef.current = null;
      return;
    }
    const tokenKey = `${accessToken || "session"}:${user._id}`;
    if (tokenKey === lastTokenRef.current) return;

    let cancelled = false;
    setIsLoading(true);

    async function exchangeToken() {
      try {
        const res = await fetch("/api/auth/convex-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, user }),
        });
        if (!res.ok) {
          if (!cancelled) { setConvexToken(null); setIsLoading(false); }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setConvexToken(data.token);
          lastTokenRef.current = tokenKey;
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("[Convex] Token exchange error:", err);
        if (!cancelled) { setConvexToken(null); setIsLoading(false); }
      }
    }

    exchangeToken();
    return () => { cancelled = true; };
  }, [isAuthenticated, accessToken, user?._id]);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }) => {
      if (forceRefreshToken) lastTokenRef.current = null;
      if (!convexToken) return null;
      return convexToken;
    },
    [convexToken]
  );

  return useMemo(
    () => ({
      isLoading: authIsLoading || isLoading,
      isAuthenticated: isAuthenticated && !!convexToken,
      fetchAccessToken,
    }),
    [authIsLoading, isLoading, isAuthenticated, convexToken, fetchAccessToken]
  );
}

export default function ConvexClientProvider({ children }) {
  if (!convex) {
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuthFromAuthProvider}>
      {children}
    </ConvexProviderWithAuth>
  );
}

