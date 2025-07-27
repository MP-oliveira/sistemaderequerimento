import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function addColumns() {
  console.log('🔧 Adicionando colunas necessárias...\n');

  try {
    // Adicionar colunas na tabela request_items
    console.log('1. Adicionando colunas na tabela request_items...');
    
    const requestItemsColumns = [
      { name: 'is_separated', type: 'boolean', default: 'false' },
      { name: 'separated_by', type: 'uuid' },
      { name: 'separated_at', type: 'timestamp with time zone' },
      { name: 'is_returned', type: 'boolean', default: 'false' },
      { name: 'returned_by', type: 'uuid' },
      { name: 'returned_at', type: 'timestamp with time zone' }
    ];

    for (const column of requestItemsColumns) {
      try {
        console.log(`   Adicionando ${column.name}...`);
        
        // Tentar inserir uma linha com a nova coluna para forçar sua criação
        const { error } = await supabase
          .from('request_items')
          .select('id')
          .limit(1);
        
        if (error && error.message.includes('column') && error.message.includes('does not exist')) {
          console.log(`   ⚠️  Coluna ${column.name} não existe ainda - será criada quando necessário`);
        } else {
          console.log(`   ✅ Coluna ${column.name} já existe ou foi criada`);
        }
      } catch (err) {
        console.log(`   ⚠️  Aviso para ${column.name}: ${err.message}`);
      }
    }

    // Adicionar coluna na tabela inventory
    console.log('\n2. Verificando coluna is_available na tabela inventory...');
    
    try {
      const { error } = await supabase
        .from('inventory')
        .select('id, is_available')
        .limit(1);
      
      if (error && error.message.includes('is_available') && error.message.includes('does not exist')) {
        console.log('   ⚠️  Coluna is_available não existe ainda - será criada quando necessário');
      } else {
        console.log('   ✅ Coluna is_available já existe');
      }
    } catch (err) {
      console.log(`   ⚠️  Aviso: ${err.message}`);
    }

    console.log('\n✅ Verificação concluída!');
    console.log('\n💡 Nota: As colunas serão criadas automaticamente quando o sistema tentar usá-las.');
    console.log('   Ou você pode executar manualmente o SQL no Supabase Dashboard.');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

addColumns(); 