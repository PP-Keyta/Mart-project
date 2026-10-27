// backup-db.js - saves the CURRENT contents of the database to a single .sql file
// Usage:  node backup-db.js                -> writes popmart_backup.sql next to this file
//         node backup-db.js my_copy.sql    -> writes to the file name you give
// Restore: node setup-db.js --reset --from popmart_backup.sql
// Uses the same settings as db.js (.env). No pg_dump needed.
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// parent tables first, so the INSERTs satisfy the foreign keys
const TABLES = ['series', 'members', 'products', 'orders', 'order_items'];

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'popmart',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

function literal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (v instanceof Date) return client.escapeLiteral(v.toISOString());
  return client.escapeLiteral(String(v));
}

async function main() {
  const outFile = path.resolve(__dirname, process.argv[2] || 'popmart_backup.sql');
  await client.connect();

  // table definitions: reuse sql/schema.sql, but cut off its sample-data part
  const schema = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');
  const marker = schema.indexOf('-- SAMPLE DATA');
  if (marker === -1) throw new Error('Could not find "-- SAMPLE DATA" marker in sql/schema.sql');
  const cut = schema.lastIndexOf('-- ====', marker);
  const ddl = schema.slice(0, cut).trimEnd();

  const out = [];
  out.push(`-- Pop Mart database backup, created ${new Date().toISOString()}`);
  out.push('-- Restore with:  node setup-db.js --reset --from ' + path.basename(outFile));
  out.push('BEGIN;', '', ddl, '');

  const counts = {};
  for (const t of TABLES) {
    const { rows, fields } = await client.query(`SELECT * FROM ${t} ORDER BY id`);
    counts[t] = rows.length;
    if (rows.length === 0) continue;
    const cols = fields.map((f) => f.name);
    out.push(`-- ${t} (${rows.length} rows)`);
    for (const r of rows) {
      out.push(`INSERT INTO ${t} (${cols.join(', ')}) VALUES (${cols.map((c) => literal(r[c])).join(', ')});`);
    }
    out.push('');
  }

  // make auto-numbering continue after the restored rows
  out.push('-- sequences');
  for (const t of TABLES) {
    out.push(`SELECT setval(pg_get_serial_sequence('${t}', 'id'), COALESCE((SELECT max(id) FROM ${t}), 1), (SELECT count(*) > 0 FROM ${t}));`);
  }
  const seq = await client.query('SELECT last_value, is_called FROM order_no_seq');
  out.push(`SELECT setval('order_no_seq', ${seq.rows[0].last_value}, ${seq.rows[0].is_called});`);
  out.push('', 'COMMIT;', '');

  fs.writeFileSync(outFile, out.join('\n'), 'utf8');
  console.log('Backup saved to', outFile);
  console.log('Rows:', counts);
  await client.end();
}

main().catch((err) => {
  console.error('Backup failed:', err.message);
  process.exit(1);
});
