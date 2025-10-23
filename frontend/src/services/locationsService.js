const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Buscar todos os locais
export async function listarLocais() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/locations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar locais: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar locais:', error);
    throw error;
  }
}

// Criar novo local
export async function criarLocal(localData) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/locations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(localData)
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar local: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar local:', error);
    throw error;
  }
}

// Atualizar local
export async function atualizarLocal(id, localData) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/locations/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(localData)
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar local: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao atualizar local:', error);
    throw error;
  }
}

// Deletar local
export async function deletarLocal(id) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/locations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar local: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao deletar local:', error);
    throw error;
  }
}
