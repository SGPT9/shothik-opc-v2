export type LifecycleState =
  | "unregistered"
  | "registered"
  | "unverified"
  | "pending_verification"
  | "verified"
  | "suspended"
  | "unlinked"
  | "transfer_pending";

export const LIFECYCLE_TRANSITIONS: Record<string, { from: LifecycleState[]; to: LifecycleState }> = {
  REGISTER: { from: ["unregistered"], to: "registered" },
  CLAIM: { from: ["registered"], to: "unverified" },
  REQUEST_VERIFICATION: { from: ["unverified"], to: "pending_verification" },
  VERIFY: { from: ["pending_verification", "unverified"], to: "verified" },
  SUSPEND: { from: ["unverified", "verified", "registered"], to: "suspended" },
  RESTORE: { from: ["suspended"], to: "unverified" },
  UNLINK: { from: ["unverified", "verified", "suspended"], to: "unlinked" },
  RECLAIM: { from: ["unlinked"], to: "unverified" },
  REQUEST_TRANSFER: { from: ["verified", "unverified"], to: "transfer_pending" },
  ACCEPT_TRANSFER: { from: ["transfer_pending"], to: "unverified" },
  CANCEL_TRANSFER: { from: ["transfer_pending"], to: "unverified" },
};

export const BLOCKED_STATES = new Set<LifecycleState>(["suspended", "unlinked"]);

export function isBlockedState(state: string): boolean {
  return BLOCKED_STATES.has(state as LifecycleState);
}

export function validateTransition(currentState: string, event: string): { valid: boolean; nextState?: LifecycleState } {
  const transition = LIFECYCLE_TRANSITIONS[event];
  if (!transition) return { valid: false };
  if (transition.from.includes(currentState as LifecycleState)) {
    return { valid: true, nextState: transition.to };
  }
  return { valid: false };
}

export function canTransition(currentState: string, event: string): boolean {
  return validateTransition(currentState, event).valid;
}

export function isActiveState(state: string): boolean {
  return !BLOCKED_STATES.has(state as LifecycleState) && state !== "unregistered";
}
