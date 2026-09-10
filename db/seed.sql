-- Datos semilla mínimos (secciones 4.1 y 4.5 de la spec) — versión en SQL
-- puro para pegar directo en el SQL Editor de Supabase, como alternativa a
-- "npm run db:seed" (que hace exactamente lo mismo pero desde tu compu).
-- Precios en 0 porque son [DECIDIR] (sección 17.1) — no se inventan.

insert into plans (name, class_count, price_cents, currency, validity_days, class_duration_minutes, description, sort_order, is_active)
values
  ('Clase individual', 1, 0, 'COP', 30, 60, null, 1, true),
  ('Pack 4', 4, 0, 'COP', 30, 60, '1 por semana', 2, true),
  ('Pack 8', 8, 0, 'COP', 30, 60, '2 por semana', 3, true),
  ('Pack 12', 12, 0, 'COP', 30, 60, '3 por semana', 4, true);

insert into teacher_settings (default_timezone, min_booking_notice_hours, buffer_minutes, max_classes_per_day)
values ('America/Bogota', 12, 15, 6);

insert into rubric_criteria (level_from, label, sort_order, is_active)
values
  ('basic', 'Postura y posición de manos estables', 1, true),
  ('basic', 'Lee notas en clave de sol y clave de fa', 2, true),
  ('basic', 'Toca con las dos manos coordinadas', 3, true),
  ('basic', 'Domina 5 acordes mayores y menores', 4, true),
  ('basic', 'Mantiene un pulso constante con metrónomo', 5, true),
  ('basic', 'Toca una pieza completa de memoria', 6, true),
  ('intermediate', 'Escalas mayores y menores en dos octavas', 1, true),
  ('intermediate', 'Cifrado americano e inversiones aplicadas', 2, true),
  ('intermediate', 'Uso del pedal con criterio', 3, true),
  ('intermediate', 'Lectura a primera vista de una pieza sencilla', 4, true),
  ('intermediate', 'Interpreta con dinámicas y matices propios', 5, true),
  ('intermediate', 'Repertorio de 3 piezas completas montadas', 6, true);
