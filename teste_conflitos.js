// Script de teste para verificar validações de conflito
const API_URL = 'http://localhost:3000';

// Simular token de autenticação (você precisará de um token válido)
const token = 'SEU_TOKEN_AQUI'; // Substitua por um token válido

async function testarConflitos() {
  console.log('🧪 Testando validações de conflito...\n');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Teste 1: Verificar conflitos
  console.log('1️⃣ Testando verificação de conflitos...');
  
  const dadosTeste = {
    location: 'Sala de Reunião',
    start_datetime: '2024-01-15T14:00:00',
    end_datetime: '2024-01-15T16:00:00'
  };

  try {
    const response = await fetch(`${API_URL}/api/requests/check-conflicts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(dadosTeste)
    });

    const resultado = await response.json();
    console.log('✅ Resposta da verificação de conflitos:', resultado);
  } catch (error) {
    console.log('❌ Erro na verificação de conflitos:', error.message);
  }

  // Teste 2: Tentar criar requisição com conflito
  console.log('\n2️⃣ Testando criação de requisição com conflito...');
  
  const requisiçãoComConflito = {
    department: 'Teste',
    event_name: 'Teste de Conflito',
    date: '2024-01-15',
    location: 'Sala de Reunião',
    description: 'Teste de validação de conflito',
    start_datetime: '2024-01-15T14:00:00',
    end_datetime: '2024-01-15T16:00:00',
    expected_audience: '10 pessoas',
    prioridade: 'Média'
  };

  try {
    const response = await fetch(`${API_URL}/api/requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requisiçãoComConflito)
    });

    const resultado = await response.json();
    console.log('✅ Resposta da criação de requisição:', resultado);
  } catch (error) {
    console.log('❌ Erro na criação de requisição:', error.message);
  }
}

// Executar teste
testarConflitos().catch(console.error); 