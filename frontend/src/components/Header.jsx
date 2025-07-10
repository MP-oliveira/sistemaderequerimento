import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import ibvaLogo from '../assets/images/ibva-logo.png';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="main-header">
      <div className="header-left">
        <img src={ibvaLogo} alt="IBVA Logo" className="header-logo" />
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
            onClick={async () => {
              try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: 'admin@igreja.com', password: 'password' })
                });
                const data = await response.json();
                if (data.success) {
                  localStorage.setItem('token', data.data.token);
                  window.location.reload();
                }
              } catch (error) {
                console.error('Erro no login automático:', error);
              }
            }}
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