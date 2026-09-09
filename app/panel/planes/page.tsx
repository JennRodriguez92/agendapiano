import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

/** sección 9.4. TODO: CRUD real contra la tabla plans (RN-01, RN-02). */
async function getPlanesAdminData() {
  return {
    plans: [
      { id: "clase-individual", name: "Clase individual", classCount: 1, priceLabel: "$—", validityDays: 30, isActive: true },
      { id: "pack-4", name: "Pack 4", classCount: 4, priceLabel: "$—", validityDays: 30, isActive: true },
      { id: "pack-8", name: "Pack 8", classCount: 8, priceLabel: "$—", validityDays: 30, isActive: true },
      { id: "pack-12", name: "Pack 12", classCount: 12, priceLabel: "$—", validityDays: 30, isActive: true },
    ],
    manualPaymentDetails: {
      nequiNumber: "300 000 0000",
      bankAccount: "—",
      accountHolder: "Nico",
    },
  };
}

export default async function PlanesAdminPage() {
  const data = await getPlanesAdminData();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold">Planes y precios</h1>
        <button className="text-sm font-medium text-accent">+ Nuevo plan</button>
      </div>

      <div className="space-y-2">
        {data.plans.map((plan) => (
          <Card key={plan.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{plan.name}</p>
              <p className="text-sm text-fg-muted">
                {plan.classCount} clases · {plan.validityDays} días · {plan.priceLabel}
              </p>
            </div>
            <Badge tone={plan.isActive ? "success" : "neutral"}>
              {plan.isActive ? "Activo" : "Inactivo"}
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <p className="mb-2 text-sm font-medium text-fg-muted">Datos de pago manual</p>
        <div className="space-y-1 text-sm">
          <p>Nequi: {data.manualPaymentDetails.nequiNumber}</p>
          <p>Cuenta: {data.manualPaymentDetails.bankAccount}</p>
          <p>Titular: {data.manualPaymentDetails.accountHolder}</p>
        </div>
      </Card>
    </div>
  );
}
