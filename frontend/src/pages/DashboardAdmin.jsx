import { useState, useEffect } from 'react';
import { listarRequisicoes } from '../services/requestsService';
import Button from '../components/Button';
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
    finalizadas: 0,
    conflitos: 0
  });

  // Estado para notificações
  const [notificacao, setNotificacao] = useState({ mensagem: '', tipo: '', mostrar: false });

  useEffect(() => {
    carregarDados();
  }, []);

  // Auto-hide das notificações
  useEffect(() => {
    if (notificacao.mostrar) {
      const timer = setTimeout(() => setNotificacao({ mensagem: '', tipo: '', mostrar: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [notificacao.mostrar]);

  function mostrarNotificacao(mensagem, tipo) {
    setNotificacao({ mensagem, tipo, mostrar: true });
  }

  const carregarDados = async () => {
    setLoading(true);
    try {
      const data = await listarRequisicoes();
      const requisicoesArray = Array.isArray(data) ? data : [];
      setRequisicoes(requisicoesArray);
      
      // Calcular estatísticas
      const estatisticas = {
        total: requisicoesArray.length,
        pendentes: requisicoesArray.filter(r => r.status === 'PENDENTE').length,
        aprovadas: requisicoesArray.filter(r => r.status === 'APTO').length,
        rejeitadas: requisicoesArray.filter(r => r.status === 'REJEITADO').length,
        executadas: requisicoesArray.filter(r => r.status === 'EXECUTADO').length,
        finalizadas: requisicoesArray.filter(r => r.status === 'FINALIZADO').length,
        conflitos: requisicoesArray.filter(r => r.status === 'PENDENTE_CONFLITO').length
      };
      setStats(estatisticas);
    } catch (err) {
      mostrarNotificacao('Erro ao carregar dados do dashboard', 'erro');
    }
    setLoading(false);
  };

  const requisicoesPendentes = requisicoes.filter(r => 
    r.status === 'PENDENTE' || r.status === 'PENDENTE_CONFLITO'
  ).slice(0, 5);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDENTE': return '#f59e0b';
      case 'PENDENTE_CONFLITO': return '#dc2626';
      case 'APTO': return '#10b981';
      case 'REJEITADO': return '#ef4444';
      case 'EXECUTADO': return '#3b82f6';
      case 'FINALIZADO': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDENTE': return 'Pendente';
      case 'PENDENTE_CONFLITO': return 'Em Conflito';
      case 'APTO': return 'Aprovada';
      case 'REJEITADO': return 'Rejeitada';
      case 'EXECUTADO': return 'Executada';
      case 'FINALIZADO': return 'Finalizada';
      default: return status;
    }
  };

  return (
    <div className="dashboard-admin">
      {/* Notificação */}
      {notificacao.mostrar && (
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
            <div className="admin-stat-card">
              <div className="admin-stat-icon blue">📊</div>
              <div className="admin-stat-content">
                <h3>{stats.total}</h3>
                <p>Total de Requisições</p>
              </div>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-icon yellow">⏳</div>
              <div className="admin-stat-content">
                <h3>{stats.pendentes}</h3>
                <p>Pendentes</p>
              </div>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-icon orange">⚠️</div>
              <div className="admin-stat-content">
                <h3>{stats.conflitos}</h3>
                <p>Em Conflito</p>
              </div>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-icon success">✅</div>
              <div className="admin-stat-content">
                <h3>{stats.aprovadas}</h3>
                <p>Aprovadas</p>
              </div>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-icon red">❌</div>
              <div className="admin-stat-content">
                <h3>{stats.rejeitadas}</h3>
                <p>Rejeitadas</p>
              </div>
            </div>
            
            <div className="admin-stat-card">
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
          <div className="dashboard-section">
            <h2>Ações Rápidas</h2>
            <div className="quick-actions">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => window.location.href = '/admin/requisicoes'}
                className="action-btn"
              >
                <span className="action-icon">📋</span>
                Gerenciar Requisições
              </Button>
              
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => window.location.href = '/usuarios'}
                className="action-btn"
              >
                <span className="action-icon">👥</span>
                Gerenciar Usuários
              </Button>
              
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => window.location.href = '/inventario'}
                className="action-btn"
              >
                <span className="action-icon">📦</span>
                Gerenciar Inventário
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 