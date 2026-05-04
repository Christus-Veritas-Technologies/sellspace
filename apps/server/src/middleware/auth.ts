import type { Context, Next } from "hono";
import { verifyAccessToken } from "../lib/jwt";

/**
 * Hono middleware that verifies a Bearer JWT in the Authorization header.
 * On success, sets `c.set("userId", sub)`.
 * On failure, returns 401 with a structured error.
 */
export async function requireAuth(c: Context, next: Next): Promise<Response | void> {
  const authorization = c.req.header("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authorization.slice(7);

  try {
    const payload = await verifyAccessToken(token); 
    c.set("userId", payload.sub);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}
