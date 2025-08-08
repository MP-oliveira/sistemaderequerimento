// backend/scripts/clearInventory.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega sempre backend/.env, independente do cwd
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidas. Verifique backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: true, persistSession: false, detectSessionInUrl: false }
});

async function clearTable(name) {
  console.log(`🗑️ Apagando tabela: ${name}...`);
  let { error } = await supabase.from(name).delete().gte('id', '00000000-0000-0000-0000-000000000000');
  if (error) {
    console.warn(`⚠️ Falhou com gte em ${name}, tentando alternativa...`);
    ({ error } = await supabase.from(name).delete().neq('id', '00000000-0000-0000-0000-000000000000'));
    if (error) {
      console.error(`❌ Erro ao limpar ${name}:`, error.message || error);
      process.exit(1);
    }
  }
  console.log(`✅ ${name} limpa`);
}

async function clearInventory() {
  console.log('🧹 Limpando inventário (request_items → inventory_history → inventory)...');
  await clearTable('request_items');
  await clearTable('inventory_history');
  await clearTable('inventory');
  console.log('🎉 Inventário zerado com sucesso!');
}

clearInventory();