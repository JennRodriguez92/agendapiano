import Link from "next/link";
import { Video } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getUrgencyLevel, urgencyColorVar } from "@/lib/ui/urgency";

export const dynamic = "force-dynamic";

/**
 * Pantalla de Inicio — sección 8.1. Es la pantalla que define el producto:
 * un solo número grande (sección 11).
 *
 * TODO: reemplazar este loader por datos reales una vez la sesión de
 * Supabase y la conexión a Postgres estén configuradas (getAvailableBalance,
 * getStatement, próxima reserva). La forma de los datos ya coincide con lo
 * que devolverán lib/credits/ledger y lib/scheduling.
 */
async function getInicioData() {
  return {
    studentName: "Laura",
    classesAvailable: 5,
    daysRemaining: 18,
    expiresAtLabel: "8 de octubre",
    hasActivePlan: true,
    nextClass: {
      dateLabel: "Jue 11 sep · 4:00 pm",
      canJoinNow: false,
    },
    quote: {
      text: "Nadie aprendió a tocar sin equivocarse primero.",
      author: "Nico",
    },
    level: { label: "Básico", achieved: 4, total: 6 },
    totalClassesTaken: 14,
  };
}

export default async function InicioPage() {
  const data = await getInicioData();

  if (!data.hasActivePlan) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-semibold">Hola, {data.studentName} 👋</h1>
        <Card className="space-y-3 text-center">
          <p className="text-fg-muted">
            Todavía no tienes un plan activo. Elige uno y empecemos a tocar.
          </p>
          <Link href="/planes" className={cn(buttonVariants({ size: "full" }))}>
            Ver planes
          </Link>
        </Card>
      </div>
    );
  }

  const urgency = getUrgencyLevel(data.daysRemaining);
  const isUrgent = urgency !== "normal";
  const progressPct = Math.min(100, Math.round((data.daysRemaining / 30) * 100));

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-semibold">Hola, {data.studentName} 👋</h1>

      <Card className="space-y-4 border-2" style={{ borderColor: urgencyColorVar[urgency] }}>
        <div className="text-center">
          <div className="font-heading text-5xl font-bold tabular-nums">
            {data.classesAvailable}
          </div>
          <p className="text-fg-muted">
            {data.classesAvailable === 1 ? "clase disponible" : "clases disponibles"}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-bg-elevated-2">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPct}%`, backgroundColor: urgencyColorVar[urgency] }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-fg-muted">
            <span style={{ color: isUrgent ? urgencyColorVar[urgency] : undefined }}>
              {data.daysRemaining} días
            </span>
            <span>Hasta el {data.expiresAtLabel}</span>
          </div>
        </div>

        {isUrgent && (
          <Link
            href="/agendar"
            className="block rounded-lg px-3 py-2 text-center text-sm font-medium"
            style={{
              backgroundColor: `color-mix(in srgb, ${urgencyColorVar[urgency]} 15%, transparent)`,
              color: urgencyColorVar[urgency],
            }}
          >
            Agenda ya tus clases restantes
          </Link>
        )}
      </Card>

      <Link href="/agendar" className={cn(buttonVariants({ size: "full" }))}>
        Agendar mi clase
      </Link>

      {data.nextClass && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-fg-muted">Tu próxima clase</h2>
          <Card className="space-y-2">
            <p className="font-medium">{data.nextClass.dateLabel}</p>
            {data.nextClass.canJoinNow ? (
              <Link
                href="#"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
              >
                <Video className="size-4" aria-hidden /> Entrar a la clase →
              </Link>
            ) : (
              <Link href="/mis-clases" className="text-sm font-medium text-fg-muted">
                Reprogramar
              </Link>
            )}
          </Card>
        </div>
      )}

      <Card className="space-y-1 bg-bg-elevated-2">
        <p className="text-[15px] italic leading-snug text-fg">“{data.quote.text}”</p>
        <p className="text-sm text-fg-muted">— {data.quote.author}</p>
      </Card>

      <div className="flex items-center justify-between text-sm text-fg-muted">
        <Link href="/mi-progreso" className="font-medium text-fg">
          Nivel: {data.level.label} ▸ {data.level.achieved} de {data.level.total}
        </Link>
        <span>Has tomado {data.totalClassesTaken} clases 🎹</span>
      </div>
    </div>
  );
}
