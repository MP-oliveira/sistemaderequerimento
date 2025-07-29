import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addChecklistColumns() {
  try {
    console.log('🔧 Adicionando colunas de checklist na tabela request_items...');

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
      { name: 'unavailable_reason', definition: 'TEXT' },
      { name: 'item_status', definition: 'VARCHAR(20) DEFAULT \'PENDENTE\'' },
      { name: 'audiovisual_notes', definition: 'TEXT' },
      { name: 'separation_datetime', definition: 'TIMESTAMP WITH TIME ZONE' }
    ];

    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`➕ Adicionando coluna: ${column.name}`);
        
        // Para Supabase, você pode adicionar colunas via SQL direto
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE request_items ADD COLUMN ${column.name} ${column.definition}`
        });

        if (error) {
          console.log(`ℹ️ Erro ao adicionar ${column.name}:`, error.message);
        } else {
          console.log(`✅ Coluna ${column.name} adicionada`);
        }
      } else {
        console.log(`ℹ️ Coluna ${column.name} já existe`);
      }
    }

    console.log('🎉 Processo concluído!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

addChecklistColumns(); 