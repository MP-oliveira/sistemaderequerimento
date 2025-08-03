import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiPackage, FiClock, FiAlertTriangle, FiEdit3, FiChevronDown, FiChevronRight, FiMapPin } from 'react-icons/fi';
import { getExecutedItems, markItemAsReturned, marcarItemComoSeparado } from '../services/requestItemsService';
import { listarRequisicoes } from '../services/requestsService';
import Modal from './Modal';
import Button from './Button';
import './ReturnMaterials.css';
import './TodayMaterials.css';

const ReturnMaterials = () => {
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
        getExecutedItems(),
        listarRequisicoes()
      ]);
      
      setExecutedItems(itemsResponse.data || []);
      setRequisicoes(requisicoesData || []);
    } catch (error) {
      console.error('🎯 ReturnMaterials - Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar itens por requisição
  const agruparItensPorRequisicao = (items) => {
    const grupos = {};
    
    items.forEach(item => {
      const requestId = item.request_id;
      const request = requisicoes.find(req => req.id === requestId);
      
      // Pular requisições finalizadas
      if (request && request.status === 'FINALIZADO') {
        return;
      }
      
      if (!grupos[requestId]) {
        grupos[requestId] = {
          request: request || {},
          items: []
        };
      }
      grupos[requestId].items.push(item);
    });
    
    return Object.values(grupos);
  };

  // Itens para despachar (status PENDENTE ou SEPARADO) - apenas eventos próximos
  const itensParaDespachar = executedItems.filter(item => {
    // Verificar se o item não está separado
    const naoSeparado = !item.is_separated || item.is_separated === false;
    
    if (!naoSeparado) return false;
    
    // Verificar se o evento é próximo (hoje ou próximos 7 dias)
    if (item.requests && item.requests.date) {
      const eventDate = new Date(item.requests.date);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      return eventDate >= today && eventDate <= nextWeek;
    }
    
    return false;
  });

  // Itens para retorno (status EXECUTADO) - apenas eventos recentes
  const itensParaRetorno = executedItems.filter(item => {
    // Verificar se o item está separado
    const separado = item.is_separated === true;
    
    if (!separado) return false;
    
    // Verificar se o evento é recente (últimos 7 dias ou hoje)
    if (item.requests && item.requests.date) {
      const eventDate = new Date(item.requests.date);
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      
      return eventDate >= lastWeek && eventDate <= today;
    }
    
    return false;
  });

  const toggleRequest = (requestId) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const handleToggleReturned = async (itemId, currentStatus) => {
    try {
      await markItemAsReturned(itemId, currentStatus);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao marcar item como retornado:', error);
    }
  };

  const handleToggleSeparated = async (itemId, currentStatus) => {
    try {
      await marcarItemComoSeparado(itemId, !currentStatus);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao marcar item como separado:', error);
    }
  };

  const markItemAsUnavailable = async () => {
    if (!selectedItem) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/request-items/${selectedItem.id}/unavailable`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          unavailable_reason: unavailableReason,
          audiovisual_notes: audiovisualNotes
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar item como indisponível');
      }

      await carregarDados();
      setShowUnavailableModal(false);
      setSelectedItem(null);
      setUnavailableReason('');
      setAudiovisualNotes('');
    } catch (error) {
      console.error('Erro ao marcar item como indisponível:', error);
    }
  };

  const markItemAsAvailableAndSeparated = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/request-items/${itemId}/available-and-separated`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar item como disponível e separado');
      }

      await carregarDados();
    } catch (error) {
      console.error('Erro ao marcar item como disponível e separado:', error);
    }
  };

  const updateNotes = async () => {
    if (!selectedItem) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/request-items/${selectedItem.id}/notes`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audiovisual_notes: audiovisualNotes
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar observações');
      }

      await carregarDados();
      setShowNotesModal(false);
      setSelectedItem(null);
      setAudiovisualNotes('');
    } catch (error) {
      console.error('Erro ao atualizar observações:', error);
    }
  };

  const openUnavailableModal = (item) => {
    setSelectedItem(item);
    setUnavailableReason('');
    setAudiovisualNotes('');
    setShowUnavailableModal(true);
  };

  const openNotesModal = (item) => {
    setSelectedItem(item);
    setAudiovisualNotes(item.audiovisual_notes || '');
    setShowNotesModal(true);
  };

  const getStatusIcon = (item) => {
    if (item.is_returned) {
      return <FiCheck size={16} style={{ color: '#2196f3' }} />;
    } else if (item.is_separated) {
      return <FiPackage size={16} style={{ color: '#4caf50' }} />;
    } else {
      return <FiAlertTriangle size={16} style={{ color: '#ff9800' }} />;
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
      return '#2196f3';
    } else if (item.is_separated) {
      return '#4caf50';
    } else {
      return '#ff9800';
    }
  };

  if (loading) {
    return (
      <div className="return-materials">
        <h3>Materiais Audiovisual</h3>
        <p>Carregando...</p>
      </div>
    );
  }

  const gruposParaDespachar = agruparItensPorRequisicao(itensParaDespachar);
  const gruposParaRetorno = agruparItensPorRequisicao(itensParaRetorno);

  // Calcular totais para o resumo
  const totalParaDespachar = gruposParaDespachar.reduce((total, grupo) => total + grupo.items.length, 0);
  const totalSeparados = gruposParaDespachar.reduce((total, grupo) => 
    total + grupo.items.filter(item => item.is_separated).length, 0
  );
  const totalPendentes = totalParaDespachar - totalSeparados;

  const totalParaRetorno = gruposParaRetorno.reduce((total, grupo) => total + grupo.items.length, 0);
  const totalRetornados = gruposParaRetorno.reduce((total, grupo) => 
    total + grupo.items.filter(item => item.is_returned).length, 0
  );
  const totalNaoRetornados = totalParaRetorno - totalRetornados;

  return (
    <div className="return-materials">
      {/* Header com resumo igual ao TodayMaterials */}
      <div className="materials-header">
        <h3 className="section-title">
          <FiPackage style={{marginRight: 8}} />
          Materiais para Despachar (Próximos 7 dias)
        </h3>
        <div className="materials-summary">
          <div className="summary-item">
            <span className="summary-number">{totalParaDespachar}</span>
            <span className="summary-label">Total</span>
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

      {/* Seção: Materiais para Despachar */}
      <div className="materials-list">
        {gruposParaDespachar.length > 0 ? (
          gruposParaDespachar.map((grupo, index) => {
            const requestId = grupo.request.id;
            const isExpanded = expandedRequests.has(requestId);
            
            // Calcular contadores para esta requisição
            const totalCount = grupo.items.length;
            const separatedCount = grupo.items.filter(item => item.is_separated).length;
            
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
                          className={`material-item ${item.is_separated ? 'separated' : ''}`}
                        >
                          <div className="item-info">
                            <span className="item-name">{item.item_name}</span>
                            <span className="item-quantity">Qtd: {item.quantity_requested}</span>
                            {item.description && (
                              <span className="item-description">{item.description}</span>
                            )}
                          </div>
                          
                          <button
                            className={`separate-btn ${item.is_separated ? 'separated' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSeparated(item.id, item.is_separated);
                            }}
                            title={item.is_separated ? 'Desmarcar como separado' : 'Marcar como separado'}
                          >
                            {item.is_separated ? <FiCheck size={16} /> : <FiX size={16} />}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="request-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${totalCount > 0 ? (separatedCount / totalCount) * 100 : 0}%` }}></div>
                      </div>
                      <span className="progress-text">
                        {separatedCount} de {totalCount} materiais separados
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>Nenhum material para despachar</p>
        )}
      </div>

      {/* Seção: Retorno de Instrumentos */}
      <div className="materials-section">
        <div className="materials-header">
          <h3 className="section-title">
            <FiClock style={{marginRight: 8}} />
            Retorno de Instrumentos (Últimos 7 dias)
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
                            
                            <button
                              className={`separate-btn ${item.is_returned ? 'returned' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleReturned(item.id, item.is_returned);
                              }}
                              title={item.is_returned ? 'Desmarcar como retornado' : 'Marcar como retornado'}
                            >
                              {item.is_returned ? <FiCheck size={16} /> : <FiX size={16} />}
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="request-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${totalCount > 0 ? (returnedCount / totalCount) * 100 : 0}%` }}></div>
                        </div>
                        <span className="progress-text">
                          {returnedCount} de {totalCount} materiais retornados
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>Nenhum material para retorno</p>
          )}
        </div>
      </div>

      {gruposParaDespachar.length === 0 && gruposParaRetorno.length === 0 && (
        <div className="no-materials">
          <FiPackage size={48} />
          <h3>Nenhum material encontrado</h3>
          <p>Não há materiais para despachar ou retornar no momento.</p>
        </div>
      )}

      {/* Modal para marcar como indisponível */}
      <Modal
        open={showUnavailableModal}
        title="Marcar Item como Indisponível"
        onClose={() => setShowUnavailableModal(false)}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={() => setShowUnavailableModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={markItemAsUnavailable}>
              Confirmar
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label>Motivo da Indisponibilidade:</label>
            <select
              value={unavailableReason}
              onChange={(e) => setUnavailableReason(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginTop: '4px'
              }}
            >
              <option value="">Selecione um motivo</option>
              <option value="Item quebrado">Item quebrado</option>
              <option value="Item perdido">Item perdido</option>
              <option value="Em uso em outro evento">Em uso em outro evento</option>
              <option value="Em manutenção">Em manutenção</option>
              <option value="Quantidade insuficiente">Quantidade insuficiente</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          
          <div>
            <label>Observações (opcional):</label>
            <textarea
              value={audiovisualNotes}
              onChange={(e) => setAudiovisualNotes(e.target.value)}
              placeholder="Adicione observações sobre o item..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical',
                marginTop: '4px'
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Modal para observações */}
      <Modal
        open={showNotesModal}
        title="Observações do Item"
        onClose={() => setShowNotesModal(false)}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={() => setShowNotesModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={updateNotes}>
              Salvar
            </Button>
          </div>
        }
      >
        <div>
          <label>Observações:</label>
          <textarea
            value={audiovisualNotes}
            onChange={(e) => setAudiovisualNotes(e.target.value)}
            placeholder="Adicione observações sobre o item..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              resize: 'vertical',
              marginTop: '4px'
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ReturnMaterials; 