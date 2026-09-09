import { BookingFlow } from "./booking-flow";

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
      <BookingFlow {...data} />
    </div>
  );
}
