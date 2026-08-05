import { Router, type IRouter } from "express";
import healthRouter from "./health";
import proxyRouter from "./proxy";

const router: IRouter = Router();

router.use(healthRouter);
// Passthrough proxy for API routes not implemented locally (chat, etc.).
// Must stay last so local routes take precedence.
router.use(proxyRouter);

export default router;
