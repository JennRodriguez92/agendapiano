/**
 * Registro por invitación de Nico (sección 2, Fase 1).
 * TODO: validar el token de invitación (enviado por correo al alumno) contra
 * una tabla de invitaciones antes de permitir crear la cuenta de Supabase
 * Auth y su student_profile.
 */
export default function InvitacionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return <InvitacionForm searchParams={searchParams} />;
}

async function InvitacionForm({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-fg-muted">
          Este enlace de invitación no es válido. Pídele a Nico que te envíe uno nuevo.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-6">
      <div className="space-y-1 text-center">
        <h1 className="font-heading text-2xl font-semibold">Bienvenido, pianista 🎹</h1>
        <p className="text-fg-muted">Crea tu contraseña para empezar.</p>
      </div>
      {/* TODO: formulario de creación de contraseña + student_profile, ligado al token */}
    </div>
  );
}
