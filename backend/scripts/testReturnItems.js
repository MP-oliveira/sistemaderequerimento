import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testReturnItems() {
  console.log('🧪 Testando funcionalidade de retorno de instrumentos...\n');

  try {
    // 1. Verificar se as colunas existem na tabela request_items
    console.log('1. Verificando estrutura da tabela request_items...');
    const { data: columns, error: columnsError } = await supabase
      .from('request_items')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.error('❌ Erro ao verificar estrutura da tabela:', columnsError);
      return;
    }

    console.log('✅ Estrutura da tabela verificada');

    // 2. Buscar itens que foram separados
    console.log('\n2. Buscando itens separados...');
    const { data: separatedItems, error: separatedError } = await supabase
      .from('request_items')
      .select(`
        id,
        request_id,
        inventory_id,
        item_name,
        quantity_requested,
        description,
        inventory (
          name,
          description
        ),
        requests (
          event_name,
          start_datetime,
          end_datetime
        )
      `);

    if (separatedError) {
      console.error('❌ Erro ao buscar itens separados:', separatedError);
      return;
    }

    console.log(`✅ Encontrados ${separatedItems.length} itens`);

    if (separatedItems.length > 0) {
      console.log('\n📋 Itens encontrados:');
      separatedItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.item_name || item.inventory?.name || 'Nome não encontrado'}`);
        console.log(`   Requisição: ${item.requests?.event_name || 'Nome não encontrado'}`);
        console.log(`   Quantidade: ${item.quantity_requested}`);
        console.log('');
      });
    } else {
      console.log('ℹ️  Nenhum item encontrado para teste');
    }

    // 3. Testar marcar um item como retornado
    const firstItem = separatedItems[0];
    if (!firstItem.is_returned) {
      console.log(`3. Testando marcar item como retornado (ID: ${firstItem.id})...`);
      
      const { error: updateError } = await supabase
        .from('request_items')
        .update({
          is_returned: true,
          returned_by: firstItem.separated_by, // Usar o mesmo usuário que separou
          returned_at: new Date().toISOString()
        })
        .eq('id', firstItem.id);

      if (updateError) {
        console.error('❌ Erro ao marcar como retornado:', updateError);
      } else {
        console.log('✅ Item marcado como retornado com sucesso');
      }
    } else {
      console.log('3. Item já foi retornado, pulando teste de retorno');
    }

    // 4. Verificar inventário
    console.log('\n4. Verificando inventário...');
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('id, name, is_available')
      .limit(5);

    if (inventoryError) {
      console.error('❌ Erro ao verificar inventário:', inventoryError);
    } else {
      console.log('✅ Inventário verificado');
      console.log('\n📦 Primeiros 5 itens do inventário:');
      inventory.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} - Disponível: ${item.is_available ? 'Sim' : 'Não'}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testReturnItems(); 