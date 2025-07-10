import React, { useState, useEffect } from 'react';
import { listarEventos, criarEvento } from '../services/eventsService';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import './Events.css';

export default function Events() {
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

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const data = await listarEventos();
      console.log('🔍 Events - Dados recebidos:', data);
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Events - Erro ao carregar eventos:', error);
      setEvents([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('🔍 Events - Criando evento:', formData);
      await criarEvento(formData);
      setShowModal(false);
      setFormData({
        name: '',
        location: '',
        start_datetime: '',
        end_datetime: '',
        description: '',
        expected_audience: ''
      });
      carregarEventos(); // Recarregar lista
    } catch (error) {
      console.error('❌ Events - Erro ao criar evento:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        <Button onClick={openModal} variant="primary">
          Novo Evento
        </Button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando eventos...</p>
        </div>
      ) : (
        <Table 
          data={events} 
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
            <Button type="submit" variant="primary">
              Criar Evento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 