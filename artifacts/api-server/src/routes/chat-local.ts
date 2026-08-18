import { Router, type IRouter, type Request, type Response } from "express";
import { OllamaService } from "../lib/ollama-service";

const router: IRouter = Router();

// GET /api/auth/session — returns mock dev session so client never 401s
router.get("/auth/session", (_req: Request, res: Response) => {
  res.json({
    user: {
      id: "usr_shothik_dev_01",
      name: "Hermes Lead Engineer",
      email: "engineer@shothik.ai",
      image: "https://api.dicebear.com/7.x/bottts/svg?seed=Hermes",
      credits: 14250,
      tier: "enterprise_pro",
    },
    expires: new Date(Date.now() + 86400000 * 30).toISOString(),
  });
});

// POST /api/chat/stream or /api/chat
router.post("/chat/stream", async (req: Request, res: Response) => {
  const { messages, model, temperature } = req.body;
  const safeMessages = Array.isArray(messages) ? messages : [{ role: "user", content: req.body.prompt || "Hello" }];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    for await (const chunk of OllamaService.streamChat({ messages: safeMessages, model, temperature })) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ error: err?.message })}\n\n`);
    res.end();
  }
});

export default router;
