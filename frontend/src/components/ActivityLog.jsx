import React from 'react';
import { 
  FiUser, 
  FiFileText, 
  FiClock, 
  FiPlus, 
  FiEdit, 
  FiCheck, 
  FiPlay, 
  FiX, 
  FiXCircle, 
  FiLock, 
  FiUnlock, 
  FiTool, 
  FiAlertTriangle, 
  FiPackage, 
  FiArrowUp, 
  FiFlag, 
  FiTrash2 
} from 'react-icons/fi';
import './ActivityLog.css';

export default function ActivityLog({ logs, title = "Histórico de Atividades", emptyMessage = "Nenhuma atividade registrada." }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const getActionIcon = (action) => {
    const icons = {
      'CRIACAO': 'FiPlus',
      'EDICAO': 'FiEdit',
      'APROVACAO': 'FiCheck',
      'EXECUCAO': 'FiPlay',
      'REJEICAO': 'FiX',
      'CANCELAMENTO': 'FiXCircle',
      'RESERVA': 'FiLock',
      'LIBERACAO': 'FiUnlock',
      'MANUTENCAO': 'FiTool',
      'INDISPONIBILIZACAO': 'FiAlertTriangle',
      'USO_REQUISICAO': 'FiPackage',
      'DEVOLUCAO_EVENTO': 'FiArrowUp',
      'FINALIZACAO': 'FiFlag',
      'REMOCAO': 'FiTrash2'
    };
    return icons[action] || 'FiFileText';
  };

  const getActionColor = (action) => {
    const colors = {
      'CRIACAO': '#10b981',
      'EDICAO': '#3b82f6',
      'APROVACAO': '#10b981',
      'EXECUCAO': '#3b82f6',
      'REJEICAO': '#ef4444',
      'CANCELAMENTO': '#6b7280',
      'RESERVA': '#f59e0b',
      'LIBERACAO': '#10b981',
      'MANUTENCAO': '#f97316',
      'INDISPONIBILIZACAO': '#ef4444',
      'USO_REQUISICAO': '#8b5cf6',
      'DEVOLUCAO_EVENTO': '#06b6d4',
      'FINALIZACAO': '#10b981',
      'REMOCAO': '#ef4444'
    };
    return colors[action] || '#6b7280';
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

  const renderIcon = (iconName, color) => {
    const iconProps = { size: 16, color };
    switch (iconName) {
      case 'FiPlus': return <FiPlus {...iconProps} />;
      case 'FiEdit': return <FiEdit {...iconProps} />;
      case 'FiCheck': return <FiCheck {...iconProps} />;
      case 'FiPlay': return <FiPlay {...iconProps} />;
      case 'FiX': return <FiX {...iconProps} />;
      case 'FiXCircle': return <FiXCircle {...iconProps} />;
      case 'FiLock': return <FiLock {...iconProps} />;
      case 'FiUnlock': return <FiUnlock {...iconProps} />;
      case 'FiTool': return <FiTool {...iconProps} />;
      case 'FiAlertTriangle': return <FiAlertTriangle {...iconProps} />;
      case 'FiPackage': return <FiPackage {...iconProps} />;
      case 'FiArrowUp': return <FiArrowUp {...iconProps} />;
      case 'FiFlag': return <FiFlag {...iconProps} />;
      case 'FiTrash2': return <FiTrash2 {...iconProps} />;
      default: return <FiFileText {...iconProps} />;
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="activity-log-container">
        <div className="activity-log-empty">
          <div className="activity-log-empty-icon">
            <FiFileText size={48} color="#9ca3af" />
          </div>
          <h4 className="activity-log-empty-title">Nenhuma atividade</h4>
          <p className="activity-log-empty-message">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-log-container">
      <div className="activity-log-list">
        {logs.map((log, index) => (
          <div key={log.id || index} className="activity-log-item">
            <div className="activity-log-icon" style={{ backgroundColor: `${getActionColor(log.action)}15` }}>
              {renderIcon(getActionIcon(log.action), getActionColor(log.action))}
            </div>
            <div className="activity-log-content">
              <div className="activity-log-header">
                <span className="activity-log-action" style={{ color: getActionColor(log.action) }}>
                  {getActionLabel(log.action)}
                </span>
                <div className="activity-log-date">
                  <FiClock size={12} />
                  <span>{formatDate(log.created_at)}</span>
                </div>
              </div>
              
              {log.usuario && (
                <div className="activity-log-user">
                  <FiUser size={12} />
                  <span>{log.usuario}</span>
                </div>
              )}
              
              {log.observacao && (
                <div className="activity-log-description">
                  <FiFileText size={12} />
                  <span>{log.observacao}</span>
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