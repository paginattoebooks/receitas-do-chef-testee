import pool from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Use POST' });
  }

  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email é obrigatório',
    });
  }

  const emailNorm = email.toLowerCase().trim();

  try {
    const client = await pool.connect();

    try {
      // 1) produtos diretamente comprados (user_products)
      const baseRes = await client.query(
        `
        SELECT
          p.id,
          p.name,
          p.type,
          p.description,
          p.cover_image_url,
          p.drive_link,
          p.checkout_link,
          p.deliverable_key
        FROM users u
        JOIN user_products up ON up.user_id = u.id
        JOIN products p ON p.id = up.product_id
        WHERE lower(u.email) = lower($1)
          AND p.is_active = true
        ORDER BY p.name;
        `,
        [emailNorm]
      );

      const base = baseRes.rows;
      if (base.length === 0) {
        return res.status(200).json({
          success: true,
          items: [],
        });
      }

      const ownedIds = new Set(base.map(p => p.id));
      const keys = [...new Set(base.map(p => p.deliverable_key).filter(Boolean))];

      let all = [...base];

      // 2) se tem combos (deliverable_key), busca todos os produtos desse combo
      if (keys.length > 0) {
        const extraRes = await client.query(
          `
          SELECT
            p.id,
            p.name,
            p.type,
            p.description,
            p.cover_image_url,
            p.drive_link,
            p.checkout_link,
            p.deliverable_key
          FROM products p
          WHERE p.is_active = true
            AND p.deliverable_key = ANY($1)
          ORDER BY p.name;
          `,
          [keys]
        );

        for (const p of extraRes.rows) {
          if (!ownedIds.has(p.id)) {
            ownedIds.add(p.id);
            all.push(p);
          }
        }
      }

      // 3) devolve tudo que o usuário TEM acesso (incluindo combos)
      return res.status(200).json({
        success: true,
        items: all,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Erro em /api/my-products', err);
    return res.status(500).json({
      success: false,
      message: 'Erro no servidor ao buscar produtos do usuário.',
    });
  }
}
