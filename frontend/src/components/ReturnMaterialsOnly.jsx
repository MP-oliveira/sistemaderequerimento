import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiPackage, FiClock, FiAlertTriangle, FiEdit3, FiChevronDown, FiChevronRight, FiMapPin } from 'react-icons/fi';
import { getExecutedItemsByCategory, markItemAsReturned, marcarItemComoSeparado } from '../services/requestItemsService';
import { listarRequisicoes } from '../services/requestsService';
import Modal from './Modal';
import Button from './Button';
import './ReturnMaterials.css';
import './TodayMaterials.css';

const ReturnMaterialsOnly = () => {
  const [executedItems, setExecutedItems] = useState([]);
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [unavailableReason, setUnavailableReason] = useState('');
  const [audiovisualNotes, setAudiovisualNotes] = useState('');
  const [expandedRequests, setExpandedRequests] = useState(new Set());

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [itemsResponse, requisicoesData] = await Promise.all([
        getExecutedItemsByCategory('servico-geral'),
        listarRequisicoes()
      ]);
      
      setExecutedItems(itemsResponse.data || []);
      setRequisicoes(requisicoesData || []);
    } catch (error) {
      console.error('🎯 ReturnMaterialsOnly - Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar itens por requisição
  const agruparItensPorRequisicao = (items) => {
    const grupos = {};
    
    items.forEach(item => {
      const requestId = item.request_id;
      
      // Usar os dados da requisição que já estão no item
      const request = item.requests || {};
      
      // Pular requisições finalizadas
      if (request.status === 'FINALIZADO') {
        return;
      }
      
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

  // Itens para retorno (status EXECUTADO) - apenas eventos recentes
  const itensParaRetorno = executedItems.filter(item => {
    // Verificar se o item está separado
    const separado = item.is_separated === true;
    
    if (!separado) return false;
    
    // Verificar se o evento é recente (próximos 7 dias ou hoje)
    if (item.requests && item.requests.date) {
      const eventDate = new Date(item.requests.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Zerar horas para comparação de data
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999); // Final do dia
      
      // Converter para string de data para comparação sem timezone
      const eventDateStr = eventDate.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      
      const isRecent = eventDateStr >= todayStr && eventDateStr <= nextWeekStr;
      console.log(`🔍 [ReturnMaterialsOnly] Item: ${item.item_name}, Data evento: ${item.requests.date}, EventDateStr: ${eventDateStr}, TodayStr: ${todayStr}, NextWeekStr: ${nextWeekStr}, É recente: ${isRecent}`);
      
      return isRecent;
    }
    
    console.log(`🔍 [ReturnMaterialsOnly] Item: ${item.item_name}, Sem data de evento`);
    return false;
  });

  const toggleRequest = (requestId) => {
    setExpandedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const handleToggleReturned = async (itemId, currentStatus) => {
    try {
      await markItemAsReturned(itemId, !currentStatus);
      carregarDados();
    } catch (error) {
      console.error('Erro ao marcar item como retornado:', error);
    }
  };

  const handleToggleSeparated = async (itemId, currentStatus) => {
    try {
      await marcarItemComoSeparado(itemId, !currentStatus);
      carregarDados();
    } catch (error) {
      console.error('Erro ao marcar item como separado:', error);
    }
  };

  const markItemAsUnavailable = async () => {
    if (!selectedItem || !unavailableReason.trim()) return;
    
    try {
      // Implementar lógica para marcar como indisponível
      setShowUnavailableModal(false);
      setUnavailableReason('');
      setSelectedItem(null);
      carregarDados();
    } catch (error) {
      console.error('Erro ao marcar item como indisponível:', error);
    }
  };

  const markItemAsAvailableAndSeparated = async (itemId) => {
    try {
      await marcarItemComoSeparado(itemId, true);
      carregarDados();
    } catch (error) {
      console.error('Erro ao marcar item como disponível e separado:', error);
    }
  };

  const updateNotes = async () => {
    if (!selectedItem || !audiovisualNotes.trim()) return;
    
    try {
      // Implementar lógica para atualizar notas
      setShowNotesModal(false);
      setAudiovisualNotes('');
      setSelectedItem(null);
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar notas:', error);
    }
  };

  const openUnavailableModal = (item) => {
    setSelectedItem(item);
    setShowUnavailableModal(true);
  };

  const openNotesModal = (item) => {
    setSelectedItem(item);
    setAudiovisualNotes(item.audiovisual_notes || '');
    setShowNotesModal(true);
  };

  const getStatusIcon = (item) => {
    if (item.is_returned) {
      return <FiCheck size={16} />;
    } else if (item.is_separated) {
      return <FiPackage size={16} />;
    } else {
      return <FiAlertTriangle size={16} />;
    }
  };

  const getStatusText = (item) => {
    if (item.is_returned) {
      return 'Retornado';
    } else if (item.is_separated) {
      return 'Separado';
    } else {
      return 'Pendente';
    }
  };

  const getStatusColor = (item) => {
    if (item.is_returned) {
      return '#4caf50';
    } else if (item.is_separated) {
      return '#4caf50';
    } else {
      return '#ff9800';
    }
  };

  if (loading) {
    return (
      <div className="return-materials">
        <p>Carregando...</p>
      </div>
    );
  }

  const gruposParaRetorno = agruparItensPorRequisicao(itensParaRetorno);

  // Calcular totais para o resumo
  const totalParaRetorno = gruposParaRetorno.reduce((total, grupo) => total + grupo.items.length, 0);
  const totalRetornados = gruposParaRetorno.reduce((total, grupo) => 
    total + grupo.items.filter(item => item.is_returned).length, 0
  );
  const totalNaoRetornados = totalParaRetorno - totalRetornados;

  return (
    <div className="return-materials">
      <div className="materials-header">
        <h3 className="section-title">
          <FiClock style={{marginRight: 8}} />
          Retorno de Materiais (Próximos 7 dias)
        </h3>
        <div className="materials-summary">
          <div className="summary-item">
            <span className="summary-number">{totalParaRetorno}</span>
            <span className="summary-label">Total</span>
          </div>
          <div className="summary-item">
            <span className="summary-number success">{totalRetornados}</span>
            <span className="summary-label">Retornados</span>
          </div>
          <div className="summary-item">
            <span className="summary-number warning">{totalNaoRetornados}</span>
            <span className="summary-label">Pendentes</span>
          </div>
        </div>
      </div>
      
      <div className="materials-list">
          {gruposParaRetorno.length > 0 ? (
            gruposParaRetorno.map((grupo, index) => {
              const requestId = grupo.request.id;
              const isExpanded = expandedRequests.has(requestId);
              
              // Calcular contadores para esta requisição
              const totalCount = grupo.items.length;
              const returnedCount = grupo.items.filter(item => item.is_returned).length;
              
              return (
                <div key={index} className="request-materials-card">
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
                          {grupo.request.date}
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
                            color: '#9c27b0',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '700'
                          }}
                        >
                          EXECUTADO
                        </span>
                        <span className="items-count">
                          {returnedCount}/{totalCount} itens
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="materials-items accordion-content">
                      <h5>Materiais para Retorno:</h5>
                      <div className="items-list">
                        {grupo.items.map((item) => (
                          <div 
                            key={item.id} 
                            className={`material-item ${item.is_returned ? 'returned' : ''}`}
                          >
                            <div className="item-info">
                              <span className="item-name">{item.item_name}</span>
                              <span className="item-quantity">Qtd: {item.quantity_requested}</span>
                              {item.description && (
                                <span className="item-description">{item.description}</span>
                              )}
                            </div>
                            <div className="item-actions">
                              <button
                                className={`return-button ${item.is_returned ? 'returned' : ''}`}
                                onClick={() => handleToggleReturned(item.id, item.is_returned)}
                                title={item.is_returned ? 'Marcar como não retornado' : 'Marcar como retornado'}
                              >
                                {item.is_returned ? <FiCheck size={16} /> : <FiX size={16} />}
                              </button>
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
              <FiPackage size={48} />
              <h3>Nenhum material para retorno</h3>
              <p>Não há materiais aguardando retorno nos próximos 7 dias</p>
            </div>
          )}
        </div>

      {/* Modal para marcar como indisponível */}
      <Modal
        open={showUnavailableModal}
        onClose={() => setShowUnavailableModal(false)}
        title="Marcar como Indisponível"
      >
        <div className="modal-content">
          <p>Motivo da indisponibilidade:</p>
          <textarea
            value={unavailableReason}
            onChange={(e) => setUnavailableReason(e.target.value)}
            placeholder="Descreva o motivo..."
            rows={3}
            style={{ width: '100%', marginBottom: '1rem' }}
          />
          <div className="modal-actions">
            <Button onClick={markItemAsUnavailable} variant="danger">
              Confirmar
            </Button>
            <Button onClick={() => setShowUnavailableModal(false)} variant="secondary">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para notas audiovisual */}
      <Modal
        open={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title="Notas Audiovisual"
      >
        <div className="modal-content">
          <textarea
            value={audiovisualNotes}
            onChange={(e) => setAudiovisualNotes(e.target.value)}
            placeholder="Adicione observações..."
            rows={4}
            style={{ width: '100%', marginBottom: '1rem' }}
          />
          <div className="modal-actions">
            <Button onClick={updateNotes} variant="primary">
              Salvar
            </Button>
            <Button onClick={() => setShowNotesModal(false)} variant="secondary">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReturnMaterialsOnly; 