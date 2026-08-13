import { describe, it, expect } from 'vitest';
import {
  NeedleDispatcher,
  type StudioMode,
  type NeedleToolDeclaration,
  type DispatchResult
} from '../needle-dispatcher';

describe('NeedleDispatcher (Needle 2 Architecture for Shothik Multi-Studio)', () => {
  it('initializes with specialized tool catalogs across all 6 flagship modes', () => {
    const dispatcher = new NeedleDispatcher();
    const modes: StudioMode[] = ['chat', 'coding', 'deepresearch', 'slide', 'sheet', 'bookwriting'];

    for (const mode of modes) {
      const tools = dispatcher.getToolsForMode(mode);
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.every(t => Boolean(t.name && t.description && t.schema))).toBe(true);
    }
  });

  it('retrieves the top relevant tools dynamically for coding queries', () => {
    const dispatcher = new NeedleDispatcher();
    const retrieved = dispatcher.retrieveTools('coding', 'fix type error in TypeScript interface and run vitest');

    expect(retrieved.length).toBeLessThanOrEqual(5);
    const names = retrieved.map(t => t.name);
    expect(names.some(n => n.includes('fix') || n.includes('lint') || n.includes('test') || n.includes('refactor'))).toBe(true);
  });

  it('confidence-gates execution: executes fast-path when confidence >= threshold', () => {
    const dispatcher = new NeedleDispatcher({ confidenceThreshold: 0.85 });
    
    // High-confidence exact intent
    const result: DispatchResult = dispatcher.routeIntent('bookwriting', '@rewrite scene with sensory details');
    expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    expect(result.escalatedToFrontier).toBe(false);
    expect(result.selectedTool?.name).toBe('rewrite_sensory');
  });

  it('confidence-gates execution: escalates to frontier model when intent is ambiguous', () => {
    const dispatcher = new NeedleDispatcher({ confidenceThreshold: 0.85 });
    
    // Vague/ambiguous query
    const result: DispatchResult = dispatcher.routeIntent('deepresearch', 'maybe tell me something interesting about science or something');
    expect(result.confidence).toBeLessThan(0.85);
    expect(result.escalatedToFrontier).toBe(true);
  });

  it('enforces structured schema extraction with constraints for slide generator', () => {
    const dispatcher = new NeedleDispatcher();
    const rawInput = 'Title: AI in Bangladesh | Bullets: bKash penetration 80%, 2GB device optimization, offline first | Theme: dark-indigo';
    
    const extracted = dispatcher.extractStructuredData('slide', 'create_slide', rawInput);
    expect(extracted.valid).toBe(true);
    expect(extracted.data).toHaveProperty('title');
    expect(extracted.data).toHaveProperty('bullets');
    expect(Array.isArray(extracted.data.bullets)).toBe(true);
  });

  it('enforces formula extraction for sheet mode', () => {
    const dispatcher = new NeedleDispatcher();
    const query = 'Calculate total revenue from column B2 to B100';
    
    const extracted = dispatcher.extractStructuredData('sheet', 'generate_formula', query);
    expect(extracted.valid).toBe(true);
    expect(extracted.data.formula).toBe('=SUM(B2:B100)');
  });

  it('maintains bounded memory with sliding window and pinned tool KV sinks', () => {
    const dispatcher = new NeedleDispatcher({ maxWindowTokens: 256 });
    
    for (let i = 0; i < 20; i++) {
      dispatcher.recordTurn('chat', `User query ${i}`, `Assistant response ${i}`);
    }

    const memory = dispatcher.getMemoryFootprint('chat');
    expect(memory.tokenCount).toBeLessThanOrEqual(256);
    expect(memory.pinnedSinks).toBeGreaterThan(0);
  });
});
