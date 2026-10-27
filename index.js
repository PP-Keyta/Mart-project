// index.js - main entry point (Express server)
require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- middleware ----------
app.use(cors());
app.use(express.json());

// ---------- routes ----------
app.get('/', (req, res) => {
  res.json({ message: 'Mart API is running' });
});

// health check: confirms the API and the database are both up
app.get('/health', async (req, res) => {
  try {
    const serverTime = await testConnection();
    res.json({ status: 'ok', database: 'connected', serverTime });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'unreachable', message: err.message });
  }
});

app.use('/api/products', require('./routes/products'));
app.use('/api/series', require('./routes/series'));

// TODO: mount the next feature routes here, e.g.
// app.use('/api/auth', require('./routes/auth'));

// ---------- 404 + error handling ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ---------- start ----------
app.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  try {
    const serverTime = await testConnection();
    console.log('PostgreSQL connected, server time:', serverTime);
  } catch (err) {
    console.error('PostgreSQL connection FAILED:', err.message);
    console.error('Check DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD in your .env file');
  }
});
