import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import ibvaLogo from '../assets/images/ibva-logo.png';
import './Header.css';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user, logout, login } = useAuth();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  
  console.log('🔍 Header - User data:', user);

  const handleAutoLogin = async () => {
    try {
      await login({ email: 'admin@igreja.com', password: 'admin123' });
    } catch (error) {
      console.error('Erro no login automático:', error);
    }
  };

  const isAdmin = user && (user.role === 'ADM' || user.role === 'PASTOR');

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
        
        {/* Menu Administrativo */}
        {isAdmin && (
          <div className="admin-menu-container">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              className="admin-menu-toggle"
            >
              ⚙️ Admin
            </Button>
            
            {showAdminMenu && (
              <div className="admin-menu">
                <Link 
                  to="/admin/dashboard" 
                  className="admin-menu-item"
                  onClick={() => setShowAdminMenu(false)}
                >
                  📊 Dashboard Admin
                </Link>
                <Link 
                  to="/admin/requisicoes" 
                  className="admin-menu-item"
                  onClick={() => setShowAdminMenu(false)}
                >
                  📋 Gerenciar Requisições
                </Link>
                <Link 
                  to="/usuarios" 
                  className="admin-menu-item"
                  onClick={() => setShowAdminMenu(false)}
                >
                  👥 Gerenciar Usuários
                </Link>
                <Link 
                  to="/inventario" 
                  className="admin-menu-item"
                  onClick={() => setShowAdminMenu(false)}
                >
                  📦 Gerenciar Inventário
                </Link>
              </div>
            )}
          </div>
        )}
        
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