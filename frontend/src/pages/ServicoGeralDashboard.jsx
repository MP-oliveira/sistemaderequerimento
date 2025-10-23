import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { listarRequisicoes, listarEventos, buscarRequisicoesCalendario, getRequisicaoDetalhada } from '../services/requestsService';
import Modal from '../components/Modal';
import TodayMaterialsServicoGeral from '../components/TodayMaterialsServicoGeral';
import TodosRequerimentos from '../components/TodosRequerimentos';
import ReturnMaterialsOnly from '../components/ReturnMaterialsOnly';
import Calendar from '../components/Calendar';
import { formatTimeUTC } from '../utils/dateUtils';
import { FiFileText, FiPackage, FiClock, FiZap, FiPlus, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import './ServicoGeralDashboard.css';

export default function ServicoGeralDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [requisicoes, setRequisicoes] = useState([]);
  const [notificacao, setNotificacao] = useState(null);
  const [modalDetalhe, setModalDetalhe] = useState(false);
  const [reqDetalhe, setReqDetalhe] = useState(null);

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
        
        // Buscar todas as Requerimentos para o calendário (histórico completo)
        const requisicoesCalendario = await buscarRequisicoesCalendario();
        
        const eventosReqs = (requisicoesCalendario || []).map(req => ({
          id: req.id,
          title: req.title || req.event_name || req.description || 'Requisição',
          location: req.location,
          start_datetime: req.start,
          end_datetime: req.end,
          status: req.status,
          type: 'requisicao',
        }));
        
        console.log('🔍 Requisições do calendário:', requisicoesCalendario);
        console.log('🔍 Eventos de requisição criados:', eventosReqs);
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
    console.log('🔍 handleDayClick chamado:', day);
    if (day.events.length > 0) {
      console.log('🔍 Eventos encontrados:', day.events);
      // Se for uma requisição, abrir modal de detalhes
      const requisicao = day.events.find(event => event.type === 'requisicao');
      console.log('🔍 Requisição encontrada:', requisicao);
      if (requisicao) {
        console.log('🔍 Abrindo modal de detalhes para:', requisicao.id);
        abrirDetalhe(requisicao.id);
      } else {
        console.log('🔍 Usando modal simples');
        // Se for evento normal, usar modal simples
        setSelectedDay(day.date);
        setSelectedDayEvents(day.events);
        setShowEventModal(true);
      }
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

  async function abrirDetalhe(id) {
    try {
      const detalhe = await getRequisicaoDetalhada(id);
      console.log('🔍 Dados recebidos do backend:', detalhe);
      setReqDetalhe(detalhe);
      setModalDetalhe(true);
    } catch {
      mostrarNotificacao('Erro ao buscar detalhes', 'erro');
    }
  }



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

      {/* Cards de Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">
              <FiFileText size={18} />
            </div>
          </div>
          <div className="stat-info">
            <div className="stat-number">{requisicoes.length}</div>
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
            <div className="stat-number">{requisicoes.filter(req => req.status === 'EXECUTADO').length}</div>
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
            <div className="stat-number">{requisicoes.filter(req => req.status === 'FINALIZADO').length}</div>
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
          <Link to="/servico-geral/requisicoes" className="action-btn">
            <FiPlus />
            Ver Requisições
          </Link>
          <Link to="/inventario" className="action-btn">
            <FiPackage />
            Gerenciar Inventário
          </Link>
        </div>
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

      {/* Todos os Requerimentos Futuros */}
      <TodosRequerimentos />

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

      {/* Modal de Detalhes da Requisição */}
      {modalDetalhe && reqDetalhe && (
        <Modal
          isOpen={modalDetalhe}
          onClose={() => setModalDetalhe(false)}
          title="Detalhes da Requisição"
        >
          <div className="requisicao-detalhes">
            <div className="detalhe-item">
              <strong>Solicitante:</strong> {reqDetalhe.requester_name}
            </div>
            <div className="detalhe-item">
              <strong>Data:</strong> {new Date(reqDetalhe.start_datetime).toLocaleDateString('pt-BR')}
            </div>
            <div className="detalhe-item">
              <strong>Horário:</strong> {new Date(reqDetalhe.start_datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(reqDetalhe.end_datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="detalhe-item">
              <strong>Local:</strong> {reqDetalhe.location}
            </div>
            <div className="detalhe-item">
              <strong>Descrição:</strong> {reqDetalhe.description}
            </div>
            <div className="detalhe-item">
              <strong>Status:</strong> {reqDetalhe.status}
            </div>
            {reqDetalhe.items && reqDetalhe.items.length > 0 && (
              <div className="detalhe-item">
                <strong>Itens:</strong>
                <ul>
                  {reqDetalhe.items.map((item, index) => (
                    <li key={index}>{item.name} - {item.quantity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
} 