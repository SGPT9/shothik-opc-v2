# Wave A & Wave B: Unified Voice AI Audio Narration & Live-Web Plagiarism Radar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide end-to-end GPU-accelerated Bangla Voice AI audio narration across Writing Studio & Humanizer (Wave A), and upgrade the plagiarism detection engine from a mock corpus to a live web radar backed by SearXNG and BullMQ asynchronous scanning (Wave B).

**Architecture:**
- **Wave A (Voice AI)**: Connect Express API to the local GPU daemon on `:8001` via `GET /api/v1/voice/personas` and `POST /api/v1/voice/synthesize`. For longer texts, dispatch chunked synthesis jobs via BullMQ `audio-synthesis` queue. Record Langfuse traces. On the frontend, introduce a reusable `AudioNarrationPlayer` with HTML5 Audio, persona selector, playback controls, speed selection, and audio download, embedded in `HumanizeGPTClient` and `PolishedWriteView`.
- **Wave B (Plagiarism Radar)**: Enhance `BengaliPlagiarismEngine` with `scanWithLiveWeb()` which queries `WigoloWebIntelligenceService.searchWeb()` against SearXNG (`:8888`) with Redis caching. Update BullMQ `plagiarism-scan` task processor with real-time SSE progress updates. In the frontend, add the "Live Web Radar" toggle in `PlagiarismInputEditor` and surface verified web sources in `PlagiarismResultsPanel`.

**Tech Stack:** Node.js / Express 5, TypeScript, React 19, Tailwind CSS, BullMQ, Redis 7, SearXNG, OpenVINO TTS (`:8001`), Langfuse (`:12000`), Vitest.

**Spec:** High-Impact Wave Roadmap & Master Execution Plan (Waves A & B).

## Global Constraints

- 100% test pass rate across all test suites (zero regressions).
- Strict TypeScript compilation (`tsc -p tsconfig.json --noEmit` cleanly in API server and web app).
- Maintain all existing comments and docstrings.
- Adhere to pre-commit checks (Unicode/Secret scanning) and pre-push chaos fuzzing.
- Use forward slashes in all markdown file links (`[file.ts](file:///...)`).
- Voice AI runs on `http://127.0.0.1:8001`; SearXNG runs on `http://127.0.0.1:8888`; Redis on `127.0.0.1:6379`.

## Review Focus

1. **Voice AI Daemon Downtime / Fallback**: When `:8001` is unreachable or busy, synthesis gracefully returns a clear HTTP 503 or fallback status without crashing Express.
2. **Audio Buffer Encoding**: Base64 WAV data returned by the TTS daemon must be properly formatted as `data:audio/wav;base64,...` so standard HTML5 `<audio>` and Web Audio API can decode and play it without corrupted headers.
3. **SearXNG Query Throttling & Caching**: Plagiarism radar extracts representative sentence n-grams and batches or caches them in Redis so SearXNG is not flooded with redundant queries.
4. **BullMQ Real-Time SSE Progress**: Long plagiarism scans and multi-sentence audio synthesis jobs must update job progress smoothly (10% -> 100%) so the UI progress bars reflect actual processing.
5. **No Visual Overlap or Broken Layouts**: Audio narration widget and plagiarism web source cards must fit seamlessly into dark/light mode with proper responsive constraints.

---

### Task 1: Backend Voice AI API Proxy & BullMQ Synthesis Worker (Wave A)

**Files:**
- Modify: `artifacts/api-server/src/routes/ai-tools-extended.ts`
- Modify: `artifacts/api-server/src/lib/queue/task-processors.ts`
- Test: `artifacts/api-server/src/lib/queue/__tests__/audio-synthesis.test.ts`

**Interfaces:**
- Consumes: `http://127.0.0.1:8001/api/v1/personas`, `http://127.0.0.1:8001/api/v1/synthesize`, `LangfuseTracer`
- Produces: `GET /api/v1/voice/personas`, `POST /api/v1/voice/synthesize`, BullMQ `audio-synthesis` job processor returning `{ success: true, audioBase64: string, audioUrl: string, sampleRate: number, durationSec: number, latencyMs: number }`

- [ ] **Step 1: Write failing test for Voice AI proxy & audio synthesis processor**

