import { supabase } from '../src/config/supabaseClient.js';
import bcrypt from 'bcryptjs';

async function editMidiaUser() {
  try {
    console.log('🔧 Editando usuário midia@ibva.com.br...');
    
    const email = 'midia@ibva.com.br';
    const password = '123456';
    const role = 'AUDIOVISUAL';

    // Verificar se o usuário já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('⚠️ Usuário encontrado! Atualizando senha...');
      
      // Fazer hash da nova senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Atualizar no banco de dados
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: hashedPassword
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar usuário:', updateError);
        return;
      }

      console.log('✅ Usuário atualizado com sucesso!');
      console.log('📧 Email:', updatedUser.email);
      console.log('🔑 Role:', updatedUser.role);
      console.log('');
      console.log('🚀 Use estas credenciais para fazer login:');
      console.log('   Email: midia@ibva.com.br');
      console.log('   Senha: 123456');
      return;
    }

    console.log('❌ Usuário não encontrado no banco de dados!');
    console.log('📧 Email procurado:', email);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
editMidiaUser();
