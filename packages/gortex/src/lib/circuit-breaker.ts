export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  recoveryTimeoutMs?: number;
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private lastFailureTime = 0;
  private failureThreshold: number;
  private recoveryTimeoutMs: number;

  constructor(options?: CircuitBreakerOptions) {
    this.failureThreshold = options?.failureThreshold ?? 3;
    this.recoveryTimeoutMs = options?.recoveryTimeoutMs ?? 10000;
  }

  public getState(): CircuitState {
    if (this.state === "OPEN" && Date.now() - this.lastFailureTime > this.recoveryTimeoutMs) {
      this.state = "HALF_OPEN";
    }
    return this.state;
  }

  public recordSuccess(): void {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  public recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  public canExecute(): boolean {
    return this.getState() !== "OPEN";
  }
}
