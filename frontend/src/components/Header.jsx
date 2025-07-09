import React from 'react';
import './Header.css';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="main-header">
      <div className="header-title">Sistema de Requisições</div>
      <div className="header-user">
        <span>{user?.name} ({user?.role})</span>
        <Button variant="secondary" size="sm" onClick={logout} style={{ marginLeft: 16 }}>
          Sair
        </Button>
      </div>
    </header>
  );
} 