Create `artifacts/api-server/src/lib/queue/__tests__/audio-synthesis.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { executeJobByType } from "../task-processors";

describe("Audio Synthesis Queue Processor", () => {
  it("processes audio-synthesis job successfully with voice and audio data URI", async () => {
    const mockJob: any = {
      id: "job-audio-1",
      data: { jobType: "audio-synthesis", payload: { text: "স্বাগতম সঠিক এআই প্ল্যাটফর্মে।", persona: "ayesha_sales" } },
      updateProgress: vi.fn().mockResolvedValue(true),
    };

    const result = await executeJobByType("audio-synthesis", mockJob, { text: "স্বাগতম সঠিক এআই প্ল্যাটফর্মে।", persona: "ayesha_sales" }, "usr-test");
    expect(result.success).toBe(true);
    expect(result.jobType).toBe("audio-synthesis");
    expect(result.data).toBeDefined();
    expect(result.data.audioUrl).toBeDefined();
    expect(mockJob.updateProgress).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd artifacts/api-server && pnpm vitest run src/lib/queue/__tests__/audio-synthesis.test.ts`
Expected: FAIL or missing real audio payload fields.

- [ ] **Step 3: Implement Voice AI routes and live worker logic**

In `artifacts/api-server/src/routes/ai-tools-extended.ts`:
- Add `GET /api/v1/voice/personas`: Fetches personas from `http://127.0.0.1:8001/api/v1/personas` with fallback if daemon is starting.
- Add `POST /api/v1/voice/synthesize`: Proxies `{ text, persona, speed }` to `http://127.0.0.1:8001/api/v1/synthesize`, records Langfuse trace `voice-synthesis`.
In `artifacts/api-server/src/lib/queue/task-processors.ts`:
- Update `handleAudioSynthesis`: splits input text into sentences, calls `:8001/api/v1/synthesize` or combines chunks, updates progress `(i+1)/total * 100`, returns `{ success: true, audioBase64, audioUrl, sampleRate, durationSec, persona }`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd artifacts/api-server && pnpm vitest run src/lib/queue/__tests__/audio-synthesis.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/routes/ai-tools-extended.ts artifacts/api-server/src/lib/queue/task-processors.ts artifacts/api-server/src/lib/queue/__tests__/audio-synthesis.test.ts
git commit -m "feat(voice): implement Voice AI API proxy and BullMQ audio synthesis processor"
```

---

### Task 2: Reusable Frontend Audio Narration Player & Studio/Humanizer Mounting (Wave A)

**Files:**
- Create: `artifacts/shothik/src/components/audio/AudioNarrationPlayer.tsx`
- Modify: `artifacts/shothik/src/app-next/(primary-layout)/humanize-gpt/HumanizeGPTClient.tsx`
- Modify: `artifacts/shothik/src/components/writing-studio/PolishedWriteView.tsx`

**Interfaces:**
- Consumes: `/api/v1/voice/personas`, `/api/v1/voice/synthesize`
- Produces: `<AudioNarrationPlayer text={string} defaultPersona="ayesha_sales" title="Voice Narration" onAudioReady={(url) => void} />`

- [ ] **Step 1: Create AudioNarrationPlayer component**

Build `AudioNarrationPlayer.tsx` with:
- Persona selector with avatar/dialect tags (`Ayesha - Sales`, `Nusrat - FinTech`, `Zara - Bilingual`, `Tania - Casual`).
- Single-click "Synthesize & Listen" trigger.
- Play / Pause, Progress bar, time display, Speed toggle (0.75x, 1x, 1.25x, 1.5x), and Download WAV button.
- Animated sound-wave equalizer bars during playback.

- [ ] **Step 2: Mount AudioNarrationPlayer in HumanizeGPTClient**

In `HumanizeGPTClient.tsx`:
- Add a "🔊 Listen" button in the Humanized Output header.
- Expanding or clicking displays the `AudioNarrationPlayer` initialized with the humanized text.

- [ ] **Step 3: Mount AudioNarrationPlayer in Writing Studio (PolishedWriteView)**

In `PolishedWriteView.tsx`:
- Add a "🔊 Listen / Narrate" button in the editor toolbar.
- Opens an inline or floating narration dock passing the active chapter or selected text.

- [ ] **Step 4: Verify frontend build and interactive preview**

Run: `cd artifacts/shothik && pnpm build`
Expected: Build succeeds without TypeScript or Vite errors.

- [ ] **Step 5: Commit**

```bash
git add artifacts/shothik/src/components/audio/AudioNarrationPlayer.tsx artifacts/shothik/src/app-next/\(primary-layout\)/humanize-gpt/HumanizeGPTClient.tsx artifacts/shothik/src/components/writing-studio/PolishedWriteView.tsx
git commit -m "feat(ui): add AudioNarrationPlayer to Writing Studio and Humanizer"
```

---

### Task 3: Live-Web Plagiarism Radar via Wigolo SearXNG (Wave B)

**Files:**
- Modify: `artifacts/api-server/src/lib/academic/bengali-plagiarism-engine.ts`
- Modify: `artifacts/api-server/src/routes/plagiarism.ts`
- Modify: `artifacts/api-server/src/lib/queue/task-processors.ts`
- Test: `artifacts/api-server/src/lib/academic/__tests__/live-web-plagiarism.test.ts`

**Interfaces:**
- Consumes: `WigoloWebIntelligenceService.searchWeb()`, `SimpleRedisClient`
- Produces: `BengaliPlagiarismEngine.scanWithLiveWeb(text, title, author, options): Promise<PlagiarismReport>` with real web URLs and matches.

- [ ] **Step 1: Write failing test for live web plagiarism detection**

Create `artifacts/api-server/src/lib/academic/__tests__/live-web-plagiarism.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { BengaliPlagiarismEngine } from "../bengali-plagiarism-engine";
import { WigoloWebIntelligenceService } from "../../wigolo-service";

