import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, plans } from "@/db/schema";
import { grantPurchaseCredits } from "@/lib/credits/ledger";

/** sección 6.2: pago por Nequi/Bancolombia/transferencia — obligatorio en Fase 1. */

export async function createManualOrder(params: {
  studentId: string;
  planId: string;
  receiptUrl: string;
}) {
  const [plan] = await db.select().from(plans).where(eq(plans.id, params.planId));
  if (!plan || !plan.isActive) throw new Error("Plan no disponible");

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
      method: "manual",
      receiptUrl: params.receiptUrl,
      status: "pending_review",
    })
    .returning();

  return order;
}

/** Nico aprueba desde el panel — genera los créditos igual que el flujo automático. */
export async function approveManualOrder(params: { orderId: string; reviewedBy: string }) {
  const [order] = await db.select().from(orders).where(eq(orders.id, params.orderId));
  if (!order) throw new Error("Orden no encontrada");
  if (order.method !== "manual") throw new Error("La orden no es de pago manual");
  if (order.status !== "pending_review") throw new Error("La orden ya fue revisada");

  const paidAt = new Date();
  await db
    .update(orders)
    .set({ status: "paid", paidAt, reviewedBy: params.reviewedBy })
    .where(eq(orders.id, order.id));

  return grantPurchaseCredits({
    studentId: order.studentId,
    orderId: order.id,
    classCount: order.planSnapshot.classCount,
    validityDays: order.planSnapshot.validityDays,
    paidAt,
  });
}

export async function rejectManualOrder(params: { orderId: string; reviewedBy: string }) {
  await db
    .update(orders)
    .set({ status: "rejected", reviewedBy: params.reviewedBy })
    .where(eq(orders.id, params.orderId));
}
