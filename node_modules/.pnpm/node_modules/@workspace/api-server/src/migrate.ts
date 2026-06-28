import { pool } from "@workspace/db";
// @ts-expect-error — esbuild loads .sql as text via loader config
import migration0000 from "./lib/db/drizzle/0000_common_doctor_faustus.sql";

const MIGRATIONS: { hash: string; sql: string }[] = [
  { hash: "0000_common_doctor_faustus", sql: migration0000 as string },
];

export async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash TEXT NOT NULL UNIQUE,
      created_at BIGINT
    )
  `);

  for (const migration of MIGRATIONS) {
    const { rows } = await pool.query(
      `SELECT id FROM "__drizzle_migrations" WHERE hash = $1`,
      [migration.hash],
    );

    if (rows.length > 0) continue;

    const statements = migration.sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (err: any) {
        // 42P07 = relation already exists, 42710 = constraint already exists — safe to skip
        if (err?.code !== "42P07" && err?.code !== "42710") throw err;
      }
    }

    await pool.query(
      `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
      [migration.hash, Date.now()],
    );
  }
}