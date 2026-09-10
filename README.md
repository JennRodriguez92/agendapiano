# Tu Profe de Piano — plataforma de estudiantes

Next.js 15 (App Router) + TypeScript + Tailwind + Drizzle/PostgreSQL (Supabase), siguiendo
la especificación del documento maestro (`spec/` o el documento entregado por el cliente).
Este README documenta lo que ya está construido, cómo levantarlo, y qué falta por decidir
o conectar antes de producción.

## Estado de este scaffold

**Construido y probado (sin infraestructura externa):**
- Esquema completo de base de datos (`db/schema.ts`, sección 12 de la spec).
- Motor de créditos (`lib/credits`): FIFO por vencimiento, cálculo de vencimiento a 30 días
  en hora Colombia, saldo disponible — con pruebas unitarias (`npm test`).
- Motor de agenda (`lib/scheduling`): ventanas de reserva/cancelación/reprogramación,
  detección de solapamiento — con pruebas unitarias.
- Sistema de diseño mobile-first (fondo azul oscuro/negro, texto blanco/azul claro, un
  único acento saturado para la acción primaria) en `app/globals.css` y `components/ui`.
- Las 6 pantallas del pianista (sección 8) y las 7 del panel de Nico (sección 9), como
  Server Components con datos de ejemplo — ver "Qué falta conectar" abajo.
