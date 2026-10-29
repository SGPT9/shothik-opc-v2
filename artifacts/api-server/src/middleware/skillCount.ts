import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
/**
 * Middleware that reads SKILL_PATHS env variable, counts the number of skill folders,
 * and, when the request originates from localhost, attaches a response header `X-External-Skill-Count`.
 * This header can be used by UI components (e.g., badge) to display the number of
 * external skill folders available.
 */
export function skillCountMiddleware(req: Request, res: Response, next: NextFunction) {
  const isLocalhost =
    req.hostname === 'localhost' ||
    req.ip === '127.0.0.1' ||
    req.ip === '::1';

  if (!isLocalhost) {
    return next();
  }

  const skillPathsEnv = process.env.SKILL_PATHS;
  let count = 0;
  if (skillPathsEnv) {
    const skillPaths = skillPathsEnv.split(path.delimiter);
    for (const base of skillPaths) {
      try {
        const entries = fs.readdirSync(base, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            count += 1;
          }
        }
      } catch {
        // ignore missing directories
      }
    }
  }

  // Attach header – safe to set on every localhost request.
  res.setHeader('X-External-Skill-Count', String(count));
  next();
}
