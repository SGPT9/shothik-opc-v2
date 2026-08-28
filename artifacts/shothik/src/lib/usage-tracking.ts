import logger from '@/lib/logger';
import {
  incrementCounter,
  maybeLogMetrics,
  recordDistribution,
} from '@/lib/runtime-metrics';

interface UsagePayload {
  userId: string;
  tool: string;
  provider: string;
  tokens: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

function getBaseApiUrl(): string {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
}

export async function trackUsageSafe(
  _clientOrPayload: any,
  payloadOrRetries?: UsagePayload | number,
  maxRetries = 2
): Promise<void> {
  // Support both trackUsageSafe(client, payload, retries) and trackUsageSafe(payload, retries)
  let payload: UsagePayload;
  let retries = maxRetries;

  if (_clientOrPayload && typeof _clientOrPayload === 'object' && 'userId' in _clientOrPayload) {
    payload = _clientOrPayload as UsagePayload;
    if (typeof payloadOrRetries === 'number') retries = payloadOrRetries;
  } else {
    payload = payloadOrRetries as UsagePayload;
  }

  if (!payload) return;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${getBaseApiUrl()}/api/v1/subscriptions/llm-track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': payload.userId,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      incrementCounter('llm.usage.track.success');
      incrementCounter('llm.usage.tokens.total', payload.tokens);
      incrementCounter('llm.usage.input_tokens.total', payload.inputTokens);
      incrementCounter('llm.usage.output_tokens.total', payload.outputTokens);
      incrementCounter('llm.usage.cost_usd.total', payload.costUsd);
      incrementCounter(`llm.usage.provider.${payload.provider}.calls`);
      incrementCounter(`llm.usage.tool.${payload.tool}.calls`);
      recordDistribution('llm.usage.cost_usd.per_call', payload.costUsd);
      recordDistribution('llm.usage.tokens.per_call', payload.tokens);
      maybeLogMetrics();
      return;
    } catch (err) {
      const isLastAttempt = attempt === retries;
      if (isLastAttempt) {
        incrementCounter('llm.usage.track.failure');
        logger.error('[usage-tracking] Failed to track LLM usage after retries', {
          tool: payload.tool,
          userId: payload.userId,
          tokens: payload.tokens,
          costUsd: payload.costUsd,
          error: err instanceof Error ? err.message : String(err),
        });
        maybeLogMetrics();
      } else {
        const backoffMs = 200 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoffMs));
      }
    }
  }
}
