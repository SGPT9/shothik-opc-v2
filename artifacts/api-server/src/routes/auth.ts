import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { logger } from "../lib/logger";

const router: IRouter = Router();

export interface StoredUser {
  id: string;
  _id: string; // for backward compatibility with frontend
  name: string;
  email: string;
  passwordHash?: string;
  role: string;
  country: string;
  credits: number;
  tier: string;
  authProvider: string;
  createdAt: string;
}

const USERS_FILE_PATH = path.resolve(process.cwd(), "artifacts/api-server/data/users.json");

// In-memory cache + persistent file storage
const usersByEmail = new Map<string, StoredUser>();
const usersById = new Map<string, StoredUser>();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, combined: string): boolean {
  try {
    const [salt, storedHash] = combined.split(":");
    if (!salt || !storedHash) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "shothik_unified_auth_secret_2026_bd";

function generateToken(userId: string, email: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      email,
      exp: Date.now() + 30 * 24 * 3600 * 1000, // 30 days
    })
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (data.exp && data.exp < Date.now()) return null;
    return { userId: data.userId, email: data.email };
  } catch {
    return null;
  }
}

function persistUsers(): void {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const allUsers = Array.from(usersById.values());
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(allUsers, null, 2), "utf-8");
  } catch (err: any) {
    logger.error({ error: err.message }, "[Auth] Failed to persist users file");
  }
}

function loadUsers(): void {
  try {
    if (fs.existsSync(USERS_FILE_PATH)) {
      const raw = fs.readFileSync(USERS_FILE_PATH, "utf-8");
      const list: StoredUser[] = JSON.parse(raw);
      for (const u of list) {
        usersByEmail.set(u.email.toLowerCase(), u);
        usersById.set(u.id, u);
      }
    }
  } catch (err: any) {
    logger.warn({ error: err.message }, "[Auth] Initializing fresh users table");
  }

  // Pre-seed developer and tester accounts if not present
  if (!usersByEmail.has("dev@shothik.local")) {
    const devUser: StoredUser = {
      id: "dev_user_local",
      _id: "dev_user_local",
      name: "Developer",
      email: "dev@shothik.local",
      passwordHash: hashPassword("Developer123!"),
      role: "admin",
      country: "BD",
      credits: 1500,
      tier: "enterprise",
      authProvider: "local_dev",
      createdAt: new Date().toISOString(),
    };
    usersByEmail.set(devUser.email.toLowerCase(), devUser);
    usersById.set(devUser.id, devUser);
  }

  if (!usersByEmail.has("tester@shothik.ai")) {
    const testerUser: StoredUser = {
      id: "usr_tester_shothik_01",
      _id: "usr_tester_shothik_01",
      name: "Shothik Beta Tester",
      email: "tester@shothik.ai",
      passwordHash: hashPassword("Tester123!"),
      role: "user",
      country: "BD",
      credits: 500,
      tier: "starter",
      authProvider: "credentials",
      createdAt: new Date().toISOString(),
    };
    usersByEmail.set(testerUser.email.toLowerCase(), testerUser);
    usersById.set(testerUser.id, testerUser);
  }

  persistUsers();
}

// Initialize users on boot
loadUsers();

function sanitizeUser(user: StoredUser) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const tokenHeader = req.headers["x-auth-token"] || req.headers["x-access-token"];
  if (typeof tokenHeader === "string" && tokenHeader.trim()) {
    return tokenHeader.trim();
  }
  // Check cookie if cookie-parser is mounted
  if ((req as any).cookies?.shothik_session) {
    return (req as any).cookies.shothik_session;
  }
  return null;
}

/**
 * POST /api/auth/sign-up
 * Registers a new user account with 500 starter credits
 */
router.post(["/auth/sign-up", "/v1/auth/sign-up", "/sign-up"], (req: Request, res: Response) => {
  try {
    const { name, email, password, country = "BD" } = req.body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Full name is required." });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "A valid email address is required." });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (usersByEmail.has(normalizedEmail)) {
      return res.status(409).json({ success: false, message: "An account with this email already exists. Please sign in." });
    }

    const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const newUser: StoredUser = {
      id: userId,
      _id: userId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: "user",
      country: String(country || "BD"),
      credits: 500, // Welcome gift of 500 credits
      tier: "starter",
      authProvider: "credentials",
      createdAt: new Date().toISOString(),
    };

    usersByEmail.set(normalizedEmail, newUser);
    usersById.set(userId, newUser);
    persistUsers();

    const token = generateToken(userId, normalizedEmail);

    logger.info({ userId, email: normalizedEmail }, "[Auth] New user registered successfully");

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      requiresEmailVerification: false,
      token,
      user: sanitizeUser(newUser),
    });
  } catch (err: any) {
    logger.error({ error: err.message }, "[Auth] Sign-up failed");
    return res.status(500).json({ success: false, message: "Internal server error during registration." });
  }
});

