import { z } from "zod";

/**
 * Model Mesh compute tiers reflecting demographic hardware profiles
 */
export const ComputeTierSchema = z.enum([
  "tier0_needle_edge",      // <28MB RAM: Cactus Needle 2 on 2GB phones
  "tier1_function_gemma",    // 270M SLM: Fast structured JSON tool calling
  "tier2_colibri_vps",       // Free C inference engine on Hostinger VPS
  "tier3_airllm_overnight",  // AirLLM layer streaming for 70B+ batch novel/research
  "tier4_cloud_frontier",    // Gemini 3.7 / DeepSeek V3 cloud frontier
]);
export type ComputeTier = z.infer<typeof ComputeTierSchema>;

/**
 * Switchyard multi-protocol translation request
 */
export const SwitchyardRouteRequestSchema = z.object({
  sourceProtocol: z.enum(["openai_chat", "anthropic_messages", "openai_responses"]),
  targetBackend: z.enum(["colibri_vps", "ollama_local", "deepseek_cloud", "gemini_cloud"]),
  prompt: z.string(),
  tools: z.array(z.record(z.unknown())).optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().positive().default(2048),
  deviceMemoryGb: z.number().default(2),
  isOffline: z.boolean().default(false),
});
export type SwitchyardRouteRequest = z.infer<typeof SwitchyardRouteRequestSchema>;

/**
 * Soup fine-tuning task configuration request
 */
export const SoupFineTuneRequestSchema = z.object({
  jobId: z.string(),
  baseModel: z.enum(["Qwen/Qwen2.5-1.5B-Instruct", "Qwen/Qwen2.5-7B-Instruct", "meta-llama/Llama-3.1-8B-Instruct"]),
  datasetPath: z.string(),
  streamLayers: z.boolean().default(true), // 4GB VRAM layer-streaming
  quantizationFormat: z.enum(["nf4", "q4_k_m", "gguf"]).default("nf4"),
  targetDomain: z.enum(["fcommerce_banglish_twin", "nbr_tax_law", "author_prose_cloner"]),
  epochs: z.number().int().positive().default(3),
  learningRate: z.number().positive().default(2e-4),
});
export type SoupFineTuneRequest = z.infer<typeof SoupFineTuneRequestSchema>;
