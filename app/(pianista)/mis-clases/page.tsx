import { MisClasesTabs } from "./tabs";

export const dynamic = "force-dynamic";

/** sección 8.3. TODO: reemplazar por lib/credits/ledger.getStatement + bookings reales. */
async function getMisClasesData() {
  return {
    upcoming: [{ id: "b1", dateLabel: "Jue 11 sep · 4:00 pm" }],
    history: [
      { id: "h1", dateLabel: "4 sep · 4:00 pm", status: "completed" as const, note: "Buen trabajo con el pedal." },
      { id: "h2", dateLabel: "28 ago · 4:00 pm", status: "completed" as const },
      { id: "h3", dateLabel: "21 ago · 4:00 pm", status: "cancelled_by_student" as const },
    ],
    movements: [
      { id: "m1", dateLabel: "3 sep", description: "Usaste 1 clase", amount: -1 },
      { id: "m2", dateLabel: "1 sep", description: "Compraste 8 clases", amount: 8 },
      { id: "m3", dateLabel: "30 ago", description: "Vencieron 2 clases", amount: -2 },
    ],
    totalClassesSinceLabel: "14 clases con Nico desde marzo",
  };
}

export default async function MisClasesPage() {
  const data = await getMisClasesData();

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold">Mis clases</h1>
      <MisClasesTabs {...data} />
    </div>
  );
}
