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
        <Button variant="secondary" size="sm" onClick={logout} className="header-logout-btn">
          Sair
        </Button>
      </div>
    </header>
  );
} 