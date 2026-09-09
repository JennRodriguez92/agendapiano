-- Crea automáticamente la fila de student_profiles (db/schema.ts) y el
-- espejo en la tabla `users` de la app cuando alguien se registra por
-- Supabase Auth (correo/contraseña, Google, o enlace mágico) — sección 2.
--
-- El autoregistro abierto en /registro (ver comentario en esa página) crea
-- el usuario directo en auth.users; este trigger es lo que lo convierte en
-- un "pianista" dentro del dominio de la app sin que el cliente tenga que
-- escribir en esas tablas (evita depender de RLS de escritura ahí).
--
-- Aplicar junto con db/rls.sql contra el proyecto de Supabase.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'student')
  on conflict (id) do nothing;

  insert into public.student_profiles (user_id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
