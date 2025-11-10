import pool from '../lib/db.js';

export default async function handler(req, res) {
  // Só aceita POST (webhook)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const evento = req.body || {};

  try {
    const emailRaw = evento?.customer?.email;
    const items = Array.isArray(evento?.items) ? evento.items : [];

    if (!emailRaw) {
      return res.status(400).json({ error: 'Email do cliente não encontrado no webhook.' });
    }

    const email = emailRaw.toLowerCase().trim();

    if (items.length === 0) {
      // Nada pra processar, mas não é erro "fatal"
      return res.status(200).json({ success: true, message: 'Nenhum item no webhook.' });
    }

    // Extrair possíveis SKUs dos items
    const skus = items
      .map((item) => {
        return (
          item.sku ||
          item.SKU ||
          item.product_sku ||
          item.variant_sku ||
          item.code ||    // se o Cartpanda usar outro nome
          null
        );
      })
      .filter(Boolean);

    if (skus.length === 0) {
      return res.status(400).json({ error: 'Nenhum SKU encontrado nos itens do webhook.' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1️⃣ Buscar ou criar usuário
      let userId;

      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rowCount > 0) {
        userId = existingUser.rows[0].id;
      } else {
        const senhaPadrao = '123456'; // mesma senha que você usa no login
        const newUser = await client.query(
          'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
          [email, senhaPadrao]
        );
        userId = newUser.rows[0].id;
      }

      // 2️⃣ Buscar produtos pelo SKU na tabela products
      const productsResult = await client.query(
        `
        SELECT id, name, cartpanda_sku
        FROM products
        WHERE cartpanda_sku = ANY($1)
        `,
        [skus]
      );

      if (productsResult.rowCount === 0) {
        await client.query('ROLLBACK');
        console.warn('Nenhum produto encontrado para os SKUs:', skus);
        return res.status(400).json({
          error: 'Nenhum produto encontrado para os SKUs enviados.',
          skusRecebidos: skus,
        });
      }

      // 3️⃣ Inserir em user_products (sem duplicar)
      let produtosInseridos = 0;

      for (const product of productsResult.rows) {
        const { id: productId } = product;

        const insert = await client.query(
          `
          INSERT INTO user_products (user_id, product_id, purchased_at, source)
          VALUES ($1, $2, NOW(), 'cartpanda')
          ON CONFLICT (user_id, product_id) DO NOTHING
          `,
          [userId, productId]
        );

        if (insert.rowCount > 0) {
          produtosInseridos += 1;
        }
      }

      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        userId,
        email,
        skusRecebidos: skus,
        produtosEncontrados: productsResult.rowCount,
        produtosInseridos,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Erro ao processar webhook Cartpanda:', err);
      return res.status(500).json({ error: 'Erro ao processar webhook.' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Erro inesperado no webhook Cartpanda:', err);
    return res.status(500).json({ error: 'Erro inesperado ao processar webhook.' });
  }
}


