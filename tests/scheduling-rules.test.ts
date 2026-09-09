import { describe, it, expect } from "vitest";
import { canBook, classifyCancellation, overlaps } from "@/lib/scheduling/rules";

describe("canBook (RN-20, RN-21, RN-15)", () => {
  const now = new Date("2026-09-10T12:00:00Z");
  const batchExpiresAt = new Date("2026-10-05T04:59:59Z");

  it("rechaza con menos de 12 horas de anticipación", () => {
    const soon = new Date(now.getTime() + 5 * 60 * 60 * 1000);
    expect(canBook(soon, now, batchExpiresAt)).toEqual({ allowed: false, reason: "too_soon" });
  });

  it("acepta con más de 12 horas y dentro de los 30 días", () => {
    const ok = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    expect(canBook(ok, now, batchExpiresAt)).toEqual({ allowed: true });
  });

  it("rechaza más allá de 30 días de anticipación", () => {
    const far = new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000);
    expect(canBook(far, now, batchExpiresAt)).toEqual({ allowed: false, reason: "too_far" });
  });

  it("rechaza una fecha posterior al vencimiento de la bolsa", () => {
    const afterExpiry = new Date("2026-10-10T12:00:00Z");
    expect(canBook(afterExpiry, now, batchExpiresAt)).toEqual({
      allowed: false,
      reason: "after_batch_expiry",
    });
  });
});

describe("classifyCancellation (RN-22, RN-23, RN-24, criterio QA #9)", () => {
  const classStartsAt = new Date("2026-09-15T16:00:00Z");

  it("más de 24h antes: gratis, sin límite de veces", () => {
    const now = new Date("2026-09-14T10:00:00Z"); // 30h antes
    expect(classifyCancellation(classStartsAt, now, false)).toBe("free_cancel");
    expect(classifyCancellation(classStartsAt, now, true)).toBe("free_cancel");
  });

  it("entre 24h y 4h, primera reprogramación de la bolsa: permitida y gratis", () => {
    const now = new Date("2026-09-15T00:00:00Z"); // 16h antes
    expect(classifyCancellation(classStartsAt, now, false)).toBe("reschedule_allowed");
  });

  it("entre 24h y 4h, ya usada la reprogramación: consume la clase", () => {
    const now = new Date("2026-09-15T00:00:00Z");
    expect(classifyCancellation(classStartsAt, now, true)).toBe("forfeits_credit");
  });

  it("menos de 4h antes: consume la clase salvo cortesía de primera ausencia", () => {
    const now = new Date("2026-09-15T14:00:00Z"); // 2h antes
    expect(classifyCancellation(classStartsAt, now, false)).toBe("forfeits_credit");
    expect(classifyCancellation(classStartsAt, now, false, true)).toBe("free_cancel");
  });
});

describe("overlaps (RN-27)", () => {
  it("detecta solapamiento de horarios", () => {
    const a = [new Date("2026-09-15T16:00:00Z"), new Date("2026-09-15T17:00:00Z")] as const;
    const b = [new Date("2026-09-15T16:30:00Z"), new Date("2026-09-15T17:30:00Z")] as const;
    expect(overlaps(...a, ...b)).toBe(true);
  });

  it("no detecta solapamiento cuando son consecutivos", () => {
    const a = [new Date("2026-09-15T16:00:00Z"), new Date("2026-09-15T17:00:00Z")] as const;
    const b = [new Date("2026-09-15T17:00:00Z"), new Date("2026-09-15T18:00:00Z")] as const;
    expect(overlaps(...a, ...b)).toBe(false);
  });
});
