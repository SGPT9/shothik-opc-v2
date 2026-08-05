import { Router, type IRouter } from "express";
import healthRouter from "./health";
import proxyRouter from "./proxy";
import twinSeedRouter from "./twin-seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(twinSeedRouter);
// Passthrough proxy for API routes not implemented locally (chat, etc.).
// Must stay last so local routes take precedence.
router.use(proxyRouter);

export default router;