describe("BengaliPlagiarismEngine Live Web Radar", () => {
  it("queries SearXNG via Wigolo and reports web matches", async () => {
    vi.spyOn(WigoloWebIntelligenceService, "searchWeb").mockResolvedValue({
      query: "কৃত্রিম বুদ্ধিমত্তা",
      results: [
        {
          title: "কৃত্রিম বুদ্ধিমত্তা - উইকিপিডিয়া",
          url: "https://bn.wikipedia.org/wiki/কৃত্রিম_বুদ্ধিমত্তা",
          excerpt: "কৃত্রিম বুদ্ধিমত্তা হলো কম্পিউটার বিজ্ঞানের একটি শাখা যেখানে বুদ্ধিমত্তা বিশিষ্ট যন্ত্র তৈরি করা হয়।",
          citationId: "cit-1",
          evidenceScore: 92,
          engine: "searxng",
        },
      ],
      totalFound: 1,
      engineUsed: "searxng",
      cached: false,
      executedAt: new Date().toISOString(),
    });

    const report = await BengaliPlagiarismEngine.scanWithLiveWeb(
      "কৃত্রিম বুদ্ধিমত্তা হলো কম্পিউটার বিজ্ঞানের একটি শাখা যেখানে বুদ্ধিমত্তা বিশিষ্ট যন্ত্র তৈরি করা হয়।",
      "Test Document",
      "Test Author",
    );

    expect(report).toBeDefined();
    expect(report.matches.length).toBeGreaterThan(0);
    expect(report.matches[0].sourceUrl).toContain("wikipedia.org");
    expect(report.evaluatedAt).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd artifacts/api-server && pnpm vitest run src/lib/academic/__tests__/live-web-plagiarism.test.ts`
Expected: FAIL (`scanWithLiveWeb` is not a function).

- [ ] **Step 3: Implement scanWithLiveWeb in BengaliPlagiarismEngine & update router**

In `artifacts/api-server/src/lib/academic/bengali-plagiarism-engine.ts`:
- Add `static async scanWithLiveWeb(text: string, title: string, author: string, options?: { onProgress?: (percent: number) => void }): Promise<PlagiarismReport>`:
  - Extract candidate sentences / 5-gram shingles from `text`.
  - Perform live web search using `WigoloWebIntelligenceService.searchWeb()`.
  - Calculate shingle similarity between document sentences and returned web excerpts.
  - Compute `overallSimilarityPercent`, generate real citations (`apa`, `ieee`, `banglaAcademic`), and calculate `auditHashSha256`.
In `artifacts/api-server/src/routes/plagiarism.ts`:
- Support query parameter or body flag `liveWeb: true` to trigger `scanWithLiveWeb`.
In `artifacts/api-server/src/lib/queue/task-processors.ts`:
- Update `handlePlagiarismScan` to invoke `BengaliPlagiarismEngine.scanWithLiveWeb` and update job progress dynamically (0% -> 100%).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd artifacts/api-server && pnpm vitest run src/lib/academic/__tests__/live-web-plagiarism.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/lib/academic/bengali-plagiarism-engine.ts artifacts/api-server/src/routes/plagiarism.ts artifacts/api-server/src/lib/queue/task-processors.ts artifacts/api-server/src/lib/academic/__tests__/live-web-plagiarism.test.ts
git commit -m "feat(plagiarism): add live web plagiarism radar powered by Wigolo and SearXNG"
```

---

### Task 4: Plagiarism Checker UI Live Web Radar Integration (Wave B)

**Files:**
- Modify: `artifacts/shothik/src/components/plagiarism/PlagiarismInputEditor.tsx`
- Modify: `artifacts/shothik/src/components/plagiarism/PlagiarismResultsPanel.tsx`
- Modify: `artifacts/shothik/src/components/plagiarism/ScanProgress.tsx`

**Interfaces:**
- Consumes: `/api/v1/academic/plagiarism/scan?liveWeb=true`, `/api/v1/jobs/submit`, `/api/v1/jobs/:id/events`
- Produces: Live Web Radar switch, real-time progress bar with current URL queried, and rich web source cards with direct external links.

- [ ] **Step 1: Add Live Web Radar toggle in PlagiarismInputEditor**

In `PlagiarismInputEditor.tsx`:
- Add a toggle switch: `🌐 Live Web Radar (SearXNG + Redis)` with badge `Free • $0 API Cost`.
- Pass `liveWeb: boolean` in scan request payload.

- [ ] **Step 2: Update ScanProgress to show live web querying phase**

In `ScanProgress.tsx`:
- Show stages: "Splitting N-Grams", "Searching SearXNG (Google, Bing, Academic)", "Comparing Web Excerpts", "Generating UGC Audit Hash".

- [ ] **Step 3: Enhance PlagiarismResultsPanel with live web source cards**

In `PlagiarismResultsPanel.tsx`:
- Render clickable link pills for detected web sources (`bn.wikipedia.org`, `prothomalo.com`, etc.).
- Add "Visit Source" external link icon and citation copy buttons.

- [ ] **Step 4: Verify frontend build**

Run: `cd artifacts/shothik && pnpm build`
Expected: Build succeeds cleanly.

- [ ] **Step 5: Commit**

```bash
git add artifacts/shothik/src/components/plagiarism/PlagiarismInputEditor.tsx artifacts/shothik/src/components/plagiarism/PlagiarismResultsPanel.tsx artifacts/shothik/src/components/plagiarism/ScanProgress.tsx
git commit -m "feat(ui): connect plagiarism UI with Live Web Radar and source inspector"
```

---

### Task 5: End-to-End Verification & Pre-Commit / Pre-Push Gates

**Files:**
- Test: All 217+ test suites across API server & frontend
- Script: `pnpm test:ecc`

**Interfaces:**
- Consumes: Entire codebase
- Produces: 100% test pass rate, clean TypeScript build, verified live integration with `:8001` (Voice AI) and `:8888` (SearXNG).

- [ ] **Step 1: Run complete API server test suite**

Run: `cd artifacts/api-server && pnpm test`
Expected: All tests pass.

- [ ] **Step 2: Run complete enterprise ECC test suite**

Run: `pnpm test:ecc`
Expected: 217+ test files pass (1,170+ tests).

- [ ] **Step 3: Verify TypeScript compilation**

Run: `pnpm --filter @workspace/api-server build && pnpm --filter @workspace/shothik build`
Expected: Zero type errors, successful bundle generation.

- [ ] **Step 4: Restart API server daemon on port 8080**

Restart task-17070 or spawn new node instance to load newly built bundles.
Verify `curl -s http://127.0.0.1:8080/api/v1/voice/personas` returns 200 OK.

- [ ] **Step 5: Final Git Commit and Push**

```bash
git push origin main
git push origin feat/supabase-deeptech-transformation
```
