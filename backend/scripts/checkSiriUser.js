import { supabase } from '../src/config/supabaseClient.js';

async function checkSiriUser() {
  try {
    console.log('🔍 Verificando usuário siri@email.com...');
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'siri@email.com')
      .single();
    
    if (error) {
      console.log('❌ Erro ao buscar usuário:', error);
      return;
    }
    
    if (!user) {
      console.log('❌ Usuário siri@email.com não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:');
    console.log('📧 Email:', user.email);
    console.log('👤 Nome:', user.full_name);
    console.log('🔑 Role:', user.role);
    console.log('🆔 ID:', user.id);
    console.log('📅 Criado em:', user.created_at);
    console.log('✅ Ativo:', user.is_active);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkSiriUser(); 