import Link from "next/link";
import { Logo } from "@/components/logo";
import { RecuperarForm } from "./recuperar-form";

/** "Olvidé mi contraseña" — sección 15, requerido por el cliente en la revisión de sept. 2026. */
export default function RecuperarPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo className="text-xl" />
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold">Recupera tu contraseña</h1>
          <p className="text-fg-muted">Te enviamos un enlace para crear una nueva.</p>
        </div>
      </div>

      <RecuperarForm />

      <p className="text-center text-sm text-fg-muted">
        <Link href="/" className="font-medium text-accent">
          Volver a entrar
        </Link>
      </p>
    </div>
  );
}
