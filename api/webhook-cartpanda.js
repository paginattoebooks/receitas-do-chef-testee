// api/webhook-cartpanda.js
import pkg from 'pg';
const { Pool } = pkg;

// 🔗 Conexão com seu banco PostgreSQL local
const pool = new Pool({
  user: 'postgres',          // seu usuário do PostgreSQL
  host: 'localhost',         // endereço do banco
  database: 'top_receitas',  // nome do banco que criamos
  password: 'sua_senha_aqui', // coloque a senha do PostgreSQL
  port: 5432,                // porta padrão do PostgreSQL
});

// Função handler padrão do Vercel
export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Método não permitido' });

  try {
    const evento = req.body;

    const email = evento?.customer?.email;
    const produtos = evento?.items || [];

    if (!email) {
      return res.status(400).json({ error: 'Email não encontrado' });
    }

    const senhaPadrao = '123456';

    // 🔹 1. Verifica se o usuário já existe
    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    let userId;
    if (users.length > 0) {
      userId = users[0].id;
    } else {
      // 🔹 2. Cria novo usuário
      const result = await pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
        [email, senhaPadrao]
      );
      userId = result.rows[0].id;
    }

    // 🔹 3. Mapa dos produtos → categorias (ajuste conforme seu CartPanda)
    const mapaCategorias = {
      'SKU_AIRFRYER': 1,
      'SKU_DOCES': 2,
      'SKU_BOLOS': 3,
      'SKU_MOLHOS': 4,
      'SKU_SUSHI': 5,
      'SKU_FIT': 6,
      'SKU_JANTAR': 7,
      'SKU_DOMINGO': 8,
    };

    const categoriasLiberadas = new Set();
    produtos.forEach(p => {
      const sku = p.sku || p.title || '';
      const categoriaId = mapaCategorias[sku];
      if (categoriaId) categoriasLiberadas.add(categoriaId);
    });

    // 🔹 4. Insere os acessos liberados
    for (const categoriaId of categoriasLiberadas) {
      await pool.query(
        `
        INSERT INTO access_levels (user_id, category_id, granted_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT DO NOTHING;
        `,
        [userId, categoriaId]
      );
    }

    console.log(`✅ Usuário ${email} atualizado com sucesso!`);
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ Erro no webhook:', err);
    return res.status(500).json({ error: 'Erro ao processar webhook' });
  }
}
