import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { trackUsageSafe } from '../usage-tracking';
import { getChatRuntimeSummary, resetMetrics } from '../runtime-metrics';

describe('trackUsageSafe', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    resetMetrics();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('records runtime usage metrics after a successful write', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const payload = {
      userId: 'u1',
      tool: 'grammar',
      provider: 'test',
      tokens: 10,
      inputTokens: 5,
      outputTokens: 5,
      costUsd: 0.01,
    };

    await trackUsageSafe(payload);

    const summary = getChatRuntimeSummary();

    expect(summary.usageTracking.successfulWrites).toBe(1);
    expect(summary.usageTracking.failedWrites).toBe(0);
    expect(summary.usageTracking.totalTokens).toBe(10);
    expect(summary.usageTracking.totalCostUsd).toBeCloseTo(0.01);
    expect(summary.usageTracking.perCall.count).toBe(1);
  });

  it('calls the REST endpoint /api/v1/subscriptions/llm-track with payload and headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
    global.fetch = mockFetch;

    const payload = {
      userId: 'u1',
      tool: 'grammar',
      provider: 'test',
      tokens: 10,
      inputTokens: 5,
      outputTokens: 5,
      costUsd: 0.01,
    };

    await expect(trackUsageSafe(payload)).resolves.toBeUndefined();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/subscriptions/llm-track'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'u1',
        },
        body: JSON.stringify(payload),
      })
    );
  });
});
