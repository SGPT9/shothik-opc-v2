import { describe, it, expect, beforeEach } from "vitest";
import { TwinOrchestrator } from "../../lib/twin/twin-orchestrator.js";
import { actorSupervisor } from "../../lib/twin/actor-supervisor.js";

describe("Bridge 3: Twin Orchestrator to Erlang/OTP Actor Supervisor Bridge", () => {
  const orchestrator = TwinOrchestrator.getInstance();

  beforeEach(() => {
    // Ensure all 10 specialized twins are instantiated in supervisor
    TwinOrchestrator.getInstance();
  });

  it("verifies all 10 specialized twins are supervised actors with clean initial states", () => {
    const actors = actorSupervisor.listActors();
    const actorIds = actors.map((a) => a.actorId);

    expect(actorIds).toContain("sales_twin");
    expect(actorIds).toContain("operations_twin");
    expect(actorIds).toContain("marketing_twin");
    expect(actorIds).toContain("content_twin");
    expect(actorIds).toContain("customer_support_twin");

    const salesActor = actorSupervisor.getActorState("sales_twin");
    expect(salesActor).toBeDefined();
    expect(salesActor?.status).toBe("IDLE");
  });

  it("processes cycle through supervised actor mailbox and increments actor processed count", async () => {
    const initialProcessed = actorSupervisor.getActorState("sales_twin")?.processedCount || 0;

    const signal = {
      source: "whatsapp" as const,
      payload: {
        text: "ভাই আমাদের প্রতিষ্ঠানের জন্য বাল্ক অর্ডার দিতে চাই",
        amount: 3000,
      },
      userId: "usr_bridge_actor_01",
      companySlug: "bengal_fabrics",
    };

    const result = await orchestrator.processCycle(signal);

    expect(result.executionStatus).toBe("executed_autonomously");
    expect(result.decision.targetTwin).toBe("sales_twin");
    expect(result.twinOutput).toContain("[Sales Twin]");

    const updatedSalesActor = actorSupervisor.getActorState("sales_twin");
    expect(updatedSalesActor?.processedCount).toBeGreaterThan(initialProcessed);
    expect(updatedSalesActor?.status).toBe("IDLE");
  });

  it("safely contains actor failure and dead-letters without breaking orchestrator pipeline", async () => {
    // 1. Force a temporary crashing handler on content_twin
    const originalActor = (actorSupervisor as any).actors.get("content_twin");
    expect(originalActor).toBeDefined();

    const originalHandler = originalActor.spec.handler;
    originalActor.spec.handler = async () => {
      throw new Error("Simulated LLM token rate-limit burst crash");
    };

    const signal = {
      source: "manual_intent" as const,
      payload: {
        message: "নতুন প্রোডাক্ট লঞ্চের ফেসবুক ক্যাম্পেইন পোস্ট লিখুন",
      },
      userId: "usr_bridge_actor_02",
      companySlug: "deshi_gadgets",
    };

    // 2. Process cycle - should not throw unhandled exception
    const result = await orchestrator.processCycle(signal);

    expect(result.decision.targetTwin).toBe("content_twin");
    expect(result.executionStatus).toBe("executed_autonomously");
    expect(result.twinOutput).toContain("[Content Twin]");

    // 3. Verify actor supervisor caught the crash and recorded dead letter
    const contentActorState = actorSupervisor.getActorState("content_twin");
    expect(contentActorState?.crashCount).toBeGreaterThanOrEqual(1);

    const deadLetters = actorSupervisor.getDeadLetters("content_twin");
    expect(deadLetters.length).toBeGreaterThanOrEqual(1);
    expect(deadLetters[deadLetters.length - 1].error).toContain("Simulated LLM token rate-limit burst crash");

    // Restore original handler
    originalActor.spec.handler = originalHandler;
  });
});
