/**
 * Shothik AI Service Offerings & Adapters Catalog
 * 
 * Central entrypoint for all domain service adapters across NLP,
 * AI Detection, Plagiarism, Presentations, Sheets, and Twin Research.
 */

import { aiDetectorCheck } from "./ai-detector.service";
import { analyzePlagiarism } from "./plagiarismService";
import { detectAutoFreezeTerms } from "./paraphrase.service";
import { grammarCheck } from "./grammar-checker.service";
import { summarizeText as summarizeServiceFn } from "./summarize.service";
import { translateText as translateServiceFn } from "./translator.service";
import { createPresentationServer as createPresentationServerFn } from "./createPresentationServer";
import { TwinResearchDispatcher } from "./twin-research-dispatcher";

export * from "./ai-detector.service";
export * from "./auth.service";
export * from "./citationDetector";
export * from "./createPresentationServer";
export * from "./deerflow.service";
export * from "./grammar-checker.service";
export * from "./paraphrase.service";
export * from "./plagiarismService";
export * from "./pricing.service";
export * from "./slide-generation";
export * from "./summarize.service";
export * from "./translator.service";
export * from "./twin-research-dispatcher";
export * from "./unified-web-agent.service";
export * from "./wallet.service";
export * from "./writing-studio.service";
export * from "./agent-team.service";

// Core canonical function exports expected by services test suite and consumer surfaces
export const checkAiContent = aiDetectorCheck;
export const checkPlagiarism = analyzePlagiarism;
export const paraphraseText = detectAutoFreezeTerms;
export const checkGrammar = grammarCheck;
export const summarizeText = summarizeServiceFn;
export const translateText = translateServiceFn;
export const createPresentationServer = createPresentationServerFn;
export const dispatchTwinResearch = TwinResearchDispatcher.dispatchTask;
