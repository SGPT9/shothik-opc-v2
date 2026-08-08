# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> shothik-web smoke suite >> health endpoint responds
- Location: e2e\smoke.spec.ts:9:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test.describe("shothik-web smoke suite", () => {
  4  |   test("homepage loads", async ({ page }) => {
  5  |     await page.goto("/");
  6  |     await expect(page).toHaveURL(/(localhost:3000|shothik-web-mirror-v2\.vercel\.app|\/)/);
  7  |   });
  8  | 
  9  |   test("health endpoint responds", async ({ request }) => {
  10 |     const response = await request.get("/api/health");
> 11 |     expect(response.ok()).toBeTruthy();
     |                           ^ Error: expect(received).toBeTruthy()
  12 |   });
  13 | 
  14 |   test("swagger endpoint responds", async ({ request }) => {
  15 |     const response = await request.get("/api/docs/swagger.json");
  16 |     expect([200, 403, 404]).toContain(response.status());
  17 |   });
  18 | });
  19 | 
```