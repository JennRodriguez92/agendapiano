import { describe, it, expect } from "vitest";
import {
  computeExpiresAt,
  extendExpiry,
  pickFifoBatch,
  isBookableWithinExpiry,
  computeAvailableBalance,
  type BatchLike,
  type MovementLike,
} from "@/lib/credits/rules";

describe("computeExpiresAt (RN-11)", () => {
  it("vence a las 23:59:59 hora Colombia del día 30, visto desde otra zona horaria (criterio QA #4)", () => {
    // 1 sep 2026 10:00 UTC = 05:00 Colombia (UTC-5)
    const startsAt = new Date("2026-09-01T10:00:00Z");
    const expiresAt = computeExpiresAt(startsAt, 30);
    // Día 30 desde el 1 de sep es el 1 de oct. 23:59:59 Colombia = 04:59:59 UTC del 2 de oct.
    expect(expiresAt.toISOString()).toBe("2026-10-02T04:59:59.000Z");

    // Verificado también como haría un alumno en Madrid (UTC+2 en esa fecha, CEST).
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Madrid",
      day: "numeric",
      hour: "numeric",
      hourCycle: "h23",
    }).formatToParts(expiresAt);
    const day = parts.find((p) => p.type === "day")?.value;
    const hour = parts.find((p) => p.type === "hour")?.value;
    expect(day).toBe("2");
    expect(hour).toBe("06");
  });

  it("es estable sin importar la hora UTC del pago dentro del mismo día Colombia", () => {
    const early = computeExpiresAt(new Date("2026-09-01T05:01:00Z"), 30); // 00:01 Colombia
    const late = computeExpiresAt(new Date("2026-09-02T04:59:00Z"), 30); // 23:59 Colombia mismo día
    expect(early.getTime()).toBe(late.getTime());
  });
});

describe("extendExpiry (RN-31)", () => {
  it("empuja el vencimiento los días congelados", () => {
    const expiresAt = new Date("2026-10-02T04:59:59.000Z");
    const extended = extendExpiry(expiresAt, 7);
    expect(extended.toISOString()).toBe("2026-10-09T04:59:59.000Z");
  });
});

describe("pickFifoBatch (RN-14, criterio QA #10)", () => {
  const asOf = new Date("2026-09-10T00:00:00Z");
  const batches: BatchLike[] = [
    { id: "batch-vence-tarde", expiresAt: new Date("2026-10-15T00:00:00Z"), status: "active" },
    { id: "batch-vence-pronto", expiresAt: new Date("2026-09-20T00:00:00Z"), status: "active" },
    { id: "batch-vencida", expiresAt: new Date("2026-09-01T00:00:00Z"), status: "expired" },
  ];

  it("elige la bolsa activa con saldo que vence primero", () => {
    const available = {
      "batch-vence-tarde": 3,
      "batch-vence-pronto": 2,
      "batch-vencida": 5,
    };
    expect(pickFifoBatch(batches, available, asOf)).toBe("batch-vence-pronto");
  });

  it("ignora bolsas sin saldo disponible", () => {
    const available = { "batch-vence-tarde": 3, "batch-vence-pronto": 0 };
    expect(pickFifoBatch(batches, available, asOf)).toBe("batch-vence-tarde");
  });

  it("devuelve null si no hay bolsas elegibles", () => {
    expect(pickFifoBatch(batches, {}, asOf)).toBeNull();
  });
});

describe("isBookableWithinExpiry (RN-15, criterio QA #11)", () => {
  it("rechaza una reserva posterior al vencimiento de la bolsa", () => {
    const batchExpiresAt = new Date("2026-09-20T04:59:59Z");
    expect(isBookableWithinExpiry(new Date("2026-09-21T00:00:00Z"), batchExpiresAt)).toBe(false);
    expect(isBookableWithinExpiry(new Date("2026-09-19T00:00:00Z"), batchExpiresAt)).toBe(true);
  });
});

describe("computeAvailableBalance", () => {
  it("suma solo los movimientos de bolsas no vencidas (criterio QA #12)", () => {
    const batches: BatchLike[] = [
      { id: "b1", expiresAt: new Date("2026-10-01T00:00:00Z"), status: "active" },
      { id: "b2", expiresAt: new Date("2026-08-01T00:00:00Z"), status: "expired" },
    ];
    const movements: MovementLike[] = [
      { batchId: "b1", type: "PURCHASE", amount: 8 },
      { batchId: "b1", type: "HOLD", amount: -1 },
      { batchId: "b2", type: "PURCHASE", amount: 4 },
      { batchId: "b2", type: "EXPIRE", amount: -4 },
    ];
    expect(computeAvailableBalance(movements, batches)).toBe(7);
  });
});
