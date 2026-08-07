import { describe, expect, it, vi } from "vitest";

import {
  describeRouteAdapterTarget,
  resolveRouteAdapterTarget,
  forwardRouteAdapterRequest,
} from "@/lib/hermes/modules/model-router/route-adapter";

describe("route adapter", () => {
  it("maps 9router routes to the gateway service", () => {
    const selection = {
      provider: "openai" as const,
      model: "openai/gpt-4o-mini",
      modelHandle: "openai/gpt-4o-mini",
      transport: "openai_sse" as const,
      apiKey: "router-key",
      baseUrl: "http://localhost:20128/v1",
      priority: 10,
    };

    const described = describeRouteAdapterTarget(
      {
        routeId: "route_1",
        capabilityId: "conversation.respond",
        backend: "nine_router",
        provider: "openai",
        model: "openai/gpt-4o-mini",
        modelHandle: "openai/gpt-4o-mini",
        transport: "openai_sse",
        baseUrl: "http://localhost:20128/v1",
        apiKey: "router-key",
        reason: "test",
        fallbackChain: [],
        observabilityLabels: {},
      },
      selection,
    );

    expect(described).toMatchObject({
      ruleId: "nine_router_openai_forward",
      targetService: "9router_gateway",
      requestUrl: "http://localhost:20128/v1/chat/completions",
    });
  });

  it("maps Gemini direct routes to the Gemini service", () => {
    const target = resolveRouteAdapterTarget(
      {
        routeId: "route_2",
        capabilityId: "conversation.respond",
        backend: "direct_provider",
        provider: "gemini",
        model: "gemini-2.5-flash",
        modelHandle: "gemini/gemini-2.5-flash",
        transport: "gemini_sse",
        baseUrl: "https://generativelanguage.googleapis.com",
        apiKey: "gem-key",
        reason: "test",
        fallbackChain: [],
        observabilityLabels: {},
      },
      {
        selection: {
          provider: "gemini",
          model: "gemini-2.5-flash",
          modelHandle: "gemini/gemini-2.5-flash",
          transport: "gemini_sse",
          apiKey: "gem-key",
          baseUrl: "https://generativelanguage.googleapis.com",
          priority: 10,
        },
        messages: [{ role: "user", content: "hello" }],
        systemPrompt: "be helpful",
        temperature: 0.8,
        maxOutputTokens: 128,
      },
    );

    expect(target.ruleId).toBe("direct_provider_gemini_stream");
    expect(target.targetService).toBe("google_generative_language");
    expect(target.requestUrl).toContain(
      "/models/gemini-2.5-flash:streamGenerateContent",
    );
  });

  it("maps direct OpenAI-compatible routes for DeepSeek and Kimi", () => {
    const deepseekTarget = resolveRouteAdapterTarget(
      {
        routeId: "route_deepseek",
        capabilityId: "conversation.respond",
        backend: "direct_provider",
        provider: "deepseek",
        model: "deepseek-chat",
        modelHandle: "deepseek/deepseek-chat",
        transport: "openai_sse",
        baseUrl: "https://api.deepseek.com/v1",
        apiKey: "ds-key",
        reason: "test",
        fallbackChain: [],
        observabilityLabels: {},
      },
      {
        selection: {
          provider: "deepseek",
          model: "deepseek-chat",
          modelHandle: "deepseek/deepseek-chat",
          transport: "openai_sse",
          apiKey: "ds-key",
          baseUrl: "https://api.deepseek.com/v1",
          priority: 10,
        },
        messages: [{ role: "user", content: "explain quantum physics" }],
        systemPrompt: "be detailed",
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    );

    expect(deepseekTarget.ruleId).toBe("direct_provider_openai_compatible_stream");
    expect(deepseekTarget.targetService).toBe("deepseek_api");
    expect(deepseekTarget.requestUrl).toBe("https://api.deepseek.com/v1/chat/completions");
  });

  it("forwards request via fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    const res = await forwardRouteAdapterRequest({
      route: {
        routeId: "route_fwd",
        capabilityId: "conversation.respond",
        backend: "direct_provider",
        provider: "openai",
        model: "gpt-4o-mini",
        modelHandle: "openai/gpt-4o-mini",
        transport: "openai_sse",
        baseUrl: "https://api.openai.com/v1",
        apiKey: "sk-test",
        reason: "test",
        fallbackChain: [],
        observabilityLabels: {},
      },
      payload: {
        selection: {
          provider: "openai",
          model: "gpt-4o-mini",
          modelHandle: "openai/gpt-4o-mini",
          transport: "openai_sse",
          apiKey: "sk-test",
          baseUrl: "https://api.openai.com/v1",
          priority: 10,
        },
        messages: [{ role: "user", content: "ping" }],
        systemPrompt: "pong",
        temperature: 0.5,
        maxOutputTokens: 50,
      },
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer sk-test",
        }),
      })
    );
    expect(res.status).toBe(200);

    fetchSpy.mockRestore();
  });

  it("throws when no rule matches the route transport", () => {
    expect(() =>
      describeRouteAdapterTarget(
        {
          routeId: "route_3",
          capabilityId: "conversation.respond",
          backend: "nine_router",
          provider: "openai",
          model: "gpt-4o-mini",
          modelHandle: "openai/gpt-4o-mini",
          transport: "gemini_sse",
          baseUrl: "http://localhost:20128/v1",
          apiKey: "router-key",
          reason: "test",
          fallbackChain: [],
          observabilityLabels: {},
        },
        {
          provider: "openai",
          model: "gpt-4o-mini",
          modelHandle: "openai/gpt-4o-mini",
          transport: "gemini_sse",
          apiKey: "router-key",
          baseUrl: "http://localhost:20128/v1",
          priority: 10,
        },
      ),
    ).toThrow(/No route adapter rule matched/);
  });
});