/**
 * POST /api/auth/sign-in
 * Authenticates user credentials and returns session token
 */
router.post(["/auth/sign-in", "/v1/auth/sign-in", "/sign-in"], (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = usersByEmail.get(normalizedEmail);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user.id, user.email);

    logger.info({ userId: user.id, email: user.email }, "[Auth] User signed in successfully");

    return res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      token,
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    logger.error({ error: err.message }, "[Auth] Sign-in failed");
    return res.status(500).json({ success: false, message: "Internal server error during sign-in." });
  }
});

/**
 * POST /api/auth/sign-out
 * Clears user session
 */
router.post(["/auth/sign-out", "/v1/auth/sign-out", "/sign-out"], (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Signed out successfully." });
});

/**
 * GET /api/auth/session
 * Returns authenticated user context based on token, header, or Cloudflare Access
 */
router.get(["/auth/session", "/v1/auth/session", "/session"], (req: Request, res: Response) => {
  const token = extractToken(req);

  if (token) {
    const verified = verifyToken(token);
    if (verified) {
      const user = usersById.get(verified.userId) || usersByEmail.get(verified.email.toLowerCase());
      if (user) {
        return res.status(200).json({
          user: sanitizeUser(user),
          expires: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        });
      }
    }
  }

  // Cloudflare Zero Trust header support
  const cfEmail = req.headers["cf-access-authenticated-user-email"] as string | undefined;
  if (cfEmail) {
    let user = usersByEmail.get(cfEmail.toLowerCase());
    if (!user) {
      const userId = `cf_usr_${cfEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
      user = {
        id: userId,
        _id: userId,
        name: cfEmail.split("@")[0] || "Cloudflare User",
        email: cfEmail.toLowerCase(),
        role: "user",
        country: (req.headers["cf-ipcountry"] as string) || "BD",
        credits: 500,
        tier: "starter",
        authProvider: "cloudflare_access_zero_trust",
        createdAt: new Date().toISOString(),
      };
      usersByEmail.set(user.email, user);
      usersById.set(user.id, user);
      persistUsers();
    }
    return res.status(200).json({
      user: sanitizeUser(user),
      expires: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    });
  }

  // Fallback dev account if explicitly requested via query or header
  const isDevExplicit = req.query.dev === "1" || req.headers["x-dev-mode"] === "true";
  if (isDevExplicit) {
    const devUser = usersByEmail.get("dev@shothik.local");
    return res.status(200).json({
      user: devUser ? sanitizeUser(devUser) : null,
      expires: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    });
  }

  // Unauthenticated visitor
  const clientIp = req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  return res.status(200).json({
    user: null,
    clientIp: String(clientIp || "127.0.0.1"),
    expires: null,
  });
});

/**
 * GET /api/auth/oauth/google
 * Test Google sign-in simulation for immediate tester onboarding
 */
router.get(["/auth/oauth/google", "/v1/auth/oauth/google"], (req: Request, res: Response) => {
  const nextPath = (req.query.next as string) || "/twin";
  
  // Provision or retrieve demo Google tester
  const googleEmail = "tester.google@shothik.ai";
  let user = usersByEmail.get(googleEmail);
  if (!user) {
    const userId = "usr_google_test_01";
    user = {
      id: userId,
      _id: userId,
      name: "Google Beta Tester",
      email: googleEmail,
      role: "user",
      country: "BD",
      credits: 500,
      tier: "starter",
      authProvider: "google",
      createdAt: new Date().toISOString(),
    };
    usersByEmail.set(googleEmail, user);
    usersById.set(userId, user);
    persistUsers();
  }

  const token = generateToken(user.id, user.email);

  // Return a small HTML redirect that writes the token into localStorage and forwards to the app
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Signing in with Google...</title></head>
      <body style="background:#0b101b;color:#e2e8f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
        <div style="text-align:center;">
          <h2 style="color:#10b981;">Google Authentication Successful</h2>
          <p>Redirecting to your workspace...</p>
        </div>
        <script>
          localStorage.setItem("jwt_token", "${token}");
          localStorage.setItem("accessToken", "${token}");
          localStorage.setItem("shothik_user", ${JSON.stringify(JSON.stringify(sanitizeUser(user)))});
          window.location.replace("${decodeURIComponent(nextPath)}");
        </script>
      </body>
    </html>
  `);
});

router.post("/auth/convex-token", (req: Request, res: Response) => {
  const token = extractToken(req);
  if (token) {
    const verified = verifyToken(token);
    if (verified) {
      const user = usersById.get(verified.userId) || usersByEmail.get(verified.email.toLowerCase());
      if (user) {
        return res.status(200).json({ token, user: sanitizeUser(user) });
      }
    }
  }

  return res.status(200).json({
    token: "dev_convex_token_local",
    user: {
      id: "dev_user_local",
      name: "Developer",
      email: "dev@shothik.local",
      role: "admin",
    },
  });
});

router.get("/auth/csrf", (_req: Request, res: Response) => {
  res.status(200).json({
    csrfToken: "shothik_csrf_token_" + crypto.randomBytes(8).toString("hex"),
  });
});

router.get("/auth/providers", (_req: Request, res: Response) => {
  res.status(200).json({
    credentials: {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      signinUrl: "/api/auth/sign-in",
      callbackUrl: "/api/auth/session",
    },
    google: {
      id: "google",
      name: "Google",
      type: "oauth",
      signinUrl: "/api/auth/oauth/google",
    },
  });
});

router.post(["/auth/login", "/v1/auth/login", "/login"], (req: Request, res: Response) => {
  try {
    const { email, password, oneTapUser } = req.body || {};

    if (oneTapUser && email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      let user = usersByEmail.get(normalizedEmail);
      if (!user) {
        const userId = `usr_onetap_${Date.now()}`;
        user = {
          id: userId,
          _id: userId,
          name: normalizedEmail.split("@")[0] || "User",
          email: normalizedEmail,
          role: "user",
          country: "BD",
          credits: 500,
          tier: "starter",
          authProvider: "onetap",
          createdAt: new Date().toISOString(),
        };
        usersByEmail.set(normalizedEmail, user);
        usersById.set(userId, user);
        persistUsers();
      }
      const token = generateToken(user.id, user.email);
      return res.status(200).json({
        success: true,
        message: "Signed in successfully.",
        token,
        data: sanitizeUser(user),
        user: sanitizeUser(user),
      });
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = usersByEmail.get(normalizedEmail);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user.id, user.email);
    return res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      token,
      data: sanitizeUser(user),
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    logger.error({ error: err.message }, "[Auth] Legacy /auth/login failed");
    return res.status(500).json({ success: false, message: "Internal server error during sign-in." });
  }
});

router.post(["/auth/register", "/v1/auth/register", "/register"], (req: Request, res: Response) => {
  try {
    const { name, email, password, country = "BD" } = req.body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "Full name is required." });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "A valid email address is required." });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (usersByEmail.has(normalizedEmail)) {
      return res.status(409).json({ success: false, message: "An account with this email already exists. Please sign in." });
    }

    const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const newUser: StoredUser = {
      id: userId,
      _id: userId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: "user",
      country: String(country || "BD"),
      credits: 500,
      tier: "starter",
      authProvider: "credentials",
      createdAt: new Date().toISOString(),
    };

    usersByEmail.set(normalizedEmail, newUser);
    usersById.set(userId, newUser);
    persistUsers();

    const token = generateToken(userId, normalizedEmail);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      data: sanitizeUser(newUser),
      user: sanitizeUser(newUser),
    });
  } catch (err: any) {
    logger.error({ error: err.message }, "[Auth] Legacy /auth/register failed");
    return res.status(500).json({ success: false, message: "Internal server error during registration." });
  }
});

