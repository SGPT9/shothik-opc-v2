import { z } from "zod";

export { z };

export interface RouteContext<TBody = any, TQuery = any, TParams = any> {
  body: TBody;
  query: TQuery;
  params: TParams;
  req: Request;
}

export interface RouteConfig<TBody = any, TQuery = any, TParams = any> {
  method?: string;
  path?: string;
  summary?: string;
  config?: {
    requireIdempotencyKey?: boolean;
    [key: string]: unknown;
  };
  schemas?: {
    body?: z.ZodType<TBody>;
    query?: z.ZodType<TQuery>;
    params?: z.ZodType<TParams>;
  };
  handler: (ctx: RouteContext<TBody, TQuery, TParams>) => Promise<Response> | Response;
}

export function defineRoute<TBody = any, TQuery = any, TParams = any>(
  config: RouteConfig<TBody, TQuery, TParams>
) {
  return async (req: Request, context?: { params?: Promise<TParams> | TParams }): Promise<Response> => {
    try {
      if (config.config?.requireIdempotencyKey) {
        const idempotencyKey =
          req.headers.get("idempotency-key") ||
          req.headers.get("Idempotency-Key") ||
          req.headers.get("x-idempotency-key");
        if (!idempotencyKey) {
          return Response.json(
            {
              code: "MISSING_IDEMPOTENCY_KEY",
              error: "Missing Idempotency-Key header",
            },
            { status: 400 }
          );
        }
      }

      const url = new URL(req.url, "http://localhost");
      const queryParams: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });

      let parsedQuery = queryParams as TQuery;
      if (config.schemas?.query) {
        const queryRes = config.schemas.query.safeParse(queryParams);
        if (!queryRes.success) {
          return Response.json(
            {
              code: "VALIDATION_ERROR",
              error: "Validation Error",
              details: queryRes.error.errors,
            },
            { status: 400 }
          );
        }
        parsedQuery = queryRes.data;
      }

      let parsedBody: TBody = {} as TBody;
      if (req.method !== "GET" && req.method !== "HEAD") {
        try {
          const rawBody = await req.json().catch(() => ({}));
          parsedBody = rawBody;
        } catch {
          parsedBody = {} as TBody;
        }

        if (config.schemas?.body) {
          const bodyRes = config.schemas.body.safeParse(parsedBody);
          if (!bodyRes.success) {
            return Response.json(
              {
                code: "VALIDATION_ERROR",
                error: "Validation Error",
                details: bodyRes.error.errors,
              },
              { status: 400 }
            );
          }
          parsedBody = bodyRes.data;
        }
      }

      let resolvedParams = {} as TParams;
      if (context?.params) {
        resolvedParams = (await context.params) as TParams;
        if (config.schemas?.params) {
          const paramsRes = config.schemas.params.safeParse(resolvedParams);
          if (!paramsRes.success) {
            return Response.json(
              {
                code: "VALIDATION_ERROR",
                error: "Validation Error",
                details: paramsRes.error.errors,
              },
              { status: 400 }
            );
          }
          resolvedParams = paramsRes.data;
        }
      }

      return await config.handler({
        body: parsedBody,
        query: parsedQuery,
        params: resolvedParams,
        req,
      });
    } catch (err: any) {
      return Response.json(
        {
          code: "INTERNAL_ERROR",
          error: "Internal Server Error",
          message: err?.message || "Internal server error",
        },
        { status: 500 }
      );
    }
  };
}

export default {
  defineRoute,
  z,
};
