import React, { useState, useEffect } from 'react';
import { listarTodosRequerimentosFuturosServicoGeral, marcarItemComoSeparado } from '../services/requestItemsService';
import { formatTimeUTC } from '../utils/dateUtils';
import './TodayMaterials.css';
import { FiClock, FiMapPin, FiUsers, FiCheck, FiX, FiPackage, FiChevronDown, FiChevronRight, FiCalendar } from 'react-icons/fi';

export default function AllFutureRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState(new Set());

  useEffect(() => {
    carregarRequerimentos();
  }, []);

  const carregarRequerimentos = async () => {
    setLoading(true);
    try {
      const data = await listarTodosRequerimentosFuturosServicoGeral();
      setRequests(data || []);
    } catch (err) {
      console.error('❌ [AllFutureRequests] Erro ao carregar requerimentos:', err);
      setRequests([]);
    }
    setLoading(false);
  };

  const handleToggleSeparated = async (itemId, currentStatus) => {
    try {
      await marcarItemComoSeparado(itemId, !currentStatus);
      await carregarRequerimentos();
    } catch (err) {
      console.error('❌ [AllFutureRequests] Erro ao marcar item como separado:', err);
    }
  };

  const formatTime = (dateString) => {
    return formatTimeUTC(dateString);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleRequest = (requestId) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const totalItems = requests.reduce((total, request) => total + request.items.length, 0);
  const separatedItems = requests.reduce((total, request) => 
    total + request.items.filter(item => item.is_separated).length, 0);
  const pendingItems = totalItems - separatedItems;

  if (loading) {
    return (
      <div className="all-future-requests-loading">
        <div className="loading-spinner"></div>
        <p>Carregando requerimentos futuros...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="all-future-requests-empty">
        <FiPackage size={48} />
        <h3>Nenhum requerimento futuro</h3>
        <p>Não há requerimentos aprovados com materiais de serviço geral para o futuro.</p>
      </div>
    );
  }

  return (
    <div className="all-future-requests">
      <div className="materials-header">
        <h3 className="section-title">
          <FiCalendar style={{marginRight: 8}} />
          Todos os Requerimentos Futuros
        </h3>
        <div className="materials-summary">
          <div className="summary-item">
            <span className="summary-number">{requests.length}</span>
            <span className="summary-label">Requerimentos</span>
          </div>
          <div className="summary-item">
            <span className="summary-number">{totalItems}</span>
            <span className="summary-label">Total de Itens</span>
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
        {requests.map((request) => {
          const isExpanded = expandedRequests.has(request.id);
          const separatedCount = request.items.filter(item => item.is_separated).length;
          const totalCount = request.items.length;
          
          return (
            <div key={request.id} className="request-materials-card">
              <div 
                className="request-header accordion-header"
                onClick={() => toggleRequest(request.id)}
              >
                <div className="request-info">
                  <div className="request-title-row">
                    <button className="accordion-toggle">
                      {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                    </button>
                    <h4>{request.event_name || request.description || 'Evento'}</h4>
                  </div>
                  <div className="request-meta">
                    <span className="department">{request.department}</span>
                    <span className="date">
                      <FiCalendar size={14} />
                      {formatDate(request.date)}
                    </span>
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
                    {request.approved_by_name && (
                      <span className="approved-by">
                        <FiUsers size={14} />
                        Aprovado por: {request.approved_by_name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="request-status">
                  <div className="status-info">
                    <span className="items-count">
                      {separatedCount}/{totalCount} itens
                    </span>
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="materials-items accordion-content">
                  <h5>Materiais para Separar:</h5>
                  <div className="items-list">
                    {request.items.map((item) => (
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
                          title={item.is_separated ? 'Marcar como não separado' : 'Marcar como separado'}
                        >
                          {item.is_separated ? <FiCheck size={16} /> : <FiX size={16} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
