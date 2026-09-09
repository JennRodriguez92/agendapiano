import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

/** sección 9.7. TODO: reemplazar por agregaciones reales sobre bookings/orders/credit_movements. */
async function getMetricasData() {
  return {
    usageRate: 0.78,
    expiredUnusedCount: 6,
    expiredUnusedValueLabel: "$—",
    renewalRate: 0.52,
    occupancyRate: 0.61,
    noShowRate: 0.04,
    revenueMonthLabel: "$—",
    studentsByLevel: { basic: 8, intermediate: 5, advanced: 2 },
  };
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="font-heading text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-fg-subtle">{hint}</p>}
    </Card>
  );
}

export default async function MetricasPage() {
  const data = await getMetricasData();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-heading text-xl font-semibold">Métricas</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Tasa de uso de créditos" value={`${Math.round(data.usageRate * 100)}%`} hint="Clases tomadas / compradas" />
        <Stat label="Clases vencidas sin usar" value={String(data.expiredUnusedCount)} hint={data.expiredUnusedValueLabel} />
        <Stat label="Renovación a 30 días" value={`${Math.round(data.renewalRate * 100)}%`} />
        <Stat label="Ocupación" value={`${Math.round(data.occupancyRate * 100)}%`} hint="Cupos ofrecidos vs. reservados" />
        <Stat label="No-shows y cancelaciones tardías" value={`${Math.round(data.noShowRate * 100)}%`} />
        <Stat label="Ingresos del mes" value={data.revenueMonthLabel} />
      </div>

      <Card>
        <p className="mb-3 text-sm font-medium text-fg-muted">Alumnos por nivel</p>
        <div className="flex gap-4 text-sm">
          <span>Básico: {data.studentsByLevel.basic}</span>
          <span>Medio: {data.studentsByLevel.intermediate}</span>
          <span>Avanzado: {data.studentsByLevel.advanced}</span>
        </div>
      </Card>
    </div>
  );
}
