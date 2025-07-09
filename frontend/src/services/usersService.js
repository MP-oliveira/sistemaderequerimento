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

export async function listarUsuarios() {
  try {
    const response = await fetch(`${API_URL}/api/users`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401 || response.status === 403) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      throw new Error(error.message || 'Erro ao buscar usuários');
    }
    const data = await response.json();
    return data.data || data;
  } catch (err) {
    throw err;
  }
}

export async function criarUsuario({ nome, email, papel, senha }) {
  try {
    console.log('🔍 Frontend - Dados sendo enviados:', { nome, email, papel, senha: senha ? '***' : 'undefined' });
    
    const requestBody = { nome, email, papel, senha };
    console.log('🔍 Frontend - Request body:', requestBody);
    
    const headers = getAuthHeaders();
    console.log('🔍 Frontend - Headers:', headers);
    
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    console.log('🔍 Frontend - Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.log('🔍 Frontend - Error response:', error);
      if (response.status === 401 || response.status === 403) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      throw new Error(error.message || 'Erro ao criar usuário');
    }
    
    const data = await response.json();
    console.log('🔍 Frontend - Success response:', data);
    return data;
  } catch (err) {
    console.error('❌ Frontend - Erro:', err);
    throw err;
  }
} 