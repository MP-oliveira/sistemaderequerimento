import { supabase } from '../src/config/supabaseClient.js';

async function createTestData() {
  try {
    console.log('🔍 Criando dados de teste...');
    
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Data de hoje:', today);
    
    // Criar uma requisição aprovada para hoje
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .insert({
        department: 'Música',
        event_name: 'Culto de Domingo',
        description: 'Culto dominical com apresentação musical',
        location: 'Templo Principal',
        start_datetime: today + 'T19:00:00',
        end_datetime: today + 'T21:00:00',
        status: 'APTO',
        prioridade: 'Alta',
        requester_id: 'b4574127-1ce0-4069-9458-f423d2635f01' // ID do Ulisses
      })
      .select()
      .single();
    
    if (requestError) {
      console.log('❌ Erro ao criar requisição:', requestError);
      return;
    }
    
    console.log('✅ Requisição criada:', request.id);
    
    // Criar itens para a requisição
    const items = [
      {
        request_id: request.id,
        item_name: 'Microfone Shure SM58',
        description: 'Microfone vocal profissional',
        quantity_requested: 2,
        estimated_value: 800.00
      },
      {
        request_id: request.id,
        item_name: 'Projetor Epson',
        description: 'Projetor para apresentações',
        quantity_requested: 1,
        estimated_value: 2500.00
      },
      {
        request_id: request.id,
        item_name: 'Cabo XLR 3m',
        description: 'Cabo para microfone',
        quantity_requested: 4,
        estimated_value: 120.00
      },
      {
        request_id: request.id,
        item_name: 'Tripé para microfone',
        description: 'Suporte para microfone',
        quantity_requested: 2,
        estimated_value: 200.00
      }
    ];
    
    const { data: createdItems, error: itemsError } = await supabase
      .from('request_items')
      .insert(items)
      .select();
    
    if (itemsError) {
      console.log('❌ Erro ao criar itens:', itemsError);
      return;
    }
    
    console.log('✅ Itens criados:', createdItems.length);
    createdItems.forEach(item => {
      console.log(`   - ${item.item_name} (Qtd: ${item.quantity_requested})`);
    });
    
    console.log('🎉 Dados de teste criados com sucesso!');
    console.log('📝 Agora você pode testar o componente "Materiais do Dia"');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

createTestData(); 