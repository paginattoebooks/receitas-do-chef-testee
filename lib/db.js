// db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',          // seu usuário do PostgreSQL
  host: 'localhost',         // endereço do banco
  database: 'top_receitas',  // nome do banco
  password: '123456', // senha do seu PostgreSQL
  port: 5432,                // porta padrão do PostgreSQL
});

export default pool;
