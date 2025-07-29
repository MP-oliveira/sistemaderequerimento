import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addColumnsDirect() {
  try {
    console.log('🔧 Adicionando colunas de checklist diretamente...');

    // Lista de comandos SQL para adicionar as colunas
    const sqlCommands = [
      `ALTER TABLE request_items ADD COLUMN IF NOT EXISTS unavailable_reason TEXT;`,
      `ALTER TABLE request_items ADD COLUMN IF NOT EXISTS item_status VARCHAR(20) DEFAULT 'PENDENTE';`,
      `ALTER TABLE request_items ADD COLUMN IF NOT EXISTS audiovisual_notes TEXT;`,
      `ALTER TABLE request_items ADD COLUMN IF NOT EXISTS separation_datetime TIMESTAMP WITH TIME ZONE;`
    ];

    for (const sql of sqlCommands) {
      console.log(`Executando: ${sql}`);
      
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.log(`ℹ️ Erro ou coluna já existe: ${error.message}`);
      } else {
        console.log('✅ Comando executado com sucesso');
      }
    }

    console.log('🎉 Processo concluído!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

addColumnsDirect(); 