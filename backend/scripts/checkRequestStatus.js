import { supabase } from '../src/config/supabaseClient.js';

async function checkRequestStatus() {
  try {
    console.log('🔍 Verificando status das requisições...\n');

    // Buscar todas as requisições
    const { data: requests, error } = await supabase
      .from('requests')
      .select('id, event_name, description, status, department, date')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.log('❌ Erro ao buscar requisições:', error.message);
      return;
    }

    console.log(`✅ Encontradas ${requests.length} requisições:`);
    requests.forEach((req, index) => {
      console.log(`   ${index + 1}. ID: ${req.id}`);
      console.log(`      Nome: ${req.event_name || req.description || 'Sem nome'}`);
      console.log(`      Status: ${req.status}`);
      console.log(`      Departamento: ${req.department}`);
      console.log(`      Data: ${req.date}`);
      console.log('');
    });

    // Verificar requisições que podem ser aprovadas
    const aprovaveis = requests.filter(req => 
      ['PENDENTE', 'PENDENTE_CONFLITO'].includes(req.status)
    );

    console.log(`📋 Requisições que podem ser aprovadas: ${aprovaveis.length}`);
    aprovaveis.forEach((req, index) => {
      console.log(`   ${index + 1}. ID: ${req.id} - Status: ${req.status}`);
    });

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

checkRequestStatus(); 