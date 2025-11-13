// /api/search.js
import pool from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Use GET' });
  }

  const q = (req.query.q || '').toString().trim();
  const email = (req.query.email || '').toString().toLowerCase().trim();

  if (!q) {
    return res.status(400).json({ success: false, error: 'q é obrigatório' });
  }

  try {
    const client = await pool.connect();

    try {
      const searchTerm = `%${q}%`;

      const result = await client.query(
        `
        WITH u AS (
          SELECT id FROM users WHERE lower(email) = lower($2)
        )
        SELECT
          p.id,
          p.name,
          p.description,
          p.cover_image_url,
          p.checkout_link,
          p.drive_link,
          p.type,
          (up.user_id IS NOT NULL) AS owned
        FROM products p
        LEFT JOIN u ON TRUE
        LEFT JOIN user_products up
          ON up.user_id = u.id
         AND up.product_id = p.id
        WHERE p.is_active = true
          AND (p.name ILIKE $1 OR p.description ILIKE $1)
        ORDER BY p.name
        LIMIT 50;
        `,
        [searchTerm, email]
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
