import { DeerFlowService } from "@/services/deerflow.service";
import { StoryBibleMemoryService } from "@/lib/story-bible-memory";

export interface TwinResearchTaskRequest {
  twinId: string;
  topic: string;
  citationStyle?: "APA" | "MLA" | "IEEE" | "Harvard";
  sources?: string[];
}

export interface TwinResearchTaskResult {
  taskId: string;
  threadId: string;
  status: "queued" | "running" | "completed" | "failed";
  paperTitle: string;
  paperOutline?: string[];
  pdfUrl?: string;
}

export class TwinResearchDispatcher {
  /**
   * Dispatch an autonomous background research paper generation task for AI Twin.
   */
  static async dispatchTask(request: TwinResearchTaskRequest): Promise<TwinResearchTaskResult> {
    const thread = await DeerFlowService.createThread({
      twinId: request.twinId,
      topic: request.topic,
      citationStyle: request.citationStyle || "APA",
    });

    const taskId = `twin-task-${Date.now()}`;
    const paperTitle = `Research Paper: ${request.topic}`;

    // Save task metadata to StoryBible / Lore memory for persistence
    await StoryBibleMemoryService.saveLore(
      request.twinId,
      "plot_hook",
      `Research: ${request.topic}`,
      `Citation Style: ${request.citationStyle || "APA"}. Thread: ${thread.thread_id}`
    );

    return {
      taskId,
      threadId: thread.thread_id,
      status: "queued",
      paperTitle,
      paperOutline: [
        "1. Abstract & Thesis Statement",
        "2. Introduction & Background",
        "3. Literature Review (arXiv & PubMed Scans)",
        "4. Methodology & Theoretical Framework",
        "5. Results & Discussion",
        "6. Verified References & DOIs",
      ],
      pdfUrl: `/api/latex/export/${taskId}`,
    };
  }
}
