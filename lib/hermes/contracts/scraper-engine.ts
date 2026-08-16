import { z } from "zod";

/**
 * Supported scraper engines in our unified extraction suite
 */
export const ScraperEngineSchema = z.enum(["scrapling", "scrapegraph_ai", "agent_reach", "crawl4ai"]);
export type ScraperEngine = z.infer<typeof ScraperEngineSchema>;

/**
 * Universal web extraction request
 */
export const WebExtractionRequestSchema = z.object({
  url: z.string().url(),
  engine: ScraperEngineSchema.default("scrapling"),
  bypassAntiBot: z.boolean().default(true),
  targetSchema: z.record(z.unknown()).optional(), // Optional JSON schema for ScrapeGraphAI
  renderJavaScript: z.boolean().default(false),
  timeoutMs: z.number().int().positive().default(15000),
});
export type WebExtractionRequest = z.infer<typeof WebExtractionRequestSchema>;

/**
 * Web extraction response
 */
export const WebExtractionResponseSchema = z.object({
  success: z.boolean(),
  engineUsed: ScraperEngineSchema,
  url: z.string(),
  title: z.string().optional(),
  cleanMarkdown: z.string(),
  structuredJson: z.record(z.unknown()).optional(),
  executionTimeMs: z.number().nonnegative(),
  httpStatusCode: z.number().int(),
  extractedAt: z.string(),
});
export type WebExtractionResponse = z.infer<typeof WebExtractionResponseSchema>;
