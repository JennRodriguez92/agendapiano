import Link from "next/link";
import { LoginForm } from "./login-form";

/** sección 2 Fase 1: ingreso con correo y contraseña + enlace mágico. */
export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-2xl font-semibold">Bienvenido de nuevo</h1>
        <p className="text-fg-muted">Entra a tu cuenta de Tu Profe de Piano.</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-fg-muted">
        ¿Nico te invitó?{" "}
        <Link href="/invitacion" className="font-medium text-accent">
          Crea tu cuenta
        </Link>
      </p>
    </div>
  );
}
