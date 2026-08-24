import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ollamaRouter from "./ollama";
import loopRouter from "./loop-engineering";
import chatLocalRouter from "./chat-local";
import twinSeedRouter from "./twin-seed";
import mfsRouter from "./mfs";
import logisticsRouter from "./logistics";
import meshRouter from "./mesh";
import scraperRouter from "./scraper";
import publishingRouter from "./publishing";
import approvalsRouter from "./approvals";
import voiceRouter from "./voice";
import mcpRouter from "./mcp";
import { memoryRouter } from "./memory";
import { inferenceRouter } from "./inference";
import { dshRouter } from "./dsh";
import { swarmRouter } from "./swarm";
import { ragRouter } from "./rag";
import { sandboxRouter } from "./sandbox";
import proxyRouter from "./proxy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ollamaRouter);
router.use(inferenceRouter);
router.use(dshRouter);
router.use(swarmRouter);
router.use(ragRouter);
router.use(sandboxRouter);
router.use(loopRouter);
router.use(chatLocalRouter);
router.use(twinSeedRouter);
router.use(mfsRouter);
router.use(logisticsRouter);
router.use(meshRouter);
router.use(scraperRouter);
router.use(publishingRouter);
router.use(approvalsRouter);
router.use(voiceRouter);
router.use(mcpRouter);
router.use(memoryRouter);

// Passthrough proxy for API routes not implemented locally (chat, etc.).
// Must stay last so local routes take precedence.
router.use(proxyRouter);

export default router;
