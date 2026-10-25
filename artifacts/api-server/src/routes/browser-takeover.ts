import { Router } from "express";
import { globalBrowserEngine, browserActionInputSchema } from "../lib/browser/browser-takeover-engine";

export const browserTakeoverRouter = Router();

browserTakeoverRouter.get(["/browser/sessions", "/v1/browser/sessions", "/api/v1/browser/sessions"], (req, res) => {
  const owner = req.query.owner as string | undefined;
  const sessions = globalBrowserEngine.listSessions(owner);
  res.json({ success: true, count: sessions.length, sessions });
});

browserTakeoverRouter.post(["/browser/sessions", "/v1/browser/sessions", "/api/v1/browser/sessions"], (req, res) => {
  try {
    const owner = (req.body.owner as string) || "default-owner";
    const url = (req.body.url as string) || "https://news.ycombinator.com";
    const session = globalBrowserEngine.createSession(owner, url);
    res.status(201).json({ success: true, session });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

browserTakeoverRouter.get(["/browser/sessions/:id", "/v1/browser/sessions/:id", "/api/v1/browser/sessions/:id"], (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const session = globalBrowserEngine.getSession(id);
  if (!session) {
    res.status(404).json({ success: false, error: "Session not found" });
    return;
  }
  res.json({ success: true, session });
});

browserTakeoverRouter.post(["/browser/sessions/:id/action", "/v1/browser/sessions/:id/action", "/api/v1/browser/sessions/:id/action"], (req, res) => {
  const parsed = browserActionInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.issues });
    return;
  }

  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const actor = (req.body.actor as "agent" | "human") || "agent";
    const result = globalBrowserEngine.executeAction(id, parsed.data, actor);
    res.json({ ...result, action: parsed.data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

browserTakeoverRouter.post(["/browser/sessions/:id/help-request", "/v1/browser/sessions/:id/help-request", "/api/v1/browser/sessions/:id/help-request"], (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reason = (req.body.reason as string) || "Automated agent encountered an OTP / verification challenge.";
    const result = globalBrowserEngine.requestHelp(id, reason);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

browserTakeoverRouter.post(["/browser/sessions/:id/take-wheel", "/v1/browser/sessions/:id/take-wheel", "/api/v1/browser/sessions/:id/take-wheel"], (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const actor = (req.body.actor as string) || "Merchant";
    const result = globalBrowserEngine.takeWheel(id, actor);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

browserTakeoverRouter.post(["/browser/sessions/:id/release-control", "/v1/browser/sessions/:id/release-control", "/api/v1/browser/sessions/:id/release-control"], (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const actor = (req.body.actor as string) || "Merchant";
    const result = globalBrowserEngine.releaseControl(id, actor);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

browserTakeoverRouter.post(["/browser/sessions/:id/close", "/v1/browser/sessions/:id/close", "/api/v1/browser/sessions/:id/close"], (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const session = globalBrowserEngine.closeSession(id);
    res.json({ success: true, message: "Browser session closed", session });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
