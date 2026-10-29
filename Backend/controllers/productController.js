import database from "../services/db.js";

//protect
const TYPES = ['blind_box', 'whole_set', 'single'];
const SORTS = {
  newest: 'p.id ASC',
  oldest: 'p.id ASC',
  price_asc: 'p.price ASC, p.id',
  price_desc: 'p.price DESC, p.id',
  name: 'p.name ASC, p.id',
};
const SELECT = `
    SELECT p.id, p.code, p.name, p.product_type, p.price, p.stock, p.description,
            s.id AS series_id, s.name AS series_name
    FROM products p
    LEFT JOIN series s ON s.id = p.series_id`;
function toInt(v) {
  return /^\d+$/.test(String(v)) ? Number(v) : null;
}

//function ทำงาน
export async function getAllProduct(req, res, next) {
    console.log(`GET /products requested`)
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
        const total = await database.query(`SELECT count(*)::int AS n FROM products p ${whereSql}`, params);

        // กำหนดตำแหน่ง index สำหรับ LIMIT และ OFFSET ก่อนจะ push ค่าลง params
        const limitIndex = params.length + 1;
        const offsetIndex = params.length + 2;
        params.push(limit, (page - 1) * limit);

        // นำ SORTS[sort] มาใส่ต่อท้าย ORDER BY ตรงนี้ครับ
        const rows = await database.query(
            `${SELECT} ${whereSql} ORDER BY ${SORTS[sort]} LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
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
}

export async function getProductById(req, res, next) {
    console.log(`GET /products/id:${req.params.id} is requested`)  
    try {
        const id = toInt(req.params.id);
        if (id === null) return res.status(400).json({ error: 'id must be a number' });

        const result = await database.query(`${SELECT} WHERE p.id = $1 AND p.is_active = TRUE`, [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
}

export async function getAllSeries(req, res, next) {
  console.log(`GET /series is requested`);
  try {
    const result = await database.query(
      `SELECT s.id, s.name, count(p.id)::int AS product_count
       FROM series s
       LEFT JOIN products p ON p.series_id = s.id AND p.is_active = TRUE
       GROUP BY s.id
       ORDER BY s.id ASC`
    );
    res.json({ total: result.rowCount, data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getSeriesById(req, res, next) {
    console.log(`GET /series/${req.params.id} is requested`);
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'id must be a number' });
        }

        const seriesResult = await database.query({
            text: `SELECT "id", "name" FROM "series" WHERE "id" = $1`,
            values: [id]
        });

        if (seriesResult.rowCount === 0) {
            return res.status(404).json({ error: 'Series not found' });
        }

        const productsResult = await database.query({
            text: `SELECT "id", "code", "name", "product_type", "price", "stock", "description", "is_active"
                   FROM "products" 
                   WHERE "series_id" = $1 AND "is_active" = TRUE
                   ORDER BY "id" ASC`,
            values: [id]
        });

        const seriesData = seriesResult.rows[0];
        seriesData.products = productsResult.rows;

        res.json(seriesData);

    } catch (err) {
        next(err);
    }
}

export async function postProduct(req, res) {
    console.log(`POST /products is requested.`);
    const bodyData = req.body;
    try {
        if (!bodyData.code || !bodyData.name) {
            return res.status(422).json({ message: `ERROR code and name are required` });
        }

        const chkRow = await database.query({
            text: `SELECT * FROM "products" WHERE "code" = $1`,
            values: [bodyData.code]
        });
        if (chkRow.rowCount !== 0) {
            return res.status(409).json({ message: `ERROR code ${bodyData.code} already exists` });
        }

        const result = await database.query({
            text: `INSERT INTO "products" ("code", "name", "series_id", "product_type", "price", "stock", "description", "is_active")
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                   RETURNING "id", "created_at", "updated_at"`,
            values: [
                bodyData.code,
                bodyData.name,
                bodyData.series_id || null,
                bodyData.product_type || 'blind_box', 
                bodyData.price,
                bodyData.stock || 0,                 
                bodyData.description || null,
                bodyData.is_active !== undefined ? bodyData.is_active : true
            ]
        });

        const newProduct = {
            id: result.rows[0].id,
            ...bodyData,
            product_type: bodyData.product_type || 'blind_box',
            stock: bodyData.stock || 0,
            is_active: bodyData.is_active !== undefined ? bodyData.is_active : true,
            created_at: result.rows[0].created_at,
            updated_at: result.rows[0].updated_at
        };

        return res.status(201).json({
            message: "ok",
            data: newProduct
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export async function putProduct(req, res) {
    console.log(`PUT /product/id:${req.params.id} is requested`)
    try {
        const bodyData = req.body
        const result = await database.query({
            text: ` UPDATE "products"
                    SET "code" = $1,
                        "name" = $2,
                        "series_id" = $3,
                        "product_type" = $4,
                        "price" = $5,
                        "stock" = $6,
                        "description" = $7,
                        "is_active" = $8,
                        "updated_at" = NOW()
                    WHERE "id" = $9
                `,
            values: [
                bodyData.code,
                bodyData.name,
                bodyData.series_id,
                bodyData.product_type,
                bodyData.price,
                bodyData.stock,
                bodyData.description,
                bodyData.is_active,
                req.params.id
            ]
        })

        if (result.rowCount === 0)
            return res.status(404).json({ message: `ERROR product id ${req.params.id} not found` })

        bodyData.updated_at = new Date()
        bodyData.message = "ok"
        return res.status(200).json(bodyData)

    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export async function deleteProduct(req, res) {
    console.log(`DELETE /product/${req.params.id} is requested`)
    try {
        const result = await database.query({
            text: ` DELETE FROM "products"
                    WHERE "id" = $1
                `,
            values: [
                req.params.id
            ]
        })

        if (result.rowCount === 0)
            return res.status(404).json({ message: `ERROR product id ${req.params.id} not found` })

        return res.status(204).end()
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}