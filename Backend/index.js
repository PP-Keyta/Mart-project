// index.js - main entry point (Express server)
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { testConnection } from './services/db.js';
//พีรวมให้มีแค่ productRoute
import productsRoute from './routes/productRoute.js';
import cartRoute from './routes/cartRoute.js';

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- middleware ----------
app.use(cors());
app.use(express.json());

// ส่วนที่ พีทำ
app.use("/img_pd",express.static("img_pd")) 
app.use("/img_mem",express.static("img_mem"))


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

app.use('/api/', productsRoute);
app.use('/api/',cartRoute);

// TODO: mount the next feature routes here, e.g.
// app.use('/api/auth', authRouter);  // import authRouter from './routes/auth.js'

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
