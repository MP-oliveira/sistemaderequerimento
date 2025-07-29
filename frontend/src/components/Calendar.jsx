import React, { useState, useEffect } from 'react';
import { buscarRequisicoesCalendario } from '../services/requestsService';
import './Calendar.css';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  useEffect(() => {
    carregarEventos();
  }, [currentDate]);

  const carregarEventos = async () => {
    try {
      setLoading(true);
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear().toString();
      const response = await buscarRequisicoesCalendario(month, year);
      setEvents(response || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Adicionar dias vazios no início
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Adicionar dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDay = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.start).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      'APTO': 'Aprovada',
      'EXECUTADO': 'Executada',
      'FINALIZADO': 'Finalizada'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDENTE': '#ff9800',
      'APTO': '#4caf50',
      'REJEITADO': '#f44336',
      'EXECUTADO': '#9c27b0',
      'PENDENTE_CONFLITO': '#ff5722',
      'PREENCHIDO': '#2196f3',
      'FINALIZADO': '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={previousMonth} className="calendar-nav-btn">
          ‹
        </button>
        <h2 className="calendar-title">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button onClick={nextMonth} className="calendar-nav-btn">
          ›
        </button>
      </div>

      <div className="calendar-grid">
        {/* Cabeçalho dos dias da semana */}
        {weekDays.map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}

        {/* Dias do mês */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isToday = day && day.toDateString() === new Date().toDateString();
          
          return (
            <div 
              key={index} 
              className={`calendar-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''}`}
            >
              {day && (
                <>
                  <div className="day-number">{day.getDate()}</div>
                  <div className="day-events">
                    {dayEvents.slice(0, 2).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className="calendar-event"
                        style={{ backgroundColor: event.color }}
                        onClick={() => setSelectedEvent(event)}
                        title={`${event.title} - ${getStatusLabel(event.status)}`}
                      >
                        <div className="event-title">{event.title}</div>
                        <div className="event-status">{getStatusLabel(event.status)}</div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="more-events">
                        +{dayEvents.length - 2} mais
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de detalhes do evento */}
      {selectedEvent && (
        <div className="event-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-modal-header">
              <h3>{selectedEvent.title}</h3>
              <button 
                className="event-modal-close"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>
            </div>
            <div className="event-modal-content">
              <div className="event-detail">
                <strong>Status:</strong>
                <span 
                  className="event-status-badge"
                  style={{ 
                    backgroundColor: 'transparent',
                    color: getStatusColor(selectedEvent.status),
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '700'
                  }}
                >
                  {getStatusLabel(selectedEvent.status)}
                </span>
              </div>
              <div className="event-detail">
                <strong>Departamento:</strong> {selectedEvent.department}
              </div>
              <div className="event-detail">
                <strong>Solicitante:</strong> {selectedEvent.requester}
              </div>
              {selectedEvent.location && (
                <div className="event-detail">
                  <strong>Local:</strong> {selectedEvent.location}
                </div>
              )}
              <div className="event-detail">
                <strong>Data:</strong> {new Date(selectedEvent.start).toLocaleDateString('pt-BR')}
              </div>
              <div className="event-detail">
                <strong>Horário:</strong> {new Date(selectedEvent.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedEvent.end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              {selectedEvent.approvedAt && (
                <div className="event-detail">
                  <strong>Aprovado em:</strong> {new Date(selectedEvent.approvedAt).toLocaleString('pt-BR')}
                </div>
              )}
              {selectedEvent.executedAt && (
                <div className="event-detail">
                  <strong>Executado em:</strong> {new Date(selectedEvent.executedAt).toLocaleString('pt-BR')}
                </div>
              )}
              {selectedEvent.returnedAt && (
                <div className="event-detail">
                  <strong>Finalizado em:</strong> {new Date(selectedEvent.returnedAt).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="calendar-loading">
          <p>Carregando eventos...</p>
        </div>
      )}
    </div>
  );
} 