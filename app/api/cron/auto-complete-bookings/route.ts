import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";
import { autoCompletePastBookings } from "@/lib/scheduling/booking";

/** RN-26, sección 13: cada 30 minutos. */
export async function POST(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  await autoCompletePastBookings(new Date());
  return NextResponse.json({ ok: true });
}
