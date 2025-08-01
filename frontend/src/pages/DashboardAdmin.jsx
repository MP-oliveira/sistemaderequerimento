import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Table from '../components/Table';
import AdminButtons from '../components/AdminButtons';
import { FiZap, FiPlus, FiUserPlus, FiCalendar, FiDownload, FiBarChart2, FiClock, FiAlertTriangle, FiCheckCircle, FiXCircle, FiFlag, FiList, FiCheckSquare, FiXSquare, FiPlay, FiFileText, FiPause, FiAlertCircle, FiCheck, FiX, FiActivity, FiThumbsUp, FiThumbsDown, FiShield, FiStar, FiAward, FiEye } from 'react-icons/fi';
import { listarRequisicoes, aprovarRequisicao, rejeitarRequisicao } from '../services/requestsService';
import { notifyRequestApproved, notifyRequestRejected, notifyAudiovisualPreparation } from '../utils/notificationUtils';
import './DashboardAdmin.css';

export default function DashboardAdmin() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    aprovadas: 0,
    rejeitadas: 0,
    executadas: 0,
    conflitos: 0
  });
  const [notificacao, setNotificacao] = useState(null);
  
  // Estados para o modal de filtros
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('');
  const [filterLoading, setFilterLoading] = useState(false);

  // Estados para o modal de detalhes
  const [modalDetalhe, setModalDetalhe] = useState(false);
  const [reqDetalhe, setReqDetalhe] = useState(null);

  function mostrarNotificacao(mensagem, tipo) {
    setNotificacao({ mensagem, tipo });
    setTimeout(() => setNotificacao(null), 5000);
  }

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const response = await listarRequisicoes();
      const requisicoesData = response.data || response || [];
      setRequisicoes(requisicoesData);
      
      // Calcular estatísticas
      const statsData = {
        total: requisicoesData.length || 0,
        pendentes: requisicoesData.filter(r => r.status === 'PENDENTE').length || 0,
        aprovadas: requisicoesData.filter(r => r.status === 'APTO').length || 0,
        rejeitadas: requisicoesData.filter(r => r.status === 'REJEITADO').length || 0,
        executadas: requisicoesData.filter(r => r.status === 'EXECUTADO').length || 0,
        conflitos: requisicoesData.filter(r => r.status === 'PENDENTE_CONFLITO').length || 0
      };
      
      setStats(statsData);
      
    } catch (error) {
      console.error('❌ DashboardAdmin - Erro ao carregar dados:', error);
      mostrarNotificacao('Erro ao carregar dados do dashboard', 'erro');
    } finally {
      setLoading(false);
    }
  };

  // Função para abrir modal com requisições filtradas
  const abrirFiltro = async (status) => {
    try {
      setFilterLoading(true);
      setCurrentFilter(status);
      setShowFilterModal(true);
      
      // Filtrar requisições pelo status
      let requests;
      if (status === 'TOTAL') {
        requests = requisicoes; // Mostrar todas as requisições
      } else {
        requests = requisicoes.filter(r => r.status === status);
      }
      
      setFilteredRequests(requests);
    } catch (error) {
      console.error('Erro ao filtrar requisições:', error);
      mostrarNotificacao('Erro ao carregar requisições filtradas', 'erro');
    } finally {
      setFilterLoading(false);
    }
  };

  // Função para formatar data
  const formatarData = (dataString) => {
    if (!dataString) return '';
    try {
      return new Date(dataString).toLocaleDateString('pt-BR');
    } catch {
      return '';
    }
  };

  // Função para obter label do status
  const getStatusLabel = (status) => {
    const labels = {
      'PENDENTE': 'Pendentes',
      'APTO': 'Aprovadas',
      'REJEITADO': 'Rejeitadas',
      'EXECUTADO': 'Executadas',
      'PENDENTE_CONFLITO': 'Em Conflito',
      'PREENCHIDO': 'Preenchidas',
      'TOTAL': 'Total de Requisições'
    };
    return labels[status] || status;
  };

  // Função para obter cor do status
  const getStatusColor = (status) => {
    const colors = {
      'PENDENTE': '#ff9800',
      'APTO': '#4caf50',
      'REJEITADO': '#f44336',
      'EXECUTADO': '#9c27b0',
      'PENDENTE_CONFLITO': '#ff5722',
      'PREENCHIDO': '#2196f3'
    };
    return colors[status] || '#6b7280';
  };

  // Função para aprovar requisição
  const aprovarRequisicaoHandler = async (id) => {
    try {
      await aprovarRequisicao(id);
      mostrarNotificacao('Requisição aprovada com sucesso!', 'sucesso');
      
      // Buscar dados da requisição para notificação
      const requisicao = requisicoes.find(req => req.id === id);
      if (requisicao) {
        // Notificar SEC sobre aprovação
        notifyRequestApproved(requisicao);
        
        // Notificar AUDIOVISUAL para preparar material
        notifyAudiovisualPreparation(requisicao);
      }
      
      carregarDados(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao aprovar requisição:', error);
      mostrarNotificacao('Erro ao aprovar requisição', 'erro');
    }
  };

  // Função para rejeitar requisição
  const rejeitarRequisicaoHandler = async (id) => {
    try {
      await rejeitarRequisicao(id, 'Rejeitado pelo administrador');
      mostrarNotificacao('Requisição rejeitada com sucesso!', 'sucesso');
      
      // Buscar dados da requisição para notificação
      const requisicao = requisicoes.find(req => req.id === id);
      if (requisicao) {
        // Notificar SEC sobre rejeição
        notifyRequestRejected(requisicao);
      }
      
      carregarDados(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao rejeitar requisição:', error);
      mostrarNotificacao('Erro ao rejeitar requisição', 'erro');
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);



  const requisicoesPendentes = requisicoes.filter(r => r.status === 'PENDENTE' || r.status === 'PENDENTE_CONFLITO').slice(0, 5);
  return (
    <div className="dashboard-admin">
      <AdminButtons />
      
      {notificacao && (
        <div className={`notificacao ${notificacao.tipo}`}>
          {notificacao.mensagem}
        </div>
      )}

      <div className="dashboard-header">
        <h1>Dashboard Administrativo</h1>
        <p>Visão geral das requisições e estatísticas do sistema</p>
      </div>

      {loading ? (
        <div className="dashboard-loading">Carregando dashboard...</div>
      ) : (
        <>
          {/* Cards de Estatísticas */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card" onClick={() => abrirFiltro('TOTAL')}>
              <div className="admin-stat-icon blue">
                <FiList />
              </div>
              <div className="admin-stat-content">
                <h3>{stats.total}</h3>
                <p>Total de Requisições</p>
              </div>
            </div>
            
            <div className="admin-stat-card" onClick={() => abrirFiltro('PENDENTE')}>
              <div className="admin-stat-icon yellow">
                <FiPause />
                {stats.pendentes > 0 && <span className="stat-badge">{stats.pendentes}</span>}
              </div>
              <div className="admin-stat-content">
                <h3>{stats.pendentes}</h3>
                <p>Pendentes</p>
              </div>
            </div>
            
            <div className="admin-stat-card" onClick={() => abrirFiltro('PENDENTE_CONFLITO')}>
              <div className="admin-stat-icon orange">
                <FiShield />
                {stats.conflitos > 0 && <span className="stat-badge">{stats.conflitos}</span>}
              </div>
              <div className="admin-stat-content">
                <h3>{stats.conflitos}</h3>
                <p>Em Conflito</p>
              </div>
            </div>
            
            <div className="admin-stat-card" onClick={() => abrirFiltro('APTO')}>
              <div className="admin-stat-icon success">
                <FiThumbsUp />
                {stats.aprovadas > 0 && <span className="stat-badge success">{stats.aprovadas}</span>}
              </div>
              <div className="admin-stat-content">
                <h3>{stats.aprovadas}</h3>
                <p>Aprovadas</p>
              </div>
            </div>
            
            <div className="admin-stat-card" onClick={() => abrirFiltro('REJEITADO')}>
              <div className="admin-stat-icon red">
                <FiX />
                {stats.rejeitadas > 0 && <span className="stat-badge">{stats.rejeitadas}</span>}
              </div>
              <div className="admin-stat-content">
                <h3>{stats.rejeitadas}</h3>
                <p>Rejeitadas</p>
              </div>
            </div>
            
            <div className="admin-stat-card" onClick={() => abrirFiltro('EXECUTADO')}>
              <div className="admin-stat-icon purple">
                <FiActivity />
                {stats.executadas > 0 && <span className="stat-badge purple">{stats.executadas}</span>}
              </div>
              <div className="admin-stat-content">
                <h3>{stats.executadas}</h3>
                <p>Executadas</p>
              </div>
            </div>
          </div>

          {/* Gráfico de Status */}
          <div className="dashboard-section">
            <h2>Distribuição por Status</h2>
            <div className="status-chart">
              {Object.entries(stats).filter(([key, value]) => key !== 'total' && value > 0).map(([key, value]) => (
                <div key={key} className="status-bar">
                  <div className="status-label">
                    <span className={`status-dot ${key.toLowerCase()}`}></span>
                    {getStatusLabel(key.toUpperCase())}
                  </div>
                  <div className="status-progress">
                    <div 
                      className={`status-fill ${key.toLowerCase()}`}
                      style={{ 
                        width: `${(value / stats.total) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="status-count">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Requisições Pendentes */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Requisições Pendentes de Aprovação</h2>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => window.location.href = '/admin/requisicoes'}
              >
                Ver Todas
              </Button>
            </div>
            
            {requisicoesPendentes.length === 0 ? (
              <div className="requests-empty">
                <span>🎉</span>
                <p>Nenhuma requisição pendente de aprovação!</p>
                <p>Todas as requisições foram processadas.</p>
              </div>
            ) : (
              <div className="requests-list-container">
                {requisicoesPendentes.map((req) => (
                  <div key={req.id} className="request-item">
                    <div className="request-item-content">
                      <div className="request-item-header">
                        <span className="request-item-title">
                          {req.department}
                        </span>
                        <span 
                          className="request-item-status"
                          style={{ 
                            backgroundColor: 'transparent',
                            color: getStatusColor(req.status),
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.8rem',
                            fontWeight: '700'
                          }}
                        >
                          {getStatusLabel(req.status)}
                        </span>
                        <span className="request-item-event">
                          {req.event_name || ''}
                        </span>
                      </div>
                      <div className="request-item-details">
                        <span className="request-item-description">
                          {req.description || req.event_name || 'Sem descrição'}
                        </span>
                        {req.location && (
                          <span className="request-item-location">
                            {req.location}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="request-item-actions">
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => aprovarRequisicaoHandler(req.id)}
                        className="approve-button"
                        title="Aprovar"
                      >
                        ✅ Aprovar
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => rejeitarRequisicaoHandler(req.id)}
                        className="reject-button"
                        title="Rejeitar"
                      >
                        ✕ Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações Rápidas */}
          <div className="quick-actions">
            <h3 className="section-title">
              <FiZap style={{marginRight: 8}} />
              Ações Rápidas
            </h3>
            <div className="actions-grid">
              <a href="/admin/requisicoes" className="action-btn">
                <FiPlus />
                Gerenciar Requerimentos
              </a>
              <a href="/usuarios" className="action-btn">
                <FiUserPlus />
                Gerenciar Usuários
              </a>
              <a href="/inventario" className="action-btn">
                <FiCalendar />
                Gerenciar Inventário
              </a>
              <a href="/relatorio" className="action-btn">
                <FiDownload />
                Relatórios Admin
              </a>
            </div>
          </div>

          {/* Lista de Requisições */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Todas as Requisições</h2>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => window.location.href = '/admin/requisicoes'}
              >
                Ver Todas
              </Button>
            </div>
            
            {requisicoes.length === 0 ? (
              <div className="requests-empty">
                <span>📋</span>
                <p>Nenhuma requisição encontrada!</p>
              </div>
            ) : (
              <div className="requests-list-container">
                {requisicoes.slice(0, 10).map((req) => (
                  <div key={req.id} className="request-item">
                    <div className="request-item-content">
                      <div className="request-item-header">
                        <span className="request-item-title">
                          {req.department}
                        </span>
                        <span 
                          className="request-item-status"
                          style={{ 
                            backgroundColor: 'transparent',
                            color: getStatusColor(req.status),
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.8rem',
                            fontWeight: '700'
                          }}
                        >
                          ({req.status})
                        </span>
                        <span className="request-item-event">
                          {req.event_name || ''}
                        </span>
                      </div>
                      <div className="request-item-details">
                        <span className="request-item-date">
                          Data: {formatarData(req.start_datetime)}
                        </span>
                        {req.location && (
                          <span className="request-item-location">
                            Local: {req.location}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="request-item-actions">
                      <Button 
                        onClick={() => {
                          setReqDetalhe(req);
                          setModalDetalhe(true);
                        }}
                        variant="icon-blue" 
                        size="sm"
                        className="details-button"
                        title="Ver Detalhes"
                      >
                        <FiEye size={18} className="details-icon" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de Filtros */}
      <Modal 
        open={showFilterModal} 
        onClose={() => setShowFilterModal(false)}
        title={`Requisições ${getStatusLabel(currentFilter)}`}
      >
        {filterLoading ? (
          <div className="loading-state">
            <p>Carregando requisições...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma requisição encontrada para este filtro.</p>
          </div>
        ) : (
          <div className="filtered-requests">
            <div className="requests-cards-grid">
              {filteredRequests.map((request, index) => (
                <div key={request.id || index} className="request-card">
                  <div className="request-card-header">
                    <h3 className="request-card-title">
                      {request.event_name || request.description || 'Sem título'}
                    </h3>
                    <span className="request-card-status">
                      ({request.status})
                    </span>
                  </div>
                  
                  <div className="request-card-content">
                    {request.start_datetime && (
                      <div className="request-card-info">
                        <strong>Data:</strong> {formatarData(request.start_datetime)}
                      </div>
                    )}
                    
                    {request.location && (
                      <div className="request-card-info">
                        <strong>Local:</strong> {request.location}
                      </div>
                    )}
                    
                    {request.department && (
                      <div className="request-card-info">
                        <strong>Departamento:</strong> {request.department}
                      </div>
                    )}
                    
                    {request.requester && (
                      <div className="request-card-info">
                        <strong>Solicitante:</strong> {request.requester}
                      </div>
                    )}
                  </div>
                  
                  <div className="request-card-actions">
                    <button 
                      className="request-card-view-btn"
                      onClick={() => {
                        // Abrir modal com detalhes da requisição
                        setReqDetalhe(request);
                        setModalDetalhe(true);
                      }}
                      title="Ver detalhes"
                    >
                      <FiEye size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="modal-footer">
              <Button 
                variant="primary" 
                onClick={() => window.location.href = '/admin/requisicoes'}
              >
                Ver Todas as Requisições
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Detalhes da Requisição */}
      <Modal 
        open={modalDetalhe} 
        onClose={() => setModalDetalhe(false)}
        title="Detalhes da Requisição"
      >
        {reqDetalhe && (
          <div className="request-details">
            <div className="detail-item">
              <strong>Evento:</strong> {reqDetalhe.event_name || reqDetalhe.description || 'Sem título'}
            </div>
            
            <div className="detail-item">
              <strong>Status:</strong> 
              <span className={`status-badge ${reqDetalhe.status.toLowerCase()}`}>
                {reqDetalhe.status}
              </span>
            </div>
            
            {reqDetalhe.start_datetime && (
              <div className="detail-item">
                <strong>Data de Início:</strong> {formatarData(reqDetalhe.start_datetime)}
              </div>
            )}
            
            {reqDetalhe.end_datetime && (
              <div className="detail-item">
                <strong>Data de Fim:</strong> {formatarData(reqDetalhe.end_datetime)}
              </div>
            )}
            
            {reqDetalhe.location && (
              <div className="detail-item">
                <strong>Local:</strong> {reqDetalhe.location}
              </div>
            )}
            
            {reqDetalhe.department && (
              <div className="detail-item">
                <strong>Departamento:</strong> {reqDetalhe.department}
              </div>
            )}
            
            {reqDetalhe.requester && (
              <div className="detail-item">
                <strong>Solicitante:</strong> {reqDetalhe.requester}
              </div>
            )}
            
            {reqDetalhe.expected_audience && (
              <div className="detail-item">
                <strong>Público Esperado:</strong> {reqDetalhe.expected_audience}
              </div>
            )}
            
            {reqDetalhe.description && (
              <div className="detail-item">
                <strong>Descrição:</strong> {reqDetalhe.description}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
} 