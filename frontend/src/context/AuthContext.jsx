import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

export const 
AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    try {
      const response = await fetch(`/api/users/me/profile`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 AuthContext - User data from API:', data);
        return data.data;
      } else if (response.status === 401) {
        // Token expirado ou inválido
        console.log('🔍 AuthContext - Token expirado, limpando dados');
        localStorage.removeItem('token');
        setUser(null);
        return null;
      } else {
        console.error('❌ AuthContext - Erro na resposta da API:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      // Em caso de erro de rede, também limpar o token
      localStorage.removeItem('token');
      setUser(null);
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
          
          // Verificar se o token está expirado
          const currentTime = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < currentTime) {
            console.log('🔍 AuthContext - Token expirado, limpando dados');
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
            return;
          }
          
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
        <LoadingSpinner fullScreen={true} text="Carregando aplicação..." />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

 