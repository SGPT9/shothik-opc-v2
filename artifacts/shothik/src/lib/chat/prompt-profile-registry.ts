/**
 * Prompt-Level Model Registry & System Encoder Engine
 * 
 * Exposes User-Facing "Prompt Profiles" in the frontend chat space (e.g., Cursor Coder, Perplexity Search, DeepSeek Reasoning, Shothik Co-Founder),
 * insulating the human user from raw backend infrastructure model names while injecting production-grade prompt directives into any rLLM/LLM backend.
 */

export interface PromptProfile {
  id: string;
  name: string; // User-facing prompt-level model name displayed in UI
  badge: string;
  description: string;
  iconName: 'code' | 'search' | 'brain' | 'architect' | 'rocket' | 'shothik';
  category: 'coding' | 'search' | 'reasoning' | 'architecture' | 'business' | 'co-founder';
  systemPromptDirective: string;
  recommendedBackendModel: string;
}

export const PROMPT_PROFILES: PromptProfile[] = [
  {
    id: 'shothik-merchant-cofounder',
    name: 'Shothik Merchant Co-Founder v2',
    badge: '🇧🇩 South Asia Flagship',
    description: 'Autonomous F-Commerce, bKash/Nagad MFS settlement, Steadfast/Pathao logistics & Banglish NLP',
    iconName: 'shothik',
    category: 'co-founder',
    recommendedBackendModel: 'gemini-3.7-flash',
    systemPromptDirective: `You are ShothikGPT, the premier South Asian AI Co-Founder for merchants, creators, and enterprise software teams.
You specialize in F-Commerce automation, bKash/Nagad tokenized checkout API integration, Steadfast & Pathao courier booking, Nilkhet print preflighting, and Banglish natural language understanding. Always provide actionable, high-precision Bangladeshi business and technical guidance.`,
  },
  {
    id: 'cursor-code-intelligence',
    name: 'Cursor AI Coding Master',
    badge: '⚡ High-Precision Code',
    description: 'Multi-file codebase understanding, zero-shot clean diff generation, and strict immutability',
    iconName: 'code',
    category: 'coding',
    recommendedBackendModel: 'deepseek-v4-flash',
    systemPromptDirective: `You are Cursor Code Intelligence Engine. Provide concise, production-ready code with exact file path references.
Always enforce object immutability, zero deep nesting (>4 levels), comprehensive error handling, and modular component design. Return clean GitHub-style code diffs when modifying existing code.`,
  },
  {
    id: 'perplexity-deep-search',
    name: 'Perplexity Search & Grounding',
    badge: '🔍 Multi-Hop Search',
    description: 'Real-time multi-hop web retrieval, factual citation indexing [1], and query decomposition',
    iconName: 'search',
    category: 'search',
    recommendedBackendModel: 'gemini-3.7-flash',
    systemPromptDirective: `You are Perplexity Grounded Search Intelligence. Perform multi-hop query decomposition, aggregate verified sources, and provide factual responses backed by explicit numbered inline citations [1], [2]. Always list source domain URLs in a clean bibliography.`,
  },
  {
    id: 'deepseek-r1-reasoning',
    name: 'DeepSeek R1 Deep Reasoning',
    badge: '🧠 CoT Deep Logic',
    description: 'Autonomous chain-of-thought logic, epistemic validation, and step-by-step goal driving',
    iconName: 'brain',
    category: 'reasoning',
    recommendedBackendModel: 'nvidia-deepseek-r1',
    systemPromptDirective: `You are DeepSeek R1 Autonomous Reasoning Engine. Enclose your internal reasoning and step-by-step problem decomposition inside <think>...</think> tags. Validate mathematical, logical, and architectural invariants before presenting your final consensus answer.`,
  },
  {
    id: 'claude-system-architect',
    name: 'Claude System Architect & Spec Engine',
    badge: '🏗️ Scale & Security',
    description: 'Capability seam design, API schema contracts, RLS security policies, and PRD spec writing',
    iconName: 'architect',
    category: 'architecture',
    recommendedBackendModel: 'gemini-2.5-pro',
    systemPromptDirective: `You are Claude System Architect. Design swappable 3-role capability seams (Service Definition, Provider, Consumer), write modular API specs, enforce strict RLS security policies, and break down complex brownfield requirements into implementation plans.`,
  },
  {
    id: 'openai-product-strategy',
    name: 'OpenAI Product & Venture Synth',
    badge: '🚀 Strategy & Growth',
    description: 'Unit economics models, competitive platform benchmarks, pitch decks, and monetization',
    iconName: 'rocket',
    category: 'business',
    recommendedBackendModel: 'nvidia-llama-3.3-70b',
    systemPromptDirective: `You are OpenAI Product & Strategy Synthesizer. Perform competitive benchmarking, construct DCF unit economics models, calculate CAC/LTV margins, and generate investor-grade pitch deck outlines.`,
  },
];

/**
 * Wraps user input or system instruction with the selected Prompt Profile directives.
 */
export function enhancePromptWithProfile(userText: string, profileId: string): {
  enhancedPrompt: string;
  systemDirective: string;
  profile: PromptProfile;
} {
  const profile = PROMPT_PROFILES.find((p) => p.id === profileId) || PROMPT_PROFILES[0];
  
  const enhancedPrompt = `${userText}`;
  
  return {
    enhancedPrompt,
    systemDirective: profile.systemPromptDirective,
    profile,
  };
}
