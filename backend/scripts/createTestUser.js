import bcrypt from 'bcryptjs';
import { supabase } from '../src/config/supabaseClient.js';

async function createTestUser() {
  try {
    console.log('🔍 Criando usuário de teste...');
    
    // Dados do usuário de teste
    const testUser = {
      email: 'teste@igreja.com',
      full_name: 'Usuário Teste',
      password: 'teste123',
      role: 'SEC' // Secretário
    };
    
    // Verificar se o usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', testUser.email)
      .single();
    
    if (existingUser) {
      console.log('⚠️ Usuário de teste já existe, atualizando...');
      
      // Atualizar senha
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: hashedPassword,
          role: testUser.role,
          is_active: true
        })
        .eq('email', testUser.email)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Erro ao atualizar usuário:', updateError);
        return;
      }
      
      console.log('✅ Usuário de teste atualizado:');
      console.log('📧 Email:', updatedUser.email);
      console.log('👤 Nome:', updatedUser.full_name);
      console.log('🔑 Role:', updatedUser.role);
      console.log('🆔 ID:', updatedUser.id);
      
    } else {
      // Criar novo usuário
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          email: testUser.email,
          full_name: testUser.full_name,
          password_hash: hashedPassword,
          role: testUser.role,
          is_active: true
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao criar usuário:', error);
        return;
      }
      
      console.log('✅ Usuário de teste criado:');
      console.log('📧 Email:', newUser.email);
      console.log('👤 Nome:', newUser.full_name);
      console.log('🔑 Role:', newUser.role);
      console.log('🆔 ID:', newUser.id);
    }
    
    console.log('\n🔑 Credenciais para teste:');
    console.log('Email: teste@igreja.com');
    console.log('Senha: teste123');
    console.log('Role: SEC (Secretário)');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

createTestUser(); 