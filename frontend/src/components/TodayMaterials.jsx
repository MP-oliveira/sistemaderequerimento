import React, { useState, useEffect } from 'react';
import { listarItensDoDia, marcarItemComoSeparado } from '../services/requestItemsService';
import { formatTimeUTC } from '../utils/dateUtils';
import './TodayMaterials.css';
import { FiClock, FiMapPin, FiUsers, FiCheck, FiX, FiPackage } from 'react-icons/fi';

export default function TodayMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    carregarMateriais();
  }, []);

  const carregarMateriais = async () => {
    setLoading(true);
    try {
      const data = await listarItensDoDia();
      setMaterials(data || []);
    } catch (err) {
      setMaterials([]);
    }
    setLoading(false);
  };

  const handleToggleSeparated = async (itemId, currentStatus) => {
    try {
      await marcarItemComoSeparado(itemId, !currentStatus);
      await carregarMateriais();
    } catch (err) {}
  };

  const formatTime = (dateString) => {
    return formatTimeUTC(dateString);
  };

  // Agrupar materiais por requisição
  const materialsByRequest = materials.reduce((acc, item) => {
    const requestId = item.requests.id;
    if (!acc[requestId]) {
      acc[requestId] = {
        request: item.requests,
        items: []
      };
    }
    acc[requestId].items.push(item);
    return acc;
  }, {});

  const totalItems = materials.length;
  const separatedItems = materials.filter(item => item.is_separated).length;
  const pendingItems = totalItems - separatedItems;

  if (loading) {
    return (
      <div className="today-materials-loading">
        <div className="loading-spinner"></div>
        <p>Carregando materiais do dia...</p>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="today-materials-empty">
        <FiPackage size={48} />
        <h3>Nenhum material para hoje</h3>
        <p>Não há requisições aprovadas com materiais para hoje.</p>
      </div>
    );
  }

  return (
    <div className="today-materials">
      <div className="materials-header">
        <h3 className="section-title">
          <FiPackage style={{marginRight: 8}} />
          Materiais do Dia
        </h3>
        <div className="materials-summary">
          <div className="summary-item">
            <span className="summary-number">{totalItems}</span>
            <span className="summary-label">Total</span>
          </div>
          <div className="summary-item">
            <span className="summary-number success">{separatedItems}</span>
            <span className="summary-label">Separados</span>
          </div>
          <div className="summary-item">
            <span className="summary-number warning">{pendingItems}</span>
            <span className="summary-label">Pendentes</span>
          </div>
        </div>
      </div>

      <div className="materials-list">
        {Object.values(materialsByRequest).map(({ request, items }) => (
          <div key={request.id} className="request-materials-card">
            <div className="request-header">
              <div className="request-info">
                <h4>{request.event_name || request.description || 'Evento'}</h4>
                <div className="request-meta">
                  <span className="department">{request.department}</span>
                  <span className="time">
                    <FiClock size={14} />
                    {formatTime(request.start_datetime)} - {formatTime(request.end_datetime)}
                  </span>
                  {request.location && (
                    <span className="location">
                      <FiMapPin size={14} />
                      {request.location}
                    </span>
                  )}
                </div>
              </div>
              <div className="request-status">
                <span 
                  className="status-badge"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: request.status === 'APTO' ? '#4caf50' : 
                           request.status === 'EXECUTADO' ? '#9c27b0' : 
                           request.status === 'PENDENTE' ? '#ff9800' : 
                           request.status === 'REJEITADO' ? '#f44336' : 
                           request.status === 'PENDENTE_CONFLITO' ? '#ff5722' : '#6b7280',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '700'
                  }}
                >
                  {request.status === 'APTO' ? 'Aprovada' : 
                   request.status === 'EXECUTADO' ? 'Executada' : 
                   request.status === 'PENDENTE' ? 'Pendente' : 
                   request.status === 'REJEITADO' ? 'Rejeitada' : 
                   request.status === 'PENDENTE_CONFLITO' ? 'Em Conflito' : request.status}
                </span>
              </div>
            </div>

            <div className="materials-items">
              <h5>Materiais Necessários:</h5>
              <div className="items-list">
                {items.map((item) => (
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
                      onClick={() => handleToggleSeparated(item.id, item.is_separated)}
                      title={item.is_separated ? 'Desmarcar como separado' : 'Marcar como separado'}
                    >
                      {item.is_separated ? <FiCheck size={16} /> : <FiX size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="request-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${items.length > 0 ? (items.filter(item => item.is_separated).length / items.length) * 100 : 0}%` }}></div>
              </div>
              <span className="progress-text">
                {items.filter(item => item.is_separated).length} de {items.length} materiais separados
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 