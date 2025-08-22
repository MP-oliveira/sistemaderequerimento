import React, { useState, useEffect } from 'react';
import { FiPackage, FiChevronDown, FiChevronRight, FiClock, FiMapPin, FiCheck, FiX } from 'react-icons/fi';
import { marcarItemComoSeparado, listarTodosRequerimentosFuturosServicoGeral } from '../services/requestItemsService';
import './TodosRequerimentos.css';

const TodosRequerimentos = ({ onDataChange }) => {
  const [expandedRequests, setExpandedRequests] = useState({});
  const [todosRequerimentos, setTodosRequerimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarTodosRequerimentos();
  }, []);

  const carregarTodosRequerimentos = async () => {
    try {
      setLoading(true);
      const data = await listarTodosRequerimentosFuturosServicoGeral();
      console.log('🔍 [TodosRequerimentos] Dados recebidos da API:', data);
      setTodosRequerimentos(data || []);
    } catch (error) {
      console.error('❌ [TodosRequerimentos] Erro ao carregar dados:', error);
      setTodosRequerimentos([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para agrupar itens por requisição (não é mais necessária, pois os dados já vêm agrupados)
  const agruparItensPorRequisicao = (items) => {
    console.log('🔍 [TodosRequerimentos] Itens recebidos:', items.length);
    console.log('🔍 [TodosRequerimentos] Itens detalhados:', items.map(item => ({
      id: item.id,
      requestId: item.request_id || item.requests?.id,
      eventName: item.requests?.event_name,
      date: item.requests?.date,
      status: item.requests?.status
    })));
    
    const grupos = {};
    
    items.forEach(item => {
      const requestId = item.request_id || item.requests?.id;
      const request = item.requests || {};
      
      console.log('🔍 [TodosRequerimentos] Processando item:', {
        itemId: item.id,
        requestId,
        eventName: request.event_name,
        date: request.date,
        status: request.status
      });
      
      if (!requestId) {
        console.log('🔍 [TodosRequerimentos] Item sem requestId, pulando');
        return;
      }
      if (request.status === 'FINALIZADO') {
        console.log('🔍 [TodosRequerimentos] Item finalizado, pulando');
        return;
      }
      
      if (!grupos[requestId]) {
        grupos[requestId] = {
          request: request,
          items: []
        };
        console.log('🔍 [TodosRequerimentos] Novo grupo criado para:', request.event_name);
      }
      grupos[requestId].items.push(item);
    });
    
    console.log('🔍 [TodosRequerimentos] Grupos criados:', Object.keys(grupos).length);
    console.log('🔍 [TodosRequerimentos] Detalhes dos grupos:', Object.values(grupos).map(g => ({
      eventName: g.request.event_name,
      date: g.request.date,
      itemsCount: g.items.length
    })));
    
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
      const updatedRequerimentos = todosRequerimentos.map(req => ({
        ...req,
        items: req.items?.map(item => 
          item.id === itemId 
            ? { ...item, is_separated: !currentStatus }
            : item
        ) || []
      }));
      
      setTodosRequerimentos(updatedRequerimentos);
      
      // Notificar o componente pai sobre a mudança
      if (onDataChange) {
        onDataChange(updatedRequerimentos);
      }
    } catch (error) {
      console.error('Erro ao marcar item como separado:', error);
    }
  };

  if (loading) {
    return (
      <div className="todos-requerimentos">
        <div className="materials-header">
          <h3 className="section-title">
            <FiPackage style={{marginRight: 8}} />
            Todos os Requerimentos
          </h3>
        </div>
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  // Calcular totais para o resumo
  const totalItens = todosRequerimentos.reduce((total, req) => total + (req.items?.length || 0), 0);
  const totalSeparados = todosRequerimentos.reduce((total, req) => 
    total + (req.items?.filter(item => item.is_separated).length || 0), 0
  );
  const totalPendentes = totalItens - totalSeparados;

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
            <span className="summary-number">{todosRequerimentos.length}</span>
            <span className="summary-label">Requisições</span>
          </div>
          <div className="summary-item">
            <span className="summary-number success">{totalSeparados}</span>
            <span className="summary-label">Separados</span>
          </div>
          <div className="summary-item">
            <span className="summary-number warning">{totalPendentes}</span>
            <span className="summary-label">Pendentes</span>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="materials-list todos-requerimentos-list">
        {todosRequerimentos.length > 0 ? (
          todosRequerimentos.map((requisicao, index) => {
            const requestId = requisicao.id;
            const isExpanded = !!expandedRequests[requestId];
            console.log('🔍 [TodosRequerimentos] Renderizando requisição:', { 
              requestId, 
              isExpanded, 
              index, 
              eventName: requisicao.event_name
            });
            
            const totalCount = requisicao.items?.length || 0;
            const separatedCount = requisicao.items?.filter(item => item.is_separated).length || 0;
            
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
                      <h4>{requisicao.event_name || requisicao.description || 'Requisição não identificada'}</h4>
                    </div>
                    <div className="request-meta">
                      <span className="department">{requisicao.department}</span>
                      <span className="time">
                        <FiClock size={14} />
                        {formatDate(requisicao.date)}
                      </span>
                      {requisicao.location && (
                        <span className="location">
                          <FiMapPin size={14} />
                          {requisicao.location}
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
                    {totalCount > 0 ? (
                      <>
                        <h5>Materiais Necessários:</h5>
                        <div className="items-list">
                          {requisicao.items.map((item) => (
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
                      </>
                    ) : (
                      <div className="no-items">
                        <p>Esta requisição não possui itens de audiovisual.</p>
                        <p>{requisicao.description}</p>
                      </div>
                    )}
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
