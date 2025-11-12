// /lib/db.js
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5432', 10),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
  // Se usar Neon Pooler, pode ativar:
  // max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000,
});

export default pool;



