import { NextResponse } from "next/server";

/**
 * Challenge 3 handshake. The course platform GETs this to confirm your
 * decision simulator is live and belongs to you (via SITE_TOKEN).
 */
export async function GET() {
  return NextResponse.json({
    service: "simulator",
    specVersion: "1",
    studentToken: process.env.SITE_TOKEN ?? "SITE_TOKEN-env-var-not-set",
  });
}
