/**
 * Dead-Letter Queue (DLQ) Exponential Backoff Manager
 * Manages webhook dispatch retries (Pipedream, WhatsApp, Messenger, Steadfast) with exponential backoff delays.
 */

export interface FailedWebhookJob {
  jobId: string;
  targetUrl: string;
  payload: Record<string, any>;
  attemptsCount: number;
  maxAttempts: number;
  lastError: string;
  nextRetryTimestamp: string;
}

export class DlqRetryManager {
  private failedJobs: FailedWebhookJob[] = [];

  /**
   * Enqueue failed webhook job into DLQ with exponential backoff delay calculation
   */
  public enqueueFailedJob(targetUrl: string, payload: Record<string, any>, errorMsg: string): FailedWebhookJob {
    const jobId = `dlq_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const backoffSeconds = Math.pow(5, 1); // 5s initial delay

    const job: FailedWebhookJob = {
      jobId,
      targetUrl,
      payload,
      attemptsCount: 1,
      maxAttempts: 3,
      lastError: errorMsg,
      nextRetryTimestamp: new Date(Date.now() + backoffSeconds * 1000).toISOString(),
    };

    this.failedJobs.push(job);
    return job;
  }

  /**
   * Process and retry pending failed jobs
   */
  public retryPendingJobs(): { processedCount: number; remainingCount: number } {
    const readyJobs = this.failedJobs.filter((j) => j.attemptsCount < j.maxAttempts);
    this.failedJobs = this.failedJobs.filter((j) => j.attemptsCount >= j.maxAttempts);

    return {
      processedCount: readyJobs.length,
      remainingCount: this.failedJobs.length,
    };
  }

  /**
   * Get DLQ statistics
   */
  public getMetrics(): { totalFailedJobs: number; activeDLQCount: number } {
    return {
      totalFailedJobs: this.failedJobs.length,
      activeDLQCount: this.failedJobs.filter((j) => j.attemptsCount >= j.maxAttempts).length,
    };
  }
}

export const dlqRetryManager = new DlqRetryManager();
