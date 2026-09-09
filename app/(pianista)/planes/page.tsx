import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * sección 8.5. [DECIDIR] sección 17.1: precios y nombres comerciales
 * definitivos. Se muestran los 4 planes base de la sección 4.1 con precios
 * de ejemplo — deben reemplazarse por lib/payments/plans reales antes de
 * salir a producción.
 */
async function getPlanesData() {
  return {
    recommendedPlanId: "pack-8",
    plans: [
      { id: "clase-individual", name: "Clase individual", classCount: 1, priceLabel: "$—", validityDays: 30, pace: null },
      { id: "pack-4", name: "Pack 4", classCount: 4, priceLabel: "$—", validityDays: 30, pace: "1 por semana" },
      { id: "pack-8", name: "Pack 8", classCount: 8, priceLabel: "$—", validityDays: 30, pace: "2 por semana" },
      { id: "pack-12", name: "Pack 12", classCount: 12, priceLabel: "$—", validityDays: 30, pace: "3 por semana" },
    ],
  };
}

export default async function PlanesPage() {
  const data = await getPlanesData();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold">Planes</h1>
        <p className="text-fg-muted">Elige tu ritmo. Todas las clases vencen a los 30 días.</p>
      </div>

      <div className="space-y-3">
        {data.plans.map((plan) => (
          <Card key={plan.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.id === data.recommendedPlanId && <Badge tone="accent">Recomendado</Badge>}
                </div>
                <p className="text-sm text-fg-muted">
                  {plan.classCount} {plan.classCount === 1 ? "clase" : "clases"} · vence en {plan.validityDays} días
                </p>
              </div>
              <span className="font-heading text-lg font-semibold">{plan.priceLabel}</span>
            </div>

            {plan.pace && (
              <p className="rounded-lg bg-bg-elevated-2 px-3 py-2 text-sm text-fg-muted">
                Son {plan.pace} durante un mes. ¿Tienes ese espacio?
              </p>
            )}

            <button className={cn(buttonVariants({ size: "full" }))}>Comprar</button>
          </Card>
        ))}
      </div>
    </div>
  );
}
