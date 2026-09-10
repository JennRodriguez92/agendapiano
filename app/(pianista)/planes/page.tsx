import { MessageCircle } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NICO_WHATSAPP_NUMBER } from "@/lib/config/external-links";
import { buildWhatsAppLink, whatsappTemplates } from "@/lib/notifications/whatsapp";

export const dynamic = "force-dynamic";

/**
 * sección 8.5, ajustada a pedido del cliente (sept. 2026): no se paga dentro
 * de la app — el pianista escribe a Nico por WhatsApp para comprar su
 * siguiente pack. [DECIDIR] sección 17.1: precios y nombres comerciales
 * definitivos. TODO: reemplazar por lib/payments/plans reales.
 */
async function getPlanesData() {
  return {
    studentFirstName: "Laura",
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
  const hasWhatsAppNumber = NICO_WHATSAPP_NUMBER.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-semibold">Planes</h1>
        <p className="text-fg-muted">Elige tu ritmo. Todas las clases vencen a los 30 días.</p>
      </div>

      <p className="rounded-xl bg-accent-soft px-3 py-2.5 text-sm text-fg-muted">
        Para comprar, escríbele a Nico por WhatsApp — él te confirma el pago y activa tus
        clases.
      </p>

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

            {hasWhatsAppNumber ? (
              <a
                href={buildWhatsAppLink(
                  NICO_WHATSAPP_NUMBER,
                  whatsappTemplates.wantsToBuyPlan(data.studentFirstName, plan.name)
                )}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ size: "full" }), "gap-2")}
              >
                <MessageCircle className="size-4" aria-hidden />
                Comprar por WhatsApp
              </a>
            ) : (
              <button
                type="button"
                disabled
                title="Falta configurar el número de WhatsApp de Nico"
                className={cn(buttonVariants({ size: "full", variant: "secondary" }))}
              >
                Comprar por WhatsApp
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
