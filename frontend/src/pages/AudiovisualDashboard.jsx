import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listarRequisicoes, listarEventos, executarRequisicao, retornarInstrumentos } from '../services/requestsService';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import { notifyRequestExecuted } from '../utils/notificationUtils';
import { FiPieChart, FiFileText, FiPackage, FiClock, FiZap, FiPlus, FiUserPlus, FiCalendar, FiDownload } from 'react-icons/fi';
import './Dashboard.css';

export default function AudiovisualDashboard() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [requisicoes, setRequisicoes] = useState([]);
  const [notificacao, setNotificacao] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [returnNotes, setReturnNotes] = useState('');

  function mostrarNotificacao(mensagem, tipo) {
    setNotificacao({ mensagem, tipo });
    setTimeout(() => setNotificacao(null), 5000);
  }

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const eventos = await listarEventos();
        const requisicoesData = await listarRequisicoes();
        setRequisicoes(requisicoesData || []);
        
        const reqsParaAgenda = (requisicoesData || []).filter(req => ['APTO', 'EXECUTADO', 'FINALIZADO'].includes(req.status));
        const eventosReqs = reqsParaAgenda.map(req => ({
          id: req.id,
          title: req.event_name || req.description || 'Requisição',
          location: req.location,
          start_datetime: req.start_datetime,
          end_datetime: req.end_datetime,
          status: req.status,
          type: 'requisicao',
        }));
        const eventosFormatados = (eventos || []).map(ev => ({
          id: ev.id,
          title: ev.name,
          location: ev.location,
          start_datetime: ev.start_datetime,
          end_datetime: ev.end_datetime,
          status: ev.status || 'CONFIRMADO',
          type: 'evento',
        }));
        setEvents([...eventosFormatados, ...eventosReqs]);
      } catch (err) {
        console.error('Erro ao carregar eventos:', err);
        setEvents([]);
      }
      setLoading(false);
    };
    carregarDados();
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const days = [];
    // Dias do mês anterior (apenas para alinhar o primeiro dia da semana)
    for (let i = 0; i < startingDay; i++) {
      days.push({
        date: null,
        isCurrentMonth: false,
        events: []
      });
    }
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const dateString = currentDate.toISOString().split('T')[0];
      const dayEvents = events.filter(event => {
        if (event.start_datetime) {
          const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
          return eventDate === dateString;
        }
        return false;
      });
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        events: dayEvents
      });
    }
    return days;
  };

  const formatDate = (date) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleDayClick = (day) => {
    if (day && day.events.length > 0) {
      setSelectedDayEvents(day.events);
      setSelectedDay(day.date);
      setShowEventModal(true);
    }
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setSelectedDayEvents([]);
    setSelectedDay(null);
  };

  const formatEventTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const marcarComoExecutada = async (id) => {
    try {
      await executarRequisicao(id);
      mostrarNotificacao('Requisição marcada como executada!', 'sucesso');
      
      // Buscar dados da requisição para notificação
      const requisicao = requisicoes.find(req => req.id === id);
      if (requisicao) {
        notifyRequestExecuted(requisicao);
      }
      
      // Recarregar dados
      const requisicoesData = await listarRequisicoes();
      setRequisicoes(requisicoesData || []);
    } catch (error) {
      console.error('Erro ao marcar como executada:', error);
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
      
      // Recarregar dados
      const requisicoesData = await listarRequisicoes();
      setRequisicoes(requisicoesData || []);
    } catch (error) {
      console.error('Erro ao retornar instrumentos:', error);
      mostrarNotificacao('Erro ao retornar instrumentos', 'erro');
    }
  };

  // Filtrar requisições para estatísticas
  const requisicoesAprovadas = requisicoes.filter(req => req.status === 'APTO');
  const requisicoesExecutadas = requisicoes.filter(req => req.status === 'EXECUTADO');
  const requisicoesFinalizadas = requisicoes.filter(req => req.status === 'FINALIZADO');

  const days = getDaysInMonth(currentDate);

  return (
    <div className="dashboard">
      {notificacao && (
        <div className={`notificacao ${notificacao.tipo}`}>
          {notificacao.mensagem}
        </div>
      )}

      <div className="dashboard-header">
        <h1>Dashboard Audiovisual</h1>
        <p>Gerencie requisições aprovadas e prepare materiais</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">
              <FiFileText size={18} />
            </div>
          </div>
          <div className="stat-info">
            <div className="stat-number">{requisicoesAprovadas.length}</div>
            <div className="stat-label">Requisições Aprovadas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon yellow">
              <FiClock size={18} />
            </div>
          </div>
          <div className="stat-info">
            <div className="stat-number">{requisicoesExecutadas.length}</div>
            <div className="stat-label">Em Preparação</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon success">
              <FiPackage size={18} />
            </div>
          </div>
          <div className="stat-info">
            <div className="stat-number">{requisicoesFinalizadas.length}</div>
            <div className="stat-label">Finalizadas</div>
          </div>
        </div>
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
            Ver Requisições
          </a>
          <a href="/inventario" className="action-btn">
            <FiPackage />
            Gerenciar Inventário
          </a>
          <a href="/relatorio" className="action-btn">
            <FiDownload />
            Relatórios
          </a>
        </div>
      </div>

      {/* Requisições Aprovadas para Preparação */}
      {requisicoesAprovadas.length > 0 && (
        <div className="dashboard-section">
          <h3 className="section-title">
            <FiClock style={{marginRight: 8}} />
            Requisições Aprovadas para Preparação
          </h3>
          <div className="approved-requests">
            {requisicoesAprovadas.slice(0, 3).map((req) => (
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
        </div>
      )}

      {/* Requisições Executadas para Retorno */}
      {requisicoesExecutadas.length > 0 && (
        <div className="dashboard-section">
          <h3 className="section-title">
            <FiPackage style={{marginRight: 8}} />
            Requisições Executadas - Retornar Instrumentos
          </h3>
          <div className="executed-requests">
            {requisicoesExecutadas.slice(0, 3).map((req) => (
              <div key={req.id} className="request-card">
                <div className="request-header">
                  <h4>{req.department}</h4>
                  <span className="status-badge executed">Executada</span>
                </div>
                <p className="request-description">
                  {req.description || req.event_name || 'Sem descrição'}
                </p>
                <div className="request-meta">
                  <span>📅 {req.date}</span>
                  {req.location && <span>📍 {req.location}</span>}
                </div>
                <div className="request-actions">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => abrirModalRetorno(req)}
                  >
                    🔄 Retornar Instrumentos
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendário */}
      <div className="card calendar-card">
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={previousMonth}>
            ‹
          </button>
          <h2 className="calendar-title">{formatDate(currentDate)}</h2>
          <button className="calendar-nav-btn" onClick={nextMonth}>
            ›
          </button>
        </div>
        {loading ? (
          <div className="calendar-loading">
            <p>Carregando eventos...</p>
          </div>
        ) : (
          <div className="calendar-grid">
            {/* Cabeçalho dos dias da semana */}
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}
            
            {/* Dias do mês */}
            {days.map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                {day.date && (
                  <>
                    <div className="day-number">{day.date.getDate()}</div>
                    <div className="day-events">
                      {day.events.slice(0, 2).map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className={`calendar-event ${event.type}`}
                          title={`${event.title} - ${event.location || 'Sem local'}`}
                        >
                          <div className="event-title">{event.title}</div>
                          <div className="event-location">{event.location}</div>
                          <div className="event-time">
                            {formatEventTime(event.start_datetime)}
                          </div>
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <div className="more-events">
                          +{day.events.length - 2} mais
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Eventos do Dia */}
      <Modal 
        open={showEventModal} 
        onClose={closeEventModal}
        title={`Eventos de ${selectedDay ? selectedDay.toLocaleDateString('pt-BR') : ''}`}
      >
        <div className="events-list">
          {selectedDayEvents.length === 0 ? (
            <div className="no-events">
              <p>Nenhum evento agendado para este dia.</p>
            </div>
          ) : (
            selectedDayEvents.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-title">{event.title}</div>
                <div className="event-location">{event.location}</div>
                <div className="event-time">
                  {formatEventTime(event.start_datetime)} - {formatEventTime(event.end_datetime)}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Modal de Retorno de Instrumentos */}
      <Modal 
        open={showReturnModal} 
        onClose={() => setShowReturnModal(false)}
        title="Retornar Instrumentos ao Inventário"
      >
        {selectedRequest && (
          <div className="return-modal-content">
            <div className="request-info">
              <h4>{selectedRequest.department}</h4>
              <p>{selectedRequest.description || selectedRequest.event_name}</p>
              <p><strong>Data:</strong> {selectedRequest.date}</p>
              {selectedRequest.location && <p><strong>Local:</strong> {selectedRequest.location}</p>}
            </div>
            
            <div className="return-notes">
              <label>Observações do Retorno (opcional):</label>
              <Input
                type="text"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Ex: Instrumentos em bom estado, microfones funcionando..."
              />
            </div>
            
            <div className="modal-actions">
              <Button 
                variant="secondary" 
                onClick={() => setShowReturnModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="success" 
                onClick={confirmarRetorno}
              >
                Confirmar Retorno
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 