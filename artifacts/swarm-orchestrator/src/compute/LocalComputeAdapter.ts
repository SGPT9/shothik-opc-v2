export interface LocalInferenceRequest {
  model?: string;
  prompt: string;
  system?: string;
  stream?: boolean;
}

export interface LocalInferenceResponse {
  model: string;
  response: string;
  totalDurationMs?: number;
  tokensGenerated?: number;
}

export class LocalComputeAdapter {
  private ollamaEndpoint: string;
  private apiGatewayEndpoint: string;

  constructor(
    ollamaEndpoint = "http://127.0.0.1:11434",
    apiGatewayEndpoint = "http://localhost:8080"
  ) {
    this.ollamaEndpoint = ollamaEndpoint;
    this.apiGatewayEndpoint = apiGatewayEndpoint;
  }

  /**
   * Execute local fast inference on Intel Arc GPU (Qwen2.5-Coder:7b)
   */
  public async generate(request: LocalInferenceRequest): Promise<LocalInferenceResponse> {
    const payload = {
      model: request.model || "qwen2.5-coder:7b",
      prompt: request.prompt,
      system: request.system,
      stream: false,
    };

    const res = await fetch(`${this.ollamaEndpoint}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Ollama local compute error: HTTP ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return {
      model: data.model,
      response: data.response,
      totalDurationMs: data.total_duration ? Math.round(data.total_duration / 1e6) : undefined,
      tokensGenerated: data.eval_count,
    };
  }

  /**
   * Health check local GPU Ollama instance
   */
  public async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.ollamaEndpoint}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }
}
