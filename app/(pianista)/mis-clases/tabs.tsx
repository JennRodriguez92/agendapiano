"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UpcomingBooking {
  id: string;
  dateLabel: string;
  meetUrl?: string;
}

interface HistoryItem {
  id: string;
  dateLabel: string;
  status: "completed" | "cancelled_by_student" | "cancelled_by_teacher" | "no_show";
  note?: string;
}

interface Movement {
  id: string;
  dateLabel: string;
  description: string;
  amount: number;
}

const statusLabels: Record<HistoryItem["status"], { label: string; tone: "success" | "neutral" | "critical" }> = {
  completed: { label: "Tomada", tone: "success" },
  cancelled_by_student: { label: "Cancelada", tone: "neutral" },
  cancelled_by_teacher: { label: "Cancelada por Nico", tone: "neutral" },
  no_show: { label: "No asistió", tone: "critical" },
};

const tabs = ["Próximas", "Historial", "Movimientos"] as const;

export function MisClasesTabs({
  upcoming,
  history,
  movements,
  totalClassesSinceLabel,
}: {
  upcoming: UpcomingBooking[];
  history: HistoryItem[];
  movements: Movement[];
  totalClassesSinceLabel: string;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Próximas");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-xl bg-bg-elevated p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
              tab === t ? "bg-accent text-accent-fg" : "text-fg-muted"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Próximas" && (
        <div className="space-y-2">
          {upcoming.length === 0 && (
            <p className="py-8 text-center text-fg-muted">No tienes clases agendadas todavía.</p>
          )}
          {upcoming.map((b) => (
            <Card key={b.id} className="flex items-center justify-between">
              <span className="font-medium">{b.dateLabel}</span>
              <div className="flex gap-3 text-sm">
                <button className="text-fg-muted">Reprogramar</button>
                <button className="text-danger">Cancelar</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "Historial" && (
        <div className="space-y-3">
          <p className="text-sm text-fg-muted">{totalClassesSinceLabel}</p>
          <div className="space-y-2">
            {history.map((h) => (
              <Card key={h.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{h.dateLabel}</span>
                  <Badge tone={statusLabels[h.status].tone}>{statusLabels[h.status].label}</Badge>
                </div>
                {h.note && <p className="text-sm text-fg-muted">{h.note}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "Movimientos" && (
        <div className="space-y-2">
          {movements.map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b border-border py-2.5">
              <div>
                <p className="text-[15px]">{m.description}</p>
                <p className="text-xs text-fg-subtle">{m.dateLabel}</p>
              </div>
              <span
                className={cn(
                  "font-heading font-semibold tabular-nums",
                  m.amount > 0 ? "text-success" : "text-fg-muted"
                )}
              >
                {m.amount > 0 ? "+" : ""}
                {m.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
