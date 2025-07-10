import React, { useState, useEffect } from 'react';
import { listarEventos } from '../services/eventsService';
import Table from '../components/Table';
import './Events.css';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

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
        <p>Listagem de eventos do sistema</p>
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
    </div>
  );
} 