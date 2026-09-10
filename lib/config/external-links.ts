/**
 * Enlaces externos indicados por el cliente por fuera de la spec (sept. 2026):
 *
 *  - Pago: se decidió NO cobrar dentro de la app. En vez de un checkout,
 *    el pianista escribe a Nico por WhatsApp para comprar su siguiente pack
 *    (ver /planes y NICO_WHATSAPP_NUMBER más abajo).
 *  - Agenda: mientras se conecta la integración OAuth de Google Calendar
 *    (sección 5.4), se usa la página pública de reservas de "Appointment
 *    schedules" del propio calendario de Nico.
 *
 * Configurables por variable de entorno para no tocar el resto de la app
 * cuando cambien.
 */

export const BOOKING_CALENDAR_URL =
  process.env.NEXT_PUBLIC_BOOKING_CALENDAR_URL ??
  "https://calendar.app.google/Zb5ur2E5cyxDY7wL6";

/**
 * Número de WhatsApp de Nico, en formato internacional sin espacios ni "+"
 * — confirmado por el cliente. Los botones de WhatsApp de la app (ver
 * /planes, /cuenta y lib/notifications/whatsapp.ts) se deshabilitan solo si
 * esto llegara a quedar vacío, para no abrir nunca un chat sin destinatario.
 */
export const NICO_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_NICO_WHATSAPP_NUMBER ?? "573202193726";
