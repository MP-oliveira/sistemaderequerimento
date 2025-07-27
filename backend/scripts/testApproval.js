import { supabase } from '../src/config/supabaseClient.js';

async function testApproval() {
  try {
    console.log('🧪 Testando aprovação de requisição...\n');

    // Buscar uma requisição com status PENDENTE
    const { data: requests, error } = await supabase
      .from('requests')
      .select('*')
      .eq('status', 'PENDENTE')
      .limit(1)
      .single();

    if (error || !requests) {
      console.log('❌ Nenhuma requisição PENDENTE encontrada');
      return;
    }

    console.log('✅ Requisição encontrada:');
    console.log(`   ID: ${requests.id}`);
    console.log(`   Status: ${requests.status}`);
    console.log(`   Departamento: ${requests.department}`);
    console.log(`   Descrição: ${requests.description || 'Sem descrição'}`);

    // Simular aprovação
    const statusHistory = requests.status_history || [];
    statusHistory.push({
      status: 'APTO',
      date: new Date().toISOString(),
      user_id: 'test-user-id',
      user_name: 'Test User',
      reason: 'Teste de aprovação'
    });

    const { data: updatedRequest, error: updateError } = await supabase
      .from('requests')
      .update({
        status: 'APTO',
        approved_by: 'test-user-id',
        approved_at: new Date().toISOString(),
        status_history: statusHistory
      })
      .eq('id', requests.id)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Erro ao aprovar requisição:', updateError.message);
      return;
    }

    console.log('✅ Requisição aprovada com sucesso!');
    console.log(`   Novo status: ${updatedRequest.status}`);
    console.log(`   Aprovado em: ${updatedRequest.approved_at}`);

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testApproval(); 