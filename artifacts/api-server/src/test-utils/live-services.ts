import net from "node:net";
import fs from "node:fs";
import path from "node:path";

/**
 * Helpers for integration tests that need real external services
 * (Postgres, Redis, the Python bangla-audio-ai daemon, local skill folders).
 *
 * Tests gated with these helpers are skipped when the service is unreachable,
 * so CI without service containers stays green, while developers running
 * `docker-compose up` still exercise them. Set RUN_LIVE_INTEGRATION=1 to force
 * them to run (and fail loudly) regardless of reachability.
 */
const FORCE = process.env.RUN_LIVE_INTEGRATION === "1";

export function isTcpReachable(host: string, port: number, timeoutMs = 500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (ok: boolean) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs, () => done(false));
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
  });
}

function hostPortFromUrl(raw: string | undefined, fallbackHost: string, fallbackPort: number) {
  try {
    if (raw) {
      const u = new URL(raw);
      return { host: u.hostname || fallbackHost, port: Number(u.port) || fallbackPort };
    }
  } catch {
    /* fall through */
  }
  return { host: fallbackHost, port: fallbackPort };
}

export async function postgresAvailable(): Promise<boolean> {
  if (FORCE) return true;
  const { host, port } = hostPortFromUrl(process.env.DATABASE_URL, "127.0.0.1", 5432);
  return isTcpReachable(host, port);
}

export async function redisAvailable(): Promise<boolean> {
  if (FORCE) return true;
  const { host, port } = hostPortFromUrl(process.env.REDIS_URL, "127.0.0.1", 6379);
  return isTcpReachable(host, port);
}

export async function voiceDaemonAvailable(): Promise<boolean> {
  if (FORCE) return true;
  const { host, port } = hostPortFromUrl(process.env.BANGLA_AUDIO_AI_URL, "127.0.0.1", 8001);
  return isTcpReachable(host, port);
}

/** DeerFlow skills live in an untracked `deer-flow-backend/` checkout next to the repo. */
export function deerFlowSkillsAvailable(): boolean {
  if (FORCE) return true;
  const cwd = process.cwd();
  return [path.resolve(cwd, "../.."), path.resolve(cwd, ".."), cwd].some((root) =>
    fs.existsSync(path.join(root, "deer-flow-backend/skills/public")),
  );
}
