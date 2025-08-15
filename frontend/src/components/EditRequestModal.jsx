import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { departamentosOptions } from '../utils/departamentosConfig';
import { PRIORIDADE_OPTIONS } from '../utils/prioridadeConfig';
import { FiX, FiSearch } from 'react-icons/fi';

export default function EditRequestModal({ open, onClose, request, onSave }) {
  console.log('🔍 EditRequestModal renderizado - open:', open, 'request:', request);
  
  const [editedRequest, setEditedRequest] = useState(request || {});
  const [saving, setSaving] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);

  // Atualizar dados quando o request mudar
  React.useEffect(() => {
    setEditedRequest(request || {});
    // Carregar itens e serviços existentes
    if (request) {
      setSelectedItems(request.request_items || []);
      setSelectedServices(request.request_services || []);
    }
  }, [request]);

  // Funções para gerenciar itens
  const alterarQuantidadeItem = (itemId, novaQuantidade) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: novaQuantidade }
          : item
      )
    );
  };

  const removerItem = (itemId) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Funções para gerenciar serviços
  const alterarQuantidadeServico = (tipo, novaQuantidade) => {
    setSelectedServices(prev => 
      prev.map(servico => 
        servico.tipo === tipo 
          ? { ...servico, quantidade: novaQuantidade }
          : servico
      )
    );
  };

  const removerServico = (tipo) => {
    setSelectedServices(prev => prev.filter(servico => servico.tipo !== tipo));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const requestCompleto = {
        ...editedRequest,
        request_items: selectedItems,
        request_services: selectedServices
      };
      await onSave(requestCompleto);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedRequest(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!request) {
    console.log('🔍 EditRequestModal - request é null, não renderizando');
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar Requisição"
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </>
      }
      style={{ width: '800px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
    >
      <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Primeira linha - Departamento e Nome do Evento */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Departamento</label>
              <select
                className="input-field"
                value={editedRequest.department || ''}
                onChange={e => handleInputChange('department', e.target.value)}
                required
              >
                {departamentosOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Nome do Evento</label>
              <input
                className="input-field"
                type="text"
                value={editedRequest.event_name || ''}
                onChange={e => handleInputChange('event_name', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Segunda linha - Data e Local */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Data</label>
              <input
                className="input-field"
                type="date"
                value={editedRequest.start_datetime ? editedRequest.start_datetime.split('T')[0] : ''}
                onChange={e => {
                  const currentTime = editedRequest.start_datetime ? editedRequest.start_datetime.split('T')[1] : '00:00';
                  handleInputChange('start_datetime', `${e.target.value}T${currentTime}`);
                  if (editedRequest.end_datetime) {
                    handleInputChange('end_datetime', `${e.target.value}T${editedRequest.end_datetime.split('T')[1]}`);
                  }
                }}
                required
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Local</label>
              <select
                className="input-field"
                value={editedRequest.location || ''}
                onChange={e => handleInputChange('location', e.target.value)}
              >
                <option value="">Selecione um local</option>
                <option value="AUDITORIO">Auditório</option>
                <option value="SALA_DE_REUNIAO">Sala de Reunião</option>
                <option value="LABORATORIO">Laboratório</option>
                <option value="SALA_DE_AULA">Sala de Aula</option>
                <option value="GINASIO">Ginásio</option>
                <option value="BIBLIOTECA">Biblioteca</option>
                <option value="CAFETERIA">Cafeteria</option>
                <option value="SALA_DE_TREINAMENTO">Sala de Treinamento</option>
              </select>
            </div>
          </div>
        </div>

        {/* Terceira linha - Hora de Início e Fim */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Hora de Início</label>
              <input
                className="input-field"
                type="time"
                value={editedRequest.start_datetime ? editedRequest.start_datetime.split('T')[1] : ''}
                onChange={e => {
                  const currentDate = editedRequest.start_datetime ? editedRequest.start_datetime.split('T')[0] : new Date().toISOString().split('T')[0];
                  handleInputChange('start_datetime', `${currentDate}T${e.target.value}`);
                }}
                required
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Hora de Fim</label>
              <input
                className="input-field"
                type="time"
                value={editedRequest.end_datetime ? editedRequest.end_datetime.split('T')[1] : ''}
                onChange={e => {
                  const currentDate = editedRequest.end_datetime ? editedRequest.end_datetime.split('T')[0] : new Date().toISOString().split('T')[0];
                  handleInputChange('end_datetime', `${currentDate}T${e.target.value}`);
                }}
                required
              />
            </div>
          </div>
        </div>

        {/* Quarta linha - Público Esperado e Prioridade */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Público Esperado</label>
              <input
                className="input-field"
                type="number"
                value={editedRequest.expected_audience || ''}
                onChange={e => handleInputChange('expected_audience', e.target.value)}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Prioridade</label>
              <select
                className="input-field"
                value={editedRequest.prioridade || ''}
                onChange={e => handleInputChange('prioridade', e.target.value)}
              >
                {PRIORIDADE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="input-group">
          <label className="input-label">Descrição</label>
          <textarea
            className="input-field"
            value={editedRequest.description || ''}
            onChange={e => handleInputChange('description', e.target.value)}
            rows={4}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Seção de Itens do Inventário */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: '#374151' }}>Itens do Inventário</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setShowInventoryModal(true)}
              >
                Adicionar Item
              </Button>
            </div>
          </div>
          
          {selectedItems.length > 0 ? (
            <div style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '0.75rem',
              backgroundColor: '#f9fafb',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {selectedItems.map((item) => (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    backgroundColor: '#fff'
                  }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{item.name}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Disponível: {item.quantity_available}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        min="1"
                        max={item.quantity_available}
                        value={item.quantity}
                        onChange={(e) => alterarQuantidadeItem(item.id, parseInt(e.target.value) || 0)}
                        style={{
                          width: '50px',
                          padding: '0.25rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontSize: '0.75rem'
                        }}
                      />
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removerItem(item.id)}
                        style={{ padding: '0.25rem', minWidth: 'auto' }}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '1rem',
              textAlign: 'center',
              color: '#6b7280',
              backgroundColor: '#f9fafb'
            }}>
              Nenhum item selecionado
            </div>
          )}
        </div>

        {/* Seção de Serviços Solicitados */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: '#374151' }}>Serviços Solicitados</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setShowServicesModal(true)}
              >
                Adicionar Serviços
              </Button>
            </div>
          </div>
          
          {selectedServices.length > 0 ? (
            <div style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '0.75rem',
              backgroundColor: '#f9fafb',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {selectedServices.map((servico) => (
                  <div key={servico.tipo} style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    backgroundColor: '#fff'
                  }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{servico.nome}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        min="1"
                        value={servico.quantidade}
                        onChange={(e) => alterarQuantidadeServico(servico.tipo, parseInt(e.target.value) || 0)}
                        style={{
                          width: '50px',
                          padding: '0.25rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontSize: '0.75rem'
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>pessoas</span>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removerServico(servico.tipo)}
                        style={{ padding: '0.25rem', minWidth: 'auto' }}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '1rem',
              textAlign: 'center',
              color: '#6b7280',
              backgroundColor: '#f9fafb'
            }}>
              Nenhum serviço selecionado
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