- Rutas de cron (`app/api/cron/*`) y el webhook de Wompi (`app/api/webhooks/wompi`),
  protegidas por `CRON_SECRET` / firma del webhook (Wompi queda de referencia, ver
  decisión #7 más abajo: ya no se cobra dentro de la app).
- `/agendar` muestra como opción principal el link público de reservas del Google Calendar
  de Nico (`lib/config/external-links.ts`) mientras se conecta la integración OAuth real.
- `/` es ahora la pantalla de entrada (antes había una portada intermedia con un botón
  "Entrar"): muestra el wordmark de NicoPiano, login con correo/contraseña, enlace mágico
  o "Entrar con Google", "¿Olvidaste tu contraseña?" (`/recuperar` → `/actualizar-contrasena`)
  y el link a `/registro`. `/login` quedó como redirect a `/` por si algo lo enlaza.
  `/registro` es autoregistro abierto (correo, contraseña, nombre) — más simple que el flujo
  de invitación con token de `/invitacion` que pedía la spec original, a pedido del cliente
  para las primeras pruebas. `db/triggers.sql` crea automáticamente la fila de
  `student_profiles` cuando alguien se registra (por correo o Google), vía un trigger sobre
  `auth.users` — aplícalo junto con `db/rls.sql`.
- **Sin pagos dentro de la app** (decisión del cliente, ver #7 abajo): en `/planes` y
  `/cuenta` el botón de comprar o de preguntar algo abre WhatsApp con un mensaje prellenado
  hacia el número de Nico (`lib/notifications/whatsapp.ts` + `NEXT_PUBLIC_NICO_WHATSAPP_NUMBER`
  en `lib/config/external-links.ts`). Si ese número no está configurado, el botón se
  deshabilita en vez de abrir un chat sin destinatario.

**Qué falta conectar (requiere credenciales reales, no se puede probar en este entorno):**
- Proyecto de Supabase real y correr `npm run db:generate` + `npm run db:migrate` +
  `npm run db:seed`, y aplicar `db/rls.sql` + `db/triggers.sql`. **Importante:** esta sesión
  de Claude Code corre en una sandbox con salida de red restringida — no puede conectarse a
  `*.supabase.co` aunque tenga las credenciales (lo confirmamos intentándolo: el proxy de
  salida lo rechaza). Esto hay que correrlo desde tu computador o desde un entorno con acceso
  de red completo — ver "Conectar Supabase de verdad" abajo.
- Autorización OAuth de Nico con Google Calendar (`lib/scheduling/google-calendar.ts` está
  completo en su forma de integración pero lanza un error explícito hasta que exista un
  `refresh_token` guardado).
- Resend (para los correos) y el número de WhatsApp de Nico (ver arriba).
- El proveedor Google en Supabase Auth (Authentication → Providers → Google, con el
  Client ID/Secret de Google Cloud) para que "Entrar con Google" funcione — el botón ya
  llama a `supabase.auth.signInWithOAuth`, solo falta activar el proveedor en el proyecto.
- Las páginas usan datos de ejemplo (`TODO` en cada archivo) en vez de consultas reales:
  la lógica de negocio que sí queda conectada a la base de datos vive en `/lib`, las
  pantallas solo necesitan que se les pase el resultado de esas funciones.

## Conectar Supabase de verdad

Ya tenemos el proyecto (`euwkyphzakcfimbxpmys`) y sus claves — faltan dos cosas que solo tú
puedes darme porque yo no puedo llegar hasta Supabase desde aquí:

1. **La contraseña real de la base de datos.** El connection string que compartiste todavía
   tiene el texto `[YOUR-PASSWORD]` sin reemplazar — eso es un molde, no la contraseña. Se
   consigue (o se resetea si no la recuerdas) en Supabase → tu proyecto → **Project Settings
   → Database → Database password**.
2. **Correrlo desde un lugar con acceso a internet normal** — tu computador, por ejemplo:

```bash
git clone https://github.com/JennRodriguez92/agendapiano.git
cd agendapiano
git checkout claude/tu-profe-piano-platform-aprcmb
npm install
cp .env.example .env.local
# abre .env.local y pega ahí: DATABASE_URL (con la contraseña real),
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Esto también te sirve como el preview local que buscabas: abre `http://localhost:3000`.

## Decisiones pendientes del cliente — sección 17 de la spec

**No se inventaron.** Se usaron los valores por defecto que la propia spec indica asumir,
marcados `[DECIDIR]` en el código para ubicarlos fácilmente:

1. Precios y nombres comerciales definitivos de los 4 planes (`db/seed.ts` los deja en $0).
2. Duración de la clase — se asumió 60 minutos (`DEFAULT_CLASS_DURATION_MINUTES`).
3. `PLAN_START_MODE` — se implementó `PAYMENT` (regla actual de Nico); `FIRST_CLASS` no
   está implementado.
4. Anticipación mínima para reservar — se asumieron 12 horas (`MIN_BOOKING_NOTICE_HOURS`).
5. Cuenta de Google de Nico (Workspace o Gmail) y qué calendarios usa hoy.
6. Alumnos fuera de Colombia / cobro en dólares.
7. **Resuelto por el cliente:** no se paga dentro de la app. El pianista escribe a Nico por
   WhatsApp para comprar su siguiente pack (botón en `/planes` y `/cuenta`) y Nico cierra el
   pago por fuera (antes se había hablado de PayPal). `lib/payments/wompi.ts` y `manual.ts`
   quedan como referencia de un motor de pagos por si algún día se automatiza, pero no están
   conectados a ninguna pantalla. **Resuelto:** el número de WhatsApp de Nico ya está
   configurado en `lib/config/external-links.ts`.
8. Datos de pago manual (Nequi, cuenta bancaria, titular) — placeholders en `db/seed.ts`.
9. Rúbrica definitiva de niveles — se sembró la rúbrica propuesta en la sección 4.5.
10. Frases motivadoras iniciales, escritas por Nico.
11. Nombre del área del alumno dentro de la app.
12. **Resuelto:** paleta azul oscuro/negro (ver `app/globals.css`) y logotipo — el cliente
    subió el archivo real a `public/logo.png` (vía GitHub, ya que esta sesión no puede leer
    los bytes de una imagen pegada en el chat ni descargar de una URL bloqueada por su
    política de red) y `components/logo.tsx` ya lo usa con `next/image` en `/`, `/registro`,
    `/recuperar` y `/actualizar-contrasena`.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con credenciales reales de Supabase, etc.
npm run db:generate          # genera la migración a partir de db/schema.ts
npm run db:migrate           # aplica la migración
npm run db:seed              # siembra planes, configuración de Nico y rúbrica
npm run dev
```

Otros comandos:

```bash
npm test        # pruebas unitarias de las reglas de negocio (vitest)
npm run lint     # eslint
npm run build    # build de producción
npm run db:studio  # explorador visual de la base de datos (Drizzle Studio)
```

## Estructura

Sigue la sección 3 de la spec: `/app/(pianista)` (alumno), `/app/panel` (Nico — se movió
de `/app/(nico)` porque los grupos de rutas no aportan segmento de URL y colisionaban con
`/app/(pianista)`, p. ej. ambos tenían `/planes`), `/app/api` (webhooks y cron), `/lib`
(toda la lógica de negocio) y `/db` (esquema, migraciones y semilla).
