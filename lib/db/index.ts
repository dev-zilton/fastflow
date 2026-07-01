import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString && process.env.NODE_ENV === "production") {
  throw new Error("Missing required environment variable DATABASE_URL");
}

if (!connectionString) {
  console.warn(
    "DATABASE_URL not set. Database connections will use default pg behavior or fail at query time.",
  );
}

export const pool = new Pool(
  connectionString ? { connectionString } : undefined,
);

export const db = drizzle(pool, { schema });
