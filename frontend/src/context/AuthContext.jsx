import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar usuário do token ao iniciar
    const token = authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ 
          id: payload.userId,
          nome: payload.name || 'Usuário',
          email: payload.email,
          role: payload.role,
          token 
        });
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    const data = await authService.login({ email, password });
    console.log('Login backend response:', data);
    
    // O backend retorna data.user com os dados do usuário
    const userData = {
      id: data.user.id,
      nome: data.user.name,
      email: data.user.email,
      role: data.user.role,
      token: data.token
    };
    
    setUser(userData);
    return userData;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 