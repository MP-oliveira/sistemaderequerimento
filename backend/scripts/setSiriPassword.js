import bcrypt from 'bcryptjs';
import { supabase } from '../src/config/supabaseClient.js';

async function setSiriPassword() {
  try {
    console.log('🔍 Definindo senha para usuário siri@email.com...');
    
    // Gerar hash da senha
    const hashedPassword = await bcrypt.hash('123456', 10);
    console.log('🔑 Hash gerado:', hashedPassword);
    
    // Atualizar usuário
    const { data: user, error } = await supabase
      .from('users')
      .update({
        password_hash: hashedPassword
      })
      .eq('email', 'siri@email.com')
      .select('id, email, full_name, role, is_active')
      .single();
    
    if (error) {
      console.log('❌ Erro ao atualizar senha:', error);
      return;
    }
    
    console.log('✅ Senha atualizada com sucesso!');
    console.log('📧 Email:', user.email);
    console.log('👤 Nome:', user.full_name);
    console.log('🔑 Role:', user.role);
    console.log('🆔 ID:', user.id);
    console.log('✅ Ativo:', user.is_active);
    
    console.log('\n🔑 Credenciais:');
    console.log('Email: siri@email.com');
    console.log('Senha: 123456');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

setSiriPassword(); 