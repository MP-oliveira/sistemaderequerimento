import React, { useState, useEffect } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { criarRequisicao, listarRequisicoes, aprovarRequisicao, executarRequisicao, finalizarRequisicao } from '../services/requestsService';
import { listarItensInventario } from '../services/inventoryService';
import { listarEventos } from '../services/eventsService';
import { useAuth } from '../context/AuthContext';
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
      setRequisicoes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar requisições:', err);
      setListError(err.message || 'Erro ao buscar requisições');
      setRequisicoes([]);
    }
    setLoadingList(false);
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
    setLoading(true);
    try {
      await criarRequisicao({ 
        department, 
        descricao, 
        data, 
        event_id: eventoSelecionado || null,
        itens: itens.map(item => ({ id: item.id, quantidade: item.quantidade })) 
      });
      setSuccessMsg('Requisição enviada com sucesso!');
      setDepartment('');
      setDescricao('');
      setData('');
      setEventoSelecionado('');
      setItens([]);
      buscarRequisicoes();
    } catch (err) {
      setFormError(err.message || 'Erro ao enviar requisição');
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
              onChange={e => setEventoSelecionado(e.target.value)}
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
            onChange={e => setData(e.target.value)}
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
          <Button type="submit" variant="primary" size="lg" className="requests-submit-btn" loading={loading} disabled={loading}>
            Enviar Requisição
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
              ...(user ? [{
                key: 'actions3',
                label: 'Ações',
                render: (value, row) => {
                  if (row && row.status === 'EXECUTADO') {
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
            data={requisicoes}
            emptyMessage="Nenhuma requisição encontrada."
          />
        )}
      </div>
    </div>
  );
} 