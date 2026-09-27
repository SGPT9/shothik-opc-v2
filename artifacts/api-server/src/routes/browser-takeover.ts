import { Router } from "express";
import { globalBrowserEngine, browserActionInputSchema } from "../lib/browser/browser-takeover-engine";

export const browserTakeoverRouter = Router();

browserTakeoverRouter.get("/browser/sessions", (req, res) => {
  const owner = req.query.owner as string | undefined;
  const sessions = globalBrowserEngine.listSessions(owner);
  res.json({ success: true, count: sessions.length, sessions });
});

browserTakeoverRouter.post("/browser/sessions", (req, res) => {
  try {
    const owner = (req.body.owner as string) || "default-owner";
    const url = (req.body.url as string) || "https://news.ycombinator.com";
    const session = globalBrowserEngine.createSession(owner, url);
    res.status(201).json({ success: true, session });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

browserTakeoverRouter.get("/browser/sessions/:id", (req, res) => {
  const session = globalBrowserEngine.getSession(req.params.id);
  if (!session) {
    res.status(404).json({ success: false, error: "Session not found" });
    return;
  }
  res.json({ success: true, session });
});

browserTakeoverRouter.post("/browser/sessions/:id/action", (req, res) => {
  const parsed = browserActionInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.issues });
    return;
  }

  try {
    const result = globalBrowserEngine.executeAction(req.params.id, parsed.data);
    res.json({ ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

browserTakeoverRouter.post("/browser/sessions/:id/close", (req, res) => {
  try {
    const session = globalBrowserEngine.closeSession(req.params.id);
    res.json({ success: true, message: "Browser session closed", session });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
