import { Queue, Worker, Job } from "bullmq";
import { logger } from "../logger";
import { processTaskJob } from "./task-processors";

export interface ShothikJobData {
  jobType: "batch-humanize" | "deep-research" | "plagiarism-scan" | "audio-synthesis";
  userId?: string;
  payload: Record<string, any>;
  submittedAt: string;
}

export interface ShothikJobResult {
  success: boolean;
  jobType: string;
  data?: any;
  error?: string;
  completedAt: string;
}

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);

const redisConnection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
};

export class BullMQQueueManager {
  private static instance: BullMQQueueManager;
  private queue: Queue<ShothikJobData, ShothikJobResult>;
  private worker: Worker<ShothikJobData, ShothikJobResult> | null = null;
  private isConnected = false;

  private constructor() {
    this.queue = new Queue<ShothikJobData, ShothikJobResult>("shothik-heavy-tasks", {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1500,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });

    this.initWorker();
  }

  public static getInstance(): BullMQQueueManager {
    if (!BullMQQueueManager.instance) {
      BullMQQueueManager.instance = new BullMQQueueManager();
    }
    return BullMQQueueManager.instance;
  }

  private initWorker() {
    try {
      this.worker = new Worker<ShothikJobData, ShothikJobResult>(
        "shothik-heavy-tasks",
        async (job: Job<ShothikJobData, ShothikJobResult>) => {
          logger.info({ jobId: job.id, jobType: job.data.jobType }, "[bullmq] Processing job");
          return await processTaskJob(job);
        },
        {
          connection: redisConnection,
          concurrency: 4,
        }
      );

      this.worker.on("ready", () => {
        this.isConnected = true;
        logger.info("[bullmq] Worker connected to Redis on port " + REDIS_PORT);
      });

      this.worker.on("completed", (job) => {
        logger.info({ jobId: job.id, jobType: job.data.jobType }, "[bullmq] Job completed successfully");
      });

      this.worker.on("failed", (job, err) => {
        logger.error({ jobId: job?.id, error: err.message }, "[bullmq] Job failed");
      });

      this.worker.on("error", (err) => {
        // Log gracefully without crashing the process if Redis is restarting
        logger.warn({ error: err.message }, "[bullmq] Worker connection error (retrying...)");
      });
    } catch (err: any) {
      logger.warn({ error: err.message }, "[bullmq] Failed to initialize worker");
    }
  }

  public async addJob(jobType: ShothikJobData["jobType"], payload: Record<string, any>, userId?: string): Promise<{ jobId: string }> {
    const jobData: ShothikJobData = {
      jobType,
      userId,
      payload,
      submittedAt: new Date().toISOString(),
    };

    const job = await this.queue.add(jobType, jobData, {
      jobId: `job_${jobType}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    });

    return { jobId: job.id! };
  }

  public async getJobStatus(jobId: string) {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress || 0;
    const returnvalues = job.returnvalue || null;
    const failedReason = job.failedReason || null;

    return {
      jobId: job.id,
      jobType: job.data.jobType,
      state,
      progress,
      result: returnvalues,
      error: failedReason,
      timestamp: job.timestamp,
    };
  }

  public async close(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
    await this.queue.close();
  }
}

export const queueManager = BullMQQueueManager.getInstance();
