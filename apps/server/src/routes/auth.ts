import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { z } from "zod";

import db from "@sellspace/db";

import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { sendOtpEmail } from "../lib/mailer";
import { generateOtp, generateMagicLinkToken } from "../lib/otp";
import { verifyGoogleIdToken } from "../lib/google";

const OTP_RATE_LIMIT = 3; // max OTPs per email per 10 minutes
const OTP_WINDOW_MS = 10 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;
const BCRYPT_ROUNDS = 10;

export const authRoutes = new Hono()

  // POST /api/auth/request-otp
  .post(
    "/request-otp",
    zValidator("json", z.object({ email: z.string().email() })),
    async (c) => {
      const { email } = c.req.valid("json");

      // Rate limit: max 3 OTPs per email in any 10-minute window
      const windowStart = new Date(Date.now() - OTP_WINDOW_MS);
      const recentCount = await db.otpRequest.count({
        where: { email, createdAt: { gte: windowStart } },
      });

      if (recentCount >= OTP_RATE_LIMIT) {
        return c.json({ error: "Too many requests. Please try again later." }, 429);
      }

      const otp = generateOtp();
      const magicLinkToken = generateMagicLinkToken();
      const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);
      const expiresAt = new Date(Date.now() + OTP_TTL_MS);

      // Get the origin from request headers for building the magic link
      const protocol = c.req.header("x-forwarded-proto") || "http";
      const host = c.req.header("x-forwarded-host") || c.req.header("host") || "localhost:9999";
      const origin = `${protocol}://${host}`;
      const magicLink = `${origin}/api/auth/verify-magic-link?token=${encodeURIComponent(magicLinkToken)}&email=${encodeURIComponent(email)}`;

      await db.otpRequest.create({ data: { email, otpHash, magicLinkToken, expiresAt } });

      await sendOtpEmail(email, otp, magicLink);

      return c.json({ message: "OTP sent to your email." });
    },
  )

  // POST /api/auth/verify-otp
  .post(
    "/verify-otp",
    zValidator(
      "json",
      z.object({
        email: z.string().email(),
        otp: z.string().length(6).regex(/^\d{6}$/),
      }),
    ),
    async (c) => {
      const { email, otp } = c.req.valid("json");

      const record = await db.otpRequest.findFirst({
        where: { email, used: false, expiresAt: { gte: new Date() } },
        orderBy: { createdAt: "desc" },
      });

      if (!record || !(await bcrypt.compare(otp, record.otpHash))) {
        return c.json({ error: "Invalid or expired code." }, 401);
      }

      // Mark OTP as used
      await db.otpRequest.update({ where: { id: record.id }, data: { used: true } });

      // Upsert user
      const user = await db.user.upsert({
        where: { email },
        create: { email, displayName: email.split("@")[0] ?? email },
        update: {},
      });

      const [accessToken, refreshToken] = await Promise.all([
        signAccessToken({ sub: user.id }),
        signRefreshToken({ sub: user.id }),
      ]);

      return c.json({
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, displayName: user.displayName },
      });
    },
  )

  // POST /api/auth/refresh
  .post(
    "/refresh",
    zValidator("json", z.object({ refreshToken: z.string().min(1) })),
    async (c) => {
      const { refreshToken } = c.req.valid("json");

      try {
        const payload = await verifyRefreshToken(refreshToken);
        const accessToken = await signAccessToken({ sub: payload.sub });
        return c.json({ accessToken });
      } catch {
        return c.json({ error: "Invalid or expired refresh token." }, 401);
      }
    },
  )

  // POST /api/auth/callback/google
  .post(
    "/callback/google",
    zValidator("json", z.object({ idToken: z.string().min(1) })),
    async (c) => {
      const { idToken } = c.req.valid("json");

      console.log("Google callback received, verifying token...");

      try {
        const payload = await verifyGoogleIdToken(idToken);

        console.log("Token verified successfully, creating/updating user...", {
          email: payload.email,
          sub: payload.sub,
        });

        // Upsert user with Google info
        const user = await db.user.upsert({
          where: { email: payload.email },
          create: {
            email: payload.email,
            displayName: payload.name || payload.email.split("@")[0] || "User",
            avatarUrl: payload.picture || undefined,
            googleId: payload.sub,
          },
          update: {
            googleId: payload.sub,
            // Update avatar if it changed
            avatarUrl: payload.picture || undefined,
          },
        });

        const [accessToken, refreshToken] = await Promise.all([
          signAccessToken({ sub: user.id }),
          signRefreshToken({ sub: user.id }),
        ]);

        return c.json({
          accessToken,
          refreshToken,
          user: { id: user.id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl },
        });
      } catch (err) {
        console.error("Google callback error:", err instanceof Error ? err.message : String(err));
        return c.json({ error: "Invalid Google token. Please try again." }, 401);
      }
    },
  )

  // GET /api/auth/verify-magic-link
  .get("/verify-magic-link", 
    async (c) => {
      const token = c.req.query("token");
      const email = c.req.query("email");

      if (!token || !email) {
        return c.json({ error: "Missing token or email." }, 400);
      }

      const record = await db.otpRequest.findFirst({
        where: { 
          email, 
          magicLinkToken: token,
          used: false, 
          expiresAt: { gte: new Date() } 
        },
      });

      if (!record) {
        return c.json({ error: "Invalid or expired magic link." }, 401);
      }

      // Mark OTP as used
      await db.otpRequest.update({ where: { id: record.id }, data: { used: true } });

      // Upsert user
      const user = await db.user.upsert({
        where: { email },
        create: { email, displayName: email.split("@")[0] ?? email },
        update: {},
      });

      const [accessToken, refreshToken] = await Promise.all([
        signAccessToken({ sub: user.id }),
        signRefreshToken({ sub: user.id }),
      ]);

      // Set secure HTTP-only cookies
      c.header("Set-Cookie", `ss_access_token=${accessToken}; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax; HttpOnly`);
      c.header("Set-Cookie", `ss_refresh_token=${refreshToken}; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax; HttpOnly`);

      // Return HTML page that redirects
      return c.html(`<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=/" />
  <title>Signing in...</title>
</head>
<body>
  <p>Signing you in...</p>
</body>
</html>`);
    },
  )

  // POST /api/auth/logout (client-side token clear — no server state)
  .post("/logout", (c) => c.json({ message: "Logged out." }));

