import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectLocalEndpoints } from '../gateway';

describe('Local LLM & ODS Auto-Discovery Scanner (gateway.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('detects and selects local Ollama when port 11434 is active', async () => {
    // Mock fetch for localhost:11434
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes(':11434')) {
        return Promise.resolve({ ok: true, json: async () => ({ models: [] }) });
      }
      return Promise.reject(new Error('connection refused'));
    });

    const discovery = await detectLocalEndpoints(true);
    expect(discovery.ollamaAvailable).toBe(true);
    expect(discovery.activeEndpoint).toBe('http://localhost:11434');
  });

  it('falls back to Colibri VPS when local ports are offline', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline'));

    const discovery = await detectLocalEndpoints(true);
    expect(discovery.activeEndpoint).toContain('8080');
  });
});
