import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

/** sección 9.2. TODO: reemplazar por consulta real de student_profiles + saldo/vigencia. */
async function getPianistasData() {
  return [
    { id: "s1", name: "Laura Gómez", level: "Básico", classesLeft: 5, daysLeft: 18, status: "active" as const },
    { id: "s2", name: "Camilo Ruiz", level: "Medio", classesLeft: 1, daysLeft: 3, status: "active" as const },
    { id: "s3", name: "Ana María", level: "Avanzado", classesLeft: 0, daysLeft: 0, status: "expired" as const },
  ];
}

const statusTone = { active: "success", expired: "critical", inactive: "neutral" } as const;
const statusLabel = { active: "Activo", expired: "Vencido", inactive: "Inactivo" } as const;

export default async function PianistasPage() {
  const pianistas = await getPianistasData();

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-heading text-xl font-semibold">Pianistas</h1>

      <div className="space-y-2">
        {pianistas.map((p) => (
          <Link key={p.id} href={`/panel/pianistas/${p.id}`}>
            <Card className="flex items-center justify-between">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-fg-muted">
                  {p.level} · {p.classesLeft} clases · {p.daysLeft} días
                </p>
              </div>
              <Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
