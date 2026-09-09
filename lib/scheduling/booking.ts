import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { holdCreditForBooking, releaseCredit } from "@/lib/credits/ledger";
import { canBook, classifyCancellation, DEFAULT_CLASS_DURATION_MINUTES } from "./rules";
import { createCalendarEvent, deleteCalendarEvent, patchCalendarEvent } from "./google-calendar";

/**
 * RN-27, sección 5.3: crea la reserva dentro de una transacción que
 * bloquea el cupo, verifica saldo, crea el HOLD y la fila de `bookings`.
 * Google Calendar se llama DESPUÉS de confirmar la transacción — si falla,
 * la reserva queda `PENDING_SYNC` (nunca se le quita la clase al alumno por
 * un error de Google).
 */
export async function createBooking(params: {
  studentId: string;
  startsAt: Date;
  studentTimezone: string;
  now: Date;
  batchExpiresAt: Date;
  durationMinutes?: number;
}) {
  const endsAt = new Date(
    params.startsAt.getTime() +
      (params.durationMinutes ?? DEFAULT_CLASS_DURATION_MINUTES) * 60 * 1000
  );

  const bookCheck = canBook(params.startsAt, params.now, params.batchExpiresAt);
  if (!bookCheck.allowed) {
    throw new Error(`No se puede reservar: ${bookCheck.reason}`);
  }

  const booking = await db.transaction(async (tx) => {
    // La restricción única (starts_at) WHERE status='scheduled' en la base
    // de datos es la última línea de defensa contra doble reserva (RN-27,
    // sección 5.3) si dos transacciones concurrentes llegan hasta aquí.
    const { batchId } = await holdCreditForBooking(tx, {
      studentId: params.studentId,
      classStartsAt: params.startsAt,
      now: params.now,
    });

    const [row] = await tx
      .insert(bookings)
      .values({
        studentId: params.studentId,
        batchId,
        startsAt: params.startsAt,
        endsAt,
        timezoneAtBooking: params.studentTimezone,
        status: "scheduled",
        syncStatus: "pending_sync",
      })
      .returning();

    return row;
  });

  try {
    const event = await createCalendarEvent({
      startsAt: booking.startsAt,
      endsAt: booking.endsAt,
      studentId: booking.studentId,
    });
    await db
      .update(bookings)
      .set({
        googleEventId: event.eventId,
        googleMeetUrl: event.meetUrl,
        syncStatus: "synced",
      })
      .where(eq(bookings.id, booking.id));
  } catch {
    // Se deja PENDING_SYNC; el job sync-google (sección 13) reintentará.
  }

  return booking;
}

/** RN-22, RN-23, RN-24: resuelve una cancelación según la ventana de tiempo. */
export async function cancelBooking(params: {
  bookingId: string;
  now: Date;
  cancelledByTeacher: boolean;
  rescheduleAlreadyUsedInBatch: boolean;
  isFirstEverAbsence?: boolean;
}) {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, params.bookingId));
  if (!booking) throw new Error("Reserva no encontrada");

  // RN-25: si Nico cancela, el crédito se devuelve siempre.
  const resolution = params.cancelledByTeacher
    ? "free_cancel"
    : classifyCancellation(
        booking.startsAt,
        params.now,
        params.rescheduleAlreadyUsedInBatch,
        params.isFirstEverAbsence ?? false
      );

  await db.transaction(async (tx) => {
    if (resolution === "free_cancel") {
      await releaseCredit(tx, {
        studentId: booking.studentId,
        batchId: booking.batchId,
        bookingId: booking.id,
        reason: params.cancelledByTeacher
          ? "Cancelada por Nico (RN-25)"
          : "Cancelación con más de 24h (RN-22)",
      });
    }
    // "forfeits_credit": el HOLD original queda como consumo definitivo —
    // no se inserta un movimiento nuevo (ver nota de diseño en credits/rules.ts).

    await tx
      .update(bookings)
      .set({
        status: params.cancelledByTeacher ? "cancelled_by_teacher" : "cancelled_by_student",
        cancelledAt: params.now,
      })
      .where(eq(bookings.id, booking.id));
  });

  if (booking.googleEventId) {
    await deleteCalendarEvent(booking.googleEventId);
  }

  return { resolution };
}

/** RN-22, RN-23: reprograma manteniendo el mismo crédito (no toca el libro). */
export async function rescheduleBooking(params: {
  bookingId: string;
  newStartsAt: Date;
  durationMinutes?: number;
}) {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, params.bookingId));
  if (!booking) throw new Error("Reserva no encontrada");

  const newEndsAt = new Date(
    params.newStartsAt.getTime() +
      (params.durationMinutes ?? DEFAULT_CLASS_DURATION_MINUTES) * 60 * 1000
  );

  await db
    .update(bookings)
    .set({
      startsAt: params.newStartsAt,
      endsAt: newEndsAt,
      rescheduleCount: booking.rescheduleCount + 1,
    })
    .where(eq(bookings.id, booking.id));

  if (booking.googleEventId) {
    // PATCH conserva el enlace de Meet (sección 5.4).
    await patchCalendarEvent(booking.googleEventId, {
      startsAt: params.newStartsAt,
      endsAt: newEndsAt,
    });
  }
}

/**
 * RN-26, job `auto-complete-bookings` (sección 13): 60 minutos después de
 * `endsAt`, una reserva `scheduled` pasa a `completed` automáticamente. El
 * crédito ya estaba consumido desde el HOLD; esto solo cambia el estado visible.
 */
export async function autoCompletePastBookings(now: Date) {
  const AUTO_COMPLETE_DELAY_MINUTES = 60;
  const cutoff = new Date(now.getTime() - AUTO_COMPLETE_DELAY_MINUTES * 60 * 1000);

  return db
    .update(bookings)
    .set({ status: "completed", completedAt: now })
    .where(and(eq(bookings.status, "scheduled"), lte(bookings.endsAt, cutoff)));
}
