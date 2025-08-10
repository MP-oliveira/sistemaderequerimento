import React, { useState, useEffect } from 'react';
import { formatTimeUTC } from '../utils/dateUtils';
import './Calendar.css';

export default function Calendar({ 
  events = [], 
  onDayClick, 
  showEventModal = false, 
  onCloseEventModal,
  selectedDayEvents = [],
  selectedDay = null 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    const days = [];
    
    // Adicionar dias vazios do mês anterior para alinhar com os dias da semana
    for (let i = 0; i < startingDay; i++) {
      days.push({
        date: null,
        isCurrentMonth: false,
        events: []
      });
    }
    
    // Adicionar todos os dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Filtrar eventos para este dia
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
    
    // Adicionar dias vazios do próximo mês para completar a última semana
    const totalDays = days.length;
    const remainingDays = (7 - (totalDays % 7)) % 7;
    
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: null,
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
    if (onDayClick && day.events.length > 0) {
      onDayClick(day);
    }
  };

  const formatEventTime = (dateString) => {
    return formatTimeUTC(dateString);
  };

  const days = getDaysInMonth(currentDate);

  return (
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
          <span>Eventos da Igreja</span>
        </div>
      </div>
    </div>
  );
}
