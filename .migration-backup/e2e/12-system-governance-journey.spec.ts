import { test, expect } from "@playwright/test";

/**
 * TASK-GOVERNANCE-01: End-to-End System Governance & Migration Safety Journey
 */
test.describe("TASK-GOVERNANCE-01: End-to-End System Governance & Migration Safety Journey", () => {
  test("TC-GOV-01: Admin governance page renders title and policy controls", async ({ page }) => {
    await page.goto("/admin/governance");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("h1")).toContainText("System Governance");
  });

  test("TC-GOV-02: Pending database migration safety API responds with success", async ({ request }) => {
    const response = await request.get("/api/vibe/migrations/approve");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("TC-GOV-03: GitHub auto-sync webhook endpoint processes repository update payload", async ({ request }) => {
    const response = await request.post("/api/webhooks/github", {
      headers: { "Content-Type": "application/json" },
      data: {
        ref: "refs/heads/main",
        repository: { full_name: "shothik/shothik-web" },
        commits: [{ id: "abc1234", message: "feat: updated core models" }],
      },
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.reindexed).toBe(true);
  });

  test("TC-GOV-04: Migration approval endpoint handles approval payload", async ({ request }) => {
    const response = await request.post("/api/vibe/migrations/approve", {
      headers: { "Content-Type": "application/json" },
      data: {
        migrationId: "non_existent_id",
        approvedBy: "playwright_e2e_runner",
      },
    });

    // Should return 404 for non-existent migration, showing proper API handling
    expect(response.status()).toBe(404);
  });
});
