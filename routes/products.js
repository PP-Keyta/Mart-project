// routes/products.js - read-only product endpoints
//   GET /api/products        list with search / filter / sort / paging
//   GET /api/products/:id    one product
import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

const TYPES = ['blind_box', 'whole_set', 'single'];
// whitelist: the ORDER BY text comes from here, never straight from the request
const SORTS = {
  newest: 'p.id DESC',
  price_asc: 'p.price ASC, p.id',
  price_desc: 'p.price DESC, p.id',
  name: 'p.name ASC, p.id',
};

const SELECT = `
  SELECT p.id, p.code, p.name, p.product_type, p.price, p.stock, p.description, p.image,
         s.id AS series_id, s.name AS series_name
  FROM products p
  LEFT JOIN series s ON s.id = p.series_id`;

// positive whole number or null
function toInt(v) {
  return /^\d+$/.test(String(v)) ? Number(v) : null;
}

router.get('/', async (req, res, next) => {
  try {
    const { q, series, type, in_stock, sort = 'newest' } = req.query;
    const page = toInt(req.query.page) || 1;
    const limit = Math.min(toInt(req.query.limit) || 12, 100);

    if (type && !TYPES.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${TYPES.join(', ')}` });
    }
    if (!SORTS[sort]) {
      return res.status(400).json({ error: `sort must be one of: ${Object.keys(SORTS).join(', ')}` });
    }
    if (series !== undefined && toInt(series) === null) {
      return res.status(400).json({ error: 'series must be a series id (number)' });
    }

    const where = ['p.is_active = TRUE'];
    const params = [];
    if (q) {
      params.push(`%${q}%`);
      where.push(`(p.name ILIKE $${params.length} OR p.code ILIKE $${params.length})`);
    }
    if (series !== undefined) {
      params.push(Number(series));
      where.push(`p.series_id = $${params.length}`);
    }
    if (type) {
      params.push(type);
      where.push(`p.product_type = $${params.length}`);
    }
    if (in_stock === 'true') where.push('p.stock > 0');

    const whereSql = `WHERE ${where.join(' AND ')}`;
    const total = await pool.query(`SELECT count(*)::int AS n FROM products p ${whereSql}`, params);

    params.push(limit, (page - 1) * limit);
    const rows = await pool.query(
      `${SELECT} ${whereSql} ORDER BY ${SORTS[sort]} LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      page,
      limit,
      total: total.rows[0].n,
      totalPages: Math.ceil(total.rows[0].n / limit),
      data: rows.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    if (id === null) return res.status(400).json({ error: 'id must be a number' });

    const result = await pool.query(`${SELECT} WHERE p.id = $1 AND p.is_active = TRUE`, [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
