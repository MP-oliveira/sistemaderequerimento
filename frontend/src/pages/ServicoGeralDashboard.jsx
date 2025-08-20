import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { listarRequisicoes, listarEventos, buscarRequisicoesCalendario } from '../services/requestsService';
import Modal from '../components/Modal';
import TodayMaterialsServicoGeral from '../components/TodayMaterialsServicoGeral';
import AllFutureRequests from '../components/AllFutureRequests';
import ReturnMaterialsOnly from '../components/ReturnMaterialsOnly';
import Calendar from '../components/Calendar';
import { formatTimeUTC } from '../utils/dateUtils';
import { FiFileText, FiPackage, FiClock, FiZap, FiPlus, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import './ServicoGeralDashboard.css';

export default function ServicoGeralDashboard() {
  console.log('🔍 [ServicoGeralDashboard] Componente sendo montado');
  console.log('🔍 [ServicoGeralDashboard] AllFutureRequests importado:', AllFutureRequests);
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
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
      try {
        const eventos = await listarEventos();
        const requisicoesData = await listarRequisicoes();
        setRequisicoes(requisicoesData || []);
        
        // Buscar requisições para o calendário usando a função correta
        const currentDate = new Date();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear().toString();
        const requisicoesCalendario = await buscarRequisicoesCalendario(month, year);
        
        const eventosReqs = (requisicoesCalendario || []).map(req => ({
          id: req.id,
          title: req.title || req.event_name || req.description || 'Requisição',
          location: req.location,
          start_datetime: req.start,
          end_datetime: req.end,
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
    };
    carregarDados();
  }, []);

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



  console.log('🔍 [ServicoGeralDashboard] Iniciando renderização');
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

      {/* Todos os Requerimentos Futuros */}
      {console.log('🔍 [ServicoGeralDashboard] ANTES de renderizar AllFutureRequests')}
      <div style={{border: '2px solid red', padding: '20px', margin: '20px'}}>
        <h3>TESTE - AllFutureRequests</h3>
        <p>Se você vê isso, o problema não é na renderização</p>
        {console.log('🔍 [ServicoGeralDashboard] DENTRO da div de teste')}
        <AllFutureRequests />
        {console.log('🔍 [ServicoGeralDashboard] DEPOIS de renderizar AllFutureRequests')}
      </div>

      {/* Materiais para Despachar (Próximos 7 dias) */}
      <TodayMaterialsServicoGeral />

      {/* Retorno de Materiais (Próximos 7 dias) */}
      <ReturnMaterialsOnly />

      {/* Calendário */}
      <Calendar 
        events={events}
        onDayClick={handleDayClick}
        showEventModal={showEventModal}
        onCloseEventModal={closeEventModal}
        selectedDayEvents={selectedDayEvents}
        selectedDay={selectedDay}
      />

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