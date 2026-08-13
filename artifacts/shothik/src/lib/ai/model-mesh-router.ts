/**
 * ModelMeshRouter — Smart Stage Router across AirLLM, FunctionGemma, Colibri, Needle 2, and NVIDIA Switchyard
 * Orchestrated with Wayfinder Decision Mapping & Continuous Hardware Awareness
 * 
 * Compute Hierarchy:
 *  - Tier 0: Micro-Edge (<35MB RAM, <5ms) — Needle 2 (45M) & Colibri
 *  - Tier 1: Fast Small Language Model (SLM) — FunctionGemma (270M)
 *  - Tier 2: Layer-Streaming Local Big Models (4-8GB VRAM) — AirLLM 70B
 *  - Tier 3: Cloud Frontier & Resilient Proxy — NVIDIA NeMo Switchyard
 */

import { StudioMode } from './needle-dispatcher';

export type ComputeTier = 'tier0_micro_edge' | 'tier1_fast_slm' | 'tier2_local_airllm' | 'tier3_cloud_frontier';

export interface DeviceHardwareProfile {
  ramGb: number;
  vramGb: number;
  isOnline: boolean;
  hasGpu: boolean;
  connectionType?: '3g' | '4g' | '5g' | 'wifi' | 'offline';
}

export interface ModelRouteSelection {
  tier: ComputeTier;
  engine: 'needle_2' | 'colibri_embed' | 'function_gemma_270m' | 'air_llm_70b' | 'switchyard_stage_router';
  expectedVramMb: number;
  layerStreamingEnabled?: boolean;
  protocolTranslation?: 'universal_anthropic_openai' | 'native';
  reason: string;
}

export interface WayfinderTicket {
  id: string;
  title: string;
  type: 'research' | 'prototype' | 'grilling' | 'task';
  blockedBy: string[]; // List of ticket titles or IDs
  status: 'open' | 'claimed' | 'closed';
  resolution?: string;
}

export interface WayfinderMap {
  id: string;
  destination: string;
  tickets: WayfinderTicket[];
  getUnblockedFrontier: () => WayfinderTicket[];
  closeTicket: (ticketIdOrTitle: string, resolution: string) => void;
}

export class ModelMeshRouter {
  private availableTiers: ComputeTier[] = [
    'tier0_micro_edge',
    'tier1_fast_slm',
    'tier2_local_airllm',
    'tier3_cloud_frontier',
  ];

  public getAvailableTiers(): ComputeTier[] {
    return [...this.availableTiers];
  }

  public selectRoute(options: {
    query: string;
    mode: StudioMode;
    confidence: number;
    device: DeviceHardwareProfile;
  }): ModelRouteSelection {
    const { mode, confidence, device } = options;

    // 1. If offline or ultra-low RAM (<=2GB), enforce Tier 0 Edge (Needle 2 / Colibri)
    if (!device.isOnline || (device.ramGb <= 2 && confidence >= 0.80)) {
      if (!device.isOnline && device.hasGpu && device.vramGb >= 4 && confidence < 0.80) {
        // Offline with Workstation GPU -> Tier 2 AirLLM Layer Streaming
        return {
          tier: 'tier2_local_airllm',
          engine: 'air_llm_70b',
          expectedVramMb: 3800,
          layerStreamingEnabled: true,
          reason: 'Offline workstation mode: AirLLM 70B layer streaming enabled for heavy reasoning on local GPU.',
        };
      }

      return {
        tier: 'tier0_micro_edge',
        engine: 'needle_2',
        expectedVramMb: 28,
        reason: 'Low-RAM or offline environment: Dispatched to Needle 2 45M edge engine (28MB RAM).',
      };
    }

    // 2. If online with 4GB+ RAM and moderate/high confidence on structured tool calls -> Tier 1 FunctionGemma
    if (device.isOnline && device.ramGb >= 4 && confidence >= 0.85 && (mode === 'deepresearch' || mode === 'coding')) {
      return {
        tier: 'tier1_fast_slm',
        engine: 'function_gemma_270m',
        expectedVramMb: 350,
        reason: 'Structured tool dispatch: FunctionGemma 270M fast path selected.',
      };
    }

    // 3. If online with ambiguous/complex queries -> Tier 3 NVIDIA Switchyard
    return {
      tier: 'tier3_cloud_frontier',
      engine: 'switchyard_stage_router',
      expectedVramMb: 0,
      protocolTranslation: 'universal_anthropic_openai',
      reason: 'Complex or multi-hop query: Routed through NVIDIA Switchyard Universal Stage Router.',
    };
  }

  public createWayfinderMap(config: {
    destination: string;
    initialTickets: { title: string; type: 'research' | 'prototype' | 'grilling' | 'task'; blockedBy?: string[] }[];
  }): WayfinderMap {
    const tickets: WayfinderTicket[] = config.initialTickets.map((t, idx) => ({
      id: `ticket_${idx + 1}`,
      title: t.title,
      type: t.type,
      blockedBy: t.blockedBy || [],
      status: 'open',
    }));

    const mapInstance: WayfinderMap = {
      id: `map_${Date.now()}`,
      destination: config.destination,
      tickets,
      getUnblockedFrontier: () => {
        const closedTitles = new Set(
          tickets.filter((t) => t.status === 'closed').map((t) => t.title)
        );
        const closedIds = new Set(
          tickets.filter((t) => t.status === 'closed').map((t) => t.id)
        );

        return tickets.filter((t) => {
          if (t.status !== 'open') return false;
          // Unblocked if every blocker is closed
          return t.blockedBy.every((blocker) => closedTitles.has(blocker) || closedIds.has(blocker));
        });
      },
      closeTicket: (ticketIdOrTitle: string, resolution: string) => {
        const target = tickets.find(
          (t) => t.id === ticketIdOrTitle || t.title === ticketIdOrTitle
        );
        if (target) {
          target.status = 'closed';
          target.resolution = resolution;
        }
      },
    };

    return mapInstance;
  }
}
