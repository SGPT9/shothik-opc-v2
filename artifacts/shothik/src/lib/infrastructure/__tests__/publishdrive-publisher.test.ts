import { describe, it, expect } from "vitest";
import { PublishDrivePublisherService } from "../publishdrive-publisher";

describe("PublishDrivePublisherService Book Writing & Publishing Pipeline", () => {
  it("should publish EPUB/PDF manuscripts to PublishDrive global distribution and Shothik Store", async () => {
    const result = await PublishDrivePublisherService.publishBook({
      workspaceId: "ws_pub_test_1",
      bookTitle: "Autonomous Growth Playbook",
      authorName: "Ben Cera & Shothik AI",
      manuscriptFormat: "epub",
      priceUsd: 29.99,
      channels: ["publishdrive", "shothik_store", "amazon_kdp"],
    });

    expect(result.publishingId).toBeDefined();
    expect(result.status).toBe("published");
    expect(result.channelsPublished.length).toBe(3);
    expect(result.isbn).toBeDefined();
    expect(result.storeUrl).toBe("https://books.shothik.app/store/autonomous-growth-playbook");
  });
});
