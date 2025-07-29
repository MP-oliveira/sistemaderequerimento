import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiAlertTriangle, FiEdit3, FiPackage, FiClock, FiMapPin } from 'react-icons/fi';
import Button from './Button';
import Modal from './Modal';
import './RequestItemsChecklist.css';

export default function RequestItemsChecklist({ open, onClose, request, onItemsUpdated }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [unavailableReason, setUnavailableReason] = useState('');
  const [audiovisualNotes, setAudiovisualNotes] = useState('');

  useEffect(() => {
    if (open && request?.id) {
      fetchItems();
    }
  }, [open, request?.id]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/request-items/request/${request.id}/with-inventory`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    }
    setLoading(false);
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
        fetchItems();
        if (onItemsUpdated) onItemsUpdated();
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
        fetchItems();
        if (onItemsUpdated) onItemsUpdated();
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
        fetchItems();
        if (onItemsUpdated) onItemsUpdated();
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
    switch (item.item_status) {
      case 'SEPARADO':
        return <FiCheck className="status-icon separated" />;
      case 'INDISPONIVEL':
        return <FiX className="status-icon unavailable" />;
      case 'PENDENTE':
      default:
        return <FiClock className="status-icon pending" />;
    }
  };

  const getStatusText = (item) => {
    switch (item.item_status) {
      case 'SEPARADO':
        return 'Separado';
      case 'INDISPONIVEL':
        return 'Indisponível';
      case 'PENDENTE':
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = (item) => {
    switch (item.item_status) {
      case 'SEPARADO':
        return '#4caf50';
      case 'INDISPONIVEL':
        return '#f44336';
      case 'PENDENTE':
      default:
        return '#ff9800';
    }
  };

  return (
    <Modal
      open={open}
      title={`Checklist de Itens - ${request?.event_name || request?.description || 'Evento'}`}
      onClose={onClose}
      size="large"
    >
      <div className="request-items-checklist">
        {loading ? (
          <div className="checklist-loading">
            <div className="loading-spinner"></div>
            <p>Carregando itens...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="checklist-empty">
            <FiPackage size={48} />
            <h3>Nenhum item encontrado</h3>
            <p>Esta requisição não possui itens associados.</p>
          </div>
        ) : (
          <div className="checklist-items">
            {items.map((item) => (
              <div key={item.id} className={`checklist-item ${item.item_status?.toLowerCase()}`}>
                <div className="item-header">
                  <div className="item-info">
                    <h4 className="item-name">{item.item_name}</h4>
                    <div className="item-details">
                      <span className="item-quantity">Qtd: {item.quantity_requested}</span>
                      {item.inventory && (
                        <>
                          <span className="item-location">
                            <FiMapPin size={12} />
                            {item.inventory.location}
                          </span>
                          <span className="item-available">
                            Disponível: {item.inventory.quantity_available}
                          </span>
                        </>
                      )}
                    </div>
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
                </div>

                {item.unavailable_reason && (
                  <div className="item-unavailable-reason">
                    <FiAlertTriangle size={14} />
                    <span><strong>Motivo:</strong> {item.unavailable_reason}</span>
                  </div>
                )}

                {item.audiovisual_notes && (
                  <div className="item-notes">
                    <FiEdit3 size={14} />
                    <span><strong>Observações:</strong> {item.audiovisual_notes}</span>
                  </div>
                )}

                <div className="item-actions">
                  {item.item_status === 'PENDENTE' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => markItemAsAvailableAndSeparated(item.id)}
                      >
                        <FiCheck size={14} />
                        Marcar como Disponível
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openUnavailableModal(item)}
                      >
                        <FiX size={14} />
                        Marcar como Indisponível
                      </Button>
                    </>
                  )}
                  
                  {item.item_status === 'INDISPONIVEL' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => markItemAsAvailableAndSeparated(item.id)}
                    >
                      <FiCheck size={14} />
                      Marcar como Disponível
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
        )}
      </div>

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
    </Modal>
  );
} 