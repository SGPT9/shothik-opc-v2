import { createClient } from "@insforge/sdk";

const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_BASE_URL || "https://ers8j28a.ap-southeast.insforge.app",
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || "anon-key-placeholder",
});

const SLIDE_API_URL = import.meta.env.VITE_SLIDE_API_URL || "http://localhost:3004";

export interface CreateSlideRequest {
  topic: string;
  slideCount: number;
  template: string;
  targetAudience?: string;
  language?: string;
  userId: string;
}

export interface SlideJob {
  id: string;
  status: "outline" | "design" | "content" | "formatting" | "review" | "paused" | "completed" | "failed";
  progress: number;
  currentStep: string;
  slides?: any[];
  error?: string;
}

// Create slide generation job
export const createSlideJob = async (request: CreateSlideRequest): Promise<{ jobId: string } | null> => {
  try {
    const response = await fetch(`${SLIDE_API_URL}/slides`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    
    const data = await response.json();
    if (data.success) {
      return { jobId: data.jobId };
    }
    return null;
  } catch (error) {
    console.error("Failed to create slide job:", error);
    return null;
  }
};

// Get job status
export const getSlideJobStatus = async (jobId: string): Promise<SlideJob | null> => {
  try {
    const response = await fetch(`${SLIDE_API_URL}/slides/${jobId}`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to get job status:", error);
    return null;
  }
};

// Subscribe to job progress via SSE
export const subscribeToJobProgress = (
  jobId: string,
  onProgress: (job: SlideJob) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const eventSource = new EventSource(`${SLIDE_API_URL}/slides/${jobId}/stream`);
  
  eventSource.onmessage = (event) => {
    try {
      const job = JSON.parse(event.data);
      onProgress(job);
      
      // Close connection if job is complete
      if (job.status === "completed" || job.status === "failed") {
        eventSource.close();
      }
    } catch (error) {
      console.error("Failed to parse SSE data:", error);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error("SSE error:", error);
    onError?.(new Error("Connection failed"));
    eventSource.close();
  };
  
  // Return cleanup function
  return () => {
    eventSource.close();
  };
};

// Pause job
export const pauseSlideJob = async (jobId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${SLIDE_API_URL}/slides/${jobId}/pause`, {
      method: "POST",
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Failed to pause job:", error);
    return false;
  }
};

// Resume job
export const resumeSlideJob = async (jobId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${SLIDE_API_URL}/slides/${jobId}/resume`, {
      method: "POST",
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Failed to resume job:", error);
    return false;
  }
};

// Get user's jobs
export const getUserSlideJobs = async (userId: string): Promise<SlideJob[]> => {
  try {
    const response = await fetch(`${SLIDE_API_URL}/slides?userId=${userId}`);
    const data = await response.json();
    return data.jobs || [];
  } catch (error) {
    console.error("Failed to get user jobs:", error);
    return [];
  }
};

// Cancel job
export const cancelSlideJob = async (jobId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${SLIDE_API_URL}/slides/${jobId}/cancel`, {
      method: "POST",
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Failed to cancel job:", error);
    return false;
  }
};

// InsForge PostgreSQL DB Sync
export const syncJobToInsForgePostgres = async (job: SlideJob): Promise<boolean> => {
  try {
    const { data, error } = await insforge.database
      .from("slide_jobs")
      .insert([{ id: job.id, status: job.status, progress: job.progress, created_at: new Date().toISOString() }]);

    if (error) {
      console.warn("InsForge DB insert warning (fallback active):", error.message);
    }
    return !error;
  } catch (e) {
    console.warn("InsForge DB sync offline fallback:", e);
    return false;
  }
};

// InsForge Realtime WebSocket Subscription
export const subscribeToInsForgeRealtimeSlideUpdates = (
  jobId: string,
  onUpdate: (payload: any) => void
) => {
  return insforge.realtime.subscribe(`slide_jobs:${jobId}`, (payload) => {
    onUpdate(payload);
  });
};

