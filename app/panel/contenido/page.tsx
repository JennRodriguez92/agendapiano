import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

/** sección 9.6. TODO: CRUD real contra la tabla quotes. */
async function getContenidoData() {
  return {
    quotes: [
      { id: "q1", text: "Bienvenido, pianista. Aquí no importa qué tan rápido avances, importa que no te detengas.", contextTag: "bienvenida" },
      { id: "q2", text: "Te quedan 3 clases y 5 días. Agendémoslas ya y cerramos el mes tocando.", contextTag: "plan_por_vencer" },
      { id: "q3", text: "El piano no se resiente, te está esperando igual. Volvamos.", contextTag: "retorno_tras_ausencia" },
    ],
  };
}

export default async function ContenidoPage() {
  const data = await getContenidoData();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold">Contenido</h1>
        <button className="text-sm font-medium text-accent">+ Nueva frase</button>
      </div>

      <div className="space-y-2">
        {data.quotes.map((q) => (
          <Card key={q.id} className="space-y-2">
            <p className="text-[15px] italic">“{q.text}”</p>
            <Badge tone="neutral">{q.contextTag}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
