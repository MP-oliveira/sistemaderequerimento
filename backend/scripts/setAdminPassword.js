import { supabase } from '../src/config/supabaseClient.js';
import bcrypt from 'bcrypt';

async function setAdminPassword() {
  try {
    console.log('🔧 Definindo senha para o usuário admin...');
    
    // Senha que queremos definir
    const newPassword = 'admin123';
    
    // Criar hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha do admin
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        password_hash: hashedPassword
      })
      .eq('email', 'admin@igreja.com')
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar senha:', error);
      return;
    }

    console.log('✅ Senha do admin atualizada com sucesso!');
    console.log('📧 Email:', updatedUser.email);
    console.log('🔑 Nova senha:', newPassword);
    console.log('');
    console.log('🚀 Use estas credenciais para fazer login:');
    console.log('   Email: admin@igreja.com');
    console.log('   Senha: admin123');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
setAdminPassword(); 