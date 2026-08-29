import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema, ZodError } from "zod";
import { ProblemDetails } from "@workspace/api-zod";

type ValidationTarget = "body" | "query" | "params";

/**
 * Express Middleware factory for strict Zod schema validation adhering to RFC 7807 Problem Details
 */
export function validateRequest(
  schema: ZodSchema,
  target: ValidationTarget = "body"
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate = req[target];
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const invalidParams = zodError.errors.map((err) => ({
        name: err.path.join(".") || target,
        reason: err.message,
      }));

      const problem: ProblemDetails = {
        type: "https://api.shothikgpt.com/errors/validation-error",
        title: "Invalid Request Payload",
        status: 400,
        detail: `The request ${target} contains invalid or missing required parameters.`,
        instance: req.originalUrl,
        invalidParams,
        code: "VALIDATION_FAILED",
      };

      res.status(400).contentType("application/problem+json").json(problem);
      return;
    }

    // Assign sanitized and parsed data back to req object
    req[target] = result.data;
    next();
  };
}
