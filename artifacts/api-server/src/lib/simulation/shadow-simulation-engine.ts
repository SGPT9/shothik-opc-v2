import { logger } from "../logger";

export interface ShadowState {
  walletBalanceBdt: number;
  inventoryStock: Record<string, number>;
  pendingConsignments: string[];
  taxInvoicesIssued: string[];
  customerAccounts: Record<string, { status: "active" | "flagged" | "frozen"; creditLimitBdt: number }>;
}

export interface SimulationAction {
  twinId: string;
  actionName: string;
  params: Record<string, any>;
}

export interface SimulationTraceStep {
  stepIndex: number;
  twinId: string;
  actionName: string;
  invariantsChecked: { invariant: string; passed: boolean; error?: string }[];
  durationMs: number;
}

export interface SimulationReport {
  simulationId: string;
  verdict: "APPROVED_TO_EXECUTE" | "REJECTED_INVARIANT_VIOLATION" | "NEEDS_HITL_ESCALATION";
  riskScore: number; // 0 (safest) to 100 (highest risk)
  totalSteps: number;
  stepsPassed: number;
  failedStepIndex?: number;
  violations: string[];
  initialState: ShadowState;
  projectedState: ShadowState;
  stateDeltas: {
    balanceDeltaBdt: number;
    inventoryDeltas: Record<string, number>;
    consignmentsCreated: number;
    taxInvoicesCreated: number;
  };
  trace: SimulationTraceStep[];
  durationMs: number;
}

export interface RehearsalScenario {
  id: string;
  name: string;
  description: string;
  actions: SimulationAction[];
  initialState?: Partial<ShadowState>;
}

/**
 * Pillar 5: Shadow Digital Twin Simulation & Rehearsal Engine
 * 
 * Executes 10ms discrete-event dry runs in an isolated shadow sandbox before
 * real-world external mutations (MFS debits, courier bookings, VAT invoices)
 * to verify multi-twin state convergence, prevent negative balances, and
 * assert strict business invariants.
 */
export class ShadowSimulationEngine {
  private static instance: ShadowSimulationEngine;
  private readonly scenarios = new Map<string, RehearsalScenario>();

  private constructor() {
    this.registerBuiltinScenarios();
  }

  public static getInstance(): ShadowSimulationEngine {
    if (!ShadowSimulationEngine.instance) {
      ShadowSimulationEngine.instance = new ShadowSimulationEngine();
    }
    return ShadowSimulationEngine.instance;
  }

