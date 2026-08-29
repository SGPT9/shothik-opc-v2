import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

/**
 * Local Auth Fallback Router
 * Provides instant, zero-latency auth endpoints for offline development and local environments,
 * preventing upstream redirect loops on /api/auth/convex-token.
 */

router.post("/auth/convex-token", (req: Request, res: Response) => {
  res.status(200).json({
    token: "dev_convex_token_local",
    user: {
      id: "dev_user_local",
      name: "Developer",
      email: "dev@shothik.local",
      role: "admin",
    },
  });
});

router.get("/auth/session", (req: Request, res: Response) => {
  const cfEmail = req.headers["cf-access-authenticated-user-email"] as string | undefined;
  const cfCountry = req.headers["cf-ipcountry"] as string | undefined;
  const clientIp = req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const email = cfEmail || "dev@shothik.local";
  const name = cfEmail ? cfEmail.split("@")[0] : "Developer";
  const userId = cfEmail ? `cf_usr_${cfEmail.replace(/[^a-zA-Z0-9]/g, "_")}` : "dev_user_local";

  res.status(200).json({
    user: {
      id: userId,
      name,
      email,
      image: null,
      country: cfCountry || "BD",
      authProvider: cfEmail ? "cloudflare_access_zero_trust" : "local_dev",
    },
    clientIp: String(clientIp || "127.0.0.1"),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
});

router.get("/auth/csrf", (req: Request, res: Response) => {
  res.status(200).json({
    csrfToken: "shothik_local_csrf_token_dev",
  });
});

router.get("/auth/providers", (req: Request, res: Response) => {
  res.status(200).json({
    credentials: {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      signinUrl: "/api/auth/signin/credentials",
      callbackUrl: "/api/auth/callback/credentials",
    },
  });
});

export default router;
