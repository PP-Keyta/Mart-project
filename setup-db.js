// setup-db.js - creates the database (if missing) and loads sql/schema.sql + sql/seed_data.sql
// Usage:  node setup-db.js            (first time)
//         node setup-db.js --reset    (DROPS all tables and loads them again)
// Uses the same settings as db.js (.env): DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const cfg = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
};
const dbName = process.env.DB_NAME || 'popmart';
const reset = process.argv.includes('--reset');

async function main() {
  // 1) create the database if it does not exist (connect to the default 'postgres' db)
  const admin = new Client({ ...cfg, database: 'postgres' });
  await admin.connect();
  const found = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (found.rowCount === 0) {
    await admin.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
    console.log(`Created database "${dbName}"`);
  } else {
    console.log(`Database "${dbName}" already exists`);
  }
  await admin.end();

  // 2) load schema + seed data
  const client = new Client({ ...cfg, database: dbName });
  await client.connect();
  const existing = await client.query("SELECT to_regclass('public.members') AS t");
  if (existing.rows[0].t && !reset) {
    console.log('Tables already exist - nothing changed. Use "node setup-db.js --reset" to wipe and reload.');
    await client.end();
    return;
  }
  for (const file of ['schema.sql', 'seed_data.sql']) {
    const sql = fs.readFileSync(path.join(__dirname, 'sql', file), 'utf8');
    await client.query(sql);
    console.log(`Loaded sql/${file}`);
  }
  const counts = await client.query(
    `SELECT (SELECT count(*) FROM members) AS members,
            (SELECT count(*) FROM products) AS products,
            (SELECT count(*) FROM orders) AS orders`
  );
  console.log('Done:', counts.rows[0]);
  await client.end();
}

main().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
