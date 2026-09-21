import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import app from '../../app.js';

describe('Fulfillment API Routes', () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('GET /api/v1/fulfillment/hubs should return all dark hubs with metrics', async () => {
    const res = await fetch(`${baseUrl}/api/v1/fulfillment/hubs`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.hubs)).toBe(true);
    expect(body.hubs.length).toBeGreaterThan(0);
    expect(body.hubs[0].metrics).toBeDefined();
  });

  it('GET /api/v1/fulfillment/inventory should return inventory items', async () => {
    const res = await fetch(`${baseUrl}/api/v1/fulfillment/inventory`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.inventory)).toBe(true);
  });

  it('POST /api/v1/fulfillment/route-order should route order to Dhanmondi hub for Kalabagan thana', async () => {
    const res = await fetch(`${baseUrl}/api/v1/fulfillment/route-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerThana: 'Kalabagan',
        items: [{ sku: 'SKU_SHAMPOO_ONION_250ML', quantity: 5 }]
      })
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.routing.assignedHub.hubId).toBe('HUB-DHK-01');
    expect(body.routing.fulfilmentType).toBe('hyperlocal_fast_dispatch');
  });

  it('POST /api/v1/fulfillment/pick-list should generate S-curve serpentine pick sequence', async () => {
    const res = await fetch(`${baseUrl}/api/v1/fulfillment/pick-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hubId: 'HUB-DHK-01',
        items: [
          { sku: 'SKU_SHAMPOO_ONION_250ML', quantity: 5 },
          { sku: 'SKU_SERUM_VITC_30ML', quantity: 2 }
        ]
      })
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.pickList.pathOptimization).toBe('s_curve_serpentine');
    expect(body.pickList.tasks.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/fulfillment/expiry-alerts should return expiring batches with markdown recommendations', async () => {
    const res = await fetch(`${baseUrl}/api/v1/fulfillment/expiry-alerts?referenceDate=2026-09-21`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.alerts)).toBe(true);
  });

  it('POST /api/v1/fulfillment/rebalance-plan should return inter-hub transfer plan', async () => {
    const res = await fetch(`${baseUrl}/api/v1/fulfillment/rebalance-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.rebalancePlan.planId).toBeDefined();
    expect(Array.isArray(body.rebalancePlan.transfers)).toBe(true);
  });
});
