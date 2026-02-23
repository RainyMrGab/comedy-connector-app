import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// NETLIFY_DATABASE_URL is auto-provisioned by Netlify DB (Neon Postgres).
const NETLIFY_DATABASE_URL = process.env.NETLIFY_DATABASE_URL;
if (!NETLIFY_DATABASE_URL) {
  throw new Error('NETLIFY_DATABASE_URL environment variable is not set');
}

const sql = neon(NETLIFY_DATABASE_URL);
export const db = drizzle(sql, { schema });
