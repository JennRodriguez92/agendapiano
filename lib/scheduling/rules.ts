/**
 * Reglas puras de reserva/reprogramación/cancelación (sección 4.3).
 * Sin dependencias de base de datos ni de Google Calendar.
 *
 * [DECIDIR] RN-20 (anticipación mínima) y RN-03 (duración de clase) tienen
 * marcador explícito de "confirmar con Nico" en la spec. Se usan aquí los
 * valores por defecto que la propia spec indica asumir, y quedan expuestos
 * como constantes para configurarlos desde teacher_settings sin tocar lógica.
 */

export const MIN_BOOKING_NOTICE_HOURS = 12; // RN-20 [DECIDIR]
export const MAX_BOOKING_ADVANCE_DAYS = 30; // RN-21
export const FREE_CANCEL_HOURS = 24; // RN-22
export const NO_SHOW_CUTOFF_HOURS = 4; // RN-24
export const DEFAULT_CLASS_DURATION_MINUTES = 60; // RN-03 [DECIDIR]

export type BookingResolution =
  | "free_cancel" // > 24h: gratis, crédito liberado, sin límite de veces
  | "reschedule_allowed" // 24h–4h, primera vez en esta bolsa: reprogramar gratis
  | "forfeits_credit"; // 24h–4h ya usada la reprogramación, o <4h, o no-show

export interface CanBookResult {
  allowed: boolean;
  reason?: "too_soon" | "too_far" | "after_batch_expiry";
}

/** RN-20, RN-21, RN-15: ventana válida para crear una reserva nueva. */
export function canBook(
  classStartsAt: Date,
  now: Date,
  batchExpiresAt: Date,
  minNoticeHours = MIN_BOOKING_NOTICE_HOURS,
  maxAdvanceDays = MAX_BOOKING_ADVANCE_DAYS
): CanBookResult {
  const hoursUntilClass =
    (classStartsAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilClass < minNoticeHours) {
    return { allowed: false, reason: "too_soon" };
  }
  if (hoursUntilClass > maxAdvanceDays * 24) {
    return { allowed: false, reason: "too_far" };
  }
  if (classStartsAt.getTime() > batchExpiresAt.getTime()) {
    return { allowed: false, reason: "after_batch_expiry" };
  }
  return { allowed: true };
}

/**
 * RN-22, RN-23, RN-24: clasifica qué pasa si el alumno cancela o reprograma
 * `classStartsAt` en el momento `now`, dado si ya usó su reprogramación
 * gratuita de esta bolsa (`rescheduleAlreadyUsedInBatch`) y si es su primera
 * ausencia en la vida del alumno (`isFirstEverAbsence`, cortesía de RN-24).
 */
export function classifyCancellation(
  classStartsAt: Date,
  now: Date,
  rescheduleAlreadyUsedInBatch: boolean,
  isFirstEverAbsence = false
): BookingResolution {
  const hoursUntilClass =
    (classStartsAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilClass >= FREE_CANCEL_HOURS) return "free_cancel";

  if (hoursUntilClass >= NO_SHOW_CUTOFF_HOURS) {
    return rescheduleAlreadyUsedInBatch ? "forfeits_credit" : "reschedule_allowed";
  }

  if (isFirstEverAbsence) return "free_cancel";
  return "forfeits_credit";
}

/** RN-27: dos reservas no pueden solaparse. */
export function overlaps(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}
