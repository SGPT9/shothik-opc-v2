import { Router, type Request, type Response } from "express";
import { McpManager } from "../lib/mcp-manager.js";

const router = Router();
const mcpManager = McpManager.getInstance();

/**
 * GET /api/mcp/capabilities
 * Lists all available MCP capabilities across operations and network tools.
 */
router.get("/mcp/capabilities", async (req: Request, res: Response) => {
  try {
    const { category, query } = req.query;
    const capabilities = await mcpManager.listCapabilities(
      typeof category === "string" ? category : undefined,
      typeof query === "string" ? query : undefined
    );

    return res.status(200).json({
      success: true,
      count: capabilities.length,
      capabilities,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to list MCP capabilities",
      message: error?.message || String(error),
    });
  }
});

/**
 * GET /api/mcp/capabilities/:id
 * Fetches metadata for a single MCP capability.
 */
router.get("/mcp/capabilities/:id", async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : String(req.params.id || "");
    const capability = await mcpManager.getCapabilityMetadata(id);

    if (!capability) {
      return res.status(404).json({
        success: false,
        error: `Capability '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      capability,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to get MCP capability metadata",
      message: error?.message || String(error),
    });
  }
});

/**
 * GET /api/mcp/capabilities/:id/source
 * Injects the full skill prompt markdown for agent execution context.
 */
router.get("/mcp/capabilities/:id/source", async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : String(req.params.id || "");
    const file = typeof req.query.file === "string" ? req.query.file : "SKILL.md";
    const result = await mcpManager.readSkillSource(id, file);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: `Skill source for '${id}' (${file}) not found`,
      });
    }

    return res.status(200).json({
      success: true,
      id: result.id,
      file: result.file,
      content: result.content,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to read skill source",
      message: error?.message || String(error),
    });
  }
});

export default router;
