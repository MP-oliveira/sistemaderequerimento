// Script de teste para validar conflitos
const API_URL = 'http://localhost:3000';

async function testarValidacao() {
  console.log('🧪 Testando validação de conflitos...\n');

  // Simular dados de teste
  const dadosTeste = {
    date: '2024-01-15',
    location: 'Sala de Reunião',
    start_time: '14:00',
    end_time: '16:00'
  };

  try {
    const response = await fetch(`${API_URL}/api/requests/check-realtime-conflicts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SEU_TOKEN_AQUI' // Substitua por um token válido
      },
      body: JSON.stringify(dadosTeste)
    });

    if (!response.ok) {
      console.log('❌ Erro na requisição:', response.status, response.statusText);
      return;
    }

    const resultado = await response.json();
    console.log('✅ Resposta da validação:');
    console.log('- Tem conflito:', resultado.temConflito);
    console.log('- Mensagem:', resultado.message);
    console.log('- Conflitos encontrados:', resultado.conflitos?.length || 0);
    console.log('- Horários sugeridos:', resultado.horariosDisponiveis?.length || 0);
    
    if (resultado.conflitos && resultado.conflitos.length > 0) {
      console.log('\n📋 Detalhes dos conflitos:');
      resultado.conflitos.forEach((conflito, index) => {
        console.log(`${index + 1}. ${conflito.tipo}: ${conflito.nome} (${conflito.inicio} - ${conflito.fim})`);
      });
    }

    if (resultado.horariosDisponiveis && resultado.horariosDisponiveis.length > 0) {
      console.log('\n🕐 Horários sugeridos:');
      resultado.horariosDisponiveis.forEach((horario, index) => {
        console.log(`${index + 1}. ${horario.inicio} - ${horario.fim}`);
      });
    }

  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testarValidacao(); 