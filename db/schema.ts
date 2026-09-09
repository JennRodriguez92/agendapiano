import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  bigint,
  boolean,
  jsonb,
  smallint,
  time,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Esquema de base de datos — sección 12 de la especificación.
 * Fuente de verdad de cupos y créditos. Todas las fechas en UTC (timestamptz).
 * Zona operativa del negocio: America/Bogota (ver BUSINESS_TIMEZONE).
 */

// ---------- Enums ----------
export const userRoleEnum = pgEnum("user_role", ["student", "teacher", "admin"]);
export const levelEnum = pgEnum("level", ["basic", "intermediate", "advanced"]);
export const studentStatusEnum = pgEnum("student_status", ["active", "inactive"]);
export const orderMethodEnum = pgEnum("order_method", ["gateway", "manual"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "pending_review",
  "paid",
  "rejected",
  "refunded",
]);
export const batchStatusEnum = pgEnum("batch_status", ["active", "expired", "exhausted"]);
export const movementTypeEnum = pgEnum("movement_type", [
  "PURCHASE",
  "MANUAL_GRANT",
  "HOLD",
  "CONSUME",
  "RELEASE",
  "EXPIRE",
  "ADJUSTMENT",
]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "scheduled",
  "completed",
  "cancelled_by_student",
  "cancelled_by_teacher",
  "no_show",
]);
export const syncStatusEnum = pgEnum("sync_status", ["synced", "pending_sync", "failed"]);

// ---------- Usuarios y perfiles ----------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("student"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const studentProfiles = pgTable("student_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  timezone: text("timezone").notNull().default("America/Bogota"),
  level: levelEnum("level").notNull().default("basic"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  notesPrivate: text("notes_private"),
  status: studentStatusEnum("status").notNull().default("active"),
  whatsappOptIn: boolean("whatsapp_opt_in").notNull().default(true),
});

export const teacherSettings = pgTable("teacher_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  googleRefreshTokenEncrypted: text("google_refresh_token_encrypted"),
  googleCalendarIds: jsonb("google_calendar_ids").$type<string[]>().notNull().default([]),
  defaultTimezone: text("default_timezone").notNull().default("America/Bogota"),
  minBookingNoticeHours: integer("min_booking_notice_hours").notNull().default(12),
  bufferMinutes: integer("buffer_minutes").notNull().default(15),
  maxClassesPerDay: integer("max_classes_per_day").notNull().default(6),
  manualPaymentDetails: jsonb("manual_payment_details").$type<{
    nequiNumber?: string;
    bankAccount?: string;
    accountHolder?: string;
    instructions?: string;
  }>(),
});

// ---------- Catálogo ----------
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  classCount: integer("class_count").notNull(),
  priceCents: bigint("price_cents", { mode: "number" }).notNull(),
  currency: text("currency").notNull().default("COP"),
  validityDays: integer("validity_days").notNull().default(30),
  classDurationMinutes: integer("class_duration_minutes").notNull().default(60),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

// ---------- Compras y pagos ----------
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => studentProfiles.userId),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id),
  planSnapshot: jsonb("plan_snapshot").$type<{
    name: string;
    classCount: number;
    priceCents: number;
    validityDays: number;
    classDurationMinutes: number;
  }>().notNull(),
  amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
  currency: text("currency").notNull().default("COP"),
  method: orderMethodEnum("method").notNull(),
  gateway: text("gateway"),
  gatewayReference: text("gateway_reference"),
  receiptUrl: text("receipt_url"),
  status: orderStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
});

export const paymentEvents = pgTable("payment_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  gateway: text("gateway").notNull(),
  externalEventId: text("external_event_id").notNull().unique(),
  payload: jsonb("payload").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Créditos ----------
export const creditBatches = pgTable(
  "credit_batches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentProfiles.userId),
    orderId: uuid("order_id").references(() => orders.id),
    classCount: integer("class_count").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    frozenDays: integer("frozen_days").notNull().default(0),
    status: batchStatusEnum("status").notNull().default("active"),
  },
  (t) => [
    index("credit_batches_student_active_idx")
      .on(t.studentId, t.expiresAt)
      .where(sql`${t.status} = 'active'`),
  ]
);

export const creditMovements = pgTable(
  "credit_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentProfiles.userId),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => creditBatches.id),
    bookingId: uuid("booking_id").references(() => bookings.id),
    type: movementTypeEnum("type").notNull(),
    amount: integer("amount").notNull(),
    reason: text("reason"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("credit_movements_student_created_idx").on(t.studentId, t.createdAt)]
);

// ---------- Agenda ----------
export const availabilityRules = pgTable("availability_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  weekday: smallint("weekday").notNull(), // 0-6, domingo-sábado
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  timezone: text("timezone").notNull().default("America/Bogota"),
  isActive: boolean("is_active").notNull().default(true),
});

export const availabilityBlocks = pgTable("availability_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  reason: text("reason"),
});

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentProfiles.userId),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => creditBatches.id),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    timezoneAtBooking: text("timezone_at_booking").notNull(),
    status: bookingStatusEnum("status").notNull().default("scheduled"),
    googleEventId: text("google_event_id"),
    googleMeetUrl: text("google_meet_url"),
    syncStatus: syncStatusEnum("sync_status").notNull().default("pending_sync"),
    rescheduleCount: integer("reschedule_count").notNull().default(0),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("bookings_starts_at_active_idx")
      .on(t.startsAt)
      .where(sql`${t.status} = 'scheduled'`),
    index("bookings_student_status_idx").on(t.studentId, t.status),
  ]
);

// ---------- Pedagogía ----------
export const lessonNotes = pgTable("lesson_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id),
  studentId: uuid("student_id")
    .notNull()
    .references(() => studentProfiles.userId),
  noteText: text("note_text"),
  audioUrl: text("audio_url"),
  homework: text("homework"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rubricCriteria = pgTable("rubric_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  levelFrom: levelEnum("level_from").notNull(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const studentRubric = pgTable(
  "student_rubric",
  {
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentProfiles.userId),
    criterionId: uuid("criterion_id")
      .notNull()
      .references(() => rubricCriteria.id),
    achievedAt: timestamp("achieved_at", { withTimezone: true }),
    markedBy: uuid("marked_by").references(() => users.id),
  },
  (t) => [uniqueIndex("student_rubric_pk").on(t.studentId, t.criterionId)]
);

export const levelHistory = pgTable("level_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => studentProfiles.userId),
  fromLevel: levelEnum("from_level").notNull(),
  toLevel: levelEnum("to_level").notNull(),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  changedBy: uuid("changed_by").references(() => users.id),
});

// ---------- Contenido y comunicación ----------
export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  text: text("text").notNull(),
  author: text("author").notNull().default("Nico"),
  contextTag: text("context_tag").notNull(), // bienvenida | antes_de_clase | plan_por_vencer | subida_de_nivel | retorno_tras_ausencia
  isActive: boolean("is_active").notNull().default(true),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  channel: text("channel").notNull(), // email | whatsapp | push
  template: text("template").notNull(),
  payload: jsonb("payload"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  status: text("status").notNull().default("pending"),
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: uuid("entity_id"),
  before: jsonb("before"),
  after: jsonb("after"),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
