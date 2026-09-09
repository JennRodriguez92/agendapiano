import Link from "next/link";
import { Logo } from "@/components/logo";
import { LoginForm } from "./(auth)/login/login-form";

/**
 * Pantalla de entrada (sección 2, Fase 1): el cliente pidió que la primera
 * pantalla SEA el login (correo/contraseña o Google), no una portada con un
 * botón intermedio — con el logo de NicoPiano visible de una vez.
 */
export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo className="text-xl" />
        <p className="text-fg-muted">Soy Nico, tu profe de piano.</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-fg-muted">
        ¿Todavía no tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-accent">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
