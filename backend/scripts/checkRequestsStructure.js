import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkRequestsStructure() {
  console.log('🔍 Verificando estrutura das requisições...\n');

  try {
    // Buscar requisições aprovadas (APTO)
    console.log('1. Requisições com status APTO:');
    const { data: approvedRequests, error: approvedError } = await supabase
      .from('requests')
      .select('*')
      .eq('status', 'APTO');

    if (approvedError) {
      console.error('❌ Erro ao buscar requisições aprovadas:', approvedError);
    } else {
      console.log(`✅ Encontradas ${approvedRequests.length} requisições aprovadas`);
      approvedRequests.forEach((req, index) => {
        console.log(`\n${index + 1}. Requisição ID: ${req.id}`);
        console.log(`   Evento: ${req.event_name || 'N/A'}`);
        console.log(`   Status: ${req.status || 'N/A'}`);
        console.log(`   Data início: ${req.start_datetime || 'N/A'}`);
        console.log(`   Data fim: ${req.end_datetime || 'N/A'}`);
        console.log(`   Local: ${req.location || 'N/A'}`);
        console.log(`   Público esperado: ${req.expected_audience || 'N/A'}`);
        console.log(`   Departamento: ${req.department || 'N/A'}`);
      });
    }

    // Buscar todas as requisições para ver os status disponíveis
    console.log('\n2. Todos os status disponíveis:');
    const { data: allRequests, error: allError } = await supabase
      .from('requests')
      .select('status');

    if (allError) {
      console.error('❌ Erro ao buscar todas as requisições:', allError);
    } else {
      const statuses = [...new Set(allRequests.map(req => req.status))];
      console.log('📋 Status encontrados:', statuses);
      
      statuses.forEach(status => {
        const count = allRequests.filter(req => req.status === status).length;
        console.log(`   ${status}: ${count} requisições`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkRequestsStructure(); 