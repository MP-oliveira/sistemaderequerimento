import React, { useState, useEffect } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { criarRequisicao, listarRequisicoes, aprovarRequisicao, executarRequisicao, finalizarRequisicao } from '../services/requestsService';
import { listarItensInventario } from '../services/inventoryService';
import { listarEventos } from '../services/eventsService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Requests.css';

export default function Requests() {
  const { user } = useAuth();
  const [descricao, setDescricao] = useState('');
  const [department, setDepartment] = useState('');
  const [data, setData] = useState('');
  const [eventoSelecionado, setEventoSelecionado] = useState('');
  const [itens, setItens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState("");
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [requisicoes, setRequisicoes] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [itensDevolucao, setItensDevolucao] = useState([]);
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState(null);
  const [conflitoDetectado, setConflitoDetectado] = useState(false);
  
  // Estado para busca
  const [busca, setBusca] = useState('');
  const [requisicoesFiltradas, setRequisicoesFiltradas] = useState([]);

  // Função para verificar conflitos de agenda
  const verificarConflitos = (novaRequisicao) => {
    if (!novaRequisicao.data || !novaRequisicao.event_id) {
      return false;
    }

    const dataRequisicao = new Date(novaRequisicao.data);
    
    // Verificar conflitos com eventos existentes
    const conflitos = events.filter(evento => {
      if (!evento.start_datetime) return false;
      
      const eventoData = new Date(evento.start_datetime);
      const mesmoDia = dataRequisicao.toDateString() === eventoData.toDateString();
      
      // Verificar se não é o próprio evento selecionado
      const naoEhMesmoEvento = evento.id !== parseInt(novaRequisicao.event_id);
      
      return mesmoDia && naoEhMesmoEvento;
    });

    return conflitos.length > 0;
  };

  useEffect(() => {
    buscarRequisicoes();
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    try {
      const data = await listarEventos();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setEvents([]);
    }
  };

  const buscarRequisicoes = async () => {
    setLoadingList(true);
    setListError('');
    try {
      const data = await listarRequisicoes();
      const requisicoesArray = Array.isArray(data) ? data : [];
      setRequisicoes(requisicoesArray);
      setRequisicoesFiltradas(requisicoesArray);
    } catch (err) {
      console.error('Erro ao buscar requisições:', err);
      setListError(err.message || 'Erro ao buscar requisições');
      setRequisicoes([]);
      setRequisicoesFiltradas([]);
    }
    setLoadingList(false);
  };

  // Função para filtrar requisições
  const filtrarRequisicoes = () => {
    if (!busca.trim()) {
      setRequisicoesFiltradas(requisicoes);
      return;
    }

    const termoBusca = busca.toLowerCase();
    const requisicoesFiltradas = requisicoes.filter(requisicao => {
      // Buscar por departamento
      if (requisicao.department?.toLowerCase().includes(termoBusca)) return true;
      
      // Buscar por descrição
      if (requisicao.description?.toLowerCase().includes(termoBusca)) return true;
      
      // Buscar por status
      if (requisicao.status?.toLowerCase().includes(termoBusca)) return true;
      
      // Buscar por data
      if (requisicao.date?.toLowerCase().includes(termoBusca)) return true;
      
      // Buscar por nome do evento
      if (requisicao.event_name?.toLowerCase().includes(termoBusca)) return true;
      
      return false;
    });

    setRequisicoesFiltradas(requisicoesFiltradas);
  };

  // Aplicar filtros quando mudarem
  useEffect(() => {
    filtrarRequisicoes();
  }, [busca, requisicoes]);

  const handleBuscaChange = (e) => {
    setBusca(e.target.value);
  };

  const limparBusca = () => {
    setBusca('');
  };

  // Buscar itens do inventário ao abrir o modal
  const handleOpenModal = async () => {
    setShowModal(true);
    if (inventoryItems.length === 0) {
      try {
        const data = await listarItensInventario();
        setInventoryItems(data);
      } catch {
        // Pode exibir erro se quiser
      }
    }
  };

  const handleAddItem = () => {
    if (!itemSelecionado || !quantidade || Number(quantidade) < 1) return;
    const item = inventoryItems.find(i => i.id === itemSelecionado || i.id === Number(itemSelecionado));
    if (!item) return;
    setItens([...itens, { ...item, quantidade: Number(quantidade) }]);
    setItemSelecionado('');
    setQuantidade("");
    setShowModal(false);
  };

  const handleRemoveItem = (index) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleOpenFinishModal = (req) => {
    setRequisicaoSelecionada(req);
    const itens = Array.isArray(req.itens) ? req.itens : [];
    setItensDevolucao(itens.map(item => ({ ...item, devolver: true })));
    setShowFinishModal(true);
  };

  const handleToggleDevolver = (index) => {
    setItensDevolucao(prev => prev.map((item, i) => i === index ? { ...item, devolver: !item.devolver } : item));
  };

  const handleFinalizar = async () => {
    try {
      const itensDevolvidos = itensDevolucao.filter(item => item.devolver).map(item => ({ id: item.id, quantidade: item.quantidade }));
      await finalizarRequisicao(requisicaoSelecionada.id, itensDevolvidos);
      setShowFinishModal(false);
      setRequisicaoSelecionada(null);
      buscarRequisicoes();
    } catch (err) {
      alert(err.message || 'Erro ao finalizar requisição');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');
    
    if (!department || !descricao || !data || itens.length === 0) {
      setFormError('Preencha todos os campos e adicione pelo menos um item.');
      return;
    }

    // Verificar conflitos se um evento foi selecionado
    if (eventoSelecionado) {
      const novaRequisicao = {
        data,
        event_id: eventoSelecionado
      };
      
      const temConflito = verificarConflitos(novaRequisicao);
      if (temConflito) {
        toast.error('⚠️ Conflito de agenda detectado! Já existe um evento nesta data.', {
          duration: 5000
        });
        setFormError('Conflito de agenda detectado. Verifique a data selecionada.');
        return;
      }
    }
    
    setLoading(true);
    try {
      await criarRequisicao({ 
        department, 
        descricao, 
        data, 
        event_id: eventoSelecionado || null,
        itens: itens.map(item => ({ id: item.id, quantidade: item.quantidade })) 
      });
      toast.success('✅ Requisição enviada com sucesso!');
      setSuccessMsg('Requisição enviada com sucesso!');
      setDepartment('');
      setDescricao('');
      setData('');
      setEventoSelecionado('');
      setItens([]);
      setConflitoDetectado(false);
      buscarRequisicoes();
    } catch (err) {
      setFormError(err.message || 'Erro ao enviar requisição');
      toast.error('❌ Erro ao enviar requisição. Tente novamente.');
    }
    setLoading(false);
  };

  const handleAprovar = async (id) => {
    try {
      await aprovarRequisicao(id);
      buscarRequisicoes();
    } catch (err) {
      alert(err.message || 'Erro ao aprovar requisição');
    }
  };

  const handleExecutar = async (id) => {
    try {
      await executarRequisicao(id);
      buscarRequisicoes();
    } catch (err) {
      alert(err.message || 'Erro ao executar requisição');
    }
  };

  return (
    <div className="requests-page">
      <div className="card requests-form-card">
        <h1 className="requests-form-title">Nova Requisição</h1>
        <form className="requests-form" onSubmit={handleSubmit}>
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
              ⚠️ <strong>Conflito de Agenda Detectado!</strong> Já existe um evento nesta data.
            </div>
          )}
          
          <Input
            label="Departamento"
            placeholder="Ex: Ministério de Louvor"
            value={department}
            onChange={e => setDepartment(e.target.value)}
            required
          />
          <div className="form-group">
            <label className="input-label">Evento (Opcional)</label>
            <select 
              value={eventoSelecionado} 
              onChange={e => {
                setEventoSelecionado(e.target.value);
                // Verificar conflitos quando evento é selecionado
                if (e.target.value && data) {
                  const novaRequisicao = {
                    data,
                    event_id: e.target.value
                  };
                  const temConflito = verificarConflitos(novaRequisicao);
                  setConflitoDetectado(temConflito);
                  if (temConflito) {
                    toast.error('⚠️ Conflito de agenda detectado! Já existe um evento nesta data.', {
                      duration: 5000
                    });
                  }
                }
              }}
              className="input-field"
            >
              <option value="">Selecione um evento (opcional)</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name} - {event.start_datetime ? new Date(event.start_datetime).toLocaleDateString('pt-BR') : 'Data não definida'}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Descrição"
            placeholder="Motivo ou detalhes da requisição"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            required
          />
          <Input
            label="Data de uso"
            type="date"
            value={data}
            onChange={e => {
              setData(e.target.value);
              // Verificar conflitos quando data é alterada
              if (e.target.value && eventoSelecionado) {
                const novaRequisicao = {
                  data: e.target.value,
                  event_id: eventoSelecionado
                };
                const temConflito = verificarConflitos(novaRequisicao);
                setConflitoDetectado(temConflito);
                if (temConflito) {
                  toast.error('⚠️ Conflito de agenda detectado! Já existe um evento nesta data.', {
                    duration: 5000
                  });
                }
              }
            }}
            required
          />
          <div className="requests-items-header">
            <span>Itens da requisição</span>
            <Button type="button" variant="primary" size="sm" onClick={handleOpenModal}>
              + Adicionar Item
            </Button>
          </div>
          <Table
            columns={[
              { key: 'name', label: 'Item' },
              { key: 'quantidade', label: 'Quantidade' },
              {
                key: 'actions',
                label: 'Ações',
                render: (value) => (
                  <Button variant="danger" size="sm" onClick={() => handleRemoveItem(value)}>
                    Remover
                  </Button>
                ),
              },
            ]}
            data={itens}
            emptyMessage="Nenhum item adicionado."
          />
          {formError && <div className="requests-error">{formError}</div>}
          {successMsg && <div className="requests-success-msg">{successMsg}</div>}
          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="requests-submit-btn" 
            loading={loading} 
            disabled={loading || conflitoDetectado}
            style={conflitoDetectado ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            {conflitoDetectado ? 'Conflito Detectado' : 'Enviar Requisição'}
          </Button>
        </form>
      </div>

      <Modal
        open={showModal}
        title="Adicionar Item"
        onClose={() => setShowModal(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddItem}>
              Adicionar
            </Button>
          </>
        }
      >
        <div className="input-group">
          <label className="input-label">Item</label>
          <select
            className="input-field"
            value={itemSelecionado}
            onChange={e => setItemSelecionado(e.target.value)}
          >
            <option value="">Selecione um item</option>
            {Array.isArray(inventoryItems) ? inventoryItems.map(item => (
              <option key={item?.id} value={item?.id}>{item?.name || 'Item'}</option>
            )) : null}
          </select>
        </div>
        <Input
          label="Quantidade"
          type="number"
          min={1}
          placeholder="1"
          value={quantidade}
          onChange={e => setQuantidade(e.target.value)}
          required
        />
      </Modal>

      <Modal
        open={showFinishModal}
        title="Devolução de Itens do Evento"
        onClose={() => setShowFinishModal(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowFinishModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleFinalizar}>
              Confirmar Devolução
            </Button>
          </>
        }
      >
        <div>
          <p>Marque os itens que estão retornando do evento:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Array.isArray(itensDevolucao) ? itensDevolucao.map((item, i) => (
              <li key={item?.id || i} style={{ marginBottom: 8 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={item?.devolver || false}
                    onChange={() => handleToggleDevolver(i)}
                  />{' '}
                  {item?.name || item?.nome || 'Item'} ({item?.quantidade || 0})
                </label>
              </li>
            )) : null}
          </ul>
        </div>
      </Modal>

      {/* Campo de Busca */}
      <div className="search-container">
        <div className="search-wrapper">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Buscar requisições por departamento, descrição, status..."
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
          <span>Mostrando {requisicoesFiltradas.length} de {requisicoes.length} requisições</span>
        </div>
      </div>

      <div className="card requests-list-card">
        <h2 className="requests-list-title">Meus Requerimentos</h2>
        {loadingList ? (
          <div className="requests-loading">Carregando...</div>
        ) : listError ? (
          <div className="requests-error">{listError}</div>
        ) : (
          <Table
            columns={[
              { key: 'description', label: 'Descrição' },
              { key: 'date', label: 'Data' },
              { key: 'status', label: 'Status' },
              { 
                key: 'event_name', 
                label: 'Evento',
                render: (value) => {
                  return value || '-';
                }
              },
              {
                key: 'itens',
                label: 'Itens',
                render: (value) => {
                  const itens = Array.isArray(value) ? value : [];
                  return (
                    <ul className="requests-items-list">
                      {itens.map((item, i) => (
                        <li key={i}>
                          {item?.name || item?.nome || 'Item'} ({item?.quantidade || 0})
                        </li>
                      ))}
                    </ul>
                  );
                },
              },
              // Botão Aprovar para ADM/PASTOR e status PENDENTE
              ...(user && (user.role === 'ADM' || user.role === 'PASTOR') ? [{
                key: 'actions',
                label: 'Ações',
                render: (value, row) => {
                  if (row && row.status === 'PENDENTE') {
                    return (
                      <Button variant="success" size="sm" onClick={() => handleAprovar(row.id)}>
                        Aprovar
                      </Button>
                    );
                  }
                  return null;
                }
              }] : []),
              // Botão Executar para AUDIOVISUAL/SEC e status APTO
              ...(user && (user.role === 'AUDIOVISUAL' || user.role === 'SEC') ? [{
                key: 'actions2',
                label: 'Ações',
                render: (value, row) => {
                  if (row && row.status === 'APTO') {
                    return (
                      <Button variant="primary" size="sm" onClick={() => handleExecutar(row.id)}>
                        Executar
                      </Button>
                    );
                  }
                  return null;
                }
              }] : []),
              // Botão Finalizar para quem executou e status EXECUTADO
              ...(user && requisicoes.some(r => r.executed_by === user.id) ? [{
                key: 'actions3',
                label: 'Ações',
                render: (value, row) => {
                  if (row && row.status === 'EXECUTADO' && row.executed_by === user.id) {
                    return (
                      <Button variant="warning" size="sm" onClick={() => handleOpenFinishModal(row)}>
                        Finalizar/Devolver Itens
                      </Button>
                    );
                  }
                  return null;
                }
              }] : [])
            ]}
            data={requisicoesFiltradas}
            emptyMessage="Nenhuma requisição encontrada."
          />
        )}
      </div>
    </div>
  );
} 