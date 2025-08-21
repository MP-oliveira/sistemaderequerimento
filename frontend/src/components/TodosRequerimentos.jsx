import React, { useState } from 'react';
import { FiPackage, FiChevronDown, FiChevronRight, FiClock, FiMapPin, FiCheck, FiX } from 'react-icons/fi';
import { marcarItemComoSeparado } from '../services/requestItemsService';
import './TodosRequerimentos.css';

const TodosRequerimentos = ({ executedItems, onDataChange }) => {
  const [expandedRequests, setExpandedRequests] = useState({});
  const [localItems, setLocalItems] = useState(executedItems);

  // Função para agrupar itens por requisição
  const agruparItensPorRequisicao = (items) => {
    const grupos = {};
    
    items.forEach(item => {
      const requestId = item.request_id || item.requests?.id;
      const request = item.requests || {};
      
      if (!requestId) return;
      if (request.status === 'FINALIZADO') return;
      
      if (!grupos[requestId]) {
        grupos[requestId] = {
          request: request,
          items: []
        };
      }
      grupos[requestId].items.push(item);
    });
    
    return Object.values(grupos);
  };

  const toggleRequest = (requestId) => {
    console.log('🔍 [TodosRequerimentos] toggleRequest chamado com requestId:', requestId);
    console.log('🔍 [TodosRequerimentos] Estado atual:', expandedRequests);
    const newExpanded = { ...expandedRequests };
    if (newExpanded[requestId]) {
      delete newExpanded[requestId];
      console.log('🔍 [TodosRequerimentos] Removendo requestId:', requestId);
    } else {
      newExpanded[requestId] = true;
      console.log('🔍 [TodosRequerimentos] Adicionando requestId:', requestId);
    }
    console.log('🔍 [TodosRequerimentos] Novo estado:', newExpanded);
    setExpandedRequests(newExpanded);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não informada';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleToggleSeparated = async (itemId, currentStatus) => {
    try {
      await marcarItemComoSeparado(itemId, !currentStatus);
      
      // Atualizar o item localmente
      const updatedItems = localItems.map(item => 
        item.id === itemId 
          ? { ...item, is_separated: !currentStatus }
          : item
      );
      
      setLocalItems(updatedItems);
      
      // Notificar o componente pai sobre a mudança
      if (onDataChange) {
        onDataChange(updatedItems);
      }
    } catch (error) {
      console.error('Erro ao marcar item como separado:', error);
    }
  };

  const grupos = agruparItensPorRequisicao(localItems);

  return (
    <div className="todos-requerimentos">
      {/* Header */}
      <div className="materials-header">
        <h3 className="section-title">
          <FiPackage style={{marginRight: 8}} />
          Todos os Requerimentos
        </h3>
        <div className="materials-summary">
          <div className="summary-item">
            <span className="summary-number">{grupos.length}</span>
            <span className="summary-label">Requisições</span>
          </div>
          <div className="summary-item">
            <span className="summary-number success">{executedItems.filter(item => item.is_separated).length}</span>
            <span className="summary-label">Separados</span>
          </div>
          <div className="summary-item">
            <span className="summary-number warning">{executedItems.filter(item => !item.is_separated).length}</span>
            <span className="summary-label">Pendentes</span>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="materials-list todos-requerimentos-list">
        {grupos.length > 0 ? (
          grupos.map((grupo, index) => {
            const requestId = grupo.request.id;
            const isExpanded = !!expandedRequests[requestId];
            console.log('🔍 [TodosRequerimentos] Renderizando grupo:', { 
              requestId, 
              isExpanded, 
              index, 
              eventName: grupo.request.event_name
            });
            
            const totalCount = grupo.items.length;
            const separatedCount = grupo.items.filter(item => item.is_separated).length;
            
            return (
              <div key={`todos-${requestId}`} className="request-materials-card">
                <div 
                  className="request-header accordion-header"
                  onClick={() => toggleRequest(requestId)}
                >
                  <div className="request-info">
                    <div className="request-title-row">
                      <button className="accordion-toggle">
                        {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                      </button>
                      <h4>{grupo.request.event_name || grupo.request.description || 'Requisição não identificada'}</h4>
                    </div>
                    <div className="request-meta">
                      <span className="department">{grupo.request.department}</span>
                      <span className="time">
                        <FiClock size={14} />
                        {formatDate(grupo.request.date)}
                      </span>
                      {grupo.request.location && (
                        <span className="location">
                          <FiMapPin size={14} />
                          {grupo.request.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="request-status">
                    <div className="status-info">
                      <span 
                        className="status-badge"
                        style={{ 
                          backgroundColor: 'transparent',
                          color: '#4caf50',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '700'
                        }}
                      >
                        APTO
                      </span>
                      <span className="items-count">
                        {separatedCount}/{totalCount} itens
                      </span>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="materials-items accordion-content">
                    <h5>Materiais Necessários:</h5>
                    <div className="items-list">
                      {grupo.items.map((item) => (
                        <div 
                          key={item.id} 
                          className={`item ${item.is_separated ? 'separated' : 'pending'}`}
                        >
                          <div className="item-info">
                            <span className="item-name">{item.item_name}</span>
                            <span className="item-quantity">Qtd: {item.quantity_requested}</span>
                          </div>
                          <div className="item-status">
                            {item.is_separated ? (
                              <FiCheck 
                                className="status-icon success" 
                                size={24}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSeparated(item.id, item.is_separated);
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                            ) : (
                              <FiX 
                                className="status-icon warning" 
                                size={32} 
                                strokeWidth={4}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSeparated(item.id, item.is_separated);
                                }}
                                style={{ cursor: 'pointer' }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-materials">
            <h3>Nenhum requerimento encontrado</h3>
            <p>Não há requerimentos ativos no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodosRequerimentos;
