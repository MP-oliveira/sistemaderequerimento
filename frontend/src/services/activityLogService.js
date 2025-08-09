const API_URL = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Buscar histórico de um item do inventário
export async function buscarHistoricoInventario(itemId) {
  try {
    const response = await fetch(`${API_URL}/api/inventory/${itemId}/history`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar histórico do inventário');
    }
    
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
}

// Buscar histórico de um evento
export async function buscarHistoricoEvento(eventId) {
  try {
    const response = await fetch(`${API_URL}/api/events/${eventId}/history`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar histórico do evento');
    }
    
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
}

// Buscar histórico de uma requisição
export async function buscarHistoricoRequisicao(requestId) {
  try {
    const response = await fetch(`${API_URL}/api/requests/${requestId}/history`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar histórico da requisição');
    }
    
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
}

// Buscar todos os logs de atividade (para dashboard)
export async function buscarTodosLogs() {
  try {
    const response = await fetch(`${API_URL}/api/activity-logs`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar logs de atividade');
    }
    
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
} 