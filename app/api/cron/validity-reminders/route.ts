import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";

/**
 * sección 7, sección 13: diario 09:00 COT — avisos de 15/7/3/0 días.
 * TODO: consultar credit_batches activas agrupadas por studentId con el
 * mínimo `expiresAt`, calcular días restantes, y enviar el aviso una sola
 * vez por bolsa y umbral (criterio QA #17) marcando en `notifications` para
 * evitar duplicados.
 */
export async function POST(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  return NextResponse.json({ ok: true, sent: 0, note: "Pendiente de implementar consulta real" });
}
