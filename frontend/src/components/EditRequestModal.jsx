import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { departamentosOptions } from '../utils/departamentosConfig';
import { PRIORIDADE_OPTIONS } from '../utils/prioridadeConfig';

export default function EditRequestModal({ open, onClose, request, onSave }) {
  console.log('🔍 EditRequestModal renderizado - open:', open, 'request:', request);
  
  const [editedRequest, setEditedRequest] = useState(request || {});
  const [saving, setSaving] = useState(false);

  // Atualizar dados quando o request mudar
  React.useEffect(() => {
    setEditedRequest(request || {});
  }, [request]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(editedRequest);
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
      </form>
    </Modal>
  );
}
