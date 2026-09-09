import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/notifications/whatsapp";

export const dynamic = "force-dynamic";

/** Ficha individual (sección 9.2). TODO: reemplazar por consultas reales. */
async function getPianistaDetail(id: string) {
  return {
    id,
    name: "Laura Gómez",
    email: "laura@example.com",
    phone: "+573000000000",
    level: "Básico",
    classesLeft: 5,
    daysLeft: 18,
    statement: [
      { id: "m1", description: "Compraste 8 clases", dateLabel: "1 sep", amount: 8 },
      { id: "m2", description: "Usaste 1 clase", dateLabel: "3 sep", amount: -1 },
    ],
  };
}

export default async function PianistaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPianistaDetail(id);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">{data.name}</h1>
        <p className="text-fg-muted">{data.email}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="font-heading text-2xl font-semibold">{data.classesLeft}</p>
          <p className="text-xs text-fg-muted">clases</p>
        </Card>
        <Card className="text-center">
          <p className="font-heading text-2xl font-semibold">{data.daysLeft}</p>
          <p className="text-xs text-fg-muted">días</p>
        </Card>
        <Card className="text-center">
          <p className="font-heading text-lg font-semibold">{data.level}</p>
          <p className="text-xs text-fg-muted">nivel</p>
        </Card>
      </div>

      <a
        href={buildWhatsAppLink(data.phone, `Hola ${data.name.split(" ")[0]}, soy Nico.`)}
        target="_blank"
        rel="noreferrer"
        className="block w-full rounded-xl bg-success/15 px-4 py-3 text-center font-medium text-success"
      >
        Escribir por WhatsApp
      </a>

      <Card>
        <CardTitle className="mb-3 text-base">Extracto de créditos</CardTitle>
        <div className="space-y-2">
          {data.statement.map((m) => (
            <div key={m.id} className="flex items-center justify-between text-sm">
              <span>{m.description}</span>
              <span className={m.amount > 0 ? "text-success" : "text-fg-muted"}>
                {m.amount > 0 ? "+" : ""}
                {m.amount}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary">Otorgar cortesía</Button>
        <Button variant="secondary">Extender vigencia</Button>
        <Button variant="secondary">Cambiar nivel</Button>
        <Button variant="secondary">Registrar pago manual</Button>
      </div>
    </div>
  );
}
