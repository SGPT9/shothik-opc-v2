import { describe, it, expect } from 'vitest';
import {
  NeedleDispatcher,
  type StudioMode,
  type NeedleToolDeclaration,
  type DispatchResult
} from '../needle-dispatcher';

describe('NeedleDispatcher (Needle 2 + Switchyard + MateClaw for Shothik)', () => {
  it('initializes with specialized tool catalogs across all 7 flagship modes including websearch', () => {
    const dispatcher = new NeedleDispatcher();
    const modes: StudioMode[] = ['chat', 'websearch', 'coding', 'deepresearch', 'slide', 'sheet', 'bookwriting'];

    for (const mode of modes) {
      const tools = dispatcher.getToolsForMode(mode);
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.every(t => Boolean(t.name && t.description && t.schema))).toBe(true);
    }
  });

  it('optimizes web search queries and extracts domain filters at the edge', () => {
    const dispatcher = new NeedleDispatcher();
    const rawSearch = 'search live news about NBR income tax circular site:gov.bd';
    
    const extracted = dispatcher.extractStructuredData('websearch', 'search_query_optimizer', rawSearch);
    expect(extracted.valid).toBe(true);
    expect(extracted.data.query).toContain('NBR income tax circular');
    expect(extracted.data.domain).toBe('gov.bd');
  });

  it('verifies grounded citations against source references in web search mode', () => {
    const dispatcher = new NeedleDispatcher();
    const claim = 'According to [1], the revenue increased by 22% in 2025.';
    const sources = [{ id: '1', url: 'https://nbr.gov.bd/report-2025', title: 'NBR Annual Report' }];

    const verified = dispatcher.verifyCitations(claim, sources);
    expect(verified.isGrounded).toBe(true);
    expect(verified.citations[0].url).toBe('https://nbr.gov.bd/report-2025');
  });

  it('executes offline exact currency and bKash fee calculations in regular chat without LLM tokens', () => {
    const dispatcher = new NeedleDispatcher();
    const query = 'calculate bKash fee for 5000 BDT at 1.85%';
    
    const extracted = dispatcher.extractStructuredData('chat', 'calculate_currency', query);
    expect(extracted.valid).toBe(true);
    expect(extracted.data.fee).toBe(92.5);
    expect(extracted.data.total).toBe(5092.5);
  });

  it('normalizes Banglish code-mixed text for regular chat', () => {
    const dispatcher = new NeedleDispatcher();
    const raw = 'amar order er status ta ekta dekhe bolo to';
    
    const extracted = dispatcher.extractStructuredData('chat', 'translate_banglish', raw);
    expect(extracted.valid).toBe(true);
    expect(extracted.data.isCodeMixed).toBe(true);
    expect(extracted.data.intent).toBe('order_status');
  });

  it('confidence-gates execution: fast-path vs frontier escalation', () => {
    const dispatcher = new NeedleDispatcher({ confidenceThreshold: 0.85 });
    
    const fastResult = dispatcher.routeIntent('bookwriting', '@rewrite scene with sensory details');
    expect(fastResult.confidence).toBeGreaterThanOrEqual(0.85);
    expect(fastResult.escalatedToFrontier).toBe(false);

    const vagueResult = dispatcher.routeIntent('deepresearch', 'maybe tell me something interesting about science or something');
    expect(vagueResult.confidence).toBeLessThan(0.85);
    expect(vagueResult.escalatedToFrontier).toBe(true);
  });

  it('enforces structured schema extraction for slides and sheets', () => {
    const dispatcher = new NeedleDispatcher();
    const slideInput = 'Title: AI in BD | Bullets: 2GB RAM device, bKash 1-tap, offline cache';
    const slideExtracted = dispatcher.extractStructuredData('slide', 'create_slide', slideInput);
    expect(slideExtracted.valid).toBe(true);
    expect(slideExtracted.data.title).toBe('AI in BD');

    const sheetInput = 'Calculate total revenue from B2 to B100';
    const sheetExtracted = dispatcher.extractStructuredData('sheet', 'generate_formula', sheetInput);
    expect(sheetExtracted.valid).toBe(true);
    expect(sheetExtracted.data.formula).toBe('=SUM(B2:B100)');
  });

  it('maintains bounded memory footprint with sliding window and pinned KV sinks', () => {
    const dispatcher = new NeedleDispatcher({ maxWindowTokens: 256 });
    
    for (let i = 0; i < 20; i++) {
      dispatcher.recordTurn('chat', `User query ${i}`, `Assistant response ${i}`);
    }

    const memory = dispatcher.getMemoryFootprint('chat');
    expect(memory.tokenCount).toBeLessThanOrEqual(256);
    expect(memory.pinnedSinks).toBeGreaterThan(0);
  });
});
