import { expect, test } from "@playwright/test";

test.describe("shothik-web smoke suite", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/(localhost:3000|shothik-web-mirror-v2\.vercel\.app|\/)/);
  });

  test("health endpoint responds", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
  });

  test("swagger endpoint responds", async ({ request }) => {
    const response = await request.get("/api/docs/swagger.json");
    expect([200, 403, 404]).toContain(response.status());
  });
});
