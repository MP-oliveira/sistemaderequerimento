import React, { useState, useEffect } from 'react';
import { listarEventos, criarEvento } from '../services/eventsService';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Events.css';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    start_datetime: '',
    end_datetime: '',
    description: '',
    expected_audience: ''
  });
  const [conflitoDetectado, setConflitoDetectado] = useState(false);
  
  // Estado para busca
  const [busca, setBusca] = useState('');
  const [eventosFiltrados, setEventosFiltrados] = useState([]);

  // Função para verificar conflitos de agenda
  const verificarConflitos = (novoEvento) => {
    if (!novoEvento.start_datetime || !novoEvento.end_datetime || !novoEvento.location) {
      return false;
    }

    const novoInicio = new Date(novoEvento.start_datetime);
    const novoFim = new Date(novoEvento.end_datetime);

    const conflitos = events.filter(evento => {
      // Verificar se o local é o mesmo (case insensitive)
      if (evento.location.toLowerCase() !== novoEvento.location.toLowerCase()) {
        return false;
      }
      
      const eventoInicio = new Date(evento.start_datetime);
      const eventoFim = new Date(evento.end_datetime);
      
      // Verificar se há sobreposição de horários
      const conflito1 = novoInicio < eventoFim && novoFim > eventoInicio; // Sobreposição geral
      const conflito2 = novoInicio >= eventoInicio && novoInicio < eventoFim; // Início dentro
      const conflito3 = novoFim > eventoInicio && novoFim <= eventoFim; // Fim dentro
      const conflito4 = novoInicio <= eventoInicio && novoFim >= eventoFim; // Contém completamente
      
      return conflito1 || conflito2 || conflito3 || conflito4;
    });

    return conflitos.length > 0;
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const data = await listarEventos();
      const eventosArray = Array.isArray(data) ? data : [];
      setEvents(eventosArray);
      setEventosFiltrados(eventosArray);
    } catch (error) {
      console.error('❌ Events - Erro ao carregar eventos:', error);
      setEvents([]);
      setEventosFiltrados([]);
    }
    setLoading(false);
  };

  // Função para filtrar eventos
  const filtrarEventos = () => {
    if (!busca.trim()) {
      setEventosFiltrados(events);
      return;
    }

    const termoBusca = busca.toLowerCase();
    const eventosFiltrados = events.filter(evento => {
      // Buscar por nome
      if (evento.name?.toLowerCase().includes(termoBusca)) return true;
      if (evento.titulo?.toLowerCase().includes(termoBusca)) return true;
      
      // Buscar por local
      if (evento.location?.toLowerCase().includes(termoBusca)) return true;
      
      // Buscar por status
      if (evento.status?.toLowerCase().includes(termoBusca)) return true;
      
      // Buscar por descrição
      if (evento.description?.toLowerCase().includes(termoBusca)) return true;
      
      return false;
    });

    setEventosFiltrados(eventosFiltrados);
  };

  // Aplicar filtros quando mudarem
  useEffect(() => {
    filtrarEventos();
  }, [busca, events]);

  const handleBuscaChange = (e) => {
    setBusca(e.target.value);
  };

  const limparBusca = () => {
    setBusca('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar conflitos antes de enviar
    if (conflitoDetectado) {
      toast.error('❌ Não é possível criar o evento devido a conflito de agenda. Verifique o local e horário.');
      return;
    }
    
    try {
      console.log('🔍 Events - Criando evento:', formData);
      await criarEvento(formData);
      toast.success('✅ Evento criado com sucesso!');
      setShowModal(false);
      setFormData({
        name: '',
        location: '',
        start_datetime: '',
        end_datetime: '',
        description: '',
        expected_audience: ''
      });
      setConflitoDetectado(false);
      carregarEventos(); // Recarregar lista
    } catch (error) {
      console.error('❌ Events - Erro ao criar evento:', error);
      toast.error('❌ Erro ao criar evento. Tente novamente.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    
    // Verificar conflitos quando os campos de data/hora/local mudarem
    if (['start_datetime', 'end_datetime', 'location'].includes(name)) {
      const temConflito = verificarConflitos(newFormData);
      setConflitoDetectado(temConflito);
      
      if (temConflito) {
        toast.error('⚠️ Conflito de agenda detectado! Já existe um evento neste local/horário.', {
          duration: 5000
        });
      }
    }
  };

  const openModal = () => {
    setFormData({
      name: '',
      location: '',
      start_datetime: '',
      end_datetime: '',
      description: '',
      expected_audience: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'location', label: 'Local' },
    { 
      key: 'start_datetime', 
      label: 'Início',
      render: (value) => formatDate(value)
    },
    { 
      key: 'end_datetime', 
      label: 'Fim',
      render: (value) => formatDate(value)
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => value || '-'
    }
  ];

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Gestão de Eventos</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {user && (user.role === 'ADM' || user.role === 'PASTOR' || user.role === 'LIDER') && (
            <Button onClick={openModal} variant="primary">
              Novo Evento
            </Button>
          )}
        </div>
      </div>

      {/* Campo de Busca */}
      <div className="search-container">
        <div className="search-wrapper">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Buscar eventos por nome, local, status..."
            value={busca}
            onChange={handleBuscaChange}
            className="search-input"
          />
          {busca && (
            <button onClick={limparBusca} className="clear-search">
              ✕
            </button>
          )}
        </div>
        <div className="search-info">
          <span>Mostrando {eventosFiltrados.length} de {events.length} eventos</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando eventos...</p>
        </div>
      ) : (
        <Table 
          data={eventosFiltrados} 
          columns={columns}
          emptyMessage="Nenhum evento encontrado."
        />
      )}

      <Modal 
        open={showModal} 
        onClose={closeModal}
        title="Novo Evento"
      >
        <form onSubmit={handleSubmit} className="event-form">
          {/* Alerta de conflito */}
          {conflitoDetectado && (
            <div style={{
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '16px',
              color: '#721c24'
            }}>
              ⚠️ <strong>Conflito de Agenda Detectado!</strong> Já existe um evento neste local/horário.
            </div>
          )}
          
          <div className="form-row">
            <Input
              label="Nome do Evento"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Local"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <Input
              label="Data/Hora de Início"
              name="start_datetime"
              type="datetime-local"
              value={formData.start_datetime}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Data/Hora de Fim"
              name="end_datetime"
              type="datetime-local"
              value={formData.end_datetime}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <Input
              label="Público Esperado"
              name="expected_audience"
              type="number"
              value={formData.expected_audience}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <label className="input-label">
              Descrição
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="input-field"
                placeholder="Descreva o evento..."
              />
            </label>
          </div>

          <div className="form-actions">
            <Button type="button" onClick={closeModal} variant="secondary">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={conflitoDetectado}
              style={conflitoDetectado ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            >
              {conflitoDetectado ? 'Conflito Detectado' : 'Criar Evento'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 