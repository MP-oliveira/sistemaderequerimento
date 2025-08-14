// Configuração da API base
const API_BASE_URL = 'https://sistema-requerimento.vercel.app/api';

// Função para fazer requisições HTTP
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
};

// Função para fazer requisições autenticadas
const authenticatedRequest = async (endpoint, options = {}, token) => {
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  };

  return apiRequest(endpoint, authOptions);
};

export const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      return {
        success: true,
        token: response.token,
        user: response.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro no login',
      };
    }
  },

  // Verificar token
  verifyToken: async (token) => {
    try {
      const response = await authenticatedRequest('/auth/verify', {}, token);
      return {
        success: true,
        user: response.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Logout
  logout: async (token) => {
    try {
      await authenticatedRequest('/auth/logout', { method: 'POST' }, token);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // Alterar senha
  changePassword: async (currentPassword, newPassword, token) => {
    try {
      const response = await authenticatedRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }, token);

      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  },
};