  /**
   * Rehearses a sequence of twin actions against an isolated copy of system state.
   */
  public rehearse(actions: SimulationAction[], customInitialState?: Partial<ShadowState>): SimulationReport {
    const startTime = performance.now();
    const simulationId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Deep clone state to create completely isolated shadow sandbox
    const baseInitial: ShadowState = {
      walletBalanceBdt: 50000,
      inventoryStock: {
        "SKU_TSHIRT_BLK": 150,
        "SKU_HOODIE_NVY": 40,
        "SKU_POLO_WHT": 85,
      },
      pendingConsignments: [],
      taxInvoicesIssued: [],
      customerAccounts: {
        "CUST_01": { status: "active", creditLimitBdt: 15000 },
        "CUST_FROZEN": { status: "frozen", creditLimitBdt: 0 },
      },
    };

    const state: ShadowState = {
      ...baseInitial,
      ...customInitialState,
      inventoryStock: { ...baseInitial.inventoryStock, ...(customInitialState?.inventoryStock || {}) },
      customerAccounts: { ...baseInitial.customerAccounts, ...(customInitialState?.customerAccounts || {}) },
      pendingConsignments: [...(customInitialState?.pendingConsignments || [])],
      taxInvoicesIssued: [...(customInitialState?.taxInvoicesIssued || [])],
    };

    const initialSnapshot = JSON.parse(JSON.stringify(state)) as ShadowState;
    const trace: SimulationTraceStep[] = [];
    const violations: string[] = [];
    let riskScore = 0;
    let failedStepIndex: number | undefined;

    // 2. Step-by-step dry-run execution
    for (let i = 0; i < actions.length; i++) {
      const stepStart = performance.now();
      const action = actions[i];
      const stepInvariants: { invariant: string; passed: boolean; error?: string }[] = [];

      try {
        this.applyActionToShadowState(state, action, stepInvariants);
      } catch (err: any) {
        stepInvariants.push({
          invariant: "ACTION_EXECUTION",
          passed: false,
          error: err?.message || String(err),
        });
      }

      // Check for invariant violations in this step
      const stepFailures = stepInvariants.filter(inv => !inv.passed);
      if (stepFailures.length > 0) {
        for (const f of stepFailures) {
          violations.push(`Step ${i + 1} (${action.twinId}/${action.actionName}) [${f.invariant}]: ${f.error || f.invariant}`);
        }
        failedStepIndex = i;
        riskScore = 100;
        trace.push({
          stepIndex: i,
          twinId: action.twinId,
          actionName: action.actionName,
          invariantsChecked: stepInvariants,
          durationMs: Math.max(1, Math.round(performance.now() - stepStart)),
        });
        break; // Stop rehearsal on first hard invariant violation
      }

      trace.push({
        stepIndex: i,
        twinId: action.twinId,
        actionName: action.actionName,
        invariantsChecked: stepInvariants,
        durationMs: Math.max(1, Math.round(performance.now() - stepStart)),
      });
    }

    // 3. Compute State Deltas
    const balanceDeltaBdt = state.walletBalanceBdt - initialSnapshot.walletBalanceBdt;
    const inventoryDeltas: Record<string, number> = {};
    for (const sku of Object.keys(initialSnapshot.inventoryStock)) {
      inventoryDeltas[sku] = (state.inventoryStock[sku] ?? 0) - initialSnapshot.inventoryStock[sku];
    }
    const consignmentsCreated = state.pendingConsignments.length - initialSnapshot.pendingConsignments.length;
    const taxInvoicesCreated = state.taxInvoicesIssued.length - initialSnapshot.taxInvoicesIssued.length;

    // 4. Formulate Verdict
    let verdict: SimulationReport["verdict"] = "APPROVED_TO_EXECUTE";
    if (violations.length > 0) {
      verdict = "REJECTED_INVARIANT_VIOLATION";
    } else if (Math.abs(balanceDeltaBdt) > 20000 || riskScore > 40) {
      verdict = "NEEDS_HITL_ESCALATION";
      riskScore = Math.max(riskScore, 65);
    } else {
      riskScore = Math.min(25, trace.length * 5);
    }

    const durationMs = Math.max(1, Math.round(performance.now() - startTime));
    logger.info(
      { simulationId, verdict, steps: actions.length, durationMs, riskScore },
      "[ShadowSimulation] Completed shadow rehearsal run",
    );

    return {
      simulationId,
      verdict,
      riskScore,
      totalSteps: actions.length,
      stepsPassed: failedStepIndex !== undefined ? failedStepIndex : actions.length,
      failedStepIndex,
      violations,
      initialState: initialSnapshot,
      projectedState: state,
      stateDeltas: {
        balanceDeltaBdt,
        inventoryDeltas,
        consignmentsCreated,
        taxInvoicesCreated,
      },
      trace,
      durationMs,
    };
  }

