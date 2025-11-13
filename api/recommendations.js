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
      // 1) produtos diretamente comprados
      const ownedRes = await client.query(
        `
        SELECT p.id, p.deliverable_key
        FROM users u
        JOIN user_products up ON up.user_id = u.id
        JOIN products p ON p.id = up.product_id
        WHERE lower(u.email) = lower($1)
        `,
        [email]
      );

      const ownedIds = new Set();
      const ownedKeys = new Set();

      for (const row of ownedRes.rows) {
        ownedIds.add(row.id);
        if (row.deliverable_key) {
          ownedKeys.add(row.deliverable_key);
        }
      }

      const ownedIdsArr = [...ownedIds];
      const ownedKeysArr = [...ownedKeys];

      // 2) recomenda apenas o que NÃO tem mesmo deliverable_key
      //    nem é o mesmo produto
      const params = [];
      let where = 'p.is_active = true';

      if (ownedIdsArr.length > 0) {
        params.push(ownedIdsArr);
        where += ` AND p.id <> ALL($${params.length})`;
      }

      if (ownedKeysArr.length > 0) {
        params.push(ownedKeysArr);
        where += ` AND (p.deliverable_key IS NULL OR p.deliverable_key <> ALL($${params.length}))`;
      }

      const query = `
        SELECT
          p.id,
          p.name,
          p.description,
          p.cover_image_url,
          p.checkout_link,
          p.drive_link,
          p.type,
          p.deliverable_key
        FROM products p
        WHERE ${where}
        ORDER BY p.created_at DESC
        LIMIT 20;
      `;

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
