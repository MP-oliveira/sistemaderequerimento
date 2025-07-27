import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkTableStructure() {
  console.log('🔍 Verificando estrutura das tabelas...\n');

  try {
    // Verificar estrutura da tabela requests
    console.log('1. Estrutura da tabela requests:');
    const { data: requestsData, error: requestsError } = await supabase
      .from('requests')
      .select('*')
      .limit(1);

    if (requestsError) {
      console.error('❌ Erro ao verificar requests:', requestsError);
    } else {
      console.log('✅ Colunas da tabela requests:');
      if (requestsData.length > 0) {
        Object.keys(requestsData[0]).forEach(column => {
          console.log(`   - ${column}`);
        });
      } else {
        console.log('   Tabela vazia');
      }
    }

    console.log('\n2. Estrutura da tabela request_items:');
    const { data: itemsData, error: itemsError } = await supabase
      .from('request_items')
      .select('*')
      .limit(1);

    if (itemsError) {
      console.error('❌ Erro ao verificar request_items:', itemsError);
    } else {
      console.log('✅ Colunas da tabela request_items:');
      if (itemsData.length > 0) {
        Object.keys(itemsData[0]).forEach(column => {
          console.log(`   - ${column}`);
        });
      } else {
        console.log('   Tabela vazia');
      }
    }

    console.log('\n3. Estrutura da tabela inventory:');
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .limit(1);

    if (inventoryError) {
      console.error('❌ Erro ao verificar inventory:', inventoryError);
    } else {
      console.log('✅ Colunas da tabela inventory:');
      if (inventoryData.length > 0) {
        Object.keys(inventoryData[0]).forEach(column => {
          console.log(`   - ${column}`);
        });
      } else {
        console.log('   Tabela vazia');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkTableStructure(); 