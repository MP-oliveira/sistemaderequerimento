import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listarRequisicoes, executarRequisicao, retornarInstrumentos } from '../services/requestsService';
import Modal from '../components/Modal';
import Button from '../components/Button';
import RequestItemsChecklist from '../components/RequestItemsChecklist';
import { formatTimeUTC } from '../utils/dateUtils';
import './RequestsAudiovisual.css';
import { FiArrowLeft, FiEye, FiCheck, FiX, FiClock, FiMapPin, FiUsers, FiPackage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function RequestsAudiovisual() {
  console.log('🎯 RequestsAudiovisual renderizado');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  console.log('🎯 RequestsAudiovisual - User:', user);
  console.log('🎯 RequestsAudiovisual - User role:', user?.role);
  
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificacao, setNotificacao] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [showChecklist, setShowChecklist] = useState(false);
  const [selectedRequestForChecklist, setSelectedRequestForChecklist] = useState(null);

  function mostrarNotificacao(mensagem, tipo) {
    setNotificacao({ mensagem, tipo });
    setTimeout(() => setNotificacao(null), 5000);
  }

  useEffect(() => {
    console.log('🎯 RequestsAudiovisual - useEffect executado');
    buscarRequisicoes();
  }, []);

  const buscarRequisicoes = async () => {
    setLoading(true);
    try {
      const data = await listarRequisicoes();
      setRequisicoes(data || []);
    } catch (err) {
      console.error('Erro ao buscar requisições:', err);
      setRequisicoes([]);
    }
    setLoading(false);
  };

  const marcarComoExecutada = async (id) => {
    try {
      await executarRequisicao(id);
      mostrarNotificacao('Requisição marcada como executada!', 'sucesso');
      buscarRequisicoes();
    } catch {
      mostrarNotificacao('Erro ao marcar como executada', 'erro');
    }
  };

  const abrirModalRetorno = (requisicao) => {
    setSelectedRequest(requisicao);
    setReturnNotes('');
    setShowReturnModal(true);
  };

  const confirmarRetorno = async () => {
    try {
      await retornarInstrumentos(selectedRequest.id, returnNotes);
      mostrarNotificacao('Instrumentos retornados com sucesso!', 'sucesso');
      setShowReturnModal(false);
      buscarRequisicoes();
    } catch {
      mostrarNotificacao('Erro ao retornar instrumentos', 'erro');
    }
  };

  const handleVoltar = () => {
    console.log('🎯 RequestsAudiovisual - handleVoltar chamado');
    console.log('🎯 RequestsAudiovisual - Navegando para /audiovisual/dashboard');
    navigate('/audiovisual/dashboard');
  };

  const openChecklist = (requisicao) => {
    setSelectedRequestForChecklist(requisicao);
    setShowChecklist(true);
  };

  const closeChecklist = () => {
    setShowChecklist(false);
    setSelectedRequestForChecklist(null);
  };

  const handleItemsUpdated = () => {
    buscarRequisicoes();
  };

  // Filtrar requisições por status
  const requisicoesAprovadas = requisicoes.filter(req => 
    req.status === 'APTO' && 
    (req.start_datetime || req.event_name || req.location)
  );
  const requisicoesExecutadas = requisicoes.filter(req => req.status === 'EXECUTADO');
  const requisicoesFinalizadas = requisicoes.filter(req => req.status === 'FINALIZADO');

  return (
    <div className="requests-page">
      {/* Botão Voltar */}
      <div className="requests-header-top">
        <Button
          variant="primary"
          size="sm"
          onClick={handleVoltar}
        >
          <FiArrowLeft size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Voltar
        </Button>
      </div>

      {/* Notificação */}
      {notificacao && (
        <div className={`notificacao ${notificacao.tipo}`}>
          {notificacao.mensagem}
        </div>
      )}

      <div className="dashboard-header">
        <h1>Requisições - Audiovisual</h1>
        <p>Gerencie requisições aprovadas e prepare materiais</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="audiovisual-stats-grid">
        <div className="audiovisual-stat-card">
          <div className="audiovisual-stat-header">
            <div className="audiovisual-stat-icon blue">
              <FiEye size={18} />
            </div>
          </div>
          <div className="audiovisual-stat-info">
            <div className="audiovisual-stat-number">{requisicoesAprovadas.length}</div>
            <div className="audiovisual-stat-label">Requisições Aprovadas</div>
          </div>
        </div>
        <div className="audiovisual-stat-card">
          <div className="audiovisual-stat-header">
            <div className="audiovisual-stat-icon yellow">
              <FiClock size={18} />
            </div>
          </div>
          <div className="audiovisual-stat-info">
            <div className="audiovisual-stat-number">{requisicoesExecutadas.length}</div>
            <div className="audiovisual-stat-label">Em Preparação</div>
          </div>
        </div>
        <div className="audiovisual-stat-card">
          <div className="audiovisual-stat-header">
            <div className="audiovisual-stat-icon success">
              <FiCheck size={18} />
            </div>
          </div>
          <div className="audiovisual-stat-info">
            <div className="audiovisual-stat-number">{requisicoesFinalizadas.length}</div>
            <div className="audiovisual-stat-label">Finalizadas</div>
          </div>
        </div>
      </div>

      {/* Requisições Aprovadas */}
      <div className="audiovisual-card">
        <h3 className="audiovisual-section-title">
          <FiCheck style={{marginRight: 8}} />
          Requisições Aprovadas para Preparação
        </h3>
        
        {loading ? (
          <div className="audiovisual-loading-container">
            <div className="audiovisual-loading-spinner"></div>
            <p>Carregando requisições...</p>
          </div>
        ) : requisicoesAprovadas.length > 0 ? (
          <div className="audiovisual-requests-list">
            {requisicoesAprovadas.map((requisicao) => (
              <div key={requisicao.id} className="audiovisual-request-item">
                <div className="audiovisual-request-content">
                  <div className="audiovisual-request-header">
                    <span className="audiovisual-request-title">
                      {requisicao.event_name || requisicao.description || 'Evento'}
                    </span>
                    <span 
                      className="audiovisual-status-badge"
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
                  </div>
                  
                  <div className="audiovisual-request-details">
                    <div className="audiovisual-detail-item">
                      <FiUsers size={14} />
                      <span>{requisicao.department}</span>
                    </div>
                    <div className="audiovisual-detail-item">
                      <FiClock size={14} />
                      <span>
                        {requisicao.start_datetime && requisicao.end_datetime 
                          ? `${formatTimeUTC(requisicao.start_datetime)} - ${formatTimeUTC(requisicao.end_datetime)}`
                          : 'Horário não definido'
                        }
                      </span>
                    </div>
                    {requisicao.location && (
                      <div className="audiovisual-detail-item">
                        <FiMapPin size={14} />
                        <span>{requisicao.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="audiovisual-request-actions">
                  <Button
                    onClick={() => marcarComoExecutada(requisicao.id)}
                    variant="primary"
                    size="sm"
                  >
                    <FiCheck size={16} />
                    Marcar como Executada
                  </Button>
                  <Button
                    onClick={() => openChecklist(requisicao)}
                    variant="secondary"
                    size="sm"
                  >
                    <FiEye size={16} />
                    Ver Checklist
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="audiovisual-empty-state">
            <FiEye size={48} />
            <h3>Nenhuma requisição aprovada</h3>
            <p>Não há requisições aprovadas aguardando preparação.</p>
          </div>
        )}
      </div>

      {/* Requisições Executadas */}
      {requisicoesExecutadas.length > 0 && (
        <div className="audiovisual-card">
          <h3 className="audiovisual-section-title">
            <FiClock style={{marginRight: 8}} />
            Requisições em Preparação
          </h3>
          <div className="audiovisual-requests-list">
            {requisicoesExecutadas.map((requisicao) => (
              <div key={requisicao.id} className="audiovisual-request-item">
                <div className="audiovisual-request-content">
                  <div className="audiovisual-request-header">
                    <span className="audiovisual-request-title">
                      {requisicao.event_name || requisicao.description || 'Evento'}
                    </span>
                    <span 
                      className="audiovisual-status-badge"
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
                  </div>
                  
                  <div className="audiovisual-request-details">
                    <div className="audiovisual-detail-item">
                      <FiUsers size={14} />
                      <span>{requisicao.department}</span>
                    </div>
                    <div className="audiovisual-detail-item">
                      <FiClock size={14} />
                      <span>
                        {requisicao.start_datetime && requisicao.end_datetime 
                          ? `${formatTimeUTC(requisicao.start_datetime)} - ${formatTimeUTC(requisicao.end_datetime)}`
                          : 'Horário não definido'
                        }
                      </span>
                    </div>
                    {requisicao.location && (
                      <div className="audiovisual-detail-item">
                        <FiMapPin size={14} />
                        <span>{requisicao.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="audiovisual-request-actions">
                  <Button
                    onClick={() => abrirModalRetorno(requisicao)}
                    variant="secondary"
                    size="sm"
                  >
                    <FiX size={16} />
                    Finalizar Evento
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Retorno */}
      <Modal
        open={showReturnModal}
        title="Finalizar Evento"
        onClose={() => setShowReturnModal(false)}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={() => setShowReturnModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={confirmarRetorno}>
              Confirmar
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p>Confirme que o evento foi finalizado e os instrumentos foram devolvidos.</p>
          <div>
            <label>Observações (opcional):</label>
            <textarea
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="Adicione observações sobre o evento..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Modal de Checklist */}
      <RequestItemsChecklist
        open={showChecklist}
        onClose={closeChecklist}
        request={selectedRequestForChecklist}
        onItemsUpdated={handleItemsUpdated}
      />
    </div>
  );
} 