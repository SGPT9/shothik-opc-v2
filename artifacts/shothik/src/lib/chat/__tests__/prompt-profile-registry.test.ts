/**
 * Intent-Aware Prompt Profile Registry Unit Test Suite
 */

import { describe, it, expect } from 'vitest';
import { PROMPT_PROFILES, enhancePromptWithProfile } from '../prompt-profile-registry';

describe('Intent-Aware Prompt-Level Model Registry Engine', () => {
  it('should contain high-demand ChatGPT/Antigravity style model profiles', () => {
    expect(PROMPT_PROFILES.length).toBeGreaterThanOrEqual(7);

    const ids = PROMPT_PROFILES.map((p) => p.id);
    expect(ids).toContain('claude-opus-4.6-thinking');
    expect(ids).toContain('gpt-5.6-sol-ultra');
    expect(ids).toContain('deepseek-r1-reasoning');
    expect(ids).toContain('gemini-3.7-pro-high-context');
    expect(ids).toContain('cursor-code-master');
    expect(ids).toContain('perplexity-pro-search');
    expect(ids).toContain('shothik-merchant-cofounder');
  });

  it('should dynamically inject Claude Opus 4.6 Thinking directives for Claude selection', () => {
    const { enhancedPrompt, systemDirective, profile } = enhancePromptWithProfile(
      'Design a resilient distributed transaction queue',
      'claude-opus-4.6-thinking'
    );

    expect(profile.name).toBe('Claude Opus 4.6 Thinking');
    expect(profile.contextLimit).toBe('1,000,000 Tokens');
    expect(systemDirective).toContain('Claude Opus 4.6 Thinking');
    expect(systemDirective).toContain('internal reasoning');
    expect(enhancedPrompt).toBe('Design a resilient distributed transaction queue');
  });

  it('should dynamically inject Cursor Code Master directives for Cursor selection', () => {
    const { systemDirective, profile } = enhancePromptWithProfile(
      'Refactor React state hook',
      'cursor-code-master'
    );

    expect(profile.name).toBe('Cursor Code Master AI');
    expect(systemDirective).toContain('Cursor Code Master AI');
    expect(systemDirective).toContain('immutability');
  });

  it('should fallback gracefully if an unknown profile ID is passed', () => {
    const { profile } = enhancePromptWithProfile('Test input', 'invalid-id');
    expect(profile.id).toBe('claude-opus-4.6-thinking');
  });
});
