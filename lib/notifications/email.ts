import { Resend } from "resend";

/** sección 7: correos transaccionales vía Resend. */

let client: Resend | null = null;
function getClient() {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY no está configurado");
    }
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  attachIcs?: string;
}) {
  return getClient().emails.send({
    from: "Nico — Tu Profe de Piano <hola@tuprofedepiano.com>",
    to: params.to,
    subject: params.subject,
    html: params.html,
    attachments: params.attachIcs
      ? [{ filename: "clase.ics", content: params.attachIcs }]
      : undefined,
  });
}

/** Genera un archivo .ics básico para adjuntar a la confirmación de reserva (sección 5.4). */
export function buildIcs(params: {
  uid: string;
  startsAt: Date;
  endsAt: Date;
  summary: string;
  description?: string;
  meetUrl?: string;
}): string {
  const toIcsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tu Profe de Piano//ES",
    "BEGIN:VEVENT",
    `UID:${params.uid}`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(params.startsAt)}`,
    `DTEND:${toIcsDate(params.endsAt)}`,
    `SUMMARY:${params.summary}`,
    params.description ? `DESCRIPTION:${params.description}` : "",
    params.meetUrl ? `URL:${params.meetUrl}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
