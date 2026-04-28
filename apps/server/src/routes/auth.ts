import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { z } from "zod";

import db from "@sellspace/db";

import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { sendOtpEmail } from "../lib/mailer";
import { generateOtp } from "../lib/otp";

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
      const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);
      const expiresAt = new Date(Date.now() + OTP_TTL_MS);

      await db.otpRequest.create({ data: { email, otpHash, expiresAt } });

      await sendOtpEmail(email, otp);

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

  // POST /api/auth/logout (client-side token clear — no server state)
  .post("/logout", (c) => c.json({ message: "Logged out." }));

