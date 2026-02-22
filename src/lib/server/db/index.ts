import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// NETLIFY_DATABASE_URL is auto-provisioned by Netlify DB (Neon Postgres)
const sql = neon(process.env.NETLIFY_DATABASE_URL!);

export const db = drizzle(sql, { schema });
