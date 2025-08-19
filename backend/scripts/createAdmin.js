import { supabase } from '../src/config/supabaseClient.js';
import bcrypt from 'bcrypt';

async function createAdmin() {
  try {
    console.log('🔧 Criando usuário admin...');
    
    // Dados do admin
    const adminData = {
      email: 'admin@igreja.com',
      full_name: 'Administrador do Sistema',
      role: 'ADM'
    };

    // Verificar se o usuário já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', adminData.email)
      .single();

    if (existingUser) {
      console.log('⚠️ Usuário admin já existe! Atualizando role...');
      
      // Atualizar apenas o role do admin existente
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          role: 'ADM'
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar admin:', updateError);
        return;
      }

      console.log('✅ Admin atualizado com sucesso!');
      console.log('📧 Email:', updatedUser.email);
      console.log('🔑 Role:', updatedUser.role);
      console.log('');
      console.log('🚀 Use estas credenciais para fazer login:');
      console.log('   Email: admin@igreja.com');
      console.log('   Senha: (use a senha atual do usuário)');
      return;
    }

    // Criar hash da senha (senha padrão: 'admin123')
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Inserir novo admin
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        ...adminData,
        password_hash: hashedPassword
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar admin:', insertError);
      return;
    }

    console.log('✅ Admin criado com sucesso!');
    console.log('📧 Email:', newUser.email);
    console.log('🔑 Senha: admin123');
    console.log('👤 Nome:', newUser.full_name);
    console.log('🔑 Role:', newUser.role);
    console.log('');
    console.log('🚀 Use estas credenciais para fazer login:');
    console.log('   Email: admin@igreja.com');
    console.log('   Senha: admin123');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
createAdmin(); 