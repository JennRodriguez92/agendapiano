import Link from "next/link";
import { Logo } from "@/components/logo";
import { RegistroForm } from "./registro-form";

/**
 * Registro (sección 2). La spec original pide invitación de Nico
 * (ver /invitacion, que valida un token); mientras se prueba la plataforma
 * en las primeras revisiones, el cliente pidió que cualquiera pueda crear
 * su cuenta directamente desde el login — por eso este flujo es de
 * autoregistro abierto. Antes de producción hay que decidir si se cierra
 * detrás de invitación otra vez o se deja abierto.
 */
export default function RegistroPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo className="text-xl" />
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold">Bienvenido, pianista 🎹</h1>
          <p className="text-fg-muted">Crea tu cuenta para empezar.</p>
        </div>
      </div>

      <RegistroForm />

      <p className="text-center text-sm text-fg-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/" className="font-medium text-accent">
          Entra aquí
        </Link>
      </p>
    </div>
  );
}
