import { NextRequest, NextResponse } from "next/server";

/** Protege los endpoints de /api/cron/* (sección 13, 16). */
export function requireCronSecret(req: NextRequest): NextResponse | null {
  const provided = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || provided !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}
