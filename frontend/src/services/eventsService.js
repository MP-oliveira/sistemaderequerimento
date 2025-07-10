const API_URL = 'http://localhost:3000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function listarEventos() {
  try {
    const response = await fetch(`${API_URL}/api/events`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar eventos');
    }
    
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
}

export async function criarEvento({ name, location, start_datetime, end_datetime, description, expected_audience }) {
  try {
    const eventData = { 
      name, 
      location, 
      start_datetime, 
      end_datetime, 
      description, 
      expected_audience 
    };
    
    console.log('🔍 Enviando dados para API:', eventData);
    
    const response = await fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    
    console.log('🔍 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro da API:', errorData);
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Evento criado com sucesso:', result);
    return result;
  } catch (err) {
    console.error('❌ Erro ao criar evento:', err);
    throw err;
  }
}

// Mock de eventos para desenvolvimento
export function getMockEvents() {
  return [
    { id: 1, titulo: 'Culto de Domingo', data: '2024-01-15', tipo: 'evento', descricao: 'Culto dominical' },
    { id: 2, titulo: 'Reunião de Jovens', data: '2024-01-18', tipo: 'evento', descricao: 'Encontro dos jovens' },
    { id: 3, titulo: 'Ensaio do Coral', data: '2024-01-20', tipo: 'evento', descricao: 'Ensaio do coral da igreja' },
    { id: 4, titulo: 'Estudo Bíblico', data: '2024-01-22', tipo: 'evento', descricao: 'Estudo bíblico semanal' },
    { id: 5, titulo: 'Reunião de Oração', data: '2024-01-25', tipo: 'evento', descricao: 'Momento de oração' },
    { id: 6, titulo: 'Culto de Domingo', data: '2024-01-29', tipo: 'evento', descricao: 'Culto dominical' },
    { id: 7, titulo: 'Reunião de Líderes', data: '2024-02-01', tipo: 'evento', descricao: 'Reunião da liderança' },
    { id: 8, titulo: 'Ensaio do Coral', data: '2024-02-03', tipo: 'evento', descricao: 'Ensaio do coral da igreja' },
  ];
} 