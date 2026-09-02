/**
 * Microservice Circuit Breaker Guard
 * Protects downstream LLM APIs (DeepSeek, Claude, OpenAI) and Payment Gateways from cascading outage failures.
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold: number; // e.g. 3 consecutive failures
  recoveryTimeoutMs: number; // e.g. 10,000ms
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private nextAttemptTime = 0;
  private options: CircuitBreakerOptions;

  constructor(options: CircuitBreakerOptions = { failureThreshold: 3, recoveryTimeoutMs: 10000 }) {
    this.options = options;
  }

  /**
   * Execute protected async action with fallback on circuit trip
   */
  public async execute<T>(actionFn: () => Promise<T>, fallbackFn: () => T): Promise<T> {
    const now = Date.now();

    if (this.state === "OPEN") {
      if (now > this.nextAttemptTime) {
        this.state = "HALF_OPEN";
      } else {
        return fallbackFn();
      }
    }

    try {
      const result = await actionFn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      return fallbackFn();
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  private onFailure(): void {
    this.failureCount += 1;
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = "OPEN";
      this.nextAttemptTime = Date.now() + this.options.recoveryTimeoutMs;
    }
  }

  public getStatus(): { state: CircuitState; failureCount: number; nextAttemptTime: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      nextAttemptTime: this.nextAttemptTime,
    };
  }
}

export const llmCircuitBreaker = new CircuitBreaker();
