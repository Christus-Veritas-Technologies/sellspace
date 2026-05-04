import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("ss_access_token")?.value ?? null;
  return Response.json({ token });
}
