import { NextRequest, NextResponse } from "next/server";
import { handleWompiWebhook, type WompiWebhookEvent } from "@/lib/payments/wompi";

export async function POST(req: NextRequest) {
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
  if (!eventsSecret) {
    return NextResponse.json({ error: "WOMPI_EVENTS_SECRET no configurado" }, { status: 500 });
  }

  const event = (await req.json()) as WompiWebhookEvent;

  try {
    const result = await handleWompiWebhook(event, eventsSecret);
    return NextResponse.json(result);
  } catch (err) {
    // Los errores de webhook nunca deben pasar en silencio (sección 3, observabilidad).
    console.error("Error procesando webhook de Wompi", err);
    return NextResponse.json({ error: "No se pudo procesar el evento" }, { status: 400 });
  }
}
