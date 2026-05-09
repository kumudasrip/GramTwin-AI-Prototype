import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

export const hasDatabase = Boolean(databaseUrl);

export const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    })
  : null;

let schemaInitialization: Promise<void> | null = null;

export async function ensureDatabaseSchema(): Promise<void> {
  if (!pool) {
    return;
  }

  if (!schemaInitialization) {
    schemaInitialization = pool.query(`
      CREATE TABLE IF NOT EXISTS village_reports (
        id TEXT PRIMARY KEY,
        village_id TEXT NOT NULL,
        report_date TIMESTAMPTZ NOT NULL,
        submitted_by TEXT NOT NULL,
        submitter_type TEXT NOT NULL,
        water_status TEXT NOT NULL,
        water_details TEXT NOT NULL DEFAULT '',
        climate_status TEXT NOT NULL,
        climate_details TEXT NOT NULL DEFAULT '',
        current_challenges JSONB NOT NULL DEFAULT '[]'::jsonb,
        notes TEXT NOT NULL DEFAULT ''
      );

      CREATE INDEX IF NOT EXISTS village_reports_village_date_idx
        ON village_reports (village_id, report_date DESC);

      CREATE TABLE IF NOT EXISTS citizen_queries (
        id TEXT PRIMARY KEY,
        village_id TEXT NOT NULL,
        text TEXT NOT NULL,
        category TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        status TEXT NOT NULL,
        citizen_id TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS citizen_queries_village_timestamp_idx
        ON citizen_queries (village_id, timestamp DESC);
    `).then(() => undefined);
  }

  await schemaInitialization;
}
