import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetCompleto() {
  console.log('🔥 RESET COMPLETO DO BANCO...');
  
  try {
    // Lista completa de todas as tabelas
    const todasTabelas = [
      'request_items',
      'requests', 
      'inventory',
      'event_history',
      'events',
      'users',
      'departments',
      'comprovantes'
    ];
    
    console.log('🗑️ Limpando TODAS as tabelas...');
    
    for (const tabela of todasTabelas) {
      console.log(`🗑️ Limpando ${tabela}...`);
      
      // Primeiro, contar quantos registros existem
      const { count, error: countError } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.log(`⚠️ Não foi possível contar ${tabela}:`, countError.message);
      } else {
        console.log(`   📊 ${tabela}: ${count} registros encontrados`);
      }
      
      // Deletar TODOS os registros (sem filtro)
      const { error: deleteError } = await supabase
        .from(tabela)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (deleteError) {
        console.log(`⚠️ Erro ao limpar ${tabela}:`, deleteError.message);
        
        // Tentar deletar com filtro diferente
        const { error: deleteError2 } = await supabase
          .from(tabela)
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000');
          
        if (deleteError2) {
          console.log(`❌ Falha total ao limpar ${tabela}:`, deleteError2.message);
        } else {
          console.log(`✅ ${tabela} limpa (tentativa 2)`);
        }
      } else {
        console.log(`✅ ${tabela} limpa`);
      }
    }
    
    console.log('🎉 RESET COMPLETO CONCLUÍDO!');
    console.log('');
    console.log('📋 Agora execute: node reset_database.js');
    
  } catch (error) {
    console.error('❌ Erro durante reset:', error);
  }
}

resetCompleto(); 