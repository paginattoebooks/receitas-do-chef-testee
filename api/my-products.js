// /api/my-products.js
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

  try {
   const query = `
  SELECT
    p.id,
    p.name,
    p.type,
    p.description,
    p.cover_image_url,
    p.deliverable_key,
    p.checkout_link,
    p.drive_link,
    p.deliverable_url
  FROM users u
  JOIN user_products up ON up.user_id = u.id
  JOIN products p ON p.id = up.product_id
  WHERE lower(u.email) = lower($1)
    AND p.is_active = true
  ORDER BY p.name;
`;


    const { rows } = await pool.query(query, [email]);

    const videos = rows.filter(r => (r.type || '').toLowerCase().includes('video'));
    const ebooks = rows.filter(r => (r.type || '').toLowerCase().includes('ebook'));

    return res.status(200).json({
      success: true,
      products: rows,
      videos,
      ebooks,
    });
  } catch (err) {
    console.error('Erro em /api/my-products', err);
    return res.status(500).json({
      success: false,
      message: 'Erro no servidor ao buscar produtos do usuário.',
    });
  }
}
