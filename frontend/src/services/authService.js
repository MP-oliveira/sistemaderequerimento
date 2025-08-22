// Use mesma origem por padrão (evita CORS); em dev, defina VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || '';

export async function login({ email, password }) {
  try {
    const loginUrl = `${API_URL}/api/auth/login`;
    console.log('🔍 Frontend - API_URL:', API_URL);
    console.log('🔍 Frontend - URL de login:', loginUrl);
    console.log('🔍 Frontend - Dados de login:', { email, password: '***' });
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('🔍 Frontend - Response status:', response.status);
    console.log('🔍 Frontend - Response ok:', response.ok);
    
    if (!response.ok) {
      const error = await response.json();
      console.log('🔍 Frontend - Error response:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
    
    const data = await response.json();
    console.log('🔍 Frontend - Success response:', data);
    localStorage.setItem('token', data.data.token);
    return data.data;
  } catch (err) {
    console.error('❌ Frontend - Erro no login:', err);
    throw err;
  }
}

export function logout() {
  localStorage.removeItem('token');
}

export function getToken() {
  return localStorage.getItem('token');
} 