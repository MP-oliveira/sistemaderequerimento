const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Buscar todos os departamentos
export async function listarDepartamentos() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/departments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar departamentos: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error);
    throw error;
  }
}

// Criar novo departamento
export async function criarDepartamento(departmentData) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/departments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(departmentData)
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar departamento: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar departamento:', error);
    throw error;
  }
}

// Atualizar departamento
export async function atualizarDepartamento(id, departmentData) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/departments/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(departmentData)
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar departamento: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao atualizar departamento:', error);
    throw error;
  }
}

// Deletar departamento
export async function deletarDepartamento(id) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/departments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar departamento: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao deletar departamento:', error);
    throw error;
  }
}
