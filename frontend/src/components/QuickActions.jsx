import React from 'react';
import { FiZap, FiPlus, FiUserPlus, FiCalendar, FiDownload } from 'react-icons/fi';
import './QuickActions.css';

export default function QuickActions() {
  return (
    <div className="quick-actions">
      <h3 className="section-title">
        <FiZap style={{marginRight: 8}} />
        Ações Rápidas
      </h3>
      <div className="actions-grid">
        <a href="/requisicoes" className="action-btn">
          <FiPlus />
          Novo Requerimento
        </a>
        <a href="/usuarios" className="action-btn">
          <FiUserPlus />
          Adicionar Usuário
        </a>
        <a href="/inventario" className="action-btn">
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