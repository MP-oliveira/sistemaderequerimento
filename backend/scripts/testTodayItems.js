import { supabase } from '../src/config/supabaseClient.js';

async function testTodayItems() {
  try {
    console.log('🔍 Testando funcionalidade de itens do dia...');
    
    // Verificar se existem requisições aprovadas para hoje
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Data de hoje:', today);
    
    // Buscar requisições aprovadas para hoje
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select('*')
      .eq('status', 'APTO')
      .gte('start_datetime', today + 'T00:00:00')
      .lte('start_datetime', today + 'T23:59:59');
    
    if (requestsError) {
      console.log('❌ Erro ao buscar requisições:', requestsError);
      return;
    }
    
    console.log('📋 Requisições aprovadas para hoje:', requests?.length || 0);
    
    if (requests && requests.length > 0) {
      requests.forEach(req => {
        console.log(`   - ${req.event_name || req.description} (${req.department})`);
      });
    }
    
    // Verificar se existem itens de requisição
    const { data: items, error: itemsError } = await supabase
      .from('request_items')
      .select('*');
    
    if (itemsError) {
      console.log('❌ Erro ao buscar itens:', itemsError);
      return;
    }
    
    console.log('📦 Total de itens de requisição:', items?.length || 0);
    
    if (items && items.length > 0) {
      items.forEach(item => {
        console.log(`   - ${item.item_name} (Qtd: ${item.quantity_requested})`);
      });
    }
    
    // Testar a query completa da API
    const { data: todayItems, error: todayError } = await supabase
      .from('request_items')
      .select(`
        *,
        requests!inner(
          id,
          event_name,
          description,
          department,
          location,
          start_datetime,
          end_datetime,
          status
        )
      `)
      .eq('requests.status', 'APTO')
      .gte('requests.start_datetime', today + 'T00:00:00')
      .lte('requests.start_datetime', today + 'T23:59:59')
      .order('requests.start_datetime', { ascending: true });
    
    if (todayError) {
      console.log('❌ Erro na query completa:', todayError);
      return;
    }
    
    console.log('🎯 Itens do dia encontrados:', todayItems?.length || 0);
    
    if (todayItems && todayItems.length > 0) {
      todayItems.forEach(item => {
        console.log(`   - ${item.item_name} para ${item.requests.event_name || item.requests.description}`);
      });
    } else {
      console.log('⚠️ Nenhum item encontrado para hoje');
      console.log('💡 Isso pode ser porque:');
      console.log('   1. Não há requisições aprovadas para hoje');
      console.log('   2. As requisições não têm itens associados');
      console.log('   3. Os itens não estão na tabela request_items');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testTodayItems(); 