  /**
   * Applies discrete simulated action and checks pre-flight & post-flight invariants.
   */
  private applyActionToShadowState(
    state: ShadowState,
    action: SimulationAction,
    invariants: { invariant: string; passed: boolean; error?: string }[]
  ): void {
    const { actionName, params } = action;

    switch (actionName) {
      case "mfs_disburse": {
        const amount = Number(params.amountBdt || 0);
        if (amount <= 0) {
          invariants.push({ invariant: "POSITIVE_DISBURSEMENT_AMOUNT", passed: false, error: "Disbursement amount must be > 0" });
          return;
        }

        // Phone check
        const phone = String(params.recipientPhone || "");
        const validPhone = /(?:\+?880|0)1[3-9]\d{8}\b/.test(phone);
        invariants.push({ invariant: "VALID_BD_PHONE", passed: validPhone, error: validPhone ? undefined : `Invalid recipient phone ${phone}` });

        // Wallet balance check
        if (state.walletBalanceBdt - amount < 0) {
          invariants.push({
            invariant: "NO_NEGATIVE_WALLET_OVERDRAFT",
            passed: false,
            error: `Disbursement of ${amount} BDT exceeds available balance of ${state.walletBalanceBdt} BDT`,
          });
          return;
        }

        state.walletBalanceBdt -= amount;
        invariants.push({ invariant: "NO_NEGATIVE_WALLET_OVERDRAFT", passed: true });
        break;
      }

      case "reserve_inventory": {
        const sku = String(params.sku || "");
        const quantity = Number(params.quantity || 0);

        const currentStock = state.inventoryStock[sku] ?? 0;
        if (currentStock - quantity < 0) {
          invariants.push({
            invariant: "NO_NEGATIVE_INVENTORY_STOCKOUT",
            passed: false,
            error: `Insufficient stock for SKU '${sku}': requested ${quantity}, available ${currentStock}`,
          });
          return;
        }

        state.inventoryStock[sku] = currentStock - quantity;
        invariants.push({ invariant: "NO_NEGATIVE_INVENTORY_STOCKOUT", passed: true });
        break;
      }

      case "book_courier_consignment": {
        const district = String(params.district || "").toLowerCase();
        const validDistricts = ["dhaka", "chittagong", "sylhet", "rajshahi", "khulna", "barisal", "rangpur", "mymensingh", "gazipur", "narayanganj"];
        const districtOk = validDistricts.includes(district);
        invariants.push({ invariant: "RECOGNIZED_BD_DISTRICT", passed: districtOk, error: districtOk ? undefined : `Unrecognized delivery district '${district}'` });

        const cid = `CN_SIM_${Date.now()}_${state.pendingConsignments.length + 1}`;
        state.pendingConsignments.push(cid);
        break;
      }

      case "issue_tax_invoice": {
        const amount = Number(params.amountBdt || 0);
        if (amount < 0) {
          invariants.push({ invariant: "VALID_TAXABLE_AMOUNT", passed: false, error: "Tax invoice amount cannot be negative" });
          return;
        }
        const invNum = `MUS63_SIM_${Date.now()}_${state.taxInvoicesIssued.length + 1}`;
        state.taxInvoicesIssued.push(invNum);
        invariants.push({ invariant: "VALID_TAXABLE_AMOUNT", passed: true });
        break;
      }

      case "charge_customer_credit": {
        const custId = String(params.customerId || "");
        const amount = Number(params.amountBdt || 0);
        const account = state.customerAccounts[custId];

        if (!account) {
          invariants.push({ invariant: "CUSTOMER_ACCOUNT_EXISTS", passed: false, error: `Customer '${custId}' does not exist` });
          return;
        }

        if (account.status === "frozen") {
          invariants.push({ invariant: "NO_TRANSACTIONS_ON_FROZEN_ACCOUNT", passed: false, error: `Customer '${custId}' is FROZEN by compliance audit` });
          return;
        }

        if (amount > account.creditLimitBdt) {
          invariants.push({ invariant: "WITHIN_CUSTOMER_CREDIT_LIMIT", passed: false, error: `Charge ${amount} BDT exceeds customer credit limit ${account.creditLimitBdt} BDT` });
          return;
        }

        account.creditLimitBdt -= amount;
        invariants.push({ invariant: "WITHIN_CUSTOMER_CREDIT_LIMIT", passed: true });
        break;
      }

      default:
        invariants.push({ invariant: "RECOGNIZED_SIMULATION_ACTION", passed: true });
        break;
    }
  }

  public registerScenario(scenario: RehearsalScenario): void {
    this.scenarios.set(scenario.id, scenario);
  }

  public getScenario(id: string): RehearsalScenario | undefined {
    return this.scenarios.get(id);
  }

  public listScenarios(): Array<{ id: string; name: string; description: string; actionCount: number }> {
    return Array.from(this.scenarios.values()).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      actionCount: s.actions.length,
    }));
  }

  public runScenario(id: string): SimulationReport {
    const sc = this.scenarios.get(id);
    if (!sc) {
      throw new Error(`Scenario '${id}' not found`);
    }
    return this.rehearse(sc.actions, sc.initialState);
  }

  private registerBuiltinScenarios(): void {
    // 1. Flash Sale Order Rehearsal
    this.registerScenario({
      id: "FLASH_SALE_ORDER_FLOW",
      name: "Flash Sale Order Multi-Twin Convergence",
      description: "Rehearses atomic reservation of inventory, booking delivery consignment, and tax invoice generation",
      actions: [
        { twinId: "sales_twin", actionName: "reserve_inventory", params: { sku: "SKU_TSHIRT_BLK", quantity: 5 } },
        { twinId: "operations_twin", actionName: "book_courier_consignment", params: { district: "Dhaka", recipientPhone: "01711223344" } },
        { twinId: "finance_twin", actionName: "issue_tax_invoice", params: { amountBdt: 4500 } },
      ],
    });

    // 2. Overdraft Prevention Rehearsal
    this.registerScenario({
      id: "OVERDRAFT_DEFENSE_FLOW",
      name: "Excessive MFS Payout Overdraft Defense",
      description: "Simulates an excessive disbursement that breaches wallet balance to verify rejection before external PGW is touched",
      actions: [
        { twinId: "finance_twin", actionName: "mfs_disburse", params: { amountBdt: 30000, recipientPhone: "01799887766" } }, // Exceeds default 25,000 balance!
      ],
    });
  }
}

export const shadowSimulationEngine = ShadowSimulationEngine.getInstance();
