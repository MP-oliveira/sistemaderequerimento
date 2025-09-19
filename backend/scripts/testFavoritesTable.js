import { supabaseAdmin } from '../src/config/supabaseClient.js';

async function testFavoritesTable() {
  try {
    console.log('🔍 Testando tabela favorites...');
    
    // Testar se a tabela existe
    const { data, error } = await supabaseAdmin
      .from('favorites')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao acessar tabela favorites:', error);
    } else {
      console.log('✅ Tabela favorites acessível!');
      console.log('📊 Dados encontrados:', data);
    }
    
    // Testar inserção
    const testData = {
      user_id: '98270d3b-ef3b-42e0-85b5-b75a4ddc0d4c',
      request_id: 'test-request-id',
      custom_name: 'Teste',
      description: 'Teste de inserção'
    };
    
    console.log('🔄 Testando inserção...');
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('favorites')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error('❌ Erro ao inserir:', insertError);
    } else {
      console.log('✅ Inserção bem-sucedida!');
      console.log('📊 Dados inseridos:', insertData);
      
      // Limpar dados de teste
      if (insertData && insertData[0]) {
        await supabaseAdmin
          .from('favorites')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Dados de teste removidos');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testFavoritesTable();
