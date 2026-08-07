import { describe, expect, it } from "vitest";
import { getHermesCapabilityRegistry } from "@/lib/hermes/modules/capability-registry";

describe("Hermes capability registry service", () => {
  it("lists enabled chat capabilities", () => {
    const registry = getHermesCapabilityRegistry();

    const capabilities = registry.listCapabilities({ domain: "chat" });

    expect(capabilities.map((capability) => capability.id)).toEqual(
      expect.arrayContaining([
        "conversation.respond",
        "reasoning.plan",
        "retrieval.search",
        "document.ingest",
      ]),
    );
  });

  it("returns full registry metadata", () => {
    const registryService = getHermesCapabilityRegistry();
    const fullRegistry = registryService.getRegistry();

    expect(fullRegistry.version).toBe("1.0.0");
    expect(fullRegistry.capabilities.length).toBeGreaterThan(0);
    expect(fullRegistry.models.length).toBeGreaterThan(0);
    expect(fullRegistry.tools.length).toBeGreaterThan(0);
  });

  it("requires known capability definitions and throws on missing", () => {
    const registry = getHermesCapabilityRegistry();

    const capability = registry.requireCapability("conversation.respond");
    expect(capability.ownerModule).toBe("chat-orchestrator");
    expect(capability.executionMode).toBe("model");

    expect(() => registry.requireCapability("nonexistent.capability")).toThrow(
      "Unknown Hermes capability: nonexistent.capability"
    );
  });

  it("exposes model capabilities by id", () => {
    const registry = getHermesCapabilityRegistry();

    const geminiCap = registry.getModelCapability("gemini/gemini-2.5-flash");
    expect(geminiCap?.supportsStreaming).toBe(true);
    expect(geminiCap?.provider).toBe("google");

    const openaiCap = registry.getModelCapability("openai/gpt-4o-mini");
    expect(openaiCap?.supportsStreaming).toBe(true);
    expect(openaiCap?.modelId).toBe("gpt-4o-mini");
  });

  it("exposes tool capabilities by id", () => {
    const registry = getHermesCapabilityRegistry();

    const toolCap = registry.getToolCapability("workspace.search");
    expect(toolCap?.toolName).toBe("workspace_search");
    expect(toolCap?.requiredPermissions).toContain("workspace.read");
  });
});
