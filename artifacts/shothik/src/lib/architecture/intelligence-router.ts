/**
 * ShothikGPT 12-Pillar Reference Architecture — Pillar 3: Intelligence Routing Plane
 * 
 * Routes incoming intents dynamically:
 *   Intent ➔ Complexity Assessment ➔ Model Selection ➔ Tool Selection ➔ Agent Selection ➔ Cost/Latency Policy
 */

import { PROMPT_PROFILES, type PromptProfile } from '../chat/prompt-profile-registry';

export type IntentCategory =
  | 'simple_query'
  | 'complex_research'
  | 'code_engineering'
  | 'business_strategy'
  | 'fcommerce_execution';

export interface IntelligenceRoutingDecision {
  intent: IntentCategory;
  complexityScore: number; // 1 to 10
  promptProfile: PromptProfile;
  recommendedBackendModel: string;
  suggestedAgent: string;
  requiredTools: string[];
  maxTokensBudget: number;
  costPolicy: 'economy' | 'balanced' | 'performance_flagship';
  latencyBudgetMs: number;
}

export class IntelligenceRouter {
  /**
   * Evaluates prompt text, user context, and system constraints to make a routing decision.
   */
  public static route(
    prompt: string,
    requestedProfileId?: string,
    userRole: 'free' | 'pro' | 'enterprise' = 'pro'
  ): IntelligenceRoutingDecision {
    const textLower = prompt.toLowerCase();

    let intent: IntentCategory = 'simple_query';
    let complexityScore = 3;

    // Detect Intent & Complexity
    if (textLower.includes('code') || textLower.includes('function') || textLower.includes('bug') || textLower.includes('refactor') || textLower.includes('ts') || textLower.includes('py')) {
      intent = 'code_engineering';
      complexityScore = 7;
    } else if (textLower.includes('research') || textLower.includes('compare') || textLower.includes('analyze') || textLower.includes('search') || textLower.includes('market')) {
      intent = 'complex_research';
      complexityScore = 8;
    } else if (textLower.includes('bkash') || textLower.includes('nagad') || textLower.includes('steadfast') || textLower.includes('courier') || textLower.includes('f-commerce') || textLower.includes('bdt')) {
      intent = 'fcommerce_execution';
      complexityScore = 6;
    } else if (textLower.includes('dcf') || textLower.includes('tam') || textLower.includes('valuation') || textLower.includes('pitch') || textLower.includes('investor')) {
      intent = 'business_strategy';
      complexityScore = 9;
    }

    // Select Prompt Profile
    let targetProfileId = requestedProfileId;
    if (!targetProfileId) {
      switch (intent) {
        case 'code_engineering':
          targetProfileId = 'cursor-code-master';
          break;
        case 'complex_research':
          targetProfileId = 'perplexity-pro-search';
          break;
        case 'business_strategy':
          targetProfileId = 'gpt-5.6-sol-ultra';
          break;
        case 'fcommerce_execution':
          targetProfileId = 'shothik-merchant-cofounder';
          break;
        default:
          targetProfileId = 'claude-opus-4.6-thinking';
      }
    }

    const profile = PROMPT_PROFILES.find((p) => p.id === targetProfileId) || PROMPT_PROFILES[0];

    // Select Agent & Tools
    let suggestedAgent = 'planner';
    const requiredTools: string[] = [];

    if (intent === 'code_engineering') {
      suggestedAgent = 'code-reviewer';
      requiredTools.push('git_diff', 'ast_parser', 'typechecker');
    } else if (intent === 'complex_research') {
      suggestedAgent = 'researcher';
      requiredTools.push('web_search', 'citation_index', 'rag_vault');
    } else if (intent === 'fcommerce_execution') {
      suggestedAgent = 'merchant-bot';
      requiredTools.push('bkash_pgw', 'nagad_pgw', 'steadfast_logistics');
    }

    // Cost & Latency Policies
    let costPolicy: 'economy' | 'balanced' | 'performance_flagship' = 'balanced';
    let maxTokensBudget = 32_000;
    let latencyBudgetMs = 3_000;

    if (userRole === 'enterprise' || complexityScore >= 8) {
      costPolicy = 'performance_flagship';
      maxTokensBudget = 128_000;
      latencyBudgetMs = 10_000;
    } else if (userRole === 'free') {
      costPolicy = 'economy';
      maxTokensBudget = 8_000;
      latencyBudgetMs = 2_000;
    }

    return {
      intent,
      complexityScore,
      promptProfile: profile,
      recommendedBackendModel: profile.recommendedBackendModel,
      suggestedAgent,
      requiredTools,
      maxTokensBudget,
      costPolicy,
      latencyBudgetMs,
    };
  }
}
