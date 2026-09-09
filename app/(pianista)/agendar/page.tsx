import { BookingFlow } from "./booking-flow";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BOOKING_CALENDAR_URL } from "@/lib/config/external-links";

export const dynamic = "force-dynamic";

/**
 * sección 8.2. TODO: sustituir por lib/scheduling/availability.getAvailableSlots
 * una vez haya sesión de alumno y conexión a Google Calendar activa.
 */
async function getAgendarData() {
  const days = [
    { dateLabel: "Lun 14", isoDate: "2026-09-14", hasSlots: true, slots: [{ time: "3:00 pm" }, { time: "4:00 pm" }] },
    { dateLabel: "Mar 15", isoDate: "2026-09-15", hasSlots: false, slots: [] },
    { dateLabel: "Mié 16", isoDate: "2026-09-16", hasSlots: true, slots: [{ time: "2:00 pm" }, { time: "5:00 pm" }] },
    { dateLabel: "Jue 17", isoDate: "2026-09-17", hasSlots: true, slots: [{ time: "4:00 pm" }] },
    { dateLabel: "Vie 18", isoDate: "2026-09-18", hasSlots: false, slots: [] },
    { dateLabel: "Sáb 19", isoDate: "2026-09-19", hasSlots: true, slots: [{ time: "10:00 am" }, { time: "11:00 am" }] },
  ];
  return {
    days,
    studentTimezone: "America/Bogota",
    balanceAfter: 4,
    cancellationPolicySummary:
      "Gratis hasta 24h antes. Entre 24h y 4h tienes una reprogramación gratuita por bolsa.",
  };
}

export default async function AgendarPage() {
  const data = await getAgendarData();

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold">Agendar mi clase</h1>

      <div className="space-y-2 rounded-xl bg-accent-soft px-3 py-3">
        <p className="text-sm text-fg-muted">
          Mientras conectamos la agenda dentro de la app, reserva tu horario directamente en el
          calendario de Nico:
        </p>
        <a
          href={BOOKING_CALENDAR_URL}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ size: "full" }))}
        >
          Agendar en Google Calendar
        </a>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-fg-subtle">
          Vista previa de cómo se verá aquí dentro
        </p>
        <BookingFlow {...data} />
      </div>
    </div>
  );
}
