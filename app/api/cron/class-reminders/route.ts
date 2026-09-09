import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";

/**
 * sección 7, sección 13: cada 15 minutos — recordatorios de 24h y 2h antes de clase.
 * TODO: consultar bookings `scheduled` cuyo `startsAt` caiga en la ventana de
 * 24h±7.5min o 2h±7.5min desde ahora, y enviar el correo/WhatsApp una sola vez
 * por reserva y umbral.
 */
export async function POST(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  return NextResponse.json({ ok: true, sent: 0, note: "Pendiente de implementar consulta real" });
}
