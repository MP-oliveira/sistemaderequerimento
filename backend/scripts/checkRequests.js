import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRequests() {
  try {
    console.log('🔍 Verificando requisições no banco de dados...');
    
    const { data: requests, error } = await supabase
      .from('requests')
      .select('*');
    
    if (error) {
      console.error('❌ Erro ao buscar requisições:', error);
      return;
    }
    
    console.log(`✅ Total de requisições encontradas: ${requests.length}`);
    
    if (requests.length > 0) {
      console.log('\n📋 Requisições:');
      requests.forEach((req, index) => {
        console.log(`${index + 1}. ID: ${req.id}`);
        console.log(`   Evento: ${req.event_name || req.description || 'Sem nome'}`);
        console.log(`   Status: ${req.status || 'Sem status'}`);
        console.log(`   Departamento: ${req.department || 'Sem departamento'}`);
        console.log(`   Data: ${req.date || req.start_datetime || 'Sem data'}`);
        console.log('---');
      });
      
      // Contar por status
      const statusCount = {};
      requests.forEach(req => {
        const status = req.status || 'SEM_STATUS';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      console.log('\n📊 Distribuição por Status:');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
      
    } else {
      console.log('📭 Nenhuma requisição encontrada no banco de dados.');
      console.log('💡 Para testar, crie algumas requisições através do frontend.');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkRequests(); 