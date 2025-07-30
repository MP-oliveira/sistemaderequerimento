import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listarRequisicoes, listarEventos, executarRequisicao, retornarInstrumentos } from '../services/requestsService';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import TodayMaterials from '../components/TodayMaterials';
import ReturnMaterials from '../components/ReturnMaterials';
import RequestItemsChecklist from '../components/RequestItemsChecklist';
import { notifyRequestExecuted } from '../utils/notificationUtils';
import { formatTimeUTC } from '../utils/dateUtils';
import { FiPieChart, FiFileText, FiPackage, FiClock, FiZap, FiPlus, FiUserPlus, FiCalendar, FiDownload, FiMapPin, FiUsers, FiCheck, FiX, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import './AudiovisualDashboard.css';

export default function AudiovisualDashboard() {
  console.log('🎯 AudiovisualDashboard renderizado');
  
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
  const [showChecklist, setShowChecklist] = useState(false);
  const [selectedRequestForChecklist, setSelectedRequestForChecklist] = useState(null);

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
        
        console.log('🎯 [AudiovisualDashboard] Requisições carregadas:', requisicoesData?.length || 0);
        console.log('🎯 [AudiovisualDashboard] Requisições:', requisicoesData);
        
        // Procurar pela requisição Kids
        const kidsRequest = requisicoesData?.find(req => req.event_name === 'Vigilia Kids');
        if (kidsRequest) {
          console.log('✅ [AudiovisualDashboard] Requisição Kids encontrada:', kidsRequest);
        } else {
          console.log('❌ [AudiovisualDashboard] Requisição Kids NÃO encontrada');
        }
        
        const reqsParaAgenda = (requisicoesData || []).filter(req => ['APTO', 'EXECUTADO', 'FINALIZADO'].includes(req.status));
        
        console.log('🎯 [AudiovisualDashboard] Requisições para agenda:', reqsParaAgenda.length);
        
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
        
        console.log('🎯 [AudiovisualDashboard] Total de eventos:', [...eventosFormatados, ...eventosReqs].length);
      } catch (err) {
        console.error('❌ [AudiovisualDashboard] Erro ao carregar eventos:', err);
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

  const marcarComoExecutada = async (id) => {
    try {
      await executarRequisicao(id);
      mostrarNotificacao('Requisição marcada como executada!', 'sucesso');
      // Recarregar dados
      const requisicoesData = await listarRequisicoes();
      setRequisicoes(requisicoesData || []);
    } catch (err) {
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
    } catch {
      mostrarNotificacao('Erro ao retornar instrumentos', 'erro');
    }
  };

  const openChecklist = (requisicao) => {
    setSelectedRequestForChecklist(requisicao);
    setShowChecklist(true);
  };

  const closeChecklist = () => {
    setShowChecklist(false);
    setSelectedRequestForChecklist(null);
  };

  const handleItemsUpdated = async () => {
    // Recarregar dados após atualização do checklist
    const requisicoesData = await listarRequisicoes();
    setRequisicoes(requisicoesData || []);
  };

  const days = getDaysInMonth(currentDate);

  // Filtrar requisições por status
  const requisicoesAprovadas = requisicoes.filter(req => 
    req.status === 'APTO' && 
    (req.start_datetime || req.event_name || req.location) // Mostrar apenas requisições com pelo menos alguns dados
  );
  const requisicoesExecutadas = requisicoes.filter(req => req.status === 'EXECUTADO');
  const requisicoesFinalizadas = requisicoes.filter(req => req.status === 'FINALIZADO');

  // Debug logs
  console.log('🎯 [AudiovisualDashboard] Total de requisições:', requisicoes.length);
  console.log('🎯 [AudiovisualDashboard] Requisições aprovadas:', requisicoesAprovadas.length);
  console.log('🎯 [AudiovisualDashboard] Requisições aprovadas:', requisicoesAprovadas);
  
  // Verificar se a requisição Kids está nas aprovadas
  const kidsRequestAprovada = requisicoesAprovadas.find(req => req.event_name === 'Vigilia Kids');
  if (kidsRequestAprovada) {
    console.log('✅ [AudiovisualDashboard] Requisição Kids está nas aprovadas:', kidsRequestAprovada);
  } else {
    console.log('❌ [AudiovisualDashboard] Requisição Kids NÃO está nas aprovadas');
    // Verificar por que não está
    const kidsRequest = requisicoes.find(req => req.event_name === 'Vigilia Kids');
    if (kidsRequest) {
      console.log('🔍 [AudiovisualDashboard] Requisição Kids encontrada mas não aprovada:', kidsRequest);
      console.log('   Status:', kidsRequest.status);
      console.log('   Tem start_datetime?', !!kidsRequest.start_datetime);
      console.log('   Tem event_name?', !!kidsRequest.event_name);
      console.log('   Tem location?', !!kidsRequest.location);
    }
  }

  return (
    <div className="dashboard-container audiovisual-dashboard">
      {/* Notificação */}
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
          <Link to="/audiovisual/requisicoes" className="action-btn" onClick={() => console.log('🎯 AudiovisualDashboard - Link clicado: /audiovisual/requisicoes')}>
            <FiPlus />
            Ver Requisições
          </Link>
          <Link to="/inventario" className="action-btn" onClick={() => console.log('🎯 AudiovisualDashboard - Link clicado: /inventario')}>
            <FiPackage />
            Gerenciar Inventário
          </Link>
        </div>
      </div>

      {/* Materiais do Dia */}
      <TodayMaterials />

      {/* Materiais Audiovisual */}
      <ReturnMaterials />

      {/* Requisições Aprovadas para Preparação */}
      {requisicoesAprovadas.length > 0 && (
        <div className="card">
          <h3 className="section-title">
            <FiCheck style={{marginRight: 8}} />
            Requisições Aprovadas para Preparação
          </h3>
          <div className="requests-grid">
            {requisicoesAprovadas.map((requisicao) => (
              <div key={requisicao.id} className="request-card">
                <div className="request-header">
                  <h4>{requisicao.event_name || requisicao.description || 'Evento'}</h4>
                  <span className="status-badge apto">APTO</span>
                </div>
                
                <div className="request-details">
                  <div className="detail-item">
                    <FiUsers size={14} />
                    <span>{requisicao.department}</span>
                  </div>
                  <div className="detail-item">
                    <FiClock size={14} />
                    <span>
                      {requisicao.start_datetime && requisicao.end_datetime 
                        ? `${formatTimeUTC(requisicao.start_datetime)} - ${formatTimeUTC(requisicao.end_datetime)}`
                        : 'Horário não definido'
                      }
                    </span>
                  </div>
                  {requisicao.location && (
                    <div className="detail-item">
                      <FiMapPin size={14} />
                      <span>{requisicao.location}</span>
                    </div>
                  )}
                </div>

                <div className="request-actions">
                  <Button
                    onClick={() => marcarComoExecutada(requisicao.id)}
                    variant="primary"
                    size="sm"
                  >
                    <FiCheck size={16} />
                    Marcar como Executada
                  </Button>
                  <Button
                    onClick={() => openChecklist(requisicao)}
                    variant="secondary"
                    size="sm"
                  >
                    <FiEye size={16} />
                    Ver Checklist
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
            <span>Requisições Aprovadas</span>
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

      {/* Modal de Retorno */}
      <Modal
        open={showReturnModal}
        title="Finalizar Evento"
        onClose={() => setShowReturnModal(false)}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="sm" onClick={() => setShowReturnModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={confirmarRetorno}>
              Confirmar
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p>Confirme que o evento foi finalizado e os instrumentos foram devolvidos.</p>
          <div>
            <label>Observações (opcional):</label>
            <textarea
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="Adicione observações sobre o evento..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Modal de Checklist */}
      <RequestItemsChecklist
        open={showChecklist}
        onClose={closeChecklist}
        request={selectedRequestForChecklist}
        onItemsUpdated={handleItemsUpdated}
      />
    </div>
  );
} 