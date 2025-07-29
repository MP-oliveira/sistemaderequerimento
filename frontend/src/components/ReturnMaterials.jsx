import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiPackage, FiClock, FiAlertTriangle, FiEdit3, FiChevronDown } from 'react-icons/fi';
import { getExecutedItems, markItemAsReturned } from '../services/requestItemsService';
import { listarRequisicoes } from '../services/requestsService';
import Modal from './Modal';
import Button from './Button';
import './ReturnMaterials.css';

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
      if (!grupos[requestId]) {
        grupos[requestId] = {
          request: requisicoes.find(req => req.id === requestId) || {},
          items: []
        };
      }
      grupos[requestId].items.push(item);
    });
    
    return Object.values(grupos);
  };

  // Itens para despachar (status PENDENTE ou SEPARADO)
  const itensParaDespachar = executedItems.filter(item => 
    !item.is_separated || item.is_separated === false
  );

  // Itens para retorno (status EXECUTADO)
  const itensParaRetorno = executedItems.filter(item => 
    item.is_separated === true
  );

  const toggleRequest = (requestId) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const handleToggleReturned = async (itemId) => {
    try {
      await markItemAsReturned(itemId);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao marcar item como retornado:', error);
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
      
      if (response.ok) {
        setShowUnavailableModal(false);
        setUnavailableReason('');
        setAudiovisualNotes('');
        setSelectedItem(null);
        await carregarDados();
      }
    } catch (error) {
      console.error('Erro ao marcar item como indisponível:', error);
    }
  };

  const markItemAsAvailableAndSeparated = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/request-items/${itemId}/available-separated`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audiovisual_notes: audiovisualNotes
        })
      });
      
      if (response.ok) {
        await carregarDados();
      }
    } catch (error) {
      console.error('Erro ao marcar item como disponível:', error);
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
      
      if (response.ok) {
        setShowNotesModal(false);
        setAudiovisualNotes('');
        setSelectedItem(null);
        await carregarDados();
      }
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
    if (item.is_separated) {
      return <FiCheck size={16} className="status-icon separated" />;
    } else if (item.is_returned) {
      return <FiCheck size={16} className="status-icon returned" />;
    } else {
      return <FiClock size={16} className="status-icon pending" />;
    }
  };

  const getStatusText = (item) => {
    if (item.is_separated) {
      return 'Separado';
    } else if (item.is_returned) {
      return 'Retornado';
    } else {
      return 'Pendente';
    }
  };

  const getStatusColor = (item) => {
    if (item.is_separated) {
      return '#4caf50';
    } else if (item.is_returned) {
      return '#2196f3';
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

  return (
    <div className="return-materials">
      <h3>Materiais Audiovisual</h3>
      
      {/* Seção: Materiais para Despachar */}
      <div className="materials-section">
        <h3 className="section-title">
          <FiPackage size={18} />
          Materiais para Despachar ({gruposParaDespachar.length})
        </h3>
        
        {gruposParaDespachar.length > 0 ? (
          gruposParaDespachar.map((grupo, index) => {
            const requestId = grupo.request.id;
            const isExpanded = expandedRequests.has(requestId);
            
            return (
              <div key={index} className="request-group">
                <div 
                  className={`request-header ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleRequest(requestId)}
                >
                  <div>
                    <h4 className="request-title">
                      {grupo.request.event_name || grupo.request.description || 'Requisição não identificada'}
                    </h4>
                    <div className="request-info">
                      <span className="request-department">{grupo.request.department}</span>
                      <span className="request-date">{grupo.request.date}</span>
                      <span className="request-location">{grupo.request.location}</span>
                    </div>
                  </div>
                  <FiChevronDown className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
                </div>
                
                <div className={`request-content ${isExpanded ? 'expanded' : ''}`}>
                  <div className="items-checklist">
                    {grupo.items.map((item) => (
                      <div key={item.id} className={`checklist-item ${item.is_separated ? 'separado' : 'pendente'}`}>
                        <div className="item-info">
                          <span className="item-name">{item.item_name}</span>
                          <span className="item-quantity">Qtd: {item.quantity_requested}</span>
                        </div>
                        
                        <div className="item-status">
                          {getStatusIcon(item)}
                          <span 
                            className="status-text"
                            style={{ color: getStatusColor(item) }}
                          >
                            {getStatusText(item)}
                          </span>
                        </div>

                        <div className="item-actions">
                          {!item.is_separated && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => markItemAsAvailableAndSeparated(item.id)}
                            >
                              <FiCheck size={14} />
                              Marcar como Separado
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openNotesModal(item)}
                          >
                            <FiEdit3 size={14} />
                            Observações
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p>Nenhum material para despachar</p>
        )}
      </div>

      {/* Seção: Retorno de Instrumentos */}
      <div className="materials-section">
        <h3 className="section-title">
          <FiClock size={18} />
          Retorno de Instrumentos ({gruposParaRetorno.length})
        </h3>
        
        {gruposParaRetorno.length > 0 ? (
          gruposParaRetorno.map((grupo, index) => {
            const requestId = grupo.request.id;
            const isExpanded = expandedRequests.has(requestId);
            
            return (
              <div key={index} className="request-group">
                <div 
                  className={`request-header ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleRequest(requestId)}
                >
                  <div>
                    <h4 className="request-title">
                      {grupo.request.event_name || grupo.request.description || 'Requisição não identificada'}
                    </h4>
                    <div className="request-info">
                      <span className="request-department">{grupo.request.department}</span>
                      <span className="request-date">{grupo.request.date}</span>
                      <span className="request-location">{grupo.request.location}</span>
                    </div>
                  </div>
                  <FiChevronDown className={`expand-icon ${isExpanded ? 'expanded' : ''}`} />
                </div>
                
                <div className={`request-content ${isExpanded ? 'expanded' : ''}`}>
                  <div className="items-return-list">
                    {grupo.items.map((item) => (
                      <div key={item.id} className="return-item">
                        <div className="item-info">
                          <span className="item-name">{item.item_name}</span>
                          <span className="item-quantity">Qtd: {item.quantity_requested}</span>
                        </div>
                        <button
                          className="return-button"
                          onClick={() => handleToggleReturned(item.id)}
                          title="Marcar como retornado"
                        >
                          <FiCheck />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p>Nenhum material para retorno</p>
        )}
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