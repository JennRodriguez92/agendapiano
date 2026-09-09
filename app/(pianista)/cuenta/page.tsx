import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

/** sección 8.6. TODO: leer/editar student_profiles real vía Server Action. */
async function getCuentaData() {
  return {
    fullName: "Laura Gómez",
    email: "laura@example.com",
    phone: "+57 300 000 0000",
    timezone: "America/Bogota",
    whatsappOptIn: true,
  };
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-fg-muted">{label}</span>
      <span className="text-[15px] font-medium">{value}</span>
    </div>
  );
}

export default async function CuentaPage() {
  const data = await getCuentaData();

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold">Cuenta</h1>

      <Card className="divide-y divide-border">
        <Field label="Nombre" value={data.fullName} />
        <Field label="Correo" value={data.email} />
        <Field label="WhatsApp" value={data.phone} />
        <Field label="Zona horaria" value={data.timezone} />
        <Field label="Recordatorios por WhatsApp" value={data.whatsappOptIn ? "Activados" : "Desactivados"} />
      </Card>

      <button className="w-full text-center text-sm text-fg-muted">Cambiar contraseña</button>
    </div>
  );
}
