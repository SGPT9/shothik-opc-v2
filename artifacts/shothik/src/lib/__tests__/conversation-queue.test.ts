import { describe, it, expect, vi } from "vitest";
import { ShothikConversationQueue } from "../conversation-queue";

describe("ShothikConversationQueue (OpenMuse Pattern)", () => {
  it("enqueues, removes, and flushes messages in FIFO sequence", async () => {
    const queue = new ShothikConversationQueue();
    const processed: string[] = [];

    queue.enqueue("Analyze sales data");
    queue.enqueue("Calculate NBR VAT");
    queue.enqueue("Generate commercial invoice");

    expect(queue.getSnapshot().pending).toHaveLength(3);

    // Remove middle item
    const items = queue.getSnapshot().pending;
    queue.remove(items[1].id);
    expect(queue.getSnapshot().pending).toHaveLength(2);

    // Flush queue
    await queue.flush(async (msg) => {
      processed.push(msg.text);
    });

    expect(processed).toEqual(["Analyze sales data", "Generate commercial invoice"]);
    expect(queue.getSnapshot().pending).toHaveLength(0);
    expect(queue.getSnapshot().running).toBe(false);
  });

  it("pauses and resumes queue processing properly", async () => {
    const queue = new ShothikConversationQueue();
    queue.enqueue("Task 1");
    queue.pause();

    expect(queue.getSnapshot().paused).toBe(true);

    let called = false;
    await queue.flush(async () => {
      called = true;
    });

    expect(called).toBe(false);

    queue.resume();
    expect(queue.getSnapshot().paused).toBe(false);

    await queue.flush(async () => {
      called = true;
    });

    expect(called).toBe(true);
  });
});
