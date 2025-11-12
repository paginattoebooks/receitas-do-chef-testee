// /api/webhook-cartpanda.js
import pool from '../lib/db.js';

// Opcional: se o Cartpanda mandar "x-www-form-urlencoded", ative o raw-body
// export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // 1) Captura o payload (JSON já parseado pelo Next) ou objeto vazio
  const evento = req.body || {};

  try {
    // 2) E-mail do cliente (tenta vários caminhos)
    const emailRaw =
      evento?.customer?.email ||
      evento?.customer_email ||
      evento?.buyer?.email ||
      evento?.email ||
      null;

    if (!emailRaw) {
      // Loga mesmo assim para debug
      await safeLog(evento);
      return res.status(400).json({ error: 'Email do cliente não encontrado no webhook.' });
    }

    const email = String(emailRaw).toLowerCase().trim();

    // 3) Colete possíveis checkout_links (nome varia conforme o payload)
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
      evento?.link,
    ].forEach((v) => {
      if (typeof v === 'string' && v.includes('/checkout/')) candidates.add(v.trim());
    });

    // nível dos itens
    for (const it of items) {
      [
        it?.checkout_link,
        it?.checkout_url,
        it?.url,
        it?.link,
        it?.product_url,
      ].forEach((v) => {
        if (typeof v === 'string' && v.includes('/checkout/')) candidates.add(v.trim());
      });
    }

    const checkoutLinks = Array.from(candidates);

    // 4) Sempre logar (ajuda MUITO no debug)
    await safeLog({ received: evento, parsed: { email, checkoutLinks } });

    if (checkoutLinks.length === 0) {
      return res.status(400).json({
        error: 'Nenhum checkout_link encontrado no webhook.',
        dica: 'Veja o JSON registrado em webhook_logs para descobrir o campo certo.',
      });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 5) Buscar/criar usuário
      let userId;
      const u = await client.query(`SELECT id FROM users WHERE email = $1`, [email]);
      if (u.rowCount > 0) {
        userId = u.rows[0].id;
      } else {
        const senhaPadrao = '123456'; // mesma do seu /api/login
        const ins = await client.query(
          `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id`,
          [email, senhaPadrao]
        );
        userId = ins.rows[0].id;
      }

      // 6) Achar produto(s) pelo checkout_link
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
          checkout_links_recebidos: checkoutLinks,
        });
      }

      // 7) Garantir unicidade user_id+product_id e vincular
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'user_products_user_id_product_id_key'
          ) THEN
            ALTER TABLE user_products
            ADD CONSTRAINT user_products_user_id_product_id_key UNIQUE (user_id, product_id);
          END IF;
        END$$;
      `);

      let produtosInseridos = 0;
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

// salva payload no Neon sem derrubar fluxo
async function safeLog(obj) {
  try {
    await ensureLogTable();
    const client = await pool.connect();
    try {
      await client.query(`INSERT INTO webhook_logs (payload) VALUES ($1)`, [obj]);
    } finally {
      client.release();
    }
  } catch (_) {}
}

async function ensureLogTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id BIGSERIAL PRIMARY KEY,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  } finally {
    client.release();
  }
}
