const API_URL = 'http://localhost:3000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function criarRequisicao({ descricao, data, itens }) {
  try {
    const response = await fetch(`${API_URL}/api/requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ descricao, data, itens }),
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