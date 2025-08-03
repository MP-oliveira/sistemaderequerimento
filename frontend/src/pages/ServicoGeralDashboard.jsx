import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listarRequisicoes, listarEventos } from '../services/requestsService';
import Modal from '../components/Modal';
import TodayMaterialsServicoGeral from '../components/TodayMaterialsServicoGeral';
import ReturnMaterialsOnly from '../components/ReturnMaterialsOnly';
import { formatTimeUTC } from '../utils/dateUtils';
import { FiFileText, FiPackage, FiClock, FiZap, FiPlus, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import './ServicoGeralDashboard.css';

export default function ServicoGeralDashboard() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [requisicoes, setRequisicoes] = useState([]);
  const [notificacao, setNotificacao] = useState(null);

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
        console.error('❌ [ServicoGeralDashboard] Erro ao carregar eventos:', err);
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
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const previousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const handleDayClick = (day) => {
    if (day.events.length > 0) {
      setSelectedDay(day.date);
      setSelectedDayEvents(day.events);
      setShowEventModal(true);
    }
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setSelectedDay(null);
    setSelectedDayEvents([]);
  };

  const formatEventTime = (dateString) => {
    return formatTimeUTC(dateString);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="dashboard-container servico-geral-dashboard">
      {/* Notificação */}
      {notificacao && (
        <div className={`notificacao ${notificacao.tipo}`}>
          {notificacao.mensagem}
        </div>
      )}

      <div className="dashboard-header">
        <h1>Dashboard Serviço Geral</h1>
        <p>Gerencie materiais e acompanhe eventos</p>
      </div>

      {/* Materiais para Despachar (Próximos 7 dias) */}
      <TodayMaterialsServicoGeral />

      {/* Retorno de Materiais (Próximos 7 dias) */}
      <ReturnMaterialsOnly />

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
                          <div key={event.id} className="event-dot" title={event.title}>
                            •
                          </div>
                        ))}
                        {day.events.length > 2 && (
                          <div className="event-more">+{day.events.length - 2}</div>
                        )}
                      </div>
                      <div className="event-name-preview" title={day.events[0].title}>
                        {day.events[0].title}
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
            <span>Eventos e Requisições</span>
          </div>
        </div>
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
    </div>
  );
} 