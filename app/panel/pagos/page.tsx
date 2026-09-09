import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

/** sección 9.5. TODO: reemplazar por consultas reales de orders + lib/payments/manual. */
async function getPagosData() {
  return {
    pendingReview: [
      { id: "o1", studentName: "Camilo Ruiz", planName: "Pack 4", receiptUrl: "#" },
    ],
    recent: [
      { id: "o2", studentName: "Laura Gómez", planName: "Pack 8", status: "paid" as const, method: "gateway" as const },
      { id: "o3", studentName: "Ana María", planName: "Clase individual", status: "paid" as const, method: "manual" as const },
    ],
  };
}

export default async function PagosPage() {
  const data = await getPagosData();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-xl font-semibold">Pagos</h1>

      {data.pendingReview.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-fg-muted">Por confirmar</h2>
          {data.pendingReview.map((o) => (
            <Card key={o.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{o.studentName}</p>
                  <p className="text-sm text-fg-muted">{o.planName}</p>
                </div>
                <a href={o.receiptUrl} className="text-sm font-medium text-accent" target="_blank" rel="noreferrer">
                  Ver comprobante
                </a>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1">
                  Rechazar
                </Button>
                <Button size="sm" className="flex-1">
                  Aprobar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-fg-muted">Recientes</h2>
          <button className="text-sm font-medium text-fg-muted">Exportar CSV</button>
        </div>
        {data.recent.map((o) => (
          <Card key={o.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{o.studentName}</p>
              <p className="text-sm text-fg-muted">{o.planName}</p>
            </div>
            <Badge tone="success">{o.method === "manual" ? "Manual" : "Pasarela"}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
