import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { listarRequisicoes } from '../services/requestsService';
import { notifyRequestExecuted } from '../utils/notificationUtils';
import './AudiovisualDashboard.css';

export default function AudiovisualDashboard() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificacao, setNotificacao] = useState(null);

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
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      mostrarNotificacao('Erro ao carregar dados', 'erro');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoExecutada = async (id) => {
    try {
      // Aqui você implementaria a chamada para marcar como executada
      // Por enquanto, vamos simular
      mostrarNotificacao('Requisição marcada como executada!', 'sucesso');
      
      // Buscar dados da requisição para notificação
      const requisicao = requisicoes.find(req => req.id === id);
      if (requisicao) {
        notifyRequestExecuted(requisicao);
      }
      
      carregarDados();
    } catch (error) {
      console.error('Erro ao marcar como executada:', error);
      mostrarNotificacao('Erro ao marcar como executada', 'erro');
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Filtrar apenas requisições aprovadas
  const requisicoesAprovadas = requisicoes.filter(req => req.status === 'APTO');

  return (
    <div className="audiovisual-dashboard">
      {notificacao && (
        <div className={`notificacao ${notificacao.tipo}`}>
          {notificacao.mensagem}
        </div>
      )}

      <div className="dashboard-header">
        <h1>Dashboard Audiovisual</h1>
        <p>Gerencie requisições aprovadas e prepare materiais</p>
      </div>

      <div className="dashboard-section">
        <h2>Requisições Aprovadas para Preparação</h2>
        
        {loading ? (
          <div className="loading-state">
            <p>Carregando requisições...</p>
          </div>
        ) : requisicoesAprovadas.length === 0 ? (
          <div className="empty-state">
            <p>🎉 Nenhuma requisição aprovada pendente!</p>
            <p>Todas as requisições foram processadas.</p>
          </div>
        ) : (
          <div className="approved-requests">
            {requisicoesAprovadas.map((req) => (
              <div key={req.id} className="request-card">
                <div className="request-header">
                  <h4>{req.department}</h4>
                  <span className="status-badge approved">Aprovada</span>
                </div>
                <p className="request-description">
                  {req.description || req.event_name || 'Sem descrição'}
                </p>
                <div className="request-meta">
                  <span>📅 {req.date}</span>
                  {req.location && <span>📍 {req.location}</span>}
                  <span>👥 {req.expected_audience || 'N/A'} pessoas</span>
                </div>
                <div className="request-actions">
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={() => marcarComoExecutada(req.id)}
                  >
                    ✅ Marcar como Executada
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 