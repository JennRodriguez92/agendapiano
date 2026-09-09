import { Card, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

/** sección 9.3. TODO: reemplazar por availability_rules / availability_blocks / bookings reales. */
async function getAgendaData() {
  return {
    weeklyRules: [
      { weekday: "Lunes a viernes", range: "2:00 pm – 8:00 pm" },
      { weekday: "Sábados", range: "9:00 am – 1:00 pm" },
    ],
    weekBookings: [
      { id: "b1", dayLabel: "Lun 14", timeLabel: "3:00 pm", studentName: "Laura Gómez" },
      { id: "b2", dayLabel: "Mié 16", timeLabel: "4:00 pm", studentName: "Camilo Ruiz" },
    ],
  };
}

export default async function AgendaPage() {
  const data = await getAgendaData();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-xl font-semibold">Agenda</h1>

      <Card>
        <CardTitle className="mb-3 text-base">Disponibilidad recurrente</CardTitle>
        <div className="space-y-2 text-sm">
          {data.weeklyRules.map((r, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-fg-muted">{r.weekday}</span>
              <span className="font-medium">{r.range}</span>
            </div>
          ))}
        </div>
        <button className="mt-4 text-sm font-medium text-accent">Editar disponibilidad</button>
      </Card>

      <Card>
        <CardTitle className="mb-3 text-base">Esta semana</CardTitle>
        <div className="space-y-2">
          {data.weekBookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between text-sm">
              <span className="text-fg-muted">
                {b.dayLabel} · {b.timeLabel}
              </span>
              <span className="font-medium">{b.studentName}</span>
            </div>
          ))}
        </div>
      </Card>

      <button className="text-sm font-medium text-fg-muted">+ Agregar bloqueo o vacaciones</button>
    </div>
  );
}
