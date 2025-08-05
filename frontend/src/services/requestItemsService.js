const API_URL = 'http://localhost:3000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token de autenticação não encontrado. Faça login novamente.');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Listar itens de uma requisição
export async function listarItensRequisicao(requestId) {
  try {
    const response = await fetch(`${API_URL}/api/request-items/${requestId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao buscar itens da requisição');
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
}

// Listar itens do dia para audiovisual
export async function listarItensDoDia() {
  try {
    const response = await fetch(`${API_URL}/api/request-items/today/audiovisual`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao buscar itens do dia');
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
}

// Listar itens do dia para serviço geral
export async function listarItensDoDiaServicoGeral() {
  try {
    const response = await fetch(`${API_URL}/api/request-items/today/servico-geral`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao buscar itens do dia');
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
}

// Marcar item como separado
export async function marcarItemComoSeparado(itemId, isSeparated) {
  try {
    const response = await fetch(`${API_URL}/api/request-items/${itemId}/separate`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_separated: isSeparated })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao marcar item como separado');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    throw err;
  }
}

// Adicionar item a uma requisição
export async function adicionarItemRequisicao(itemData) {
  try {
    const response = await fetch(`${API_URL}/api/request-items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao adicionar item');
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
}

// Remover item de uma requisição
export async function removerItemRequisicao(itemId) {
  try {
    const response = await fetch(`${API_URL}/api/request-items/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao remover item');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    throw err;
  }
}

export const getExecutedItems = async () => {
  try {
    const response = await fetch(`${API_URL}/api/request-items/executed`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar itens executados');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar itens executados:', error);
    throw error;
  }
};

// Buscar itens executados por categoria
export const getExecutedItemsByCategory = async (category) => {
  try {
    const response = await fetch(`${API_URL}/api/request-items/executed/${category}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar itens executados por categoria');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar itens executados por categoria:', error);
    throw error;
  }
};

export const markItemAsReturned = async (itemId, currentStatus) => {
  try {
    const response = await fetch(`${API_URL}/api/request-items/${itemId}/return`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        is_returned: !currentStatus 
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao marcar item como retornado');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao marcar item como retornado:', error);
    throw error;
  }
}; 