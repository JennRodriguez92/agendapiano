import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { availabilityBlocks, availabilityRules, bookings } from "@/db/schema";
import { canBook, overlaps, DEFAULT_CLASS_DURATION_MINUTES } from "./rules";
import { getBusyIntervals, type BusyInterval } from "./google-calendar";

export interface Slot {
  startsAt: Date;
  endsAt: Date;
}

const FREEBUSY_CACHE_TTL_MS = 60_000; // sección 5.2: cachear máximo 60s
let freeBusyCache: { key: string; expiresAt: number; data: BusyInterval[] } | null = null;

async function getCachedBusyIntervals(timeMin: Date, timeMax: Date): Promise<BusyInterval[]> {
  const key = `${timeMin.toISOString()}:${timeMax.toISOString()}`;
  if (freeBusyCache && freeBusyCache.key === key && freeBusyCache.expiresAt > Date.now()) {
    return freeBusyCache.data;
  }
  const data = await getBusyIntervals({ timeMin, timeMax });
  freeBusyCache = { key, expiresAt: Date.now() + FREEBUSY_CACHE_TTL_MS, data };
  return data;
}

/**
 * Genera los cupos teóricos de un día a partir de las reglas recurrentes de
 * disponibilidad (sección 5.1), con la granularidad y el colchón indicados.
 */
export function generateTheoreticalSlots(params: {
  date: Date; // cualquier instante dentro del día, en UTC
  rule: { startTime: string; endTime: string }; // "HH:mm:ss" en zona del profesor
  slotGranularityMinutes: number; // 30 o 60, sección 5.1 [DECIDIR]
  bufferMinutes: number;
  classDurationMinutes: number;
  timezoneOffsetHours: number; // desplazamiento fijo de la zona del profesor vs UTC (negativo = detrás de UTC)
}): Slot[] {
  const [startH, startM] = params.rule.startTime.split(":").map(Number);
  const [endH, endM] = params.rule.endTime.split(":").map(Number);

  const dayUtcMidnight = Date.UTC(
    params.date.getUTCFullYear(),
    params.date.getUTCMonth(),
    params.date.getUTCDate()
  );
  const offsetMs = params.timezoneOffsetHours * 60 * 60 * 1000;

  const windowStart = dayUtcMidnight - offsetMs + (startH * 60 + startM) * 60 * 1000;
  const windowEnd = dayUtcMidnight - offsetMs + (endH * 60 + endM) * 60 * 1000;

  const step = params.slotGranularityMinutes * 60 * 1000;
  const duration = params.classDurationMinutes * 60 * 1000;
  // El colchón (`bufferMinutes`) no se aplica aquí: se resuelve al filtrar
  // los cupos teóricos contra reservas y bloqueos existentes en getAvailableSlots.

  const slots: Slot[] = [];
  for (let start = windowStart; start + duration <= windowEnd; start += step) {
    slots.push({ startsAt: new Date(start), endsAt: new Date(start + duration) });
  }
  return slots;
}

/**
 * sección 5.2: cupos teóricos → menos bloqueos manuales → menos reservas en
 * BD → menos ocupación de Google (todos los calendarios) → filtra por
 * anticipación mínima y vigencia del crédito.
 */
export async function getAvailableSlots(params: {
  date: Date;
  studentTimezone: string;
  now: Date;
  batchExpiresAt: Date | null;
}): Promise<Slot[]> {
  const weekday = params.date.getUTCDay();

  const rules = await db
    .select()
    .from(availabilityRules)
    .where(and(eq(availabilityRules.weekday, weekday), eq(availabilityRules.isActive, true)));

  const dayStart = new Date(
    Date.UTC(params.date.getUTCFullYear(), params.date.getUTCMonth(), params.date.getUTCDate())
  );
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const [blocks, existingBookings, busyIntervals] = await Promise.all([
    db
      .select()
      .from(availabilityBlocks)
      .where(and(gte(availabilityBlocks.endsAt, dayStart), lte(availabilityBlocks.startsAt, dayEnd))),
    db
      .select()
      .from(bookings)
      .where(
        and(eq(bookings.status, "scheduled"), gte(bookings.startsAt, dayStart), lte(bookings.startsAt, dayEnd))
      ),
    getCachedBusyIntervals(dayStart, dayEnd),
  ]);

  let theoretical: Slot[] = [];
  for (const rule of rules) {
    theoretical = theoretical.concat(
      generateTheoreticalSlots({
        date: params.date,
        rule: { startTime: rule.startTime, endTime: rule.endTime },
        slotGranularityMinutes: 60, // [DECIDIR] sección 5.1, por defecto 60
        bufferMinutes: 15,
        classDurationMinutes: DEFAULT_CLASS_DURATION_MINUTES,
        timezoneOffsetHours: -5, // America/Bogota
      })
    );
  }

  const occupied: Array<{ start: Date; end: Date }> = [
    ...blocks.map((b) => ({ start: b.startsAt, end: b.endsAt })),
    ...existingBookings.map((b) => ({ start: b.startsAt, end: b.endsAt })),
    ...busyIntervals.map((b) => ({ start: b.start, end: b.end })),
  ];

  return theoretical.filter((slot) => {
    const isFree = !occupied.some((o) => overlaps(slot.startsAt, slot.endsAt, o.start, o.end));
    if (!isFree) return false;

    if (!params.batchExpiresAt) return false;
    const check = canBook(slot.startsAt, params.now, params.batchExpiresAt);
    return check.allowed;
  });
}
