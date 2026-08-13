import { describe, it, expect } from 'vitest';
import {
  ModelMeshRouter,
  type ComputeTier,
  type DeviceHardwareProfile,
  type ModelRouteSelection
} from '../model-mesh-router';

describe('ModelMeshRouter (AirLLM + FunctionGemma + Colibri + Needle + Switchyard + Wayfinder)', () => {
  it('registers all 4 compute tiers accurately', () => {
    const router = new ModelMeshRouter();
    const tiers = router.getAvailableTiers();
    
    expect(tiers).toContain('tier0_micro_edge'); // Needle 2 (45M) & Colibri
    expect(tiers).toContain('tier1_fast_slm');   // FunctionGemma (270M)
    expect(tiers).toContain('tier2_local_airllm'); // AirLLM 70B (Layer-offload)
    expect(tiers).toContain('tier3_cloud_frontier'); // Switchyard Proxy (Claude/Gemini)
  });

  it('routes to Tier 0 (Needle/Colibri) for offline low-RAM (2GB) devices when intent confidence is high', () => {
    const router = new ModelMeshRouter();
    const lowEndDevice: DeviceHardwareProfile = {
      ramGb: 2,
      vramGb: 0,
      isOnline: false,
      hasGpu: false,
    };

    const route: ModelRouteSelection = router.selectRoute({
      query: 'calculate bKash fee for 5000 BDT',
      mode: 'chat',
      confidence: 0.95,
      device: lowEndDevice,
    });

    expect(route.tier).toBe('tier0_micro_edge');
    expect(route.engine).toBe('needle_2');
    expect(route.expectedVramMb).toBeLessThan(35);
  });

  it('routes to Tier 1 (FunctionGemma) for fast structured tool calling when online and 4GB+ RAM available', () => {
    const router = new ModelMeshRouter();
    const midDevice: DeviceHardwareProfile = {
      ramGb: 4,
      vramGb: 0,
      isOnline: true,
      hasGpu: false,
    };

    const route: ModelRouteSelection = router.selectRoute({
      query: 'call search_academic_sources with domain arxiv.org',
      mode: 'deepresearch',
      confidence: 0.88,
      device: midDevice,
    });

    expect(route.tier).toBe('tier1_fast_slm');
    expect(route.engine).toBe('function_gemma_270m');
  });

  it('routes to Tier 2 (AirLLM) when deep local reasoning is needed and local GPU has SSD layer-offloading', () => {
    const router = new ModelMeshRouter();
    const workstationDevice: DeviceHardwareProfile = {
      ramGb: 16,
      vramGb: 6,
      isOnline: false, // Offline heavy work
      hasGpu: true,
    };

    const route: ModelRouteSelection = router.selectRoute({
      query: 'deeply critique and rewrite 20-page dissertation chapter without internet',
      mode: 'bookwriting',
      confidence: 0.70,
      device: workstationDevice,
    });

    expect(route.tier).toBe('tier2_local_airllm');
    expect(route.engine).toBe('air_llm_70b');
    expect(route.layerStreamingEnabled).toBe(true);
  });

  it('routes to Tier 3 (NVIDIA Switchyard) when high reasoning power and internet connectivity are available', () => {
    const router = new ModelMeshRouter();
    const standardDevice: DeviceHardwareProfile = {
      ramGb: 8,
      vramGb: 2,
      isOnline: true,
      hasGpu: true,
    };

    const route: ModelRouteSelection = router.selectRoute({
      query: 'synthesize cross-market macroeconomic analysis and generate pitch slides',
      mode: 'slide',
      confidence: 0.60, // Complex / ambiguous
      device: standardDevice,
    });

    expect(route.tier).toBe('tier3_cloud_frontier');
    expect(route.engine).toBe('switchyard_stage_router');
    expect(route.protocolTranslation).toBe('universal_anthropic_openai');
  });

  it('integrates Wayfinder decision mapping to clear the fog of war on complex planning tasks', () => {
    const router = new ModelMeshRouter();
    const map = router.createWayfinderMap({
      destination: 'Publish 10-Chapter Book with Physical Steadfast Courier Delivery',
      initialTickets: [
        { title: 'Lock character arcs in Story Bible', type: 'grilling', blockedBy: [] },
        { title: 'Draft chapter 1 to 5 with AirLLM', type: 'task', blockedBy: ['Lock character arcs in Story Bible'] },
      ],
    });

    expect(map.destination).toContain('Publish 10-Chapter Book');
    expect(map.tickets).toHaveLength(2);
    expect(map.getUnblockedFrontier()).toHaveLength(1);
    expect(map.getUnblockedFrontier()[0].title).toBe('Lock character arcs in Story Bible');
  });
});
