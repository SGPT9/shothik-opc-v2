import crypto from "crypto";
import { logger } from "../logger";

export interface Caveat {
  type: "scope" | "max_amount_bdt" | "district" | "valid_until" | "delegatee" | "custom";
  key: string;
  value: string | number | string[];
}

export interface SerializedCapabilityToken {
  id: string;
  parentId?: string;
  location: string;
  caveats: Caveat[];
  signature: string;
}

export interface VerificationContext {
  actionScope: string;
  amountBdt?: number;
  district?: string;
  delegatee?: string;
  timestamp?: number;
}

export interface LeashVerificationResult {
  valid: boolean;
  code?: "VALID" | "INVALID_SIGNATURE" | "EXPIRED" | "SCOPE_UNAUTHORIZED" | "DISTRICT_UNAUTHORIZED" | "DELEGATEE_MISMATCH" | "BUDGET_EXCEEDED" | "MALFORMED_TOKEN";
  reason?: string;
  maxAmountBdt?: number;
  spentAmountBdt?: number;
  remainingBudgetBdt?: number;
  scopes?: string[];
  expiresAt?: string;
}

export interface LeashState {
  id: string;
  rootTokenId: string;
  allocatedBudgetBdt: number;
  spentBudgetBdt: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pillar 2: Cryptographic Capability Attenuation & Spend Leash (Macaroons)
 * 
 * Provides HMAC-SHA256 verifiable capability tokens that allow autonomous agents
 * and sub-agents to delegate attenuated (strictly narrowed) authority offline
 * without revealing the root secret, with strict spend capping and spatial/temporal bounds.
 */
export class CapabilityLeashEngine {
  private static instance: CapabilityLeashEngine;
  private readonly rootSecret: Buffer;
  private readonly leashLedger = new Map<string, LeashState>();
  private readonly MAX_LEDGER_ENTRIES = 5000;

  private constructor() {
    const envSecret = process.env.SHOTHIK_CAPABILITY_ROOT_SECRET;
    this.rootSecret = envSecret
      ? crypto.createHash("sha256").update(envSecret).digest()
      : crypto.randomBytes(32);
  }

  public static getInstance(): CapabilityLeashEngine {
    if (!CapabilityLeashEngine.instance) {
      CapabilityLeashEngine.instance = new CapabilityLeashEngine();
    }
    return CapabilityLeashEngine.instance;
  }

