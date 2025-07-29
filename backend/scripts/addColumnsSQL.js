import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addColumnsSQL() {
  try {
    console.log('🔧 Adicionando colunas de checklist via SQL...');

    // Verificar se as colunas já existem
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'request_items')
      .eq('table_schema', 'public');

    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError);
      return;
    }

    const existingColumns = columns.map(col => col.column_name);
    console.log('📋 Colunas existentes:', existingColumns);

    // Adicionar colunas se não existirem
    const columnsToAdd = [
      'unavailable_reason',
      'item_status', 
      'audiovisual_notes',
      'separation_datetime'
    ];

    for (const columnName of columnsToAdd) {
      if (!existingColumns.includes(columnName)) {
        console.log(`➕ Adicionando coluna: ${columnName}`);
        
        // Para Supabase, você pode usar SQL direto
        const { error } = await supabase
          .from('request_items')
          .select('id')
          .limit(1);
        
        if (error) {
          console.log(`ℹ️ Erro ao verificar tabela: ${error.message}`);
        } else {
          console.log(`✅ Coluna ${columnName} pode ser adicionada manualmente`);
        }
      } else {
        console.log(`ℹ️ Coluna ${columnName} já existe`);
      }
    }

    console.log('🎉 Processo concluído!');
    console.log('💡 Para adicionar as colunas, execute no Supabase SQL Editor:');
    console.log(`
ALTER TABLE request_items ADD COLUMN IF NOT EXISTS unavailable_reason TEXT;
ALTER TABLE request_items ADD COLUMN IF NOT EXISTS item_status VARCHAR(20) DEFAULT 'PENDENTE';
ALTER TABLE request_items ADD COLUMN IF NOT EXISTS audiovisual_notes TEXT;
ALTER TABLE request_items ADD COLUMN IF NOT EXISTS separation_datetime TIMESTAMP WITH TIME ZONE;
    `);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

addColumnsSQL(); 