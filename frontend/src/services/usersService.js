const API_URL = import.meta.env.VITE_API_URL || '';

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

export async function criarUsuario({ name, email, role, password }) {
  try {
    console.log('🔍 Frontend - Dados sendo enviados:', { name, email, role, password: password ? '***' : 'undefined' });
    
    const requestBody = { 
      nome: name, 
      email, 
      papel: role, 
      senha: password 
    };
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

export async function atualizarUsuario(id, { name, email, role, password }) {
  try {
    const updateData = {
      full_name: name,
      email,
      role
    };
    
    // Adicionar senha apenas se for fornecida
    if (password && password !== '••••••••') {
      updateData.password = password;
      console.log('🔍 Frontend - Senha será enviada:', password ? '***' : 'undefined');
    } else {
      console.log('🔍 Frontend - Senha não será enviada (vazia ou pontos)');
    }
    
    console.log('🔍 Frontend - Dados para atualização:', updateData);
    
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401 || response.status === 403) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      throw new Error(error.message || 'Erro ao atualizar usuário');
    }
    
    const data = await response.json();
    console.log('🔍 Frontend - Resposta do backend:', data);
    return data;
  } catch (err) {
    throw err;
  }
}

export async function deletarUsuario(id) {
  try {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401 || response.status === 403) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      throw new Error(error.message || 'Erro ao deletar usuário');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    throw err;
  }
}

export async function alternarStatusUsuario(id, isActive) {
  try {
    const response = await fetch(`${API_URL}/api/users/${id}/activate`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active: isActive }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401 || response.status === 403) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      throw new Error(error.message || 'Erro ao alterar status do usuário');
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    throw err;
  }
} 