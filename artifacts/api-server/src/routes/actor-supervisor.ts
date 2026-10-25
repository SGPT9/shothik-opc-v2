import { Router, type Request, type Response } from "express";
import { actorSupervisor } from "../lib/twin/actor-supervisor";
import { logger } from "../lib/logger";

export const actorSupervisorRouter = Router();

/**
 * GET /api/v1/actors
 * Lists all supervised actors in the swarm with status, mailbox length, and restart counts.
 */
actorSupervisorRouter.get("/v1/actors", (_req: Request, res: Response) => {
  const actors = actorSupervisor.listActors();
  res.json({
    success: true,
    count: actors.length,
    data: actors,
  });
});

/**
 * GET /api/v1/actors/:id
 * Fetches single actor state, health, and dead letter queue.
 */
actorSupervisorRouter.get("/v1/actors/:id", (req: Request, res: Response) => {
  const actorId = String(req.params.id);
  const state = actorSupervisor.getActorState(actorId);

  if (!state) {
    res.status(404).json({
      success: false,
      error: { code: "ACTOR_NOT_FOUND", message: `Actor '${actorId}' not found in supervision tree` },
    });
    return;
  }

  const deadLetters = actorSupervisor.getDeadLetters(actorId);

  res.json({
    success: true,
    data: {
      ...state,
      deadLetters,
    },
  });
});

/**
 * POST /api/v1/actors/:id/send
 * Enqueues a message into the actor's isolated mailbox.
 */
actorSupervisorRouter.post("/v1/actors/:id/send", (req: Request, res: Response) => {
  try {
    const actorId = String(req.params.id);
    const { type, payload, sender } = req.body;

    if (!type || typeof type !== "string") {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_MESSAGE_TYPE", message: "message type string is required" },
      });
      return;
    }

    const result = actorSupervisor.send(actorId, {
      type,
      payload: payload ?? {},
      sender,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    logger.warn({ error: err.message }, "[ActorRouter] Send rejected");
    res.status(400).json({
      success: false,
      error: { code: "SEND_FAILED", message: err.message || "Failed to enqueue message" },
    });
  }
});

/**
 * POST /api/v1/actors/:id/restart
 * Triggers controlled hot-restart of the actor.
 */
actorSupervisorRouter.post("/v1/actors/:id/restart", (req: Request, res: Response) => {
  const actorId = String(req.params.id);
  const state = actorSupervisor.getActorState(actorId);

  if (!state) {
    res.status(404).json({
      success: false,
      error: { code: "ACTOR_NOT_FOUND", message: `Actor '${actorId}' not found` },
    });
    return;
  }

  actorSupervisor.restartSingleActor(actorId);
  const updatedState = actorSupervisor.getActorState(actorId);

  res.json({
    success: true,
    data: updatedState,
  });
});

/**
 * POST /api/v1/actors/:id/quarantine
 * Manually isolates an actor.
 */
actorSupervisorRouter.post("/v1/actors/:id/quarantine", (req: Request, res: Response) => {
  const actorId = String(req.params.id);
  actorSupervisor.quarantineActor(actorId);
  res.json({
    success: true,
    message: `Actor '${actorId}' quarantined`,
  });
});

/**
 * POST /api/v1/actors/:id/unquarantine
 * Releases actor from quarantine.
 */
actorSupervisorRouter.post("/v1/actors/:id/unquarantine", (req: Request, res: Response) => {
  const actorId = String(req.params.id);
  actorSupervisor.unquarantineActor(actorId);
  res.json({
    success: true,
    message: `Actor '${actorId}' released from quarantine`,
  });
});
