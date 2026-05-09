import { ensureDatabaseSchema, hasDatabase, pool } from "../db.ts";

export interface CitizenQuery {
  id: string;
  text: string;
  category: string;
  timestamp: string;
  status: "submitted" | "answered";
  villageId: string;
  citizenId: string;
}

let citizenQueries: CitizenQuery[] = [];

function mapQueryRow(row: any): CitizenQuery {
  return {
    id: row.id,
    villageId: row.village_id,
    text: row.text,
    category: row.category,
    timestamp: row.timestamp,
    status: row.status,
    citizenId: row.citizen_id,
  };
}

export async function initializeCitizenQueryStore(): Promise<void> {
  await ensureDatabaseSchema();
}

export async function addCitizenQuery(query: CitizenQuery): Promise<CitizenQuery> {
  if (!hasDatabase || !pool) {
    citizenQueries.unshift(query);
    return query;
  }

  await ensureDatabaseSchema();
  const result = await pool.query(
    `
      INSERT INTO citizen_queries (
        id,
        village_id,
        text,
        category,
        timestamp,
        status,
        citizen_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [query.id, query.villageId, query.text, query.category, query.timestamp, query.status, query.citizenId]
  );

  return mapQueryRow(result.rows[0]);
}

export async function getCitizenQueries(villageId: string): Promise<CitizenQuery[]> {
  if (!hasDatabase || !pool) {
    return citizenQueries.filter(query => query.villageId === villageId);
  }

  await ensureDatabaseSchema();
  const result = await pool.query(
    `
      SELECT *
      FROM citizen_queries
      WHERE village_id = $1
      ORDER BY timestamp DESC
    `,
    [villageId]
  );

  return result.rows.map(mapQueryRow);
}

export async function updateCitizenQueryStatus(queryId: string, status: "submitted" | "answered"): Promise<CitizenQuery | null> {
  if (!hasDatabase || !pool) {
    const index = citizenQueries.findIndex(query => query.id === queryId);
    if (index === -1) return null;
    citizenQueries[index] = { ...citizenQueries[index], status };
    return citizenQueries[index];
  }

  await ensureDatabaseSchema();
  const result = await pool.query(
    `
      UPDATE citizen_queries
      SET status = $2
      WHERE id = $1
      RETURNING *
    `,
    [queryId, status]
  );

  return result.rows[0] ? mapQueryRow(result.rows[0]) : null;
}
