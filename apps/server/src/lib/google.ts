import { OAuth2Client } from "google-auth-library";
import { env } from "@sellspace/env/server";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export interface GoogleTokenPayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: number;
  exp: number;
}

/**
 * Verifies a Google ID token and returns the payload.
 * Throws on invalid or expired token.
 */
export async function verifyGoogleIdToken(token: string): Promise<GoogleTokenPayload> {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid Google token payload");
  }

  return payload as GoogleTokenPayload;
}
