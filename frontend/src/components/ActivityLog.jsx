import React from 'react';
import './ActivityLog.css';

export default function ActivityLog({ logs, title = "Histórico de Atividades", emptyMessage = "Nenhuma atividade registrada." }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const getActionIcon = (action) => {
    const icons = {
      'CRIACAO': '➕',
      'EDICAO': '✏️',
      'APROVACAO': '✅',
      'EXECUCAO': '🚀',
      'REJEICAO': '❌',
      'CANCELAMENTO': '🚫',
      'RESERVA': '🔒',
      'LIBERACAO': '🔓',
      'MANUTENCAO': '🔧',
      'INDISPONIBILIZACAO': '⚠️',
      'USO_REQUISICAO': '📦',
      'DEVOLUCAO_EVENTO': '📤',
      'FINALIZACAO': '🏁',
      'REMOCAO': '🗑️'
    };
    return icons[action] || '📝';
  };

  const getActionColor = (action) => {
    const colors = {
      'CRIACAO': '#28a745',
      'EDICAO': '#17a2b8',
      'APROVACAO': '#28a745',
      'EXECUCAO': '#007bff',
      'REJEICAO': '#dc3545',
      'CANCELAMENTO': '#6c757d',
      'RESERVA': '#ffc107',
      'LIBERACAO': '#28a745',
      'MANUTENCAO': '#fd7e14',
      'INDISPONIBILIZACAO': '#dc3545',
      'USO_REQUISICAO': '#6f42c1',
      'DEVOLUCAO_EVENTO': '#20c997',
      'FINALIZACAO': '#28a745',
      'REMOCAO': '#dc3545'
    };
    return colors[action] || '#6c757d';
  };

  const getActionLabel = (action) => {
    const labels = {
      'CRIACAO': 'Criado',
      'EDICAO': 'Editado',
      'APROVACAO': 'Aprovado',
      'EXECUCAO': 'Executado',
      'REJEICAO': 'Rejeitado',
      'CANCELAMENTO': 'Cancelado',
      'RESERVA': 'Reservado',
      'LIBERACAO': 'Liberado',
      'MANUTENCAO': 'Em Manutenção',
      'INDISPONIBILIZACAO': 'Indisponibilizado',
      'USO_REQUISICAO': 'Usado em Requisição',
      'DEVOLUCAO_EVENTO': 'Devolvido',
      'FINALIZACAO': 'Finalizado',
      'REMOCAO': 'Removido'
    };
    return labels[action] || action;
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="activity-log-container">
        <h3 className="activity-log-title">{title}</h3>
        <div className="activity-log-empty">
          <span>📋</span>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-log-container">
      <h3 className="activity-log-title">{title}</h3>
      <div className="activity-log-list">
        {logs.map((log, index) => (
          <div key={log.id || index} className="activity-log-item">
            <div className="activity-log-icon" style={{ color: getActionColor(log.action) }}>
              {getActionIcon(log.action)}
            </div>
            <div className="activity-log-content">
              <div className="activity-log-header">
                <span className="activity-log-action" style={{ color: getActionColor(log.action) }}>
                  {getActionLabel(log.action)}
                </span>
                <span className="activity-log-date">
                  {formatDate(log.created_at)}
                </span>
              </div>
              
              {log.usuario && (
                <div className="activity-log-user">
                  👤 <strong>{log.usuario}</strong>
                </div>
              )}
              
              {log.observacao && (
                <div className="activity-log-description">
                  📝 {log.observacao}
                </div>
              )}
              
              {/* Detalhes específicos baseados no tipo de ação */}
              {log.status_anterior && log.status_novo && (
                <div className="activity-log-details">
                  <span className="status-change">
                    Status: <span className="status-old">{log.status_anterior}</span> → <span className="status-new">{log.status_novo}</span>
                  </span>
                </div>
              )}
              
              {log.quantidade_anterior !== null && log.quantidade_nova !== null && (
                <div className="activity-log-details">
                  <span className="quantity-change">
                    Quantidade: <span className="quantity-old">{log.quantidade_anterior}</span> → <span className="quantity-new">{log.quantidade_nova}</span>
                  </span>
                </div>
              )}
              
              {log.campo_alterado && log.valor_anterior && log.valor_novo && (
                <div className="activity-log-details">
                  <span className="field-change">
                    {log.campo_alterado}: <span className="value-old">{log.valor_anterior}</span> → <span className="value-new">{log.valor_novo}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 