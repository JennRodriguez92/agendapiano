import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";
import { expireDueBatches } from "@/lib/credits/ledger";

/** RN-16, sección 13: diario 00:15 COT. */
export async function POST(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  const expiredBatchIds = await expireDueBatches(new Date());
  // TODO: encolar el correo de vencimiento (sección 7) por cada bolsa expirada.
  return NextResponse.json({ expiredBatchIds });
}
