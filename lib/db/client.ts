import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './drizzle-schema'

const connectionString = process.env.DATABASE_URL

// For serverless and Supabase connection pooler (Supavisor port 6543),
// set prepare: false to ensure compatibility with transaction pooling.
const client = connectionString
  ? postgres(connectionString, {
      max: Number(process.env.DATABASE_POOL_SIZE || 10),
      prepare: false,
    })
  : null

export const db = client ? drizzle(client, { schema }) : null

export function isDatabaseConnected(): boolean {
  return Boolean(client && db)
}

