import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { FiZap, FiPlus, FiUserPlus, FiCalendar, FiDownload } from 'react-icons/fi';
import { listarRequisicoes } from '../services/requestsService';
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
      console.log('🔍 DashboardAdmin - Abrindo filtro para status:', status);
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
      
      console.log('🔍 DashboardAdmin - Requisições filtradas:', requests);
      setFilteredRequests(requests);
    } catch (error) {
      console.error('Erro ao filtrar requisições:', error);
      mostrarNotificacao('Erro ao carregar requisições filtradas', 'erro');
    } finally {
      setFilterLoading(false);
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

  useEffect(() => {
    carregarDados();
  }, []);

  // Configuração das colunas da tabela
  const columns = [
    { key: 'event_name', label: 'Evento' },
    { key: 'department', label: 'Departamento' },
    { key: 'requester', label: 'Solicitante' },
    { key: 'start_datetime', label: 'Data/Hora Início' },
    { key: 'end_datetime', label: 'Data/Hora Fim' },
    { key: 'location', label: 'Local' },
    { key: 'status', label: 'Status' }
  ];

  // Formatar dados para a tabela
  const formatTableData = (requests) => {
    return requests.map(request => ({
      ...request,
      start_datetime: new Date(request.start_datetime).toLocaleString('pt-BR'),
      end_datetime: new Date(request.end_datetime).toLocaleString('pt-BR'),
      status: (
        <span className="status-badge-table">
          {request.status}
        </span>
      )
    }));
  };

  const requisicoesPendentes = requisicoes.filter(r => r.status === 'PENDENTE').slice(0, 5);

  return (
    <div className="dashboard-admin">
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
              <div className="admin-stat-icon blue">📊</div>
              <div className="admin-stat-content">
                <h3>{stats.total}</h3>
                <p>Total de Requisições</p>
              </div>
            </div>
            
            <div className="admin-stat-card" onClick={() => abrirFiltro('PENDENTE')}>
              <div className="admin-stat-icon yellow">⏳</div>
              <div className="admin-stat-content">
                <h3>{stats.pendentes}</h3>
                <p>Pendentes</p>
              </div>
            </div>
            
            <div className="admin-stat-card" onClick={() => abrirFiltro('PENDENTE_CONFLITO')}>
              <div className="admin-stat-icon orange">⚠️</div>
              <div className="admin-stat-content">
                <h3>{stats.conflitos}</h3>
                <p>Em Conflito</p>
              </div>
            </div>
            
            <div className="admin-stat-card" onClick={() => abrirFiltro('APTO')}>
              <div className="admin-stat-icon success">✅</div>
              <div className="admin-stat-content">
                <h3>{stats.aprovadas}</h3>
                <p>Aprovadas</p>
              </div>
            </div>
            
            <div className="admin-stat-card" onClick={() => abrirFiltro('REJEITADO')}>
              <div className="admin-stat-icon red">❌</div>
              <div className="admin-stat-content">
                <h3>{stats.rejeitadas}</h3>
                <p>Rejeitadas</p>
              </div>
            </div>
            
            <div className="admin-stat-card" onClick={() => abrirFiltro('EXECUTADO')}>
              <div className="admin-stat-icon purple">🎯</div>
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
                    <span className="status-dot" style={{ backgroundColor: getStatusColor(key.toUpperCase()) }}></span>
                    {getStatusLabel(key.toUpperCase())}
                  </div>
                  <div className="status-progress">
                    <div 
                      className="status-fill" 
                      style={{ 
                        width: `${(value / stats.total) * 100}%`,
                        backgroundColor: getStatusColor(key.toUpperCase())
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
              <h2>Requisições Pendentes</h2>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => window.location.href = '/admin/requisicoes'}
              >
                Ver Todas
              </Button>
            </div>
            
            {requisicoesPendentes.length === 0 ? (
              <div className="empty-state">
                <p>🎉 Nenhuma requisição pendente!</p>
                <p>Todas as requisições foram processadas.</p>
              </div>
            ) : (
              <div className="pending-requests">
                {requisicoesPendentes.map((req) => (
                  <div key={req.id} className="request-card">
                    <div className="request-header">
                      <h4>{req.department}</h4>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(req.status) }}
                      >
                        {getStatusLabel(req.status)}
                      </span>
                    </div>
                    <p className="request-description">{req.description || req.event_name || 'Sem descrição'}</p>
                    <div className="request-meta">
                      <span>📅 {req.date}</span>
                      {req.location && <span>📍 {req.location}</span>}
                    </div>
                    <div className="request-actions">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => window.location.href = `/admin/requisicoes`}
                      >
                        Ver Detalhes
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
              <a href="/requisicoes" className="action-btn">
                <FiPlus />
                Novo Requerimento
              </a>
              <a href="/usuarios" className="action-btn">
                <FiUserPlus />
                Adicionar Usuário
              </a>
              <a href="/inventario" className="action-btn">
                <FiCalendar />
                Agendar Evento
              </a>
              <a href="/relatorio" className="action-btn">
                <FiDownload />
                Relatório
              </a>
            </div>
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
            <Table 
              columns={columns}
              data={formatTableData(filteredRequests)}
              className="admin-table"
            />
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
    </div>
  );
} 