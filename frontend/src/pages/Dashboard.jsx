import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMockEvents } from '../services/eventsService';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carregar eventos (usando mock por enquanto)
  useEffect(() => {
    setLoading(true);
    try {
      const mockEvents = getMockEvents();
      setEvents(mockEvents);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    }
    setLoading(false);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Dias do mês anterior
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevMonth = new Date(year, month - 1, 0);
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
        events: []
      });
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const dateString = currentDate.toISOString().split('T')[0];
      const dayEvents = events.filter(event => event.data === dateString);
      
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        events: dayEvents
      });
    }
    
    // Dias do próximo mês
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let i = 1; i <= remainingDays; i++) {
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
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="dashboard-container">
      <div className="card dashboard-card">
        <h1>Bem-vindo, {user?.nome || 'Usuário'}!</h1>
        <p className="dashboard-subtitle">Sistema de Requisições e Eventos da Igreja</p>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Requerimentos</h3>
            <p className="stat-number">12</p>
            <p className="stat-label">Este mês</p>
          </div>
          <div className="stat-card">
            <h3>Eventos</h3>
            <p className="stat-number">{events.length}</p>
            <p className="stat-label">Este mês</p>
          </div>
          <div className="stat-card">
            <h3>Itens</h3>
            <p className="stat-number">45</p>
            <p className="stat-label">Disponíveis</p>
          </div>
        </div>
      </div>

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
          <>
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
                    className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''}`}
                  >
                    <span className="day-number">{day.date.getDate()}</span>
                    {day.events.length > 0 && (
                      <div className="day-events">
                        {day.events.slice(0, 2).map(event => (
                          <div key={event.id} className="event-dot" title={event.titulo}>
                            •
                          </div>
                        ))}
                        {day.events.length > 2 && (
                          <div className="event-more">+{day.events.length - 2}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="calendar-legend">
              <div className="legend-item">
                <div className="legend-dot"></div>
                <span>Eventos da Igreja</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 