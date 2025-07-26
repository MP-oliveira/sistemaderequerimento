async function loginAdmin() {
  try {
    console.log('🔐 Fazendo login do admin através da API...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@igreja.com',
        password: 'admin123'
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Erro ao fazer login:', error);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Login realizado com sucesso!');
    console.log('👤 Usuário:', data.data.user.email);
    console.log('🆔 ID:', data.data.user.id);
    console.log('🔑 Token:', data.data.token);
    
    console.log('\n🎯 Para usar no frontend, copie este token:');
    console.log(data.data.token);
    
    // Testar se o token funciona
    console.log('\n🧪 Testando token...');
    const testResponse = await fetch('http://localhost:3000/api/users', {
      headers: {
        'Authorization': `Bearer ${data.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (testResponse.ok) {
      console.log('✅ Token funcionando corretamente!');
    } else {
      console.log('❌ Token não está funcionando');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

loginAdmin(); 