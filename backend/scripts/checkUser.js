import { supabase } from '../src/config/supabaseClient.js';

async function checkUser() {
  try {
    console.log('🔍 Verificando usuário admin...');
    
    // Buscar usuário admin
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@igreja.com')
      .single();

    if (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      return;
    }

    if (!user) {
      console.log('❌ Usuário admin não encontrado!');
      return;
    }

    console.log('✅ Usuário admin encontrado:');
    console.log('📧 Email:', user.email);
    console.log('👤 Nome:', user.full_name);
    console.log('🔑 Role:', user.role);
    console.log('🆔 ID:', user.id);
    console.log('📅 Criado em:', user.created_at);
    console.log('');
    console.log('📋 Todos os campos:');
    console.log(JSON.stringify(user, null, 2));

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
checkUser(); 