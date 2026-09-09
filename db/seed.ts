import { db } from "./index";
import { plans, teacherSettings, rubricCriteria } from "./schema";

/**
 * Datos semilla mínimos para desarrollo local (sección 4.1 y 4.5).
 * Precios en $— porque son [DECIDIR] (sección 17.1) — NO se inventan.
 * Ejecutar con: npm run db:seed
 */
async function seed() {
  console.log("Sembrando planes...");
  await db.insert(plans).values([
    {
      name: "Clase individual",
      classCount: 1,
      priceCents: 0, // [DECIDIR] precio real pendiente
      validityDays: 30,
      classDurationMinutes: 60,
      sortOrder: 1,
    },
    {
      name: "Pack 4",
      classCount: 4,
      priceCents: 0,
      validityDays: 30,
      classDurationMinutes: 60,
      description: "1 por semana",
      sortOrder: 2,
    },
    {
      name: "Pack 8",
      classCount: 8,
      priceCents: 0,
      validityDays: 30,
      classDurationMinutes: 60,
      description: "2 por semana",
      sortOrder: 3,
    },
    {
      name: "Pack 12",
      classCount: 12,
      priceCents: 0,
      validityDays: 30,
      classDurationMinutes: 60,
      description: "3 por semana",
      sortOrder: 4,
    },
  ]);

  console.log("Sembrando configuración de Nico...");
  await db.insert(teacherSettings).values({
    defaultTimezone: "America/Bogota",
    minBookingNoticeHours: 12,
    bufferMinutes: 15,
    maxClassesPerDay: 6,
  });

  console.log("Sembrando rúbrica de niveles (sección 4.5, editable por Nico)...");
  await db.insert(rubricCriteria).values([
    { levelFrom: "basic", label: "Postura y posición de manos estables", sortOrder: 1 },
    { levelFrom: "basic", label: "Lee notas en clave de sol y clave de fa", sortOrder: 2 },
    { levelFrom: "basic", label: "Toca con las dos manos coordinadas", sortOrder: 3 },
    { levelFrom: "basic", label: "Domina 5 acordes mayores y menores", sortOrder: 4 },
    { levelFrom: "basic", label: "Mantiene un pulso constante con metrónomo", sortOrder: 5 },
    { levelFrom: "basic", label: "Toca una pieza completa de memoria", sortOrder: 6 },
    { levelFrom: "intermediate", label: "Escalas mayores y menores en dos octavas", sortOrder: 1 },
    { levelFrom: "intermediate", label: "Cifrado americano e inversiones aplicadas", sortOrder: 2 },
    { levelFrom: "intermediate", label: "Uso del pedal con criterio", sortOrder: 3 },
    { levelFrom: "intermediate", label: "Lectura a primera vista de una pieza sencilla", sortOrder: 4 },
    { levelFrom: "intermediate", label: "Interpreta con dinámicas y matices propios", sortOrder: 5 },
    { levelFrom: "intermediate", label: "Repertorio de 3 piezas completas montadas", sortOrder: 6 },
  ]);

  console.log("Listo.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
