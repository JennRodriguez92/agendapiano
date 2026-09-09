/**
 * sección 11: la barra de vigencia cambia de color en tres umbrales
 * (normal / ≤7 días / ≤3 días) — debe leerse sin leer el texto.
 */
export type UrgencyLevel = "normal" | "warning" | "critical";

export function getUrgencyLevel(daysRemaining: number): UrgencyLevel {
  if (daysRemaining <= 3) return "critical";
  if (daysRemaining <= 7) return "warning";
  return "normal";
}

export const urgencyColorVar: Record<UrgencyLevel, string> = {
  normal: "var(--color-urgency-normal)",
  warning: "var(--color-urgency-warning)",
  critical: "var(--color-urgency-critical)",
};
