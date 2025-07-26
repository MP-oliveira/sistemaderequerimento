import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listarRequisicoes, listarEventos } from '../services/requestsService';
import ActivityLog from '../components/ActivityLog';
import Modal from '../components/Modal';
import Button from '../components/Button';
import './Dashboard.css';
import { FiPieChart, FiFileText, FiPackage, FiClock, FiZap, FiPlus, FiUserPlus, FiCalendar, FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const PAGES = [
  { key: 'dashboard', label: 'Dashboard', icon: <FiPieChart />, url: '/' },
  { key: 'requirements', label: 'Requerimentos', icon: <FiFileText />, url: '/requisicoes' },
  { key: 'inventory', label: 'Inventário', icon: <FiPackage />, url: '/inventario' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [requisicoesConflito, setRequisicoesConflito] = useState([]);

  // Função para carregar logs recentes (não faz mais nada)
  const carregarLogsRecentes = async () => {
    // Removido: não é mais necessário
  };

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const eventos = await listarEventos();
        const requisicoes = await listarRequisicoes();
        const reqsParaAgenda = (requisicoes || []).filter(req => ['APTO', 'EXECUTADO', 'FINALIZADO'].includes(req.status));
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
        await carregarLogsRecentes();
      } catch (err) {
        console.error('Erro ao carregar eventos:', err);
        setEvents([]);
      }
      setLoading(false);
    };
    carregarDados();
  }, []);

  useEffect(() => {
    async function buscarConflitos() {
      if (user && (user.role === 'ADM' || user.role === 'PASTOR')) {
        const todas = await listarRequisicoes();
        setRequisicoesConflito((todas || []).filter(r => r.status === 'PENDENTE_CONFLITO'));
      }
    }
    buscarConflitos();
  }, [user]);

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
          const eventDate = new Date(event.start_datetime);
          const eventDateString = eventDate.toISOString().split('T')[0];
          return eventDateString === dateString;
        }
        return false;
      });
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        events: dayEvents
      });
    }
    // Dias do próximo mês (apenas para completar a última semana)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        events: []
      });
    }
    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
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
    if (day.events.length > 0) {
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
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="dashboard-container">
      {/* Page Toggle */}
      <div className="page-toggle">
        {PAGES.map(p => (
          <a
            key={p.key}
            className={`toggle-btn${window.location.pathname === p.url ? ' active' : ''}`}
            href={p.url}
          >
            {p.icon}
            {p.label}
          </a>
        ))}
      </div>
      <div className="dashboard-header">
        <h2>Bem-vindo, {user?.nome || 'Administrador'}!</h2>
        <p>Gerencie os requerimentos e recursos da igreja</p>
      </div>
      {/* Stats Cards - Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">
              <FiFileText size={18} />
            </div>
          </div>
          <div className="stat-info">
            <div className="stat-number">12</div>
            <div className="stat-label">Requerimentos Ativos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon yellow">
              <FiClock size={18} />
            </div>
          </div>
          <div className="stat-info">
            <div className="stat-number">{events.length}</div>
            <div className="stat-label">Eventos Agendados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon success">
              <FiPackage size={18} />
            </div>
          </div>
          <div className="stat-info">
            <div className="stat-number">45</div>
            <div className="stat-label">Itens Disponíveis</div>
          </div>
        </div>
      </div>
      {/* Quick Actions - Grid */}
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
      {/* Painel de conflitos */}
      {user && (user.role === 'ADM' || user.role === 'PASTOR') && requisicoesConflito.length > 0 && (
        <div className="dashboard-conflitos-card">
          <div className="conflitos-header">
            ⚠️ Requisições em Conflito aguardando decisão ({requisicoesConflito.length})
          </div>
          <ul className="conflitos-list">
            {requisicoesConflito.map(req => (
              <li key={req.id} className="conflito-item">
                <div className="conflito-content">
                  <div className="conflito-title">{req.description || 'Sem descrição'}</div>
                  <div className="conflito-info">Depto: {req.department} | Prioridade: <b>{req.prioridade || '-'}</b></div>
                  <div className="conflito-date">Data: {req.start_datetime ? new Date(req.start_datetime).toLocaleString('pt-BR') : '-'}</div>
                </div>
                <Button variant="success" size="sm" onClick={() => window.location.href = `/requests?id=${req.id}&acao=aprovar`} className="conflito-btn-aprovar">Aprovar</Button>
                <Button variant="danger" size="sm" onClick={() => window.location.href = `/requests?id=${req.id}&acao=rejeitar`} className="conflito-btn-rejeitar">Rejeitar</Button>
              </li>
            ))}
          </ul>
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
            <div className="loading-spinner"></div>
            <p>Carregando eventos...</p>
          </div>
        ) : (
          <div className="calendar-grid">
            <div className="calendar-weekdays">
              <div className="weekday">Dom</div>
              <div className="weekday">Seg</div>
              <div className="weekday">Ter</div>
              <div className="weekday">Qua</div>
              <div className="weekday">Qui</div>
              <div className="weekday">Sex</div>
              <div className="weekday">Sáb</div>
            </div>
            <div className="calendar-days">
              {days.map((day, index) => (
                <div 
                  key={index} 
                  className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''} ${day.events.length > 0 ? 'has-events' : ''}`}
                  onClick={() => handleDayClick(day)}
                  style={{ cursor: day.events.length > 0 ? 'pointer' : 'default' }}
                >
                  <span className="day-number">{day.date ? day.date.getDate() : ''}</span>
                  {day.events.length > 0 && (
                    <>
                      <div className="day-events">
                        {day.events.slice(0, 2).map(event => (
                          <div key={event.id} className="event-dot" title={event.name || event.titulo}>
                            •
                          </div>
                        ))}
                        {day.events.length > 2 && (
                          <div className="event-more">+{day.events.length - 2}</div>
                        )}
                      </div>
                      <div className="event-name-preview" title={day.events[0].name || day.events[0].titulo}>
                        {day.events[0].name || day.events[0].titulo}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-dot"></div>
            <span>Eventos da Igreja</span>
          </div>
        </div>
      </div>
      {/* Lista de eventos do dia */}
      <div className="card activity-card activity-card-today">
        <h3 className="activity-title">Atividades do dia</h3>
        {(() => {
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          const eventosHoje = events.filter(ev => {
            if (!ev.start_datetime) return false;
            const evDate = new Date(ev.start_datetime);
            return evDate.toISOString().split('T')[0] === todayStr;
          });
          if (eventosHoje.length === 0) {
            return <div className="no-events">Nenhum evento para hoje.</div>;
          }
          return (
            <ul className="events-list">
              {eventosHoje.map(ev => (
                <li key={ev.id} className="event-item">
                  <span className="event-title">{ev.title}</span>
                  <span className="event-location">
                    {ev.location ? `(${ev.location})` : ''}
                  </span>
                  <span className="event-time">
                    {ev.start_datetime ? new Date(ev.start_datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    {ev.end_datetime ? ' - ' + new Date(ev.end_datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </li>
              ))}
            </ul>
          );
        })()}
      </div>
      {/* Lista de atividades recentes do mês até ontem */}
      <div className="card activity-card activity-card-recent">
        <h3 className="activity-title">Atividades recentes</h3>
        {(() => {
          const today = new Date();
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const eventosRecentes = events.filter(ev => {
            if (!ev.start_datetime) return false;
            const evDate = new Date(ev.start_datetime);
            // Entre o primeiro dia do mês e ontem
            return evDate >= firstDayOfMonth && evDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          }).sort((a, b) => new Date(b.start_datetime) - new Date(a.start_datetime));
          if (eventosRecentes.length === 0) {
            return <div className="no-events">Nenhuma atividade recente neste mês.</div>;
          }
          return (
            <ul className="events-list">
              {eventosRecentes.map(ev => (
                <li key={ev.id} className="event-item">
                  <span className="event-title">{ev.title}</span>
                  <span className="event-location">
                    {ev.location ? `(${ev.location})` : ''}
                  </span>
                  <span className="event-time">
                    {ev.start_datetime ? new Date(ev.start_datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''}
                    {ev.start_datetime ? ' ' + new Date(ev.start_datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    {ev.end_datetime ? ' - ' + new Date(ev.end_datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </li>
              ))}
            </ul>
          );
        })()}
      </div>
      {/* Modal de Eventos do Dia */}
      <Modal 
        open={showEventModal} 
        title={
          <div className="event-modal-header">
            <span className="event-modal-title">Evento</span>
            {selectedDay && (
              <span className="event-modal-date">
                {(() => {
                  const dia = selectedDay.toLocaleDateString('pt-BR', { weekday: 'long' });
                  const data = selectedDay.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  return `${dia.charAt(0).toUpperCase() + dia.slice(1)}, ${data}`;
                })()}
              </span>
            )}
          </div>
        }
        onClose={closeEventModal}
        actions={
          <Button variant="secondary" size="sm" onClick={closeEventModal}>Fechar</Button>
        }
      >
        <div className="event-modal-cards">
          {selectedDayEvents
            .filter(ev => ev.status !== 'CANCELADO')
            .map((ev, idx) => {
              const isFinalizado = ev.status === 'FINALIZADO';
              return (
                <div
                  key={ev.id + '-' + idx}
                  className={`event-modal-card${isFinalizado ? ' finalizado' : ''}`}
                  style={{
                    background: isFinalizado ? '#f9fafb' : '#fff',
                    opacity: isFinalizado ? 0.7 : 1,
                    borderRadius: 14,
                    boxShadow: '0 2px 12px #2563eb11',
                    padding: 20,
                    marginBottom: 12,
                    minWidth: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                    <span className="event-modal-title-name" style={{ fontWeight: 600, fontSize: 18, color: '#2563eb' }}>{ev.title}</span>
                    <span className={`event-modal-status${ev.status === 'APTO' ? ' apto' : ev.status === 'EXECUTADO' ? ' executado' : ev.status === 'FINALIZADO' ? ' finalizado' : ''}`}
                      style={{
                        background: ev.status === 'APTO' ? '#d1fae5' : ev.status === 'EXECUTADO' ? '#fef3c7' : '#f3f4f6',
                        color: ev.status === 'APTO' ? '#059669' : ev.status === 'EXECUTADO' ? '#d97706' : '#9ca3af',
                        fontWeight: 500,
                        fontSize: 13,
                        borderRadius: 12,
                        padding: '4px 12px',
                        marginLeft: 'auto'
                      }}
                    >{ev.status}</span>
                  </div>
                  <div style={{ color: '#666', fontSize: 15, margin: '4px 0 0 0' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span role="img" aria-label="local" style={{ fontSize: 17 }}>📍</span> {ev.location || '-'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <span role="img" aria-label="horario" style={{ fontSize: 17 }}>🕒</span> {formatEventTime(ev.start_datetime)} - {formatEventTime(ev.end_datetime)}
                    </span>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    {ev.type === 'requisicao' && <span className="event-modal-badge requisicao" style={{ background: '#dbeafe', color: '#2563eb', fontSize: 12, fontWeight: 500, borderRadius: 8, padding: '4px 12px' }}>Requerimento</span>}
                    {ev.type === 'evento' && <span className="event-modal-badge" style={{ background: '#d1fae5', color: '#059669', fontSize: 12, fontWeight: 500, borderRadius: 8, padding: '4px 12px' }}>Evento</span>}
                  </div>
                </div>
              );
            })}
          {selectedDayEvents.filter(ev => ev.status !== 'CANCELADO').length === 0 && <div>Nenhum evento ou requerimento neste dia.</div>}
        </div>
      </Modal>
    </div>
  );
} 