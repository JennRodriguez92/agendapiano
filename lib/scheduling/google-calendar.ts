/**
 * Integración con Google Calendar (sección 5.4).
 *
 * Solo Nico autoriza vía OAuth 2.0 (alcances: openid, email, profile,
 * calendar.events, calendar.readonly). Su refresh_token se guarda cifrado
 * en `teacher_settings.google_refresh_token_encrypted`. Los alumnos no
 * necesitan cuenta de Google.
 *
 * Este módulo requiere GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET reales y el
 * refresh_token de Nico para funcionar — no se pueden probar en este entorno
 * sin esas credenciales. Las funciones están completas en su forma de
 * integración (llamadas REST directas a la API de Calendar) para que quede
 * listo para conectar en cuanto Nico complete el consentimiento OAuth.
 */

const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

interface GoogleTokens {
  accessToken: string;
  calendarId: string;
}

async function getTeacherTokens(): Promise<GoogleTokens> {
  // TODO: leer teacher_settings, desencriptar el refresh_token y canjearlo
  // por un access_token vigente (POST https://oauth2.googleapis.com/token).
  throw new Error(
    "Google Calendar no está conectado todavía. Nico debe autorizar el acceso desde el panel."
  );
}

export interface CreateEventResult {
  eventId: string;
  meetUrl: string;
}

/** Crea el evento con Meet (`conferenceData` + `conferenceDataVersion=1`) e invita al alumno. */
export async function createCalendarEvent(params: {
  startsAt: Date;
  endsAt: Date;
  studentId: string;
  studentEmail?: string;
}): Promise<CreateEventResult> {
  const { accessToken, calendarId } = await getTeacherTokens();

  const res = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start: { dateTime: params.startsAt.toISOString(), timeZone: "UTC" },
        end: { dateTime: params.endsAt.toISOString(), timeZone: "UTC" },
        attendees: params.studentEmail ? [{ email: params.studentEmail }] : [],
        conferenceData: {
          createRequest: {
            requestId: `${params.studentId}-${params.startsAt.getTime()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Google Calendar API error: ${res.status} ${await res.text()}`);
  }

  const event = await res.json();
  return {
    eventId: event.id,
    meetUrl: event.hangoutLink ?? event.conferenceData?.entryPoints?.[0]?.uri ?? "",
  };
}

/** PATCH del evento existente — conserva el enlace de Meet. */
export async function patchCalendarEvent(
  eventId: string,
  params: { startsAt: Date; endsAt: Date }
): Promise<void> {
  const { accessToken, calendarId } = await getTeacherTokens();

  const res = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}?sendUpdates=all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start: { dateTime: params.startsAt.toISOString(), timeZone: "UTC" },
        end: { dateTime: params.endsAt.toISOString(), timeZone: "UTC" },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Google Calendar API error: ${res.status} ${await res.text()}`);
  }
}

/** DELETE del evento con notificación a los asistentes. */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const { accessToken, calendarId } = await getTeacherTokens();

  const res = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}?sendUpdates=all`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok && res.status !== 410 && res.status !== 404) {
    throw new Error(`Google Calendar API error: ${res.status} ${await res.text()}`);
  }
}

export interface BusyInterval {
  start: Date;
  end: Date;
}

/**
 * `freeBusy` incluyendo explícitamente TODOS los calendarios de Nico
 * (sección 5.2, paso 4) — no solo el principal. Resultado cacheado 60s por
 * quien lo invoca (ver lib/scheduling/availability.ts).
 */
export async function getBusyIntervals(params: {
  timeMin: Date;
  timeMax: Date;
}): Promise<BusyInterval[]> {
  const { accessToken, calendarId } = await getTeacherTokens();
  // TODO: incluir aquí todos los `teacherSettings.googleCalendarIds`, no
  // solo `calendarId`, cuando existan calendarios secundarios conectados.

  const res = await fetch(`${CALENDAR_API_BASE}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: params.timeMin.toISOString(),
      timeMax: params.timeMax.toISOString(),
      items: [{ id: calendarId }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Google Calendar API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const busy = data.calendars?.[calendarId]?.busy ?? [];
  return busy.map((b: { start: string; end: string }) => ({
    start: new Date(b.start),
    end: new Date(b.end),
  }));
}
