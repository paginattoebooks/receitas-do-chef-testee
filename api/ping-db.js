import pool from '../lib/db.js';

export default async function handler(req, res) {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({ success: true, time: result.rows[0].now });
  } catch (error) {
    console.error('Erro ao conectar no banco:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
