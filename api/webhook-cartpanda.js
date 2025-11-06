// api/webhook-cartpanda.js
import { createClient } from '@supabase/supabase-js';

// Configurações (coloque isso nas variáveis de ambiente da Vercel)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const evento = req.body;

    const email = evento?.customer?.email;
    const cpf = evento?.customer?.document; // se quiser ainda guardar depois
    const produtos = evento?.items || [];

    if (!email) {
      return res.status(400).json({ error: 'Email não encontrado' });
    }

    // 🔐 SENHA PADRÃO FIXA PARA TODOS
    const senhaTemporaria = '123456';

    // 1️⃣ Cria usuário no Supabase (ou ignora se já existir)
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email,
      password: senhaTemporaria,
      email_confirm: true,
    });

    if (userError && !userError.message.includes('already exists')) {
      console.error('Erro ao criar usuário:', userError);
      throw userError;
    }

    // 2️⃣ Mapeia produtos → categorias
    const mapaCategorias = {
      'SKU_AIRFRYER': [0],
      'SKU_DOCES': [1],
      'SKU_BOLOS': [3],
      'SKU_MOLHOS': [5],
      'SKU_SUSHI': [6],
      'SKU_FIT': [7],
      'SKU_JANTAR': [8],
      'SKU_DOMINGO': [9],
    };

    const categoriasLiberadas = new Set();
    produtos.forEach((p) => {
      const sku = p.sku || p.title || '';
      const categorias = mapaCategorias[sku] || [];
      categorias.forEach((c) => categoriasLiberadas.add(c));
    });

    // pega o id do usuário (da tabela profiles ou do auth)
    const { data: foundUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    const userId = foundUser?.id || user?.user?.id;

    // 3️⃣ Grava os acessos na tabela access_levels
    for (const categoria of categoriasLiberadas) {
      const { error: accessError } = await supabase.from('access_levels').upsert({
        user_id: userId,
        category_id: categoria,
        granted_at: new Date().toISOString(),
      });

      if (accessError) {
        console.error('Erro ao salvar access_levels:', accessError);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Erro geral no webhook:', err);
    return res.status(500).json({ error: 'Erro ao processar webhook' });
  }
}




