/**
 * Prompt Profile Registry Unit Test Suite
 */

import { describe, it, expect } from 'vitest';
import { PROMPT_PROFILES, enhancePromptWithProfile } from '../prompt-profile-registry';

describe('Prompt-Level Model Registry Engine', () => {
  it('should contain production prompt-level model profiles', () => {
    expect(PROMPT_PROFILES.length).toBeGreaterThanOrEqual(6);

    const ids = PROMPT_PROFILES.map((p) => p.id);
    expect(ids).toContain('shothik-merchant-cofounder');
    expect(ids).toContain('cursor-code-intelligence');
    expect(ids).toContain('perplexity-deep-search');
    expect(ids).toContain('deepseek-r1-reasoning');
    expect(ids).toContain('claude-system-architect');
    expect(ids).toContain('openai-product-strategy');
  });

  it('should enhance user prompts with system directives from selected profile', () => {
    const { enhancedPrompt, systemDirective, profile } = enhancePromptWithProfile(
      'Fix modern web layout overflow',
      'cursor-code-intelligence'
    );

    expect(profile.name).toBe('Cursor AI Coding Master');
    expect(systemDirective).toContain('Cursor Code Intelligence');
    expect(systemDirective).toContain('immutability');
    expect(enhancedPrompt).toBe('Fix modern web layout overflow');
  });

  it('should fallback gracefully if an unknown profile ID is passed', () => {
    const { profile } = enhancePromptWithProfile('Hello world', 'unknown-profile-id');
    expect(profile.id).toBe('shothik-merchant-cofounder');
  });
});
