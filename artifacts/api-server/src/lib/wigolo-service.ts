import http from "node:http";
import net from "node:net";
import crypto from "node:crypto";

export interface WigoloSearchParams {
  query: string | string[];
  domains?: string[];
  maxResults?: number;
  timeRange?: "day" | "week" | "month" | "year";
  language?: string;
}

export interface WigoloSearchResultItem {
  title: string;
  url: string;
  excerpt: string;
  citationId: string;
  evidenceScore: number;
  engine: string;
}

export interface WigoloSearchResponse {
  query: string;
  results: WigoloSearchResultItem[];
  totalFound: number;
  engineUsed: string;
  cached: boolean;
  executedAt: string;
}

// In-memory fallback cache if Redis connection drops
const localMemoryCache = new Map<string, { data: WigoloSearchResponse; expires: number }>();

function formatResp(args: (string | number)[]): string {
  let res = `*${args.length}\r\n`;
  for (const arg of args) {
    const str = String(arg);
    res += `$${Buffer.byteLength(str)}\r\n${str}\r\n`;
  }
  return res;
}

/**
 * Robust raw Redis Client with streaming Buffer parsing for UTF-8 and multi-byte text.
 */
class SimpleRedisClient {
  private host: string;
  private port: number;

  constructor(redisUrl?: string) {
    const parsed = redisUrl ? new URL(redisUrl.replace("redis://", "http://")) : null;
    this.host = parsed?.hostname || "127.0.0.1";
    this.port = parsed?.port ? parseInt(parsed.port, 10) : 6379;
  }

  async get(key: string): Promise<string | null> {
    return new Promise((resolve) => {
      const socket = net.createConnection({ host: this.host, port: this.port }, () => {
        socket.write(formatResp(["GET", key]));
      });

      const chunks: Buffer[] = [];
      let totalBytes = 0;
      let expectedLength = -1;
      let headerParsed = false;
      let payloadOffset = 0;

      socket.setTimeout(800);

      socket.on("data", (chunk: Buffer | string) => {
        const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
        chunks.push(buf);
        totalBytes += buf.length;
        const all = Buffer.concat(chunks, totalBytes);

        if (!headerParsed) {
          const strHeader = all.toString("ascii", 0, Math.min(all.length, 32));
          if (strHeader.startsWith("$-1\r\n")) {
            socket.destroy();
            resolve(null);
            return;
          }
          if (strHeader.startsWith("$")) {
            const rn = all.indexOf("\r\n");
            if (rn !== -1) {
              expectedLength = parseInt(all.toString("ascii", 1, rn), 10);
              payloadOffset = rn + 2;
              headerParsed = true;
            }
          } else if (strHeader.startsWith("-ERR") || strHeader.startsWith("+")) {
            socket.destroy();
            resolve(null);
            return;
          }
        }

        if (headerParsed && expectedLength >= 0) {
          if (totalBytes >= payloadOffset + expectedLength) {
            const payload = all.toString("utf8", payloadOffset, payloadOffset + expectedLength);
            socket.destroy();
            resolve(payload);
          }
        }
      });

      socket.on("timeout", () => {
        socket.destroy();
        resolve(null);
      });

      socket.on("error", () => {
        socket.destroy();
        resolve(null);
      });
    });
  }

  async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
    return new Promise((resolve) => {
      const socket = net.createConnection({ host: this.host, port: this.port }, () => {
        socket.write(formatResp(["SET", key, value, "EX", ttlSeconds]));
      });

      socket.setTimeout(800);
      socket.on("data", () => {
        socket.destroy();
        resolve();
      });
      socket.on("timeout", () => {
        socket.destroy();
        resolve();
      });
      socket.on("error", () => {
        socket.destroy();
        resolve();
      });
    });
  }
}

const redis = new SimpleRedisClient(process.env.REDIS_URL || "redis://127.0.0.1:6379");

export class WigoloWebIntelligenceService {
  private static getSearxngUrl(): string {
    return process.env.SEARXNG_URL || "http://127.0.0.1:8888";
  }

  /**
   * Local-First Keyless Web Search & Rank Fusion via SearXNG & Redis.
   */
  static async searchWeb(params: WigoloSearchParams): Promise<WigoloSearchResponse> {
    const queryStr = (Array.isArray(params.query) ? params.query.join(" ") : params.query).trim();
    const maxResults = params.maxResults || 10;
    const cacheKey = `wigolo:search:${crypto.createHash("sha256").update(queryStr + "_" + maxResults).digest("hex")}`;

    // 1. Check Redis Cache
    try {
      const cachedStr = await redis.get(cacheKey);
      if (cachedStr) {
        const cachedObj = JSON.parse(cachedStr) as WigoloSearchResponse;
        cachedObj.cached = true;
        return cachedObj;
      }
    } catch {
      // Redis fallback to in-memory
      const local = localMemoryCache.get(cacheKey);
      if (local && local.expires > Date.now()) {
        return { ...local.data, cached: true };
      }
    }

    // 2. Query Local SearXNG Instance
    const searxngBase = this.getSearxngUrl().replace(/\/$/, "");
    const searchUrl = `${searxngBase}/search?q=${encodeURIComponent(queryStr)}&format=json`;

    const searxngData = await new Promise<{ results?: Array<Record<string, unknown>> }>((resolve) => {
      const req = http.get(searchUrl, { timeout: 6000 }, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve({ results: [] });
          }
        });
      });
      req.on("error", () => resolve({ results: [] }));
      req.on("timeout", () => {
        req.destroy();
        resolve({ results: [] });
      });
    });

    const rawResults = searxngData.results || [];
    const results: WigoloSearchResultItem[] = rawResults.slice(0, maxResults).map((r, i) => {
      const title = String(r.title || "No Title");
      const url = String(r.url || "");
      const excerpt = String(r.content || "");
      const engine = String(r.engine || "searxng-rank-fusion");

      // Calculate confidence / evidence weight based on academic/domain quality
      let evidenceScore = 0.85;
      if (url.includes(".edu") || url.includes(".ac.bd") || url.includes("wikipedia.org") || url.includes("arxiv.org")) {
        evidenceScore = 0.98;
      } else if (url.includes(".gov") || url.includes("researchgate.net")) {
        evidenceScore = 0.94;
      }

      return {
        title,
        url,
        excerpt,
        citationId: `src-${i + 1}`,
        evidenceScore,
        engine,
      };
    });

    const response: WigoloSearchResponse = {
      query: queryStr,
      results,
      totalFound: results.length,
      engineUsed: "wigolo-searxng-local",
      cached: false,
      executedAt: new Date().toISOString(),
    };

    // 3. Cache Result in Redis (1 hour)
    if (results.length > 0) {
      try {
        await redis.set(cacheKey, JSON.stringify(response), 3600);
      } catch {
        localMemoryCache.set(cacheKey, { data: response, expires: Date.now() + 3600000 });
      }
    }

    return response;
  }
}
