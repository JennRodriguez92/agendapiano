import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __dbClient: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // No lanza en el momento del import (rompería `next build` sin una base
  // configurada); la conexión real de postgres.js es perezosa, así que el
  // error solo aparece si de verdad se ejecuta una query sin DATABASE_URL.
  console.warn("DATABASE_URL no está definido — configúralo antes de usar la base de datos.");
}

// En desarrollo, reutiliza la conexión entre recargas de Next.js.
const client =
  global.__dbClient ?? postgres(connectionString ?? "postgres://placeholder", { prepare: false });

if (process.env.NODE_ENV !== "production") {
  global.__dbClient = client;
}

export const db = drizzle(client, { schema });
