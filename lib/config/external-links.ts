/**
 * Enlaces externos temporales para las primeras revisiones (indicados por
 * el cliente por fuera de la spec, sept. 2026):
 *
 *  - Pago: el método real será PayPal [DECIDIR: integración PayPal —
 *    reemplaza a Wompi/ePayco de la sección 6/17.7 de la spec, pendiente
 *    de confirmar con el cliente]. Mientras tanto se usa un link de pago
 *    de Hotmart para poder revisar el flujo de compra.
 *  - Agenda: mientras se conecta la integración OAuth de Google Calendar
 *    (sección 5.4), se usa la página pública de reservas de "Appointment
 *    schedules" del propio calendario de Nico.
 *
 * Ambos son temporales — se reemplazan por la integración real (checkout
 * embebido + lib/scheduling/google-calendar) sin tocar el resto de la app,
 * por eso viven en un solo lugar y son configurables por variable de entorno.
 */

export const CHECKOUT_URL =
  process.env.NEXT_PUBLIC_CHECKOUT_URL ??
  "https://pay.hotmart.com/G102552224C?off=av8moxhy&checkoutMode=10";

export const BOOKING_CALENDAR_URL =
  process.env.NEXT_PUBLIC_BOOKING_CALENDAR_URL ??
  "https://calendar.app.google/Zb5ur2E5cyxDY7wL6";
