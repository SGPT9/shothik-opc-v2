import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";
import { AuditLedgerEngine } from "../../lib/audit/audit-ledger-engine.js";

describe("Capability 4: initiator_kind Attribution & Nobody Watching Audit Filter", { timeout: 25000 }, () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    AuditLedgerEngine._reset();
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

  it("posts journal entry with initiatorKind and attributes properly", async () => {
    const res = await fetch(`${baseUrl}/api/v1/audit/journal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionRef: "INV-AUTO-COD-55",
        transactionType: "sale_cod",
        memo: "Autonomous courier COD reconciliation",
        initiatorKind: "routine",
        initiatorId: "twin_logistics_01",
        lines: [
          { accountCode: "1030", debitBdt: 3000, creditBdt: 0, description: "COD received" },
          { accountCode: "4010", debitBdt: 0, creditBdt: 3000, description: "COD sale" },
        ],
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.entry.initiatorKind).toBe("routine");
    expect(body.entry.initiatorId).toBe("twin_logistics_01");
    expect(body.entry.isBalanced).toBe(true);
  });

  it("filters journals by ?nobodyWatching=true", async () => {
    // 1. Post a human-initiated entry
    await fetch(`${baseUrl}/api/v1/audit/journal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionRef: "INV-FOUNDER-MANUAL",
        transactionType: "sale_bkash",
        memo: "Founder manual sale entry",
        initiatorKind: "person",
        lines: [
          { accountCode: "1020", debitBdt: 1200, creditBdt: 0 },
          { accountCode: "4010", debitBdt: 0, creditBdt: 1200 },
        ],
      }),
    });

    // 2. Post an autonomous standing responsibility entry
    await fetch(`${baseUrl}/api/v1/audit/journal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionRef: "RESP-VAT-AUTONOMOUS",
        transactionType: "vat_mushak_6_3",
        memo: "Autonomous standing tax audit responsibility",
        initiatorKind: "responsibility",
        lines: [
          { accountCode: "2010", debitBdt: 180, creditBdt: 0 },
          { accountCode: "1010", debitBdt: 0, creditBdt: 180 },
        ],
      }),
    });

    // Query all entries
    const allRes = await fetch(`${baseUrl}/api/v1/audit/journals`);
    expect(allRes.status).toBe(200);
    const allBody = await allRes.json();
    expect(allBody.count).toBe(2);

    // Query with ?nobodyWatching=true
    const nobodyRes = await fetch(`${baseUrl}/api/v1/audit/journals?nobodyWatching=true`);
    expect(nobodyRes.status).toBe(200);
    const nobodyBody = await nobodyRes.json();
    expect(nobodyBody.nobodyWatching).toBe(true);
    expect(nobodyBody.count).toBe(1);
    expect(nobodyBody.entries[0].initiatorKind).toBe("responsibility");
    expect(nobodyBody.entries[0].transactionRef).toBe("RESP-VAT-AUTONOMOUS");
  });

  it("ingests and filters telemetry spans by ?nobodyWatching=true", async () => {
    // Ingest human telemetry event
    await fetch(`${baseUrl}/api/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "manual_search",
        initiatorKind: "person",
      }),
    });

    // Ingest autonomous routine telemetry event
    await fetch(`${baseUrl}/api/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "autonomous_stock_sweep",
        initiatorKind: "routine",
      }),
    });

    // Filter nobodyWatching
    const res = await fetch(`${baseUrl}/api/telemetry?nobodyWatching=true`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.nobodyWatching).toBe(true);
    const events = data.events;
    expect(events.every((e: any) => e.initiatorKind !== "person")).toBe(true);
  });
});
