/**
 * Reglas puras del motor de créditos (sección 4.2 de la spec).
 * Sin dependencias de base de datos — se pueden probar de forma aislada.
 *
 * Diseño del libro de movimientos (documentado porque la spec deja un margen
 * de interpretación entre HOLD y CONSUME):
 *   - Al crear una reserva se inserta un único movimiento HOLD(-1). Ese −1
 *     ya representa el crédito comprometido.
 *   - Si la reserva se cancela dentro de una ventana que devuelve el crédito
 *     (RN-22, RN-25, o la reprogramación gratuita de RN-23 no aplica aquí
 *     porque reprogramar no toca el libro) se inserta RELEASE(+1), que neutraliza
 *     el HOLD.
 *   - Si la clase se completa (RN-26) o se pierde por cancelación tardía /
 *     no-show (RN-24), NO se inserta un movimiento adicional: el HOLD ya
 *     representa el consumo definitivo. "El cierre solo cambia el estado
 *     visible", como indica la spec.
 *   - CONSUME queda reservado para descuentos directos sin reserva asociada
 *     (p. ej. correcciones), y EXPIRE para el job de vencimiento (RN-16).
 */

export const BUSINESS_TIMEZONE = "America/Bogota";

export type MovementType =
  | "PURCHASE"
  | "MANUAL_GRANT"
  | "HOLD"
  | "CONSUME"
  | "RELEASE"
  | "EXPIRE"
  | "ADJUSTMENT";

export interface BatchLike {
  id: string;
  expiresAt: Date;
  status: "active" | "expired" | "exhausted";
}

export interface MovementLike {
  batchId: string;
  type: MovementType;
  amount: number;
}

/**
 * RN-11: el vencimiento cae a las 23:59:59 hora Colombia del día `validityDays`
 * después de `startsAt`. Colombia es UTC-5 fijo (sin horario de verano), así
 * que el cálculo es un offset constante — documentado explícitamente para no
 * depender de un supuesto oculto si el negocio se expande a zonas con DST.
 */
export function computeExpiresAt(startsAt: Date, validityDays: number): Date {
  const COLOMBIA_UTC_OFFSET_MS = 5 * 60 * 60 * 1000;
  // Reloj de Colombia en el instante de inicio, leído como campos UTC de un
  // instante desplazado -5h (válido porque Colombia no tiene horario de verano).
  const startColombiaClock = new Date(startsAt.getTime() - COLOMBIA_UTC_OFFSET_MS);
  // Medianoche del día de inicio en hora Colombia, expresada en UTC real:
  const startColombiaMidnightUtc =
    Date.UTC(
      startColombiaClock.getUTCFullYear(),
      startColombiaClock.getUTCMonth(),
      startColombiaClock.getUTCDate(),
      0,
      0,
      0
    ) + COLOMBIA_UTC_OFFSET_MS;
  const expiryColombiaMidnightUtc =
    startColombiaMidnightUtc + validityDays * 24 * 60 * 60 * 1000;
  // 23:59:59 hora Colombia del día de vencimiento = medianoche siguiente - 1s.
  const expiryUtcMs =
    expiryColombiaMidnightUtc + 24 * 60 * 60 * 1000 - 1000;
  return new Date(expiryUtcMs);
}

/** RN-31 (Fase 2): la congelación empuja el vencimiento los días congelados. */
export function extendExpiry(currentExpiresAt: Date, days: number): Date {
  return new Date(currentExpiresAt.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * RN-14: al reservar se consume siempre el crédito que vence primero (FIFO
 * por vencimiento) entre las bolsas activas con saldo disponible.
 */
export function pickFifoBatch(
  batches: BatchLike[],
  availableByBatch: Record<string, number>,
  asOf: Date
): string | null {
  const eligible = batches.filter(
    (b) =>
      b.status === "active" &&
      b.expiresAt.getTime() > asOf.getTime() &&
      (availableByBatch[b.id] ?? 0) > 0
  );
  if (eligible.length === 0) return null;
  eligible.sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());
  return eligible[0].id;
}

/** RN-15: no se puede reservar una clase después del vencimiento del crédito. */
export function isBookableWithinExpiry(
  classStartsAt: Date,
  batchExpiresAt: Date
): boolean {
  return classStartsAt.getTime() <= batchExpiresAt.getTime();
}

/** Saldo de una bolsa a partir de sus propios movimientos. */
export function computeBatchAvailable(movements: MovementLike[]): number {
  return movements.reduce((sum, m) => sum + m.amount, 0);
}

/**
 * Saldo disponible total = suma de todos los movimientos de bolsas no
 * vencidas (regla explícita de la sección 4.2).
 */
export function computeAvailableBalance(
  movements: MovementLike[],
  batches: BatchLike[]
): number {
  const nonExpiredBatchIds = new Set(
    batches.filter((b) => b.status !== "expired").map((b) => b.id)
  );
  return movements
    .filter((m) => nonExpiredBatchIds.has(m.batchId))
    .reduce((sum, m) => sum + m.amount, 0);
}
