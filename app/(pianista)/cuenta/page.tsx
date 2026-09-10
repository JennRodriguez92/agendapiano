import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NICO_WHATSAPP_NUMBER } from "@/lib/config/external-links";
import { buildWhatsAppLink, whatsappTemplates } from "@/lib/notifications/whatsapp";

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

      {NICO_WHATSAPP_NUMBER && (
        <a
          href={buildWhatsAppLink(NICO_WHATSAPP_NUMBER, whatsappTemplates.generalQuestion(data.fullName.split(" ")[0]))}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ size: "full", variant: "secondary" }), "gap-2")}
        >
          <MessageCircle className="size-4" aria-hidden />
          Escribirle a Nico
        </a>
      )}

      <Link href="/recuperar" className="block w-full text-center text-sm text-fg-muted">
        Cambiar contraseña
      </Link>
    </div>
  );
}
