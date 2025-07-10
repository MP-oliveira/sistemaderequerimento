import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
    }
    return null;
  };

  useEffect(() => {
    // Carregar usuário do token ao iniciar
    const loadUser = async () => {
      const token = authService.getToken();
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('🔍 AuthContext - Token payload:', payload);
          
          // Buscar dados completos do usuário
          const userData = await loadUserData(payload.userId);
          if (userData) {
            setUser({ 
              id: userData.id,
              nome: userData.full_name || 'Usuário',
              email: userData.email,
              role: userData.role,
              token 
            });
          } else {
            // Fallback com dados do token
            setUser({ 
              id: payload.userId,
              nome: 'Usuário',
              email: 'usuario@igreja.com',
              role: payload.role,
              token 
            });
          }
        } catch (error) {
          console.error('❌ AuthContext - Erro ao processar token:', error);
          setUser(null);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async ({ email, password }) => {
    const data = await authService.login({ email, password });
    
    // Buscar dados completos do usuário após login
    const userData = await loadUserData(data.user.id);
    
    const userInfo = {
      id: userData?.id || data.user.id,
      nome: userData?.full_name || data.user.name || 'Usuário',
      email: userData?.email || data.user.email,
      role: userData?.role || data.user.role,
      token: data.token
    };
    
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Carregando...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 