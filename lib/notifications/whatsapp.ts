/**
 * sección 7: en Fase 1, sin Cloud API automática todavía, el panel de Nico
 * genera el mensaje prellenado con un botón que abre wa.me. Fase 2 conecta
 * WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN para el envío automático.
 */

export function buildWhatsAppLink(phone: string, message: string): string {
  const digitsOnly = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

export const whatsappTemplates = {
  validityReminder15: (name: string, classesLeft: number) =>
    `Hola ${name}, soy Nico. Te quedan ${classesLeft} clases y 15 días de vigencia en tu plan. ¿Agendamos?`,
  validityReminder7: (name: string, classesLeft: number, nearestSlot: string) =>
    `Hola ${name}, te quedan ${classesLeft} clases y 7 días. Tengo cupo el ${nearestSlot}, ¿te lo aparto?`,
  validityReminder3: (name: string, classesLeft: number, nearestSlot: string) =>
    `${name}, te quedan solo 3 días y ${classesLeft} clases sin usar. El horario más cercano es ${nearestSlot}. ¡Agendemos ya!`,
  validityExpired: (name: string) =>
    `Hola ${name}, tu plan venció. Cuando quieras retomar, aquí estoy para ayudarte a elegir el pack que más te sirva.`,
  bookingConfirmed: (name: string, dateLabel: string, meetUrl: string) =>
    `${name}, quedó agendada tu clase para ${dateLabel}. Enlace de Meet: ${meetUrl}`,
  classCancelledByTeacher: (name: string, rescheduleUrl: string) =>
    `${name}, tuve que cancelar tu clase. Se te devolvió el crédito y tu vencimiento se extendió. Reagenda aquí: ${rescheduleUrl}`,
} as const;
