const API_URL = 'http://localhost:3000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function criarRequisicao({ department, descricao, data, event_id, itens }) {
  try {
    const response = await fetch(`${API_URL}/api/requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ department, description: descricao, date: data, event_id, itens }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar requisição');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

export async function listarRequisicoes() {
  try {
    const response = await fetch(`${API_URL}/api/requests`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Erro ao buscar requisições');
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
}

export async function aprovarRequisicao(id) {
  try {
    const response = await fetch(`${API_URL}/api/requests/${id}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao aprovar requisição');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

export async function executarRequisicao(id) {
  try {
    const response = await fetch(`${API_URL}/api/requests/${id}/execute`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao executar requisição');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

export async function finalizarRequisicao(id, itensDevolvidos) {
  try {
    const response = await fetch(`${API_URL}/api/requests/${id}/finish`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ itensDevolvidos }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao finalizar requisição');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
} 