router.get(["/user/profile", "/v1/user/profile", "/user/me"], (req: Request, res: Response) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized. Missing token." });
  }

  const verified = verifyToken(token);
  if (!verified) {
    return res.status(401).json({ success: false, message: "Unauthorized. Invalid or expired token." });
  }

  const user = usersById.get(verified.userId) || usersByEmail.get(verified.email.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  return res.status(200).json({
    success: true,
    data: sanitizeUser(user),
    user: sanitizeUser(user),
  });
});

router.post(["/user/profile-update", "/v1/user/profile-update"], (req: Request, res: Response) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }
  const verified = verifyToken(token);
  if (!verified) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }
  const user = usersById.get(verified.userId) || usersByEmail.get(verified.email.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  const { name, country } = req.body || {};
  if (name && typeof name === "string") user.name = name.trim();
  if (country && typeof country === "string") user.country = country.trim();
  persistUsers();

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: sanitizeUser(user),
    user: sanitizeUser(user),
  });
});

router.get(["/auth/token-generate", "/v1/auth/token-generate"], (req: Request, res: Response) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }
  const verified = verifyToken(token);
  if (!verified) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }
  const user = usersById.get(verified.userId) || usersByEmail.get(verified.email.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }
  const freshToken = generateToken(user.id, user.email);
  return res.status(200).json({
    success: true,
    token: freshToken,
    data: { token: freshToken, user: sanitizeUser(user) },
  });
});

router.post(["/auth/logout", "/v1/auth/logout"], (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Logged out successfully." });
});

export default router;

