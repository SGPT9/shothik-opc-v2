export interface QueuedRequest {
  id: string;
  url: string;
  method: "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body: any;
  retryCount: number;
  timestamp: number;
}

export class OfflineSyncQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  private listeners: Array<(count: number, isOnline: boolean) => void> = [];

  constructor() {
    this.loadQueue();
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.isOnline = true;
        this.notify();
        this.processQueue();
      });
      window.addEventListener("offline", () => {
        this.isOnline = false;
        this.notify();
      });
    }
  }

  private loadQueue() {
    if (typeof localStorage !== "undefined") {
      try {
        const raw = localStorage.getItem("shothik_offline_queue");
        if (raw) this.queue = JSON.parse(raw);
      } catch {
        this.queue = [];
      }
    }
  }

  private saveQueue() {
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("shothik_offline_queue", JSON.stringify(this.queue));
      } catch (e) {
        console.error("Failed to save offline queue", e);
      }
    }
    this.notify();
  }

  public enqueue(url: string, method: "POST" | "PUT" | "DELETE", body: any, headers?: Record<string, string>): string {
    const id = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const req: QueuedRequest = {
      id,
      url,
      method,
      headers: headers || { "Content-Type": "application/json" },
      body,
      retryCount: 0,
      timestamp: Date.now(),
    };

    this.queue.push(req);
    this.saveQueue();

    if (this.isOnline) {
      this.processQueue();
    }
    return id;
  }

  public async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0 && this.isOnline) {
      const item = this.queue[0];
      try {
        const res = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: JSON.stringify(item.body),
        });

        if (res.ok) {
          this.queue.shift();
          this.saveQueue();
        } else if (res.status >= 400 && res.status < 500) {
          // Client error, discard
          this.queue.shift();
          this.saveQueue();
        } else {
          // Server error, backoff
          item.retryCount++;
          break;
        }
      } catch {
        // Network failure
        this.isOnline = false;
        break;
      }
    }

    this.isProcessing = false;
    this.notify();
  }

  public subscribe(fn: (count: number, isOnline: boolean) => void) {
    this.listeners.push(fn);
    fn(this.queue.length, this.isOnline);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    for (const fn of this.listeners) {
      fn(this.queue.length, this.isOnline);
    }
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }
}

export const globalOfflineSyncQueue = new OfflineSyncQueue();
