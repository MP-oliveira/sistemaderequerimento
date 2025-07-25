import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import ibvaLogo from '../assets/images/ibva-logo.png';
import './Header.css';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user, logout, login } = useAuth();
  
  console.log('🔍 Header - User data:', user);

  const handleAutoLogin = async () => {
    try {
      await login({ email: 'admin@igreja.com', password: 'password' });
    } catch (error) {
      console.error('Erro no login automático:', error);
    }
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <Link to="/">
          <img src={ibvaLogo} alt="IBVA Logo" className="header-logo" />
        </Link>
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