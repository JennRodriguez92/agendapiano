"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DaySlots {
  dateLabel: string; // "Lun 14"
  isoDate: string;
  hasSlots: boolean;
  slots: { time: string; timeColombia?: string }[];
}

/**
 * Flujo de 3 pasos (sección 8.2): calendario horizontal por semana → horas
 * disponibles → confirmación. Recibe los días con cupos ya calculados por
 * lib/scheduling/availability (server-side); aquí solo se maneja la
 * interacción de selección.
 */
export function BookingFlow({
  days,
  studentTimezone,
  balanceAfter,
  cancellationPolicySummary,
}: {
  days: DaySlots[];
  studentTimezone: string;
  balanceAfter: number;
  cancellationPolicySummary: string;
}) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    () => days.findIndex((d) => d.hasSlots) ?? 0
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [offerRest, setOfferRest] = useState(false);

  const selectedDay = days[selectedDayIndex];
  const showTimezoneHint = studentTimezone !== "America/Bogota";

  const step = useMemo(() => {
    if (confirmed) return 3;
    if (selectedTime) return 2.5;
    return 2;
  }, [confirmed, selectedTime]);

  if (confirmed) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-3xl">
          🎹
        </div>
        <h2 className="font-heading text-xl font-semibold">Clase agendada</h2>
        <p className="text-fg-muted">
          {selectedDay.dateLabel} · {selectedTime}
        </p>

        {!offerRest ? (
          <Card className="space-y-3">
            <p className="text-[15px]">¿Quieres dejar agendadas las clases restantes?</p>
            <p className="text-sm text-fg-muted">
              Mismo día y hora de la semana, un toque para confirmarlas todas.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setOfferRest(true)}>
                Ahora no
              </Button>
              <Button className="flex-1" onClick={() => setOfferRest(true)}>
                Sí, agéndalas
              </Button>
            </div>
          </Card>
        ) : (
          <p className="text-sm text-fg-muted">Puedes verlas en “Mis clases”.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {days.map((day, i) => (
          <button
            key={day.isoDate}
            onClick={() => {
              setSelectedDayIndex(i);
              setSelectedTime(null);
            }}
            disabled={!day.hasSlots}
            className={cn(
              "flex min-w-16 flex-col items-center rounded-xl px-3 py-2.5 text-sm transition-colors",
              i === selectedDayIndex
                ? "bg-accent text-accent-fg"
                : day.hasSlots
                  ? "bg-bg-elevated text-fg hover:bg-bg-elevated-2"
                  : "bg-bg-elevated/40 text-fg-subtle"
            )}
          >
            {day.dateLabel}
          </button>
        ))}
      </div>

      {step === 2 && (
        <div className="space-y-2">
          {selectedDay?.slots.length ? (
            selectedDay.slots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => setSelectedTime(slot.time)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-bg-elevated px-4 py-3 text-left hover:border-border-strong"
              >
                <span className="font-medium">{slot.time}</span>
                {showTimezoneHint && slot.timeColombia && (
                  <span className="text-xs text-fg-subtle">{slot.timeColombia} Colombia</span>
                )}
                <ChevronRight className="size-4 text-fg-subtle" aria-hidden />
              </button>
            ))
          ) : (
            <p className="py-8 text-center text-fg-muted">No hay cupos este día.</p>
          )}
        </div>
      )}

      {step === 2.5 && selectedTime && (
        <Card className="space-y-4">
          <button
            onClick={() => setSelectedTime(null)}
            className="flex items-center gap-1 text-sm text-fg-muted"
          >
            <ChevronLeft className="size-4" aria-hidden /> Elegir otra hora
          </button>
          <div>
            <p className="text-lg font-semibold">
              {selectedDay.dateLabel} · {selectedTime}
            </p>
            <p className="mt-1 text-sm text-fg-muted">
              Se usará 1 crédito. Te quedarán {balanceAfter} después de esta reserva.
            </p>
          </div>
          <p className="text-sm text-fg-muted">{cancellationPolicySummary}</p>
          <Button size="full" onClick={() => setConfirmed(true)}>
            Confirmar clase
          </Button>
        </Card>
      )}
    </div>
  );
}
