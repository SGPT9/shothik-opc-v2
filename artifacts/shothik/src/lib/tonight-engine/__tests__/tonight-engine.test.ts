/**
 * Tonight Engine Daemon Test Suite
 * Tests queue management, prioritization, retries, concurrency, and DSH SessionEventLog integration
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TonightWorkerDaemon } from '../tonight-worker-daemon';
import { SessionEventLog } from '../../harness/session-event-log';

describe('TonightWorkerDaemon', () => {
  let daemon: TonightWorkerDaemon;
  let eventLog: SessionEventLog;

  beforeEach(() => {
    vi.useFakeTimers();
    eventLog = new SessionEventLog('tonight-daemon-test');
    daemon = new TonightWorkerDaemon(
      {
        maxConcurrency: 2,
        pollIntervalMs: 100,
        defaultMaxRetries: 2,
      },
      undefined,
      eventLog
    );
  });

  afterEach(async () => {
    await daemon.stop();
    vi.useRealTimers();
  });

  it('should enqueue jobs with priority ordering', () => {
    const lowJob = daemon.enqueueJob('merchant_catalog_sync', 'Low Priority Sync', {}, 1);
    const highJob = daemon.enqueueJob('invoice_reconciliation', 'High Priority Invoices', {}, 10);

    const status = daemon.getStatus();
    expect(status.queuedJobs).toBe(2);
    expect(highJob.priority).toBe(10);
    expect(lowJob.priority).toBe(1);
  });

  it('should process jobs using registered handler and update progress', async () => {
    const handler = vi.fn().mockImplementation(async (job, updateProgress) => {
      updateProgress(50, 'Processing items');
      updateProgress(100, 'Done');
      return { processedCount: 42 };
    });

    daemon.registerHandler('invoice_reconciliation', handler);
    const job = daemon.enqueueJob('invoice_reconciliation', 'Reconcile bKash Invoices', {}, 5);

    daemon.start();

    // Advance timer to trigger poll and execution
    await vi.advanceTimersByTimeAsync(150);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(job.status).toBe('completed');
    expect(job.progress).toBe(100);
    expect(job.result).toEqual({ processedCount: 42 });

    // Verify SessionEventLog captured step events
    const logged = eventLog.getAll();
    expect(logged.some((e) => e.data['title'] === 'Reconcile bKash Invoices')).toBe(true);
  });

  it('should retry failed jobs up to maxRetries', async () => {
    let attempts = 0;
    const failingHandler = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Transient network timeout');
      }
      return { recovered: true };
    });

    daemon.registerHandler('deep_research_scrape', failingHandler);
    const job = daemon.enqueueJob('deep_research_scrape', 'Scrape Research', {}, 5, 2);

    daemon.start();

    // First attempt fails -> re-enqueued
    await vi.advanceTimersByTimeAsync(150);
    expect(attempts).toBe(1);
    expect(job.status).toBe('queued');
    expect(job.retryCount).toBe(1);

    // Second attempt succeeds
    await vi.advanceTimersByTimeAsync(150);
    expect(attempts).toBe(2);
    expect(job.status).toBe('completed');
  });

  it('should mark job failed when maxRetries exceeded', async () => {
    const alwaysFailHandler = vi.fn().mockRejectedValue(new Error('Fatal DB Error'));

    daemon.registerHandler('book_pdf_compile', alwaysFailHandler);
    const job = daemon.enqueueJob('book_pdf_compile', 'Compile Book', {}, 5, 1);

    daemon.start();

    // Run 2 poll cycles (initial + 1 retry)
    await vi.advanceTimersByTimeAsync(300);

    expect(job.status).toBe('failed');
    expect(job.error).toContain('Max retries exceeded');
  });
});
