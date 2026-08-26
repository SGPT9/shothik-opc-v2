import logger from "../logger.js";

export interface QueueMessage<T = Record<string, unknown>> {
  id: string;
  timestamp: number;
  type: "swarm_task" | "deep_research" | "book_compilation" | "mfs_reconciliation";
  payload: T;
  retryCount: number;
  maxRetries: number;
}

export interface QueueBatchResponse {
  processed: number;
  failed: number;
  retried: number;
}

export class HermesQueueConsumer {
  private queueName: string;
  private isProcessing: boolean = false;
  private localQueue: QueueMessage[] = [];

  constructor(queueName?: string) {
    this.queueName = queueName || process.env.HERMES_WORKER_QUEUE_NAME || "shothik-hermes-run-queue";
  }

  public enqueue<T = Record<string, unknown>>(
    type: QueueMessage["type"],
    payload: T,
    maxRetries: number = 3
  ): QueueMessage<T> {
    const message: QueueMessage<T> = {
      id: `qmsg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      type,
      payload,
      retryCount: 0,
      maxRetries,
    };

    this.localQueue.push(message);
    logger.info("[queue-consumer] Enqueued async task to queue", {
      queueName: this.queueName,
      messageId: message.id,
      type,
    });

    return message;
  }

  public getPendingCount(): number {
    return this.localQueue.length;
  }

  public async processBatch(
    handler: (msg: QueueMessage) => Promise<{ success: boolean; error?: string }>
  ): Promise<QueueBatchResponse> {
    if (this.isProcessing) {
      return { processed: 0, failed: 0, retried: 0 };
    }

    this.isProcessing = true;
    let processed = 0;
    let failed = 0;
    let retried = 0;

    const currentBatch = [...this.localQueue];
    this.localQueue = [];

    for (const msg of currentBatch) {
      try {
        const result = await handler(msg);
        if (result.success) {
          processed++;
          logger.info("[queue-consumer] Successfully processed queue message", { messageId: msg.id });
        } else {
          if (msg.retryCount < msg.maxRetries) {
            msg.retryCount++;
            retried++;
            this.localQueue.push(msg);
            logger.warn("[queue-consumer] Message failed, requeued for retry", {
              messageId: msg.id,
              retryCount: msg.retryCount,
              error: result.error,
            });
          } else {
            failed++;
            logger.error("[queue-consumer] Message exceeded max retries, sent to DLQ", {
              messageId: msg.id,
            });
          }
        }
      } catch (err: any) {
        if (msg.retryCount < msg.maxRetries) {
          msg.retryCount++;
          retried++;
          this.localQueue.push(msg);
        } else {
          failed++;
        }
      }
    }

    this.isProcessing = false;
    return { processed, failed, retried };
  }
}

export const hermesQueueConsumer = new HermesQueueConsumer();
