/**
 * DeerFlow 2.0 Client Service Helper
 * Handles communication between Shothik Web frontend and DeerFlow FastAPI backend.
 */

export interface DeerFlowThread {
  thread_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface DeerFlowHealthResponse {
  status: 'ok' | 'degraded' | 'offline';
  version?: string;
  engine?: string;
  port?: number;
}

export class DeerFlowService {
  private static baseUrl = '/api/langgraph';

  /**
   * Check if DeerFlow FastAPI backend service is online and healthy.
   */
  static async checkHealth(): Promise<DeerFlowHealthResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) {
        return { status: 'degraded' };
      }
      const data = await res.json();
      return {
        status: 'ok',
        version: data.version || '2.0.0',
        engine: 'LangGraph SuperAgent',
        port: 8000,
      };
    } catch {
      return { status: 'offline' };
    }
  }

  /**
   * Create a new persistent LangGraph thread for a story writing or research session.
   */
  static async createThread(metadata: Record<string, any> = {}): Promise<DeerFlowThread> {
    try {
      const res = await fetch(`${this.baseUrl}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata }),
      });
      if (!res.ok) {
        throw new Error(`Failed to create thread: ${res.statusText}`);
      }
      return await res.json();
    } catch (err: any) {
      // Fallback thread generation for local dev mode
      return {
        thread_id: `th-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata,
      };
    }
  }

  /**
   * Fetch thread execution history and checkpoint state.
   */
  static async getThreadHistory(threadId: string): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/threads/${threadId}/history`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }
}
