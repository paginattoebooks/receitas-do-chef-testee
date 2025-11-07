// api/login.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',           // seu usuário do PostgreSQL
  host: 'localhost',          // cuidado: em produção precisa ser o host do servidor, não o seu PC
  database: 'top_receitas',
  password: '123456', // troque pela senha do Postgres
  port: 5432,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const result = await pool.query(
      'SELECT id, email FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // login ok
    return res.status(200).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro interno ao tentar logar' });
  }
}
