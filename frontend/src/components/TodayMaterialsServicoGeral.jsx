import React, { useState, useEffect } from 'react';
import { listarItensDoDiaServicoGeral, marcarItemComoSeparado } from '../services/requestItemsService';
import { formatTimeUTC } from '../utils/dateUtils';
import './TodayMaterials.css';
import { FiClock, FiMapPin, FiUsers, FiCheck, FiX, FiPackage, FiChevronDown, FiChevronRight } from 'react-icons/fi';

export default function TodayMaterialsServicoGeral() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [expandedRequests, setExpandedRequests] = useState(new Set());

  useEffect(() => {
    carregarMateriais();
  }, []);

  const carregarMateriais = async () => {
    setLoading(true);
    try {
      console.log('🔍 [TodayMaterialsServicoGeral] Carregando materiais...');
      const data = await listarItensDoDiaServicoGeral();
      console.log('🔍 [TodayMaterialsServicoGeral] Dados recebidos:', data);
      setMaterials(data || []);
      console.log('🔍 [TodayMaterialsServicoGeral] Materiais definidos:', data?.length || 0);
    } catch (err) {
      console.error('❌ [TodayMaterialsServicoGeral] Erro ao carregar materiais:', err);
      setMaterials([]);
    }
    setLoading(false);
  };

  const handleToggleSeparated = async (itemId, currentStatus) => {
    console.log('🔍 [TodayMaterialsServicoGeral] handleToggleSeparated chamado');
    console.log('   Item ID:', itemId);
    console.log('   Status atual:', currentStatus);
    console.log('   Novo status:', !currentStatus);
    
    try {
      console.log('🔍 [TodayMaterialsServicoGeral] Chamando API...');
      await marcarItemComoSeparado(itemId, !currentStatus);
      console.log('✅ [TodayMaterialsServicoGeral] API chamada com sucesso');
      console.log('🔍 [TodayMaterialsServicoGeral] Recarregando materiais...');
      await carregarMateriais();
      console.log('✅ [TodayMaterialsServicoGeral] Materiais recarregados');
    } catch (err) {
      console.error('❌ [TodayMaterialsServicoGeral] Erro ao marcar item como separado:', err);
    }
  };

  const formatTime = (dateString) => {
    return formatTimeUTC(dateString);
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

  console.log('🔍 [TodayMaterialsServicoGeral] Renderizando com', materials.length, 'materiais');
  
  if (materials.length === 0) {
    console.log('🔍 [TodayMaterialsServicoGeral] Renderizando estado vazio');
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
          Materiais para Despachar (Próximos 7 dias)
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
        {Object.values(materialsByRequest).map(({ request, items }) => {
          const isExpanded = expandedRequests.has(request.id);
          const separatedCount = items.filter(item => item.is_separated).length;
          const totalCount = items.length;
          
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
                  <div className="status-info">
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
                    <span className="items-count">
                      {separatedCount}/{totalCount} itens
                    </span>
                  </div>
              </div>
              </div>
              
              {isExpanded && (
                <div className="materials-items accordion-content">
                  <h5>Materiais para Despachar:</h5>
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
                        <div className="item-actions">
                          <button
                            className={`separate-btn ${item.is_separated ? 'separated' : ''}`}
                            onClick={() => handleToggleSeparated(item.id, item.is_separated)}
                            title={item.is_separated ? 'Marcar como não separado' : 'Marcar como separado'}
                          >
                            {item.is_separated ? <FiCheck size={16} /> : <FiX size={16} />}
                          </button>
                        </div>
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