  /**
   * Mints a fresh root capability leash token.
   */
  public mintRootLeash(params: {
    id?: string;
    scopes: string[];
    maxAmountBdt: number;
    districts?: string[];
    validUntilEpochMs?: number;
    delegatee?: string;
    location?: string;
  }): { token: string; parsed: SerializedCapabilityToken; remainingBudgetBdt: number } {
    const id = params.id || `leash_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const location = params.location || "shothik://agent-mesh/root";

    const caveats: Caveat[] = [
      { type: "scope", key: "scopes", value: params.scopes },
      { type: "max_amount_bdt", key: "max_amount_bdt", value: params.maxAmountBdt },
    ];

    if (params.districts && params.districts.length > 0) {
      caveats.push({ type: "district", key: "districts", value: params.districts });
    }

    if (params.validUntilEpochMs) {
      caveats.push({ type: "valid_until", key: "valid_until", value: params.validUntilEpochMs });
    }

    if (params.delegatee) {
      caveats.push({ type: "delegatee", key: "delegatee", value: params.delegatee });
    }

    // S_0 = HMAC(K_0, id)
    let sig = crypto.createHmac("sha256", this.rootSecret).update(id).digest();

    // S_i = HMAC(S_{i-1}, canonical(caveat))
    for (const c of caveats) {
      sig = crypto.createHmac("sha256", sig).update(this.canonicalizeCaveat(c)).digest();
    }

    const parsed: SerializedCapabilityToken = {
      id,
      location,
      caveats,
      signature: sig.toString("hex"),
    };

    // Initialize budget tracking in ledger
    this.saveLedgerState({
      id,
      rootTokenId: id,
      allocatedBudgetBdt: params.maxAmountBdt,
      spentBudgetBdt: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const token = this.encodeToken(parsed);
    logger.info({ leashId: id, maxAmountBdt: params.maxAmountBdt, scopes: params.scopes }, "[CapabilityLeash] Minted root capability token");

    return { token, parsed, remainingBudgetBdt: params.maxAmountBdt };
  }

  /**
   * Attenuates an existing token by adding further restrictive caveats.
   * Crucial Macaroon property: Anyone holding the token can attenuate it WITHOUT access to the root secret!
   */
  public attenuateLeash(params: {
    token: string;
    addCaveats: Caveat[];
    newId?: string;
  }): { token: string; parsed: SerializedCapabilityToken } {
    const parent = this.decodeToken(params.token);
    const parentSig = Buffer.from(parent.signature, "hex");

    let sig = parentSig;
    const combinedCaveats = [...parent.caveats];

    for (const c of params.addCaveats) {
      combinedCaveats.push(c);
      sig = crypto.createHmac("sha256", sig).update(this.canonicalizeCaveat(c)).digest();
    }

    const newId = params.newId || `leash_atten_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

    const parsed: SerializedCapabilityToken = {
      id: newId,
      parentId: parent.id,
      location: parent.location,
      caveats: combinedCaveats,
      signature: sig.toString("hex"),
    };

    // If a tighter max_amount_bdt was added in the new caveats, establish or propagate budget
    const explicitMaxAmount = this.resolveMaxAmount(combinedCaveats);
    const parentState = this.getLedgerState(parent.id);
    const rootId = parentState ? parentState.rootTokenId : parent.id;

    this.saveLedgerState({
      id: newId,
      rootTokenId: rootId,
      allocatedBudgetBdt: explicitMaxAmount,
      spentBudgetBdt: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const token = this.encodeToken(parsed);
    logger.info({ newId, parentId: parent.id, caveatsCount: combinedCaveats.length }, "[CapabilityLeash] Attenuated capability token");

    return { token, parsed };
  }

  /**
   * Verifies the cryptographic signature chain and all caveats against the invocation context.
   */
  public verifyLeash(tokenStr: string, ctx: VerificationContext): LeashVerificationResult {
    let parsed: SerializedCapabilityToken;
    try {
      parsed = this.decodeToken(tokenStr);
    } catch (e: any) {
      return { valid: false, code: "MALFORMED_TOKEN", reason: "Invalid token serialization" };
    }

    // 1. Re-compute root signature chain from root secret
    // Find the original root id (if parentId exists, we walk the id chain or use parsed id)
    // In canonical Macaroon design, root is initialized from parent root or original token id
    const rootIdentifier = parsed.caveats.length > 0 ? (parsed.parentId ? this.findRootIdentifier(parsed) : parsed.id) : parsed.id;

    let computedSig = crypto.createHmac("sha256", this.rootSecret).update(rootIdentifier).digest();
    for (const c of parsed.caveats) {
      computedSig = crypto.createHmac("sha256", computedSig).update(this.canonicalizeCaveat(c)).digest();
    }

    if (computedSig.toString("hex") !== parsed.signature) {
      return { valid: false, code: "INVALID_SIGNATURE", reason: "HMAC signature chain verification failed" };
    }

    // 2. Evaluate all caveats sequentially (monotonically narrowing)
    const now = ctx.timestamp ?? Date.now();
    let currentMaxAmount = Infinity;
    let allowedScopes: Set<string> | null = null;
    let allowedDistricts: Set<string> | null = null;
    let requiredDelegatee: string | null = null;
    let validUntil: number | null = null;

    for (const c of parsed.caveats) {
      if (c.type === "valid_until") {
        const exp = Number(c.value);
        if (validUntil === null || exp < validUntil) {
          validUntil = exp;
        }
        if (now > exp) {
          return { valid: false, code: "EXPIRED", reason: `Capability leash expired at ${new Date(exp).toISOString()}` };
        }
      } else if (c.type === "scope") {
        const scopes = Array.isArray(c.value) ? (c.value as string[]) : [String(c.value)];
        if (allowedScopes === null) {
          allowedScopes = new Set(scopes);
        } else {
          // Attenuation: intersect scopes
          const intersected = new Set<string>();
          for (const s of scopes) {
            if (allowedScopes.has(s) || allowedScopes.has("*")) {
              intersected.add(s);
            }
          }
          allowedScopes = intersected;
        }
      } else if (c.type === "max_amount_bdt") {
        const amt = Number(c.value);
        if (amt < currentMaxAmount) {
          currentMaxAmount = amt;
        }
      } else if (c.type === "district") {
        const districts = Array.isArray(c.value) ? (c.value as string[]) : [String(c.value)];
        if (allowedDistricts === null) {
          allowedDistricts = new Set(districts.map(d => d.toLowerCase()));
        } else {
          const intersected = new Set<string>();
          for (const d of districts) {
            if (allowedDistricts.has(d.toLowerCase())) {
              intersected.add(d.toLowerCase());
            }
          }
          allowedDistricts = intersected;
        }
      } else if (c.type === "delegatee") {
        requiredDelegatee = String(c.value);
      }
    }

    // 3. Verify Action Scope
    if (allowedScopes && !allowedScopes.has("*") && !allowedScopes.has(ctx.actionScope)) {
      return {
        valid: false,
        code: "SCOPE_UNAUTHORIZED",
        reason: `Action scope '${ctx.actionScope}' not authorized by leash (allowed: ${Array.from(allowedScopes).join(", ")})`,
      };
    }

    // 4. Verify District Boundary
    if (ctx.district && allowedDistricts && !allowedDistricts.has(ctx.district.toLowerCase())) {
      return {
        valid: false,
        code: "DISTRICT_UNAUTHORIZED",
        reason: `District '${ctx.district}' outside permitted operational territory`,
      };
    }

    // 5. Verify Delegatee Identity
    if (ctx.delegatee && requiredDelegatee && ctx.delegatee !== requiredDelegatee) {
      return {
        valid: false,
        code: "DELEGATEE_MISMATCH",
        reason: `Capability delegated to '${requiredDelegatee}', not '${ctx.delegatee}'`,
      };
    }

    // 6. Check Ledger Spend Budget
    const ledgerState = this.getLedgerState(parsed.id);
    const spent = ledgerState ? ledgerState.spentBudgetBdt : 0;
    const effectiveLimit = Math.min(currentMaxAmount, ledgerState?.allocatedBudgetBdt ?? Infinity);
    const requestedAmount = ctx.amountBdt ?? 0;

    if (spent + requestedAmount > effectiveLimit) {
      return {
        valid: false,
        code: "BUDGET_EXCEEDED",
        reason: `Spend amount ${requestedAmount} BDT exceeds remaining leash budget (${effectiveLimit - spent} BDT remaining of ${effectiveLimit} BDT)`,
        maxAmountBdt: effectiveLimit,
        spentAmountBdt: spent,
        remainingBudgetBdt: Math.max(0, effectiveLimit - spent),
      };
    }

    return {
      valid: true,
      code: "VALID",
      maxAmountBdt: effectiveLimit === Infinity ? undefined : effectiveLimit,
      spentAmountBdt: spent,
      remainingBudgetBdt: effectiveLimit === Infinity ? undefined : effectiveLimit - spent,
      scopes: allowedScopes ? Array.from(allowedScopes) : ["*"],
      expiresAt: validUntil ? new Date(validUntil).toISOString() : undefined,
    };
  }

  /**
   * Records expenditure against a verified leash token.
   */
  public recordSpend(tokenStr: string, amountBdt: number): { success: boolean; remainingBudgetBdt: number } {
    const parsed = this.decodeToken(tokenStr);
    const state = this.getLedgerState(parsed.id);
    if (!state) {
      throw new Error(`Leash ${parsed.id} has no active ledger record`);
    }

    state.spentBudgetBdt += amountBdt;
    state.updatedAt = new Date().toISOString();
    this.saveLedgerState(state);

    // Also deduct from root if different
    if (state.rootTokenId !== state.id) {
      const rootState = this.getLedgerState(state.rootTokenId);
      if (rootState) {
        rootState.spentBudgetBdt += amountBdt;
        rootState.updatedAt = new Date().toISOString();
        this.saveLedgerState(rootState);
      }
    }

    const remaining = Math.max(0, state.allocatedBudgetBdt - state.spentBudgetBdt);
    logger.info({ leashId: parsed.id, spent: amountBdt, remaining }, "[CapabilityLeash] Recorded spend against leash");
    return { success: true, remainingBudgetBdt: remaining };
  }

  public getActiveLeashes(): LeashState[] {
    return Array.from(this.leashLedger.values());
  }

  public getLedgerState(id: string): LeashState | undefined {
    return this.leashLedger.get(id);
  }

  public encodeToken(parsed: SerializedCapabilityToken): string {
    const jsonStr = JSON.stringify(parsed);
    return `shothik_macaroon_v1.${Buffer.from(jsonStr, "utf-8").toString("base64url")}`;
  }

  public decodeToken(tokenStr: string): SerializedCapabilityToken {
    if (!tokenStr.startsWith("shothik_macaroon_v1.")) {
      throw new Error("Invalid token prefix: expected 'shothik_macaroon_v1.'");
    }
    const b64 = tokenStr.replace("shothik_macaroon_v1.", "");
    const jsonStr = Buffer.from(b64, "base64url").toString("utf-8");
    return JSON.parse(jsonStr) as SerializedCapabilityToken;
  }

  private canonicalizeCaveat(c: Caveat): string {
    const val = typeof c.value === "object" ? JSON.stringify(c.value) : String(c.value);
    return `${c.type}:${c.key}=${val}`;
  }

  private resolveMaxAmount(caveats: Caveat[]): number {
    let min = Infinity;
    for (const c of caveats) {
      if (c.type === "max_amount_bdt") {
        const val = Number(c.value);
        if (val < min) min = val;
      }
    }
    return min === Infinity ? 0 : min;
  }

  private findRootIdentifier(token: SerializedCapabilityToken): string {
    // If parentId is present, we locate rootTokenId from ledger or fallback to parentId
    const state = this.getLedgerState(token.id);
    if (state) return state.rootTokenId;
    return token.parentId || token.id;
  }

  private saveLedgerState(state: LeashState): void {
    if (this.leashLedger.size >= this.MAX_LEDGER_ENTRIES) {
      const oldestKey = this.leashLedger.keys().next().value;
      if (oldestKey) this.leashLedger.delete(oldestKey);
    }
    this.leashLedger.set(state.id, { ...state });
  }
}

export const capabilityLeashEngine = CapabilityLeashEngine.getInstance();
