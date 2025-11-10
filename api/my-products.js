import pool from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const emailRaw = req.query.email;

  if (!emailRaw) {
    return res.status(400).json({ error: 'Parâmetro "email" é obrigatório.' });
  }

  const email = emailRaw.toLowerCase().trim();

  try {
    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.name,
        p.type,
        p.description,
        p.slug,
        p.price,
        p.checkout_url,
        p.cover_image_url,
        p.tags
      FROM user_products up
      JOIN users u ON u.id = up.user_id
      JOIN products p ON p.id = up.product_id
      WHERE u.email = $1
      ORDER BY p.type, p.name
      `,
      [email]
    );

    return res.status(200).json({
      success: true,
      email,
      products: result.rows,
    });
  } catch (error) {
    console.error('Erro em /api/my-products:', error);
    return res.status(500).json({ error: 'Erro ao buscar produtos do usuário.' });
  }
}
