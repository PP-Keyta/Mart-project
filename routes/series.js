// routes/series.js - GET /api/series  (all series + how many active products each has)
import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.name, count(p.id)::int AS product_count
       FROM series s
       LEFT JOIN products p ON p.series_id = s.id AND p.is_active = TRUE
       GROUP BY s.id
       ORDER BY s.name`
    );
    res.json({ total: result.rowCount, data: result.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
