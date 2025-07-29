import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import './AdminButtons.css';

export default function AdminButtons() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user && (user.role === 'ADM' || user.role === 'PASTOR');

  if (!isAdmin) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-buttons-container">
      <div className="admin-buttons">
        <Link to="/admin/dashboard">
          <Button 
            variant="secondary" 
            size="sm" 
            className={`admin-btn ${isActive('/admin/dashboard') ? 'active' : ''}`}
          >
            📊 Dashboard Admin
          </Button>
        </Link>
        <Link to="/admin/requisicoes">
          <Button 
            variant="secondary" 
            size="sm" 
            className={`admin-btn ${isActive('/admin/requisicoes') ? 'active' : ''}`}
          >
            📋 Gerenciar Requerimentos
          </Button>
        </Link>
        <Link to="/usuarios">
          <Button 
            variant="secondary" 
            size="sm" 
            className={`admin-btn ${isActive('/usuarios') ? 'active' : ''}`}
          >
            👥 Gerenciar Usuários
          </Button>
        </Link>
      </div>
    </div>
  );
} 