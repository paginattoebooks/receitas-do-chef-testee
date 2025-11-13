// /api/recommendations.js
import pool from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Use GET' });
  }

  const email = (req.query.email || '').toString().toLowerCase().trim();
  if (!email) {
    return res.status(400).json({ success: false, error: 'email é obrigatório' });
  }

  try {
    const client = await pool.connect();

    try {
      // produtos já comprados
      const ownedRes = await client.query(
        `
        SELECT p.id
        FROM users u
        JOIN user_products up ON up.user_id = u.id
        JOIN products p ON p.id = up.product_id
        WHERE lower(u.email) = lower($1)
        `,
        [email]
      );

      const ownedIds = ownedRes.rows.map(r => r.id);

      let query = `
        SELECT id, name, description, cover_image_url, checkout_link, drive_link, type
        FROM products
        WHERE is_active = true
      `;
      const params = [];

      if (ownedIds.length > 0) {
        query += ' AND id <> ALL($1)';
        params.push(ownedIds);
      }

      query += ' ORDER BY created_at DESC LIMIT 20';

      const recRes = await client.query(query, params);

      return res.status(200).json({
        success: true,
        items: recRes.rows,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Erro em /api/recommendations', err);
    return res.status(500).json({ success: false, error: 'erro ao buscar recomendações' });
  }
}
