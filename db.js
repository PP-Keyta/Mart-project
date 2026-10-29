// db.js - PostgreSQL connection (shared pool)
// Reads settings from .env (see the variable names below)
import dotenv from 'dotenv';
dotenv.config({ quiet: true });
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'popmart',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
      }
);

// an idle client can fail (e.g. DB restarted); log it instead of crashing
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

// quick check used at startup and by GET /health
async function testConnection() {
  const result = await pool.query('SELECT now() AS server_time');
  return result.rows[0].server_time;
}

export { pool, testConnection };
