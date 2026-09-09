import Link from "next/link";
import { Video, AlertTriangle } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloseClassButton } from "./close-class-button";

export const dynamic = "force-dynamic";

/** sección 9.1. TODO: reemplazar por consultas reales de bookings/orders/teacherSettings. */
async function getHoyData() {
  return {
    todayClasses: [
      { id: "b1", studentName: "Laura Gómez", timeLabel: "4:00 pm", meetUrl: "#" },
      { id: "b2", studentName: "Camilo Ruiz", timeLabel: "5:00 pm", meetUrl: "#" },
    ],
    toClose: [{ id: "b0", studentName: "Ana María", timeLabel: "2:00 pm" }],
    manualPaymentsPending: 2,
    planExpiringCount: 3,
    googleTokenHealthy: true,
  };
}

export default async function HoyPage() {
  const data = await getHoyData();

  return (
    <div className="max-w-md space-y-6">
      <h1 className="font-heading text-xl font-semibold">Hoy</h1>

      {!data.googleTokenHealthy && (
        <div className="flex items-center gap-2 rounded-xl bg-danger/15 px-4 py-3 text-sm text-danger">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          Google Calendar está desconectado. No se pueden crear reservas nuevas hasta reconectar.
        </div>
      )}

      {data.toClose.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-fg-muted">Clases por cerrar</h2>
          {data.toClose.map((c) => (
            <Card key={c.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{c.studentName}</p>
                <p className="text-sm text-fg-muted">{c.timeLabel}</p>
              </div>
              <CloseClassButton bookingId={c.id} />
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-fg-muted">Agenda de hoy</h2>
        {data.todayClasses.map((c) => (
          <Card key={c.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{c.studentName}</p>
              <p className="text-sm text-fg-muted">{c.timeLabel}</p>
            </div>
            <Link href={c.meetUrl} className="flex items-center gap-1.5 text-sm font-medium text-accent">
              <Video className="size-4" aria-hidden /> Meet
            </Link>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle className="mb-3 text-base">Avisos</CardTitle>
        <div className="space-y-2 text-sm">
          <Link href="/panel/pagos" className="flex items-center justify-between">
            <span className="text-fg-muted">Pagos manuales por confirmar</span>
            <Badge tone={data.manualPaymentsPending ? "warning" : "neutral"}>
              {data.manualPaymentsPending}
            </Badge>
          </Link>
          <Link href="/panel/pianistas" className="flex items-center justify-between">
            <span className="text-fg-muted">Alumnos con plan por vencer</span>
            <Badge tone={data.planExpiringCount ? "warning" : "neutral"}>
              {data.planExpiringCount}
            </Badge>
          </Link>
        </div>
      </Card>
    </div>
  );
}
