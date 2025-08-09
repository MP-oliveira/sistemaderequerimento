const API_URL = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function listarItensInventario() {
  try {
    const response = await fetch(`${API_URL}/api/inventory`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Erro ao buscar inventário');
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
}

export async function criarItemInventario({ name, category, quantity }) {
  try {
    const response = await fetch(`${API_URL}/api/inventory`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        category,
        quantity_available: quantity,
        quantity_total: quantity
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar item');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
}

export async function atualizarItemInventario(id, { name, category, quantity_available, quantity_total }) {
  try {
    console.log('🔄 [inventoryService] Atualizando item:', id);
    console.log('🔄 [inventoryService] Dados:', { name, category, quantity_available, quantity_total });
    
    const response = await fetch(`${API_URL}/api/inventory/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        category,
        quantity_available,
        quantity_total
      }),
    });
    
    console.log('🔄 [inventoryService] Status da resposta:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ [inventoryService] Erro da API:', error);
      throw new Error(error.message || 'Erro ao atualizar item');
    }
    
    const result = await response.json();
    console.log('✅ [inventoryService] Sucesso:', result);
    return result;
  } catch (err) {
    console.error('❌ [inventoryService] Erro geral:', err);
    throw err;
  }
}

export async function deletarItemInventario(id) {
  try {
    const response = await fetch(`${API_URL}/api/inventory/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao deletar item');
    }
    return await response.json();
  } catch (err) {
    throw err;
  }
} 