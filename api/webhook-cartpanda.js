import pool from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const evento = req.body || {};

  try {
    // 1) E-mail do cliente
    const emailRaw =
      evento?.customer?.email ||
      evento?.customer_email ||
      evento?.buyer?.email ||
      evento?.email ||
      null;

    if (!emailRaw) {
      return res.status(400).json({ error: 'Email do cliente não encontrado no webhook.' });
    }
    const email = String(emailRaw).toLowerCase().trim();

    // 2) Colete possíveis checkout_links (nomes variam conforme integração)
    const items = Array.isArray(evento?.items) ? evento.items : [];

    const candidates = new Set();

    // nível do evento
    [
      evento?.checkout_link,
      evento?.checkout_url,
      evento?.order?.checkout_link,
      evento?.order?.checkout_url,
      evento?.purchase?.checkout_link,
      evento?.purchase?.checkout_url,
      evento?.url,
      evento?.link
    ].forEach((v) => {
      if (typeof v === 'string' && v.includes('/checkout/')) candidates.add(v.trim());
    });

    // nível dos items
    for (const it of items) {
      [
        it?.checkout_link,
        it?.checkout_url,
        it?.url,
        it?.link,
        it?.product_url
      ].forEach((v) => {
        if (typeof v === 'string' && v.includes('/checkout/')) candidates.add(v.trim());
      });
    }

    const checkoutLinks = Array.from(candidates);

    if (checkoutLinks.length === 0) {
      return res.status(400).json({
        error: 'Nenhum checkout_link encontrado no webhook.',
        dica: 'Confirme no Cartpanda quais campos do payload trazem a URL de checkout.'
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // (opcional) logar payload bruto para debug
      try {
        await client.query(
          `CREATE TABLE IF NOT EXISTS webhook_logs (
            id BIGSERIAL PRIMARY KEY,
            payload JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );`
        );
        await client.query(`INSERT INTO webhook_logs (payload) VALUES ($1)`, [evento]);
      } catch { /* se falhar o log, não quebra o fluxo */ }

      // 3) Buscar usuário (ou criar)
      let userId;
      const u = await client.query(`SELECT id FROM users WHERE email = $1`, [email]);
      if (u.rowCount > 0) {
        userId = u.rows[0].id;
      } else {
        const senhaPadrao = '123456'; // igual ao login que você já usa
        const ins = await client.query(
          `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id`,
          [email, senhaPadrao]
        );
        userId = ins.rows[0].id;
      }

      // 4) Encontrar produto(s) pelo checkout_link
      const prod = await client.query(
        `SELECT id, name, deliverable_key
           FROM products
          WHERE checkout_link = ANY($1)`,
        [checkoutLinks]
      );

      if (prod.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: 'Nenhum produto encontrado para os checkout_links recebidos.',
          checkout_links_recebidos: checkoutLinks
        });
      }

      // 5) Vincular produtos ao usuário (sem duplicar)
      let produtosInseridos = 0;

      // garantir constraint (idempotente)
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
              FROM pg_constraint
             WHERE conname = 'user_products_user_id_product_id_key'
          ) THEN
            ALTER TABLE user_products
              ADD CONSTRAINT user_products_user_id_product_id_key
              UNIQUE (user_id, product_id);
          END IF;
        END$$;
      `);

      for (const p of prod.rows) {
        const ins = await client.query(
          `INSERT INTO user_products (user_id, product_id, purchased_at, source)
             VALUES ($1, $2, NOW(), 'cartpanda')
             ON CONFLICT (user_id, product_id) DO NOTHING`,
          [userId, p.id]
        );
        if (ins.rowCount > 0) produtosInseridos += 1;
      }

      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        email,
        userId,
        checkout_links_recebidos: checkoutLinks,
        produtosEncontrados: prod.rowCount,
        produtosInseridos
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



