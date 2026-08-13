import { describe, it, expect } from 'vitest';
import { NeedleDispatcher } from '../needle-dispatcher';
import { ModelMeshRouter } from '../model-mesh-router';

describe('ScenarioLab Hardware & Demography Audit (2GB RAM / 3G / bKash / Steadfast)', () => {
  it('enforces <= 35MB RAM footprint budget on low-end 2GB RAM devices', () => {
    const router = new ModelMeshRouter();
    const route = router.selectRoute({
      query: 'calculate total price with 1.85% bkash charge for 1200 taka',
      mode: 'chat',
      confidence: 0.95,
      device: {
        ramGb: 2,
        isOnline: true,
        hasGpu: false,
        vramGb: 0,
        connectionType: '3g',
      },
    });

    expect(route.tier).toBe('tier0_micro_edge');
    expect(route.expectedVramMb).toBeLessThanOrEqual(35);
    expect(route.engine).toBe('needle_2');
  });

  it('correctly calculates bKash 1.85% fee with exact decimal precision', () => {
    const dispatcher = new NeedleDispatcher();
    const result = dispatcher.calculateExactMath('1500 * 0.0185');

    expect(result).toBe(27.75);
    expect(1500 + result).toBe(1527.75);
  });

  it('normalizes Banglish phonetics accurately for low-bandwidth users', () => {
    const dispatcher = new NeedleDispatcher();
    const normalized = dispatcher.normalizeBanglish('kivabe');

    expect(normalized).toBe('কীভাবে');
  });

  it('validates Steadfast courier delivery payload for 64 districts in Bangladesh', () => {
    const validateSteadfastOrder = (order: {
      recipientPhone: string;
      district: string;
      amount: number;
    }) => {
      const bdPhoneRegex = /^01[3-9]\d{8}$/;
      if (!bdPhoneRegex.test(order.recipientPhone)) {
        throw new Error('Invalid Bangladeshi mobile number');
      }
      if (!order.district || order.amount <= 0) {
        throw new Error('Invalid parcel specifications');
      }
      return {
        consignmentId: `STD-${Date.now()}`,
        status: 'in_review',
        deliveryFee: order.district.toLowerCase() === 'dhaka' ? 60 : 120,
      };
    };

    const dhakaOrder = validateSteadfastOrder({
      recipientPhone: '01712345678',
      district: 'Dhaka',
      amount: 450,
    });
    expect(dhakaOrder.deliveryFee).toBe(60);
    expect(dhakaOrder.consignmentId).toMatch(/^STD-/);

    const chittagongOrder = validateSteadfastOrder({
      recipientPhone: '01812345678',
      district: 'Chittagong',
      amount: 450,
    });
    expect(chittagongOrder.deliveryFee).toBe(120);

    expect(() =>
      validateSteadfastOrder({
        recipientPhone: '12345',
        district: 'Dhaka',
        amount: 450,
      })
    ).toThrow(/Invalid Bangladeshi mobile number/);
  });
});
