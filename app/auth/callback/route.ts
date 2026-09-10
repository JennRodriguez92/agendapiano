import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Punto de llegada único para los enlaces que manda Supabase Auth por
 * correo (confirmación de registro, recuperar contraseña, enlace mágico) y
 * para el login con Google: todos traen un `?code=` que hay que canjear por
 * una sesión real antes de mandar al usuario a la pantalla final. Sin esta
 * ruta, el navegador llega con el código en la URL pero sin sesión iniciada.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/inicio";

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
