import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** sección 8.4. TODO: reemplazar por lib/levels/rubric.getRubricProgress. */
async function getProgresoData() {
  return {
    levelLabel: "Básico",
    criteria: [
      { id: "1", label: "Postura y posición de manos estables", achieved: true },
      { id: "2", label: "Lee notas en clave de sol y clave de fa", achieved: true },
      { id: "3", label: "Toca con las dos manos coordinadas", achieved: true },
      { id: "4", label: "Domina 5 acordes mayores y menores", achieved: true },
      { id: "5", label: "Mantiene un pulso constante con metrónomo", achieved: false },
      { id: "6", label: "Toca una pieza completa de memoria", achieved: false },
    ],
  };
}

export default async function MiProgresoPage() {
  const data = await getProgresoData();
  const achievedCount = data.criteria.filter((c) => c.achieved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Mi progreso</h1>
        <p className="text-fg-muted">
          Nivel {data.levelLabel} · {achievedCount} de {data.criteria.length} criterios
        </p>
      </div>

      <Card className="space-y-1 divide-y divide-border">
        {data.criteria.map((c) => (
          <div key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full",
                c.achieved ? "bg-success/20 text-success" : "bg-bg-elevated-2 text-fg-subtle"
              )}
            >
              {c.achieved && <Check className="size-4" aria-hidden />}
            </span>
            <span className={cn("text-[15px]", !c.achieved && "text-fg-muted")}>{c.label}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
