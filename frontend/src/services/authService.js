const API_URL = import.meta.env.VITE_API_URL || 'https://sistemaderequerimento-backend.vercel.app';

export async function login({ email, password }) {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao fazer login');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.data.token);
    return data.data;
  } catch (err) {
    throw err;
  }
}

export function logout() {
  localStorage.removeItem('token');
}

export function getToken() {
  return localStorage.getItem('token');
} 