-- Row Level Security (sección 12, 15): un alumno solo lee/escribe filas
-- donde student_id = auth.uid(). El rol profesor no es accesible desde el
-- cliente del alumno. Las mutaciones sensibles (créditos, órdenes) solo
-- pasan por Server Actions con el rol de servicio — este archivo cubre el
-- acceso de LECTURA del propio alumno a sus datos; nada aquí habilita
-- escritura directa desde el navegador a credit_movements ni a orders.
--
-- Aplicar contra el proyecto de Supabase una vez esté creado
-- (supabase db push, o pegar en el SQL editor).

alter table student_profiles enable row level security;
alter table credit_batches enable row level security;
alter table credit_movements enable row level security;
alter table bookings enable row level security;
alter table lesson_notes enable row level security;
alter table student_rubric enable row level security;
alter table level_history enable row level security;
alter table orders enable row level security;
alter table notifications enable row level security;

create policy "student reads own profile" on student_profiles
  for select using (user_id = auth.uid());

create policy "student updates own profile" on student_profiles
  for update using (user_id = auth.uid());

create policy "student reads own credit batches" on credit_batches
  for select using (student_id = auth.uid());

create policy "student reads own credit movements" on credit_movements
  for select using (student_id = auth.uid());

create policy "student reads own bookings" on bookings
  for select using (student_id = auth.uid());

create policy "student reads own lesson notes" on lesson_notes
  for select using (student_id = auth.uid());

create policy "student reads own rubric" on student_rubric
  for select using (student_id = auth.uid());

create policy "student reads own level history" on level_history
  for select using (student_id = auth.uid());

create policy "student reads own orders" on orders
  for select using (student_id = auth.uid());

create policy "student reads own notifications" on notifications
  for select using (user_id = auth.uid());

-- Nico (role = 'teacher' | 'admin' en la tabla users) accede a todo a
-- través del rol de servicio en el servidor, nunca con el cliente anónimo
-- desde el navegador — por eso no hay políticas de "teacher reads all"
-- aquí: esas consultas usan la service role key, que ignora RLS.
