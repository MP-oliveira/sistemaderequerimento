import React from 'react';
import { FiZap, FiPlus, FiUserPlus, FiCalendar, FiDownload } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import './QuickActions.css';

export default function QuickActions() {
  const { user } = useAuth();

  return (
    <div className="quick-actions">
      <h3 className="section-title">
        <FiZap style={{marginRight: 8}} />
        Ações Rápidas
      </h3>
      <div className="actions-grid">
        <a href="/requisicoes" className="action-btn" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/requisicoes'); window.dispatchEvent(new PopStateEvent('popstate')); }}>
          <FiPlus />
          Novo Requerimento
        </a>
        {user && (user.role === 'ADM' || user.role === 'PASTOR') ? (
          <a href="/admin/requisicoes" className="action-btn" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/admin/requisicoes'); window.dispatchEvent(new PopStateEvent('popstate')); }}>
            <FiUserPlus />
            Gerenciar Requisições
          </a>
        ) : user && (user.role === 'LIDER' || user.role === 'USER') ? (
          <a href="/usuarios" className="action-btn" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/usuarios'); window.dispatchEvent(new PopStateEvent('popstate')); }}>
            <FiUserPlus />
            Adicionar Usuário
          </a>
        ) : null}
        <a href="/inventario" className="action-btn" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/inventario'); window.dispatchEvent(new PopStateEvent('popstate')); }}>
          <FiCalendar />
          Agendar Evento
        </a>
        <a href="/relatorio" className="action-btn">
          <FiDownload />
          Relatório
        </a>
      </div>
    </div>
  );
} 