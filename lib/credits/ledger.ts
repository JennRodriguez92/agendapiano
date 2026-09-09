import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { creditBatches, creditMovements } from "@/db/schema";
import {
  computeExpiresAt,
  pickFifoBatch,
  isBookableWithinExpiry,
  type BatchLike,
} from "./rules";

/**
 * Servicio único de escritura del libro de créditos (principio de
 * arquitectura #4 de la spec): ningún endpoint escribe en credit_movements
 * directamente, todo pasa por aquí.
 */

type Tx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

async function loadActiveBatchesWithAvailable(tx: Tx, studentId: string) {
  const batches = await tx
    .select()
    .from(creditBatches)
    .where(and(eq(creditBatches.studentId, studentId), eq(creditBatches.status, "active")));

  const movements = batches.length
    ? await tx
        .select({ batchId: creditMovements.batchId, amount: creditMovements.amount })
        .from(creditMovements)
        .where(
          inArray(
            creditMovements.batchId,
            batches.map((b) => b.id)
          )
        )
    : [];

  const availableByBatch: Record<string, number> = {};
  for (const b of batches) availableByBatch[b.id] = 0;
  for (const m of movements) availableByBatch[m.batchId] += m.amount;

  const batchLikes: BatchLike[] = batches.map((b) => ({
    id: b.id,
    expiresAt: b.expiresAt,
    status: b.status,
  }));

  return { batches, batchLikes, availableByBatch };
}

/** RN-10, RN-02: crea una bolsa de créditos a partir de una compra confirmada. */
export async function grantPurchaseCredits(params: {
  studentId: string;
  orderId: string;
  classCount: number;
  validityDays: number;
  paidAt: Date;
}) {
  const expiresAt = computeExpiresAt(params.paidAt, params.validityDays);

  return db.transaction(async (tx) => {
    const [batch] = await tx
      .insert(creditBatches)
      .values({
        studentId: params.studentId,
        orderId: params.orderId,
        classCount: params.classCount,
        startsAt: params.paidAt,
        expiresAt,
        status: "active",
      })
      .returning();

    await tx.insert(creditMovements).values({
      studentId: params.studentId,
      batchId: batch.id,
      type: "PURCHASE",
      amount: params.classCount,
      createdBy: null,
    });

    return batch;
  });
}

/** RN-17: cortesía o ajuste manual de Nico, siempre con motivo auditado. */
export async function grantManualCredits(params: {
  studentId: string;
  classCount: number;
  validityDays: number;
  now: Date;
  grantedBy: string;
  reason: string;
}) {
  if (!params.reason?.trim()) {
    throw new Error("El motivo es obligatorio para otorgar créditos manuales (RN-17)");
  }
  const expiresAt = computeExpiresAt(params.now, params.validityDays);

  return db.transaction(async (tx) => {
    const [batch] = await tx
      .insert(creditBatches)
      .values({
        studentId: params.studentId,
        classCount: params.classCount,
        startsAt: params.now,
        expiresAt,
        status: "active",
      })
      .returning();

    await tx.insert(creditMovements).values({
      studentId: params.studentId,
      batchId: batch.id,
      type: "MANUAL_GRANT",
      amount: params.classCount,
      reason: params.reason,
      createdBy: params.grantedBy,
    });

    return batch;
  });
}

/**
 * RN-14, RN-15, RN-27: reserva un crédito para una clase, eligiendo la bolsa
 * FIFO por vencimiento. Debe ejecutarse dentro de la misma transacción que
 * crea la fila de `bookings` (ver lib/scheduling/booking.ts) para que el
 * bloqueo de fila cubra ambas escrituras.
 */
export async function holdCreditForBooking(
  tx: Tx,
  params: { studentId: string; classStartsAt: Date; now: Date }
) {
  const { batchLikes, availableByBatch } = await loadActiveBatchesWithAvailable(
    tx,
    params.studentId
  );

  const batchId = pickFifoBatch(batchLikes, availableByBatch, params.now);
  if (!batchId) {
    throw new Error("Sin créditos disponibles");
  }

  const batch = batchLikes.find((b) => b.id === batchId)!;
  if (!isBookableWithinExpiry(params.classStartsAt, batch.expiresAt)) {
    throw new Error("La fecha de la clase es posterior al vencimiento del crédito");
  }

  const [movement] = await tx
    .insert(creditMovements)
    .values({
      studentId: params.studentId,
      batchId,
      type: "HOLD",
      amount: -1,
    })
    .returning();

  return { batchId, movementId: movement.id };
}

/** RN-22, RN-25: libera un crédito retenido (cancelación a tiempo o cancelación de Nico). */
export async function releaseCredit(
  tx: Tx,
  params: { studentId: string; batchId: string; bookingId: string; reason: string }
) {
  await tx.insert(creditMovements).values({
    studentId: params.studentId,
    batchId: params.batchId,
    bookingId: params.bookingId,
    type: "RELEASE",
    amount: 1,
    reason: params.reason,
  });
}

/** RN-17: corrección manual auditada, positiva o negativa. */
export async function adjustCredits(params: {
  studentId: string;
  batchId: string;
  amount: number;
  reason: string;
  createdBy: string;
}) {
  if (!params.reason?.trim()) {
    throw new Error("El motivo es obligatorio para un ajuste manual (RN-17)");
  }
  await db.insert(creditMovements).values({
    studentId: params.studentId,
    batchId: params.batchId,
    type: "ADJUSTMENT",
    amount: params.amount,
    reason: params.reason,
    createdBy: params.createdBy,
  });
}

/** RN-16: job diario — marca como vencidas las bolsas activas cuyo plazo pasó. */
export async function expireDueBatches(now: Date) {
  return db.transaction(async (tx) => {
    const dueBatches = await tx
      .select()
      .from(creditBatches)
      .where(and(eq(creditBatches.status, "active"), sql`${creditBatches.expiresAt} <= ${now}`));

    for (const batch of dueBatches) {
      const [{ available } = { available: 0 }] = await tx
        .select({ available: sql<number>`coalesce(sum(${creditMovements.amount}), 0)` })
        .from(creditMovements)
        .where(eq(creditMovements.batchId, batch.id));

      if (available > 0) {
        await tx.insert(creditMovements).values({
          studentId: batch.studentId,
          batchId: batch.id,
          type: "EXPIRE",
          amount: -available,
          reason: "Vencimiento automático (RN-16)",
        });
      }

      await tx.update(creditBatches).set({ status: "expired" }).where(eq(creditBatches.id, batch.id));
    }

    return dueBatches.map((b) => b.id);
  });
}

/** Saldo disponible total del alumno (para la pantalla de Inicio). */
export async function getAvailableBalance(studentId: string) {
  const { batchLikes, availableByBatch } = await loadActiveBatchesWithAvailable(db, studentId);
  return batchLikes.reduce((sum, b) => sum + (availableByBatch[b.id] ?? 0), 0);
}

/** Extracto de movimientos en lenguaje humano (sección 8.3). */
export async function getStatement(studentId: string) {
  return db
    .select()
    .from(creditMovements)
    .where(eq(creditMovements.studentId, studentId))
    .orderBy(creditMovements.createdAt);
}
