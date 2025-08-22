import React, { useState, useEffect } from 'react';
import { FiPackage, FiChevronDown, FiChevronRight, FiClock, FiMapPin, FiCheck, FiX, FiUsers } from 'react-icons/fi';
import { marcarItemComoSeparado } from '../services/requestItemsService';
import { listarRequisicoes } from '../services/requestsService';
import { listarItensRequisicao } from '../services/requestItemsService';
import './TodosRequerimentos.css';

const TodosRequerimentos = ({ category = 'audiovisual' }) => {
  const [todosRequerimentos, setTodosRequerimentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState({});

  useEffect(() => {
    carregarTodosRequerimentos();
  }, [category]);

  const carregarTodosRequerimentos = async () => {
    try {
      setLoading(true);
      const data = await listarRequisicoes();
      const requisicoesAprovadas = data.filter(req => req.status === 'APTO');
      
      // Definir categorias baseado no parâmetro
      let targetCategories = [];
      if (category === 'audiovisual') {
        targetCategories = ['AUDIO_VIDEO', 'INSTRUMENTO_MUSICAL'];
      } else if (category === 'servico-geral') {
        targetCategories = ['SERVICO_GERAL'];
      } else if (category === 'decoracao') {
        targetCategories = ['DECORACAO'];
      } else if (category === 'esportes') {
        targetCategories = ['ESPORTES'];
      } else {
        // Se não for especificada categoria ou for "todos", mostrar todos os itens
        targetCategories = null;
      }
      
      // Buscar itens para cada requisição
      const requisicoesComItens = await Promise.all(
        requisicoesAprovadas.map(async (requisicao) => {
          try {
            const itens = await listarItensRequisicao(requisicao.id);
            // Filtrar apenas itens da categoria especificada, ou mostrar todos se não especificada
            const itensFiltrados = targetCategories 
              ? itens.filter(item => {
                  const category = item.inventory?.category;
                  return targetCategories.includes(category);
                })
              : itens; // Mostrar todos os itens se não especificada categoria
            return {
              ...requisicao,
              items: itensFiltrados
            };
          } catch (error) {
            console.error('❌ [TodosRequerimentos] Erro ao buscar itens da requisição:', requisicao.id, error);
            return {
              ...requisicao,
              items: []
            };
          }
        })
      );
      
      setTodosRequerimentos(requisicoesComItens || []);
    } catch (error) {
      console.error('❌ [TodosRequerimentos] Erro ao carregar dados:', error);
      setTodosRequerimentos([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRequest = (requestId) => {
    setExpandedRequests(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não informada';
    
    // Evitar conversão de timezone usando split manual
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    
    return dateString;
  };

  const getCategoryTitle = () => {
    switch (category) {
      case 'audiovisual':
        return 'Materiais de Audiovisual';
      case 'servico-geral':
        return 'Materiais de Serviço Geral';
      case 'decoracao':
        return 'Materiais de Decoração';
      case 'esportes':
        return 'Materiais de Esportes';
      default:
        return 'Materiais';
    }
  };

  const getNoItemsMessage = () => {
    switch (category) {
      case 'audiovisual':
        return 'Esta requisição não possui itens de audiovisual.';
      case 'servico-geral':
        return 'Esta requisição não possui itens de serviço geral.';
      case 'decoracao':
        return 'Esta requisição não possui itens de decoração.';
      case 'esportes':
        return 'Esta requisição não possui itens de esportes.';
      default:
        return 'Esta requisição não possui itens.';
    }
  };

  if (loading) {
    return (
      <div className="todos-requerimentos-loading">
        <div className="loading-spinner"></div>
        <p>Carregando requerimentos...</p>
      </div>
    );
  }

  const totalRequisicoes = todosRequerimentos.length;
  const totalItens = todosRequerimentos.reduce((total, req) => total + (req.items?.length || 0), 0);
  const itensSeparados = todosRequerimentos.reduce((total, req) => {
    return total + (req.items?.filter(item => item.is_separated).length || 0);
  }, 0);

  return (
    <div className="todos-requerimentos">
      <div className="todos-requerimentos-header">
        <h3>Todos os Requerimentos</h3>
        <div className="todos-requerimentos-summary">
          <span>{totalRequisicoes} REQUISIÇÕES</span>
          <span>{itensSeparados} SEPARADOS</span>
          <span>{totalItens - itensSeparados} PENDENTES</span>
        </div>
      </div>

      <div className="materials-list">
        {todosRequerimentos.length > 0 ? (
          todosRequerimentos.map((requisicao, index) => {
            const requestId = requisicao.id;
            const isExpanded = !!expandedRequests[requestId];
            
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
                      {requisicao.approved_by_name && (
                        <span className="approved-by">
                          <FiUsers size={14} />
                          Aprovado por: {requisicao.approved_by_name}
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
                          color: requisicao.status === 'APTO' ? '#4caf50' : 
                                 requisicao.status === 'PENDENTE' ? '#ff9800' :
                                 requisicao.status === 'REJEITADO' ? '#f44336' :
                                 requisicao.status === 'EXECUTADO' ? '#2196f3' :
                                 requisicao.status === 'FINALIZADO' ? '#9c27b0' : '#757575',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '700'
                        }}
                      >
                        {requisicao.status || 'PENDENTE'}
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
                        <h5>{getCategoryTitle()}:</h5>
                        <div className="items-list">
                          {requisicao.items.map((item) => (
                            <div key={item.id} className="item">
                              <div className="item-info">
                                <span className="item-name">{item.item_name}</span>
                                <span className="item-quantity">Qtd: {item.quantity_requested}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="no-items">
                        <p>{getNoItemsMessage()}</p>
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
