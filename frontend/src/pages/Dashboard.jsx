import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listarItensInventario } from '../services/inventoryService';
import { buscarTodosLogs } from '../services/activityLogService';
import { listarRequisicoes, listarEventos } from '../services/requestsService';
import ActivityLog from '../components/ActivityLog';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Button from '../components/Button';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itensBaixoEstoque, setItensBaixoEstoque] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Estados para logs de atividade
  const [recentLogs, setRecentLogs] = useState([]);

  // Função para verificar estoque baixo
  const verificarEstoqueBaixo = async () => {
    try {
      const itens = await listarItensInventario();
      const itensBaixoEstoque = itens.filter(item => 
        Number(item.quantity_available) <= 2
      );
      
      setItensBaixoEstoque(itensBaixoEstoque);
    } catch (error) {
      console.error('Erro ao verificar estoque:', error);
    }
  };

  // Função para carregar logs recentes
  const carregarLogsRecentes = async () => {
    try {
      const logs = await buscarTodosLogs();
      // Pegar apenas os 5 logs mais recentes
      setRecentLogs(logs.slice(0, 5) || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      // Não mostrar erro toast para não poluir a interface
    }
  };

  // Carregar eventos da API e verificar estoque
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const eventos = await listarEventos();
        // Buscar requisições relevantes
        const requisicoes = await listarRequisicoes();
        // Filtrar apenas APTO, EXECUTADO, FINALIZADO
        const reqsParaAgenda = (requisicoes || []).filter(req => ['APTO', 'EXECUTADO', 'FINALIZADO'].includes(req.status));
        // Mapear para formato de evento
        const eventosReqs = reqsParaAgenda.map(req => ({
          id: req.id,
          title: req.event_name || req.description || 'Requisição',
          location: req.location,
          start_datetime: req.start_datetime,
          end_datetime: req.end_datetime,
          status: req.status,
          type: 'requisicao',
        }));
        // Mapear eventos para formato unificado
        const eventosFormatados = (eventos || []).map(ev => ({
          id: ev.id,
          title: ev.name,
          location: ev.location,
          start_datetime: ev.start_datetime,
          end_datetime: ev.end_datetime,
          status: ev.status || 'CONFIRMADO',
          type: 'evento',
        }));
        // Unir tudo
        setEvents([...eventosFormatados, ...eventosReqs]);
        await verificarEstoqueBaixo();
        await carregarLogsRecentes();
      } catch (err) {
        console.error('Erro ao carregar eventos:', err);
        setEvents([]);
        toast.error('Erro ao carregar eventos ou requisições. Tente novamente.');
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
      const dayEvents = events.filter(event => {
        // Verificar se o evento tem start_datetime e se corresponde ao dia
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

  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
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
        
        {/* Alerta de estoque baixo */}
        {itensBaixoEstoque.length > 0 && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '20px',
            color: '#856404'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <strong>Alerta de Estoque Baixo</strong>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
              {itensBaixoEstoque.length} item(s) com estoque baixo: {itensBaixoEstoque.map(item => 
                `${item.name} (${item.quantity_available} disponível)`
              ).join(', ')}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
              Por favor, verifique o inventário e reponha os itens necessários.
            </p>
          </div>
        )}
        
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
                    className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''} ${day.events.length > 0 ? 'has-events' : ''}`}
                    onClick={() => handleDayClick(day)}
                    style={{ cursor: day.events.length > 0 ? 'pointer' : 'default' }}
                  >
                    <span className="day-number">{day.date.getDate()}</span>
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
                        {/* Nome do primeiro evento */}
                        <div className="event-name-preview" title={day.events[0].name || day.events[0].titulo}>
                          {day.events[0].name || day.events[0].titulo}
                        </div>
                      </>
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

      {/* Seção de Atividades Recentes */}
      <div className="card activity-card">
        <ActivityLog 
          logs={recentLogs}
          title="📋 Atividades Recentes"
          emptyMessage="Nenhuma atividade registrada recentemente."
        />
      </div>

      {/* Modal de Eventos do Dia */}
      <Modal 
        open={showEventModal} 
        onClose={closeEventModal}
        title={selectedDay ? `Eventos/Requerimentos em ${formatEventDate(selectedDay)}` : 'Eventos'}
        actions={
          <Button variant="secondary" size="sm" onClick={closeEventModal}>Fechar</Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedDayEvents.map((ev, idx) => (
            <div
              key={ev.id + '-' + idx}
              style={{
                border: '1px solid #2d8cff',
                borderRadius: 8,
                padding: 12,
                background: ev.status === 'FINALIZADO' ? '#f5faff' : '#fff',
                opacity: ev.status === 'FINALIZADO' ? 0.6 : 1,
                boxShadow: '0 2px 8px #0001',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 16 }}>{ev.title}</div>
              <div><b>Local:</b> {ev.location || '-'}</div>
              <div><b>Status:</b> {ev.status}</div>
              <div><b>Horário:</b> {formatEventTime(ev.start_datetime)} - {formatEventTime(ev.end_datetime)}</div>
              {ev.type === 'requisicao' && <div style={{ color: '#2d8cff', fontSize: 13 }}>Requerimento</div>}
              {ev.type === 'evento' && <div style={{ color: '#28a745', fontSize: 13 }}>Evento</div>}
            </div>
          ))}
          {selectedDayEvents.length === 0 && <div>Nenhum evento ou requerimento neste dia.</div>}
        </div>
      </Modal>
    </div>
  );
} 