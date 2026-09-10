import { Logo } from "@/components/logo";
import { ActualizarContrasenaForm } from "./actualizar-contrasena-form";

/**
 * Página a la que Supabase redirige desde el correo de "olvidé mi
 * contraseña" (y desde el de confirmación de correo). Supabase deja al
 * usuario con una sesión temporal válida solo para cambiar su contraseña.
 */
export default function ActualizarContrasenaPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo className="text-xl" />
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold">Crea tu nueva contraseña</h1>
        </div>
      </div>

      <ActualizarContrasenaForm />
    </div>
  );
}
