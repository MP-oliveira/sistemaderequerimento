import bcrypt from 'bcryptjs';
import { supabase } from '../src/config/supabaseClient.js';

async function testSiriPassword() {
  try {
    console.log('🔍 Testando senha do usuário siri@email.com...');
    
    // Buscar usuário
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('email', 'siri@email.com')
      .single();
    
    if (error || !user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('🔑 Hash da senha no banco:', user.password_hash);
    
    // Testar senha "123456"
    const isPasswordValid = await bcrypt.compare('123456', user.password_hash);
    console.log('✅ Senha "123456" é válida:', isPasswordValid);
    
    // Testar outras senhas comuns
    const testPasswords = ['123456', 'password', 'admin', 'siri', '123'];
    for (const password of testPasswords) {
      const isValid = await bcrypt.compare(password, user.password_hash);
      console.log(`🔍 Senha "${password}": ${isValid ? '✅ VÁLIDA' : '❌ inválida'}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testSiriPassword(); 