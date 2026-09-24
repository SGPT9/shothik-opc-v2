import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import app from '../../app.js';
import { LayaSystemOneEngine } from '../../lib/system1/laya-system-one-engine.js';

describe('System 1 Decision Engine & Evaluation Route (/api/v1/system1/*)', () => {
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

  it('evaluates typed choice, score, and noul questions via LayaSystemOneEngine', async () => {
    const engine = LayaSystemOneEngine.getInstance();
    const state = {
      customer: 'Power Merchant Ltd',
      district: 'Chittagong',
      message: 'Ami taka refund chai, delivery rider ashoni!',
      grandTotalBdt: 12000
    };

    const res = await engine.systemOne(state, {
      intent: {
        type: 'choice',
        instructions: 'Determine customer intent',
        criteria: {
          refund: 'refund, taka ferot, cancel',
          tracking: 'delivery status, courier, rider',
          inquiry: 'general info'
        }
      },
      urgency: {
        type: 'score',
        instructions: 'Determine urgency',
        criteria: ['low', 'medium', 'high', 'critical']
      },
      requires_approval: {
        type: 'noul',
        instructions: 'Is high value order needing approval?'
      }
    });

    expect(res.answers.intent.type).toBe('choice');
    expect(res.answers.intent.choice).toBe('refund');
    expect(res.answers.intent.confidence).toBeGreaterThan(0.6);
    expect(res.answers.urgency.type).toBe('score');
    expect(res.answers.requires_approval.type).toBe('noul');
    expect(res.answers.requires_approval.noul).toBeGreaterThan(0.5);
    expect(res.latencyMs).toBeGreaterThanOrEqual(1);
    expect(res.sha256Seal).toBeDefined();
  });

  it('POST /api/v1/system1/evaluate executes single-pass parallel decisions over HTTP', async () => {
    const payload = {
      state: {
        item: 'USB-C Cable',
        category: 'electronics',
        priceBdt: 150
      },
      questions: {
        department: {
          type: 'choice',
          instructions: 'Assign team',
          criteria: {
            gadgets: 'electronics, cable, charger',
            grocery: 'rice, oil, tea'
          }
        },
        in_stock: {
          type: 'noul',
          instructions: 'Is available?'
        }
      }
    };

    const res = await fetch(`${baseUrl}/api/v1/system1/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.result.answers.department.choice).toBe('gadgets');
    expect(body.result.answers.in_stock.noul).toBeDefined();
  });
});
