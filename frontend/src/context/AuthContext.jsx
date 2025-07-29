import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/me/profile`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 AuthContext - User data from API:', data);
        return data.data;
      } else {
        console.error('❌ AuthContext - Erro na resposta da API:', response.status, response.statusText);
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
      console.log('🔍 AuthContext - Token encontrado:', !!token);
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('🔍 AuthContext - Token payload:', payload);
          
          // Buscar dados completos do usuário
          const userData = await loadUserData(payload.userId);
          console.log('🔍 AuthContext - User data from API:', userData);
          
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
            console.log('🔍 AuthContext - Usando fallback com dados do token');
            setUser({ 
              id: payload.userId,
              nome: payload.name || 'Usuário',
              email: payload.email || 'admin@igreja.com',
              role: payload.role,
              token 
            });
          }
        } catch (error) {
          console.error('❌ AuthContext - Erro ao processar token:', error);
          setUser(null);
          localStorage.removeItem('token');
        }
      } else {
        console.log('🔍 AuthContext - Nenhum token encontrado');
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async ({ email, password }) => {
    console.log('🔍 AuthContext - Iniciando login:', { email });
    const data = await authService.login({ email, password });
    console.log('🔍 AuthContext - Login response:', data);
    
    // Buscar dados completos do usuário após login
    const userData = await loadUserData(data.user.id);
    console.log('🔍 AuthContext - User data from API:', userData);
    
    const userInfo = {
      id: userData?.id || data.user.id,
      nome: userData?.full_name || data.user.name || 'Usuário',
      email: userData?.email || data.user.email,
      role: userData?.role || data.user.role,
      token: data.token
    };
    
    console.log('🔍 AuthContext - Final user info:', userInfo);
    console.log('🔍 AuthContext - Role do usuário:', userInfo.role);
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
      {console.log('🔍 AuthContext - Renderizando com user:', user)}
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