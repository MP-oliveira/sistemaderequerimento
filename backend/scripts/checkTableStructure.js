import { supabase } from '../src/config/supabaseClient.js';

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela requests...\n');

    // Tentar buscar uma requisição com todas as colunas
    const { data: request, error } = await supabase
      .from('requests')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.log('❌ Erro ao buscar requisição:', error.message);
      return;
    }

    console.log('✅ Estrutura da tabela requests:');
    console.log('📋 Colunas disponíveis:');
    
    Object.keys(request).forEach((column, index) => {
      console.log(`   ${index + 1}. ${column}: ${typeof request[column]} (${request[column]})`);
    });

    console.log('\n🔍 Verificando colunas específicas...');
    
    const specificColumns = [
      'returned_at',
      'returned_by', 
      'return_notes',
      'executed_at',
      'executed_by',
      'approved_at',
      'approved_by'
    ];

    for (const column of specificColumns) {
      if (request.hasOwnProperty(column)) {
        console.log(`   ✅ ${column}: ${request[column]}`);
      } else {
        console.log(`   ❌ ${column}: NÃO EXISTE`);
      }
    }

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

checkTableStructure(); 