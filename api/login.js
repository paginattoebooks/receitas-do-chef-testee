import pool from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const emailNormalizado = email.toLowerCase().trim();

  try {
    const result = await pool.query(
      'SELECT id, email FROM users WHERE email = $1 AND password = $2 LIMIT 1',
      [emailNormalizado, password]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const user = result.rows[0];

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno ao tentar fazer login.' });
  }
}

