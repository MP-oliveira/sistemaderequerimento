import React, { useState } from 'react';
import { FiPackage, FiChevronDown, FiChevronRight, FiClock, FiMapPin, FiX } from 'react-icons/fi';
import './TodosRequerimentos.css';

const TodosRequerimentos = ({ executedItems }) => {
  const [expandedRequests, setExpandedRequests] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState(null);

  // Função para agrupar itens por requisição usando índices únicos
  const agruparItensPorRequisicao = (items) => {
    const grupos = {};
    let grupoIndex = 0;
    
    items.forEach(item => {
      const requestId = item.request_id || item.requests?.id;
      const request = item.requests || {};
      
      if (!requestId) return;
      if (request.status === 'FINALIZADO') return;
      
      if (!grupos[requestId]) {
        grupos[requestId] = {
          request: request,
          items: [],
          uniqueIndex: grupoIndex++ // Índice único para cada grupo
        };
      }
      grupos[requestId].items.push(item);
    });
    
    return Object.values(grupos);
  };

  const openModal = (grupo) => {
    setSelectedGrupo(grupo);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedGrupo(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não informada';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const grupos = agruparItensPorRequisicao(executedItems);

  return (
    <div className="todos-requerimentos">
      {/* Header */}
      <div className="materials-header">
        <h3 className="section-title">
          <FiPackage style={{marginRight: 8}} />
          Todos os Requerimentos
        </h3>
        <div className="materials-summary">
          <div className="summary-item">
            <span className="summary-number">{grupos.length}</span>
            <span className="summary-label">Requisições</span>
          </div>
          <div className="summary-item">
            <span className="summary-number success">{executedItems.filter(item => item.is_separated).length}</span>
            <span className="summary-label">Separados</span>
          </div>
          <div className="summary-item">
            <span className="summary-number warning">{executedItems.filter(item => !item.is_separated).length}</span>
            <span className="summary-label">Pendentes</span>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="materials-list todos-requerimentos-list">
        {grupos.length > 0 ? (
          grupos.map((grupo, index) => {
            const totalCount = grupo.items.length;
            const separatedCount = grupo.items.filter(item => item.is_separated).length;
            
            return (
              <div key={`todos-${grupo.uniqueIndex}`} className="request-materials-card">
                <div 
                  className="request-header"
                  onClick={() => openModal(grupo)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="request-info">
                    <div className="request-title-row">
                      <h4>{grupo.request.event_name || grupo.request.description || 'Requisição não identificada'}</h4>
                    </div>
                    <div className="request-meta">
                      <span className="department">{grupo.request.department}</span>
                      <span className="time">
                        <FiClock size={14} />
                        {formatDate(grupo.request.date)}
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

      {/* Modal para mostrar materiais */}
      {showModal && selectedGrupo && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedGrupo.request.event_name || 'Requisição'}</h3>
              <button className="modal-close" onClick={closeModal}>
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-info">
                <p><strong>Departamento:</strong> {selectedGrupo.request.department}</p>
                <p><strong>Data:</strong> {formatDate(selectedGrupo.request.date)}</p>
                {selectedGrupo.request.location && (
                  <p><strong>Local:</strong> {selectedGrupo.request.location}</p>
                )}
              </div>
              
              <h4>Materiais Necessários:</h4>
              <div className="modal-items-list">
                {selectedGrupo.items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`modal-item ${item.is_separated ? 'separated' : 'pending'}`}
                  >
                    <div className="item-info">
                      <span className="item-name">{item.item_name}</span>
                      <span className="item-quantity">Qtd: {item.quantity_requested}</span>
                    </div>
                    <div className="item-status">
                      {item.is_separated ? (
                        <span className="status-badge success">Separado</span>
                      ) : (
                        <span className="status-badge warning">Pendente</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodosRequerimentos;
