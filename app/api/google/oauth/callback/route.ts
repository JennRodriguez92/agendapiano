import { NextRequest, NextResponse } from "next/server";

/**
 * sección 5.4: callback del consentimiento OAuth de Nico (solo él autoriza,
 * una vez). Alcances: openid, email, profile, calendar.events, calendar.readonly.
 *
 * TODO:
 *  1. Intercambiar `code` por tokens en https://oauth2.googleapis.com/token
 *     usando GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI.
 *  2. Cifrar el refresh_token (ENCRYPTION_KEY) y guardarlo en
 *     teacher_settings.google_refresh_token_encrypted.
 *  3. Redirigir al panel con una confirmación de conexión exitosa.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Falta el parámetro code" }, { status: 400 });
  }

  return NextResponse.json(
    { error: "Integración pendiente: intercambio de tokens de Google no implementado todavía" },
    { status: 501 }
  );
}
