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
  res.status(200).json({
    user: {
      id: "dev_user_local",
      name: "Developer",
      email: "dev@shothik.local",
      image: null,
    },
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
