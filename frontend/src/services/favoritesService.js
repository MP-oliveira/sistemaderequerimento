// Em desenvolvimento, usa o proxy do Vite
// Em produção, usa URL relativa para o mesmo domínio
const API_URL = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
}

// Adicionar requerimento aos favoritos
export const addToFavorites = async (requestId, customName = null, description = null) => {
  try {
    const response = await fetch(`${API_URL}/api/favorites`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        request_id: requestId,
        custom_name: customName,
        description: description
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao adicionar aos favoritos');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao adicionar aos favoritos:', error);
    throw error;
  }
};

// Remover requerimento dos favoritos
export const removeFromFavorites = async (requestId) => {
  try {
    const response = await fetch(`${API_URL}/api/favorites?request_id=${requestId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao remover dos favoritos');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao remover dos favoritos:', error);
    throw error;
  }
};

// Listar favoritos do usuário
export const getFavorites = async () => {
  try {
    const response = await fetch(`${API_URL}/api/favorites`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao buscar favoritos');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    throw error;
  }
};

// Verificar se um requerimento está nos favoritos
export const checkFavorite = async (requestId) => {
  try {
    const response = await fetch(`${API_URL}/api/favorites/check?request_id=${requestId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao verificar favorito');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    throw error;
  }
};
