import { randomUUID } from "node:crypto";
import { z } from "zod";

export const browserActionInputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("click"),
    x: z.number().int().min(0).max(1280),
    y: z.number().int().min(0).max(800),
  }),
  z.object({
    type: z.literal("text"),
    text: z.string().max(2000),
  }),
  z.object({
    type: z.literal("key"),
    key: z.enum(["Enter", "Tab", "Backspace", "Escape", "ArrowUp", "ArrowDown"]),
  }),
  z.object({
    type: z.literal("scroll"),
    deltaY: z.number().int().min(-5000).max(5000),
  }),
  z.object({
    type: z.literal("navigate"),
    url: z.string().url(),
  }),
]);

export type BrowserActionInput = z.infer<typeof browserActionInputSchema>;

export interface HandoverEvent {
  event: "computer.help_requested" | "computer.control_taken" | "computer.control_released";
  timestamp: string;
  actor: string;
  details?: string;
}

export interface BrowserSessionRecord {
  id: string;
  owner: string;
  url: string;
  title: string;
  status: "idle" | "active" | "closed" | "error";
  controlHolder: "agent" | "human";
  helpRequested: boolean;
  helpReason?: string;
  handoverLog: HandoverEvent[];
  viewport: { width: number; height: number };
  createdAt: string;
  updatedAt: string;
  lastScreenshotBase64?: string;
  history: string[];
}

export class BrowserTakeoverEngine {
  private sessions = new Map<string, BrowserSessionRecord>();

  // SSRF blocklist: Prevents navigation to internal networks, metadata services, and localhosts
  validatePublicUrl(urlString: string): URL {
    const parsed = new URL(urlString);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error(`Invalid protocol: ${parsed.protocol}. Only HTTP and HTTPS are permitted.`);
    }

    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "169.254.169.254" || // AWS/GCP metadata service
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      (host.startsWith("172.") && Number(host.split(".")[1]) >= 16 && Number(host.split(".")[1]) <= 31)
    ) {
      throw new Error(`SSRF Block: Access to private or loopback host '${host}' is strictly forbidden.`);
    }

    return parsed;
  }

  createSession(owner: string, initialUrl = "https://news.ycombinator.com"): BrowserSessionRecord {
    const validated = this.validatePublicUrl(initialUrl);
    const id = randomUUID();
    const now = new Date().toISOString();

    const session: BrowserSessionRecord = {
      id,
      owner,
      url: validated.href,
      title: `Session on ${validated.hostname}`,
      status: "active",
      controlHolder: "agent",
      helpRequested: false,
      handoverLog: [],
      viewport: { width: 1280, height: 800 },
      createdAt: now,
      updatedAt: now,
      history: [validated.href],
      // Simulated 1x1 dummy PNG frame placeholder until real frame is captured
      lastScreenshotBase64: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='800'><rect width='100%' height='100%' fill='%23111827'/><text x='50%' y='50%' fill='%239CA3AF' font-family='sans-serif' font-size='24' text-anchor='middle'>Agent Browser Viewport: " + validated.hostname + "</text></svg>",
    };

    this.sessions.set(id, session);
    return session;
  }

  getSession(id: string): BrowserSessionRecord | null {
    return this.sessions.get(id) || null;
  }

  listSessions(owner?: string): BrowserSessionRecord[] {
    const list: BrowserSessionRecord[] = [];
    for (const s of this.sessions.values()) {
      if (!owner || s.owner === owner) {
        list.push(s);
      }
    }
    return list;
  }

  requestHelp(sessionId: string, reason: string): { success: boolean; session: BrowserSessionRecord; message: string } {
    const session = this.getSession(sessionId);
    if (!session) throw new Error("Browser session not found");
    session.helpRequested = true;
    session.helpReason = reason;
    session.updatedAt = new Date().toISOString();
    session.handoverLog.unshift({
      event: "computer.help_requested",
      timestamp: session.updatedAt,
      actor: "Agent Twin",
      details: reason,
    });
    this.sessions.set(sessionId, session);
    return {
      success: true,
      session,
      message: `Help requested: ${reason}. Awaiting human takeover.`,
    };
  }

  takeWheel(sessionId: string, humanActor = "Merchant"): { success: boolean; session: BrowserSessionRecord; message: string } {
    const session = this.getSession(sessionId);
    if (!session) throw new Error("Browser session not found");
    session.controlHolder = "human";
    session.helpRequested = false;
    session.updatedAt = new Date().toISOString();
    session.handoverLog.unshift({
      event: "computer.control_taken",
      timestamp: session.updatedAt,
      actor: humanActor,
      details: "Merchant took direct control of browser canvas. Autonomous agent commands will be refused.",
    });
    this.sessions.set(sessionId, session);
    return {
      success: true,
      session,
      message: "Human operator has taken the wheel. Agent execution locked.",
    };
  }

  releaseControl(sessionId: string, humanActor = "Merchant"): { success: boolean; session: BrowserSessionRecord; message: string } {
    const session = this.getSession(sessionId);
    if (!session) throw new Error("Browser session not found");
    session.controlHolder = "agent";
    session.helpRequested = false;
    session.helpReason = undefined;
    session.updatedAt = new Date().toISOString();
    session.handoverLog.unshift({
      event: "computer.control_released",
      timestamp: session.updatedAt,
      actor: humanActor,
      details: "Control released back to Agent Twin. Autonomous execution safely resumed.",
    });
    this.sessions.set(sessionId, session);
    return {
      success: true,
      session,
      message: "Control returned to Agent Twin. Autonomous execution safely resumed.",
    };
  }

  executeAction(
    sessionId: string,
    action: BrowserActionInput,
    actor: "agent" | "human" = "agent"
  ): { success: boolean; session: BrowserSessionRecord; message: string; refused?: boolean } {
    const session = this.getSession(sessionId);
    if (!session) throw new Error("Browser session not found");
    if (session.status === "closed") throw new Error("Browser session is closed");

    // HITL Refusal Gate (OpenBot Refusal Rule): If human has taken the wheel, refuse bot commands
    if (actor === "agent" && session.controlHolder === "human") {
      return {
        success: false,
        refused: true,
        session,
        message: "Action refused: human operator is driving ('Take the wheel' active). Agent commands locked.",
      };
    }

    session.updatedAt = new Date().toISOString();
    let message = "";

    switch (action.type) {
      case "navigate": {
        const target = this.validatePublicUrl(action.url);
        session.url = target.href;
        session.title = `Navigated to ${target.hostname}`;
        session.history.push(target.href);
        message = `Navigated to ${target.href}`;
        break;
      }
      case "click": {
        // Coordinate normalization check
        message = `Simulated click at coordinates (${action.x}, ${action.y}) on viewport (${session.viewport.width}x${session.viewport.height})`;
        break;
      }
      case "text": {
        message = `Typed '${action.text}' into active input field`;
        break;
      }
      case "key": {
        message = `Dispatched key event: ${action.key}`;
        break;
      }
      case "scroll": {
        message = `Scrolled viewport by ${action.deltaY}px`;
        break;
      }
    }

    this.sessions.set(sessionId, session);
    return { success: true, session, message };
  }

  closeSession(sessionId: string): BrowserSessionRecord {
    const session = this.getSession(sessionId);
    if (!session) throw new Error("Browser session not found");
    session.status = "closed";
    session.updatedAt = new Date().toISOString();
    this.sessions.set(sessionId, session);
    return session;
  }
}

export const globalBrowserEngine = new BrowserTakeoverEngine();
