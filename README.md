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
  protegidas por `CRON_SECRET` / firma del webhook.
- Enlaces externos temporales para las primeras revisiones (`lib/config/external-links.ts`):
  el botón "Comprar" de `/planes` abre el link de pago de Hotmart que envió el cliente, y
  `/agendar` muestra como opción principal el link público de reservas del Google Calendar
  de Nico. Ambos son un puente mientras se conectan PayPal y la integración OAuth reales —
  se reemplazan cambiando ese único archivo.

**Qué falta conectar (requiere credenciales reales, no se puede probar en este entorno):**
- Proyecto de Supabase real (`DATABASE_URL`, claves de Auth) y correr `npm run db:generate`
  + `npm run db:migrate` + `npm run db:seed`, y aplicar `db/rls.sql`.
- Autorización OAuth de Nico con Google Calendar (`lib/scheduling/google-calendar.ts` está
  completo en su forma de integración pero lanza un error explícito hasta que exista un
  `refresh_token` guardado).
- Credenciales de Wompi (o ePayco, ver decisión pendiente #7 abajo) y Resend.
- Las páginas usan datos de ejemplo (`TODO` en cada archivo) en vez de consultas reales:
  la lógica de negocio que sí queda conectada a la base de datos vive en `/lib`, las
  pantallas solo necesitan que se les pase el resultado de esas funciones.

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
7. **Resuelto por el cliente:** el pago real será con **PayPal** (no Wompi ni ePayco). Falta
   la integración PayPal en sí — `lib/payments/wompi.ts` queda como referencia de cómo se
   estructura un webhook de pasarela, pero hay que escribir el equivalente para PayPal
   (webhooks/checkout de PayPal) cuando el cliente tenga las credenciales. Mientras tanto,
   `/planes` usa el link de Hotmart de prueba (ver arriba).
8. Datos de pago manual (Nequi, cuenta bancaria, titular) — placeholders en `db/seed.ts`.
9. Rúbrica definitiva de niveles — se sembró la rúbrica propuesta en la sección 4.5.
10. Frases motivadoras iniciales, escritas por Nico.
11. Nombre del área del alumno dentro de la app.
12. **Paleta resuelta:** azul oscuro/negro de referencia que envió el cliente (ver
    `app/globals.css`). **Logotipo pendiente:** el cliente compartió la imagen del logo de
    NicoPiano en el chat, pero esta sesión no tiene forma de leer los bytes de una imagen
    pegada en la conversación — solo puede guardar un archivo si se sube al repo o se
    comparte por URL. Sube el logo (PNG/SVG) a `public/logo.png` (o pásame una URL) y lo
    conecto en `app/layout.tsx`, `app/page.tsx` y el favicon.

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
