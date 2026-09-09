import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";

/**
 * sección 13: diario 20:00 COT — resumen a Nico (clases sin cerrar, pagos por
 * revisar, alumnos por vencer). TODO: agregar las tres consultas y enviar
 * por correo con sendEmail (lib/notifications/email).
 */
export async function POST(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  return NextResponse.json({ ok: true, note: "Pendiente de implementar consulta real" });
}
