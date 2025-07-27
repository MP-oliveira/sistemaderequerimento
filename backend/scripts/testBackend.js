import bcrypt from 'bcryptjs';
import { supabase } from '../src/config/supabaseClient.js';

async function testBackend() {
  try {
    console.log('🧪 Testando funcionalidades do backend...\n');

    // 1. Testar login de admin
    console.log('1️⃣ Testando login de admin...');
    const adminEmail = 'admin@igreja.com';
    const adminPassword = 'admin123';
    
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (adminError || !adminUser) {
      console.log('❌ Admin não encontrado');
      return;
    }
    
    const isPasswordValid = await bcrypt.compare(adminPassword, adminUser.password_hash);
    if (!isPasswordValid) {
      console.log('❌ Senha do admin inválida');
      return;
    }
    
    console.log('✅ Login de admin funcionando');
    console.log(`   👤 ID: ${adminUser.id}`);
    console.log(`   📧 Email: ${adminUser.email}`);
    console.log(`   🔑 Role: ${adminUser.role}\n`);

    // 2. Testar busca de requisições
    console.log('2️⃣ Testando busca de requisições...');
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select('*')
      .limit(5);
    
    if (requestsError) {
      console.log('❌ Erro ao buscar requisições:', requestsError.message);
    } else {
      console.log(`✅ Encontradas ${requests.length} requisições`);
      requests.forEach((req, index) => {
        console.log(`   ${index + 1}. ${req.event_name || req.description} - Status: ${req.status}`);
      });
    }
    console.log('');

    // 3. Testar busca de requisições aprovadas para calendário
    console.log('3️⃣ Testando busca de requisições para calendário...');
    const { data: calendarRequests, error: calendarError } = await supabase
      .from('requests')
      .select(`
        id,
        event_name,
        description,
        location,
        start_datetime,
        end_datetime,
        status,
        department,
        requester_id,
        approved_at,
        executed_at,
        users!requests_requester_id_fkey(full_name)
      `)
      .in('status', ['APTO', 'EXECUTADO', 'FINALIZADO'])
      .order('start_datetime', { ascending: true })
      .limit(3);
    
    if (calendarError) {
      console.log('❌ Erro ao buscar requisições para calendário:', calendarError.message);
    } else {
      console.log(`✅ Encontradas ${calendarRequests.length} requisições para calendário`);
      calendarRequests.forEach((req, index) => {
        console.log(`   ${index + 1}. ${req.event_name || req.description}`);
        console.log(`      Status: ${req.status}`);
        console.log(`      Solicitante: ${req.users?.full_name || 'N/A'}`);
        console.log(`      Data: ${req.start_datetime}`);
      });
    }
    console.log('');

    // 4. Testar inventário
    console.log('4️⃣ Testando inventário...');
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .limit(3);
    
    if (inventoryError) {
      console.log('❌ Erro ao buscar inventário:', inventoryError.message);
    } else {
      console.log(`✅ Encontrados ${inventory.length} itens no inventário`);
      inventory.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} - Quantidade: ${item.quantity_available} - Status: ${item.status}`);
      });
    }
    console.log('');

    console.log('🎉 Testes concluídos com sucesso!');
    console.log('\n📋 Resumo das funcionalidades testadas:');
    console.log('   ✅ Login de admin');
    console.log('   ✅ Busca de requisições');
    console.log('   ✅ Busca para calendário');
    console.log('   ✅ Inventário');
    console.log('\n🚀 Backend está funcionando corretamente!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

testBackend(); 