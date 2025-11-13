// /api/search.js
import pool from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Use GET' });
  }

  const qRaw = (req.query.q || '').toString().trim();
  const email = (req.query.email || '').toString().toLowerCase().trim();

  if (!qRaw) {
    return res.status(400).json({ success: false, error: 'q é obrigatório' });
  }

  const q = `%${qRaw}%`;

  try {
    const client = await pool.connect();

    try {
      const result = await client.query(
        `
        WITH u AS (
          SELECT id FROM users WHERE lower(email) = lower($2)
        ),
        base_owned AS (
          SELECT p.id, p.deliverable_key
          FROM user_products up
          JOIN u ON u.id = up.user_id
          JOIN products p ON p.id = up.product_id
        ),
        owned_keys AS (
          SELECT DISTINCT deliverable_key
          FROM base_owned
          WHERE deliverable_key IS NOT NULL
        )
        SELECT
          p.id,
          p.name,
          p.description,
          p.cover_image_url,
          p.checkout_link,
          p.drive_link,
          p.type,
          p.deliverable_key,
          (
            EXISTS (SELECT 1 FROM base_owned bo WHERE bo.id = p.id)
            OR (
              p.deliverable_key IS NOT NULL
              AND EXISTS (
                SELECT 1
                FROM owned_keys ok
                WHERE ok.deliverable_key = p.deliverable_key
              )
            )
          ) AS owned
        FROM products p
        WHERE p.is_active = true
          AND (p.name ILIKE $1 OR p.description ILIKE $1)
        ORDER BY p.name
        LIMIT 50;
        `,
        [q, email]
      );

      return res.status(200).json({
        success: true,
        items: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Erro em /api/search', err);
    return res.status(500).json({ success: false, error: 'erro ao buscar' });
  }
}

