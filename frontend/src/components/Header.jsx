import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
// Logo será carregada diretamente da pasta public
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const handleAutoLogin = async () => {
    try {
      await login({ email: 'admin@igreja.com', password: 'admin123' });
    } catch (error) {
      console.error('Erro no login automático:', error);
    }
  };

  const isAdmin = user && (user.role === 'ADM' || user.role === 'PASTOR');
  
  // Determinar para onde o logo deve redirecionar
  const getDashboardPath = () => {
    if (!user) {
      return '/';
    }
    if (isAdmin) {
      return '/admin/dashboard';
    }
    if (user.role === 'AUDIOVISUAL') {
      return '/audiovisual/dashboard';
    }
    return '/dashboard';
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <button
          onClick={() => {
            const path = getDashboardPath();
            navigate(path);
          }}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
        >
          <img src="/ibva-logo.png" alt="IBVA Logo" className="header-logo" />
        </button>
      </div>
      
      <div className="header-center">
        <h1 className="header-title">Sistema de Requerimentos</h1>
      </div>
      
      <div className="header-right">
        <span className="header-user-name">Olá, {user?.nome || 'Usuário'}</span>
        
        {!user && (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleAutoLogin}
            className="header-login-btn"
          >
            Login
          </Button>
        )}
        {user && (
          <Button variant="secondary" size="sm" onClick={logout} className="header-logout-btn">
            Sair
          </Button>
        )}
      </div>
    </header>
  );
} 