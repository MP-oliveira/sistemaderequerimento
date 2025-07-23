import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error } = await supabase.from('departments').select('*').limit(1);
  if (error) {
    console.error('Erro ao conectar no Supabase:', error.message);
  } else {
    console.log('Conexão bem-sucedida! Exemplo de dado:', data);
  }
}

test(); 