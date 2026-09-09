import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, paymentEvents, plans } from "@/db/schema";
import { grantPurchaseCredits } from "@/lib/credits/ledger";

/**
 * Integración Wompi (sección 6.1). [DECIDIR] sección 17.7: confirmar si es
 * Wompi o ePayco según el banco de Nico — se implementa Wompi por ser la
 * elección por defecto de la spec (sección 3).
 */

export interface WompiWebhookEvent {
  event: string; // p. ej. "transaction.updated"
  data: {
    transaction: {
      id: string;
      reference: string;
      status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING";
      amount_in_cents: number;
      currency: string;
    };
  };
  signature: { checksum: string; properties: string[] };
  timestamp: number;
}

/** Valida la firma del evento según el algoritmo de Wompi (checksum SHA256). */
export function verifyWompiSignature(event: WompiWebhookEvent, eventsSecret: string): boolean {
  const values = event.signature.properties.map((path) => {
    const parts = path.split(".");
    let value: unknown = event;
    for (const part of parts) {
      value = (value as Record<string, unknown>)?.[part];
    }
    return String(value);
  });
  const raw = values.join("") + event.timestamp + eventsSecret;
  const expected = crypto.createHash("sha256").update(raw).digest("hex");
  return expected === event.signature.checksum;
}

/**
 * Handler del webhook (sección 6.1, paso 3):
 *  - valida firma
 *  - idempotencia contra payment_events.external_event_id
 *  - si aprobado: marca la orden PAID y genera los créditos vía el ledger
 *  - registra siempre el evento crudo
 */
export async function handleWompiWebhook(event: WompiWebhookEvent, eventsSecret: string) {
  if (!verifyWompiSignature(event, eventsSecret)) {
    throw new Error("Firma de Wompi inválida");
  }

  const externalEventId = `${event.data.transaction.id}:${event.data.transaction.status}`;

  const alreadyProcessed = await db
    .select({ id: paymentEvents.id })
    .from(paymentEvents)
    .where(eq(paymentEvents.externalEventId, externalEventId));

  if (alreadyProcessed.length > 0) {
    return { duplicate: true };
  }

  await db.insert(paymentEvents).values({
    gateway: "wompi",
    externalEventId,
    payload: event as unknown as Record<string, unknown>,
  });

  if (event.data.transaction.status !== "APPROVED") {
    return { duplicate: false, approved: false };
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.gatewayReference, event.data.transaction.reference));

  if (!order) {
    throw new Error(`Orden no encontrada para la referencia ${event.data.transaction.reference}`);
  }
  if (order.status === "paid") {
    // Ya procesada por un reintento anterior con otro external_event_id.
    return { duplicate: true, approved: true };
  }

  const paidAt = new Date();
  await db.update(orders).set({ status: "paid", paidAt }).where(eq(orders.id, order.id));

  await grantPurchaseCredits({
    studentId: order.studentId,
    orderId: order.id,
    classCount: order.planSnapshot.classCount,
    validityDays: order.planSnapshot.validityDays,
    paidAt,
  });

  return { duplicate: false, approved: true };
}

/** RN-02: crea la orden congelando el precio/clases/vigencia vigentes del plan. */
export async function createGatewayOrder(params: { studentId: string; planId: string }) {
  const [plan] = await db.select().from(plans).where(eq(plans.id, params.planId));
  if (!plan || !plan.isActive) throw new Error("Plan no disponible");

  const reference = `tpp_${crypto.randomUUID()}`;

  const [order] = await db
    .insert(orders)
    .values({
      studentId: params.studentId,
      planId: plan.id,
      planSnapshot: {
        name: plan.name,
        classCount: plan.classCount,
        priceCents: plan.priceCents,
        validityDays: plan.validityDays,
        classDurationMinutes: plan.classDurationMinutes,
      },
      amountCents: plan.priceCents,
      currency: plan.currency,
      method: "gateway",
      gateway: "wompi",
      gatewayReference: reference,
      status: "pending",
    })
    .returning();

  return order;
}
