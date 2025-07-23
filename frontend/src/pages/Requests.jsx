 import React, { useState, useEffect, useCallback } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Comprovantes from '../components/Comprovantes';
import { criarRequisicao, listarRequisicoes, aprovarRequisicao, executarRequisicao, finalizarRequisicao, rejeitarRequisicao } from '../services/requestsService';
import { listarItensInventario } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Requests.css';

export default function Requests() {
  const { user } = useAuth();
  const [department, setDepartment] = useState('');
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
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [itensDevolucao, setItensDevolucao] = useState([]);
  const [requisicaoSelecionada, setRequisicaoSelecionada] = useState(null);
  const [conflitoDetectado, setConflitoDetectado] = useState(false);
  
  // Estado para busca
  const [busca, setBusca] = useState('');
  const [requisicoesFiltradas, setRequisicoesFiltradas] = useState([]);
  
  // Estado para comprovantes
  const [showComprovantesModal, setShowComprovantesModal] = useState(false);
  const [requisicaoComprovantes, setRequisicaoComprovantes] = useState(null);

  // Campos de evento dentro da requisição
  const [evento, setEvento] = useState({
    name: '',
    location: '',
    start_datetime: '',
    end_datetime: '',
    expected_audience: '',
    description: ''
  });

  // Estados para filtros
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');


  useEffect(() => {
    buscarRequisicoes();
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    try {
      const data = await listarItensInventario();
      setInventoryItems(data);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setInventoryItems([]); // Changed from setEvents to setInventoryItems
    }
  };

  const buscarRequisicoes = async () => {
    setLoadingList(true);
    setListError('');
    try {
      const data = await listarRequisicoes();
      const requisicoesArray = Array.isArray(data) ? data : [];
      console.log('🔍 Requisições carregadas:', requisicoesArray);
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
  const filtrarRequisicoes = useCallback(() => {
    let filtradas = requisicoes;
    if (filtroStatus) {
      filtradas = filtradas.filter(r => r.status === filtroStatus);
    }
    if (filtroPrioridade) {
      filtradas = filtradas.filter(r => (r.prioridade || '').toLowerCase() === filtroPrioridade.toLowerCase());
    }
    if (filtroDepartamento) {
      filtradas = filtradas.filter(r => (r.department || '').toLowerCase().includes(filtroDepartamento.toLowerCase()));
    }
    if (busca.trim()) {
      const termoBusca = busca.toLowerCase();
      filtradas = filtradas.filter(requisicao => {
        if (requisicao.department?.toLowerCase().includes(termoBusca)) return true;
        if (requisicao.description?.toLowerCase().includes(termoBusca)) return true;
        if (requisicao.status?.toLowerCase().includes(termoBusca)) return true;
        if (requisicao.date?.toLowerCase().includes(termoBusca)) return true;
        if (requisicao.event_name?.toLowerCase().includes(termoBusca)) return true;
        return false;
      });
    }
    setRequisicoesFiltradas(filtradas);
  }, [busca, requisicoes, filtroStatus, filtroPrioridade, filtroDepartamento]);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    filtrarRequisicoes();
  }, [busca, requisicoes, filtrarRequisicoes]);

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
    
    if (!department || itens.length === 0) {
      setFormError('Preencha todos os campos e adicione pelo menos um item.');
      return;
    }


    
    setLoading(true);
    try {
      const response = await criarRequisicao({ 
        department, 
        data: new Date().toISOString().slice(0, 10), // Usar a data atual
        itens: itens.map(item => ({ id: item.id, quantidade: item.quantidade })),
        evento: evento.name || evento.location || evento.start_datetime ? evento : null
      });
      if (response && response.conflito) {
        setConflitoDetectado(true);
        toast('⚠️ Sua requisição foi criada, mas está em conflito de agenda e aguarda decisão do pastor/ADM.', {
          icon: '⚠️',
          style: { background: '#fff3cd', color: '#856404', fontWeight: 600 }
        });
      } else {
        setConflitoDetectado(false);
        toast.success('✅ Requisição enviada com sucesso!');
      }
      setSuccessMsg('Requisição enviada com sucesso!');
      setDepartment('');
      setItens([]);
      setEvento({ name: '', location: '', start_datetime: '', end_datetime: '', expected_audience: '', description: '' });
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
      toast.success('✅ Requisição aprovada com sucesso!');
      buscarRequisicoes();
    } catch (err) {
      toast.error('❌ Erro ao aprovar requisição: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleExecutar = async (id) => {
    try {
      await executarRequisicao(id);
      toast.success('✅ Requisição executada com sucesso!');
      buscarRequisicoes();
    } catch (err) {
      toast.error('❌ Erro ao executar requisição: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleRejeitar = async (id) => {
    const motivo = prompt('Digite o motivo da rejeição:');
    if (!motivo) {
      alert('É necessário informar um motivo para a rejeição.');
      return;
    }
    
    try {
      await rejeitarRequisicao(id, motivo);
      toast.success('✅ Requisição rejeitada com sucesso!');
      buscarRequisicoes();
    } catch (err) {
      toast.error('❌ Erro ao rejeitar requisição: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleVerComprovantes = (requisicao) => {
    setRequisicaoComprovantes(requisicao);
    setShowComprovantesModal(true);
  };

  const handleFecharComprovantes = () => {
    setShowComprovantesModal(false);
    setRequisicaoComprovantes(null);
  };

  return (
    <div className="requests-page">
      <div className="card requests-form-card">
        <h1 className="requests-form-title">Novo Requerimento</h1>
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
            className="input-full-requests"
          />
          {/* Campos de Evento dentro da requisição */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>Dados do Evento (opcional)</div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
              <Input
                label="Nome do Evento"
                name="name"
                value={evento.name}
                onChange={e => setEvento(ev => ({ ...ev, name: e.target.value }))}
                className="input-full"
              />
              <label className="input-label" style={{ width: '100%' }}>
                Local
                <select
                  name="location"
                  className="input-field input-full"
                  value={evento.location}
                  onChange={e => setEvento(ev => ({ ...ev, location: e.target.value }))}
                  required
                >
                  <option value="">Selecione o local</option>
                  <option value="Sala 22">Sala 22</option>
                  <option value="Sala 23">Sala 23</option>
                  <option value="Sala 24">Sala 24</option>
                  <option value="Sala 26">Sala 26</option>
                  <option value="Sala 27">Sala 27</option>
                  <option value="Templo">Templo</option>
                  <option value="Anexo 2">Anexo 2</option>
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
              <Input
                label="Data/Hora de Início"
                name="start_datetime"
                type="datetime-local"
                value={evento.start_datetime}
                onChange={e => {
                  const value = e.target.value;
                  setEvento(ev => {
                    // Se end_datetime estiver vazio ou for de outro dia, preenche igual ao início
                    let novoFim = ev.end_datetime;
                    if (!ev.end_datetime || (value && ev.end_datetime.slice(0, 10) !== value.slice(0, 10))) {
                      novoFim = value;
                    }
                    return { ...ev, start_datetime: value, end_datetime: novoFim };
                  });
                }}
                className="input-full"
              />
              <Input
                label="Data/Hora de Fim"
                name="end_datetime"
                type="datetime-local"
                value={evento.end_datetime}
                onChange={e => setEvento(ev => ({ ...ev, end_datetime: e.target.value }))}
                className="input-full"
              />
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
              <Input
                label="Público Esperado"
                name="expected_audience"
                type="number"
                value={evento.expected_audience}
                onChange={e => setEvento(ev => ({ ...ev, expected_audience: e.target.value }))}
                className="input-full"
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label className="input-label">
                Descrição
                <textarea
                  name="description"
                  value={evento.description}
                  onChange={e => setEvento(ev => ({ ...ev, description: e.target.value }))}
                  rows="3"
                  className="input-field input-full"
                  placeholder="Descreva o evento..."
                  style={{ marginTop: 4 }}
                />
              </label>
            </div>
          </div>
          <div className="requests-items-header">
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
            {conflitoDetectado ? 'Conflito Detectado' : 'Enviar Requerimento'}
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
          className="input-full"
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

      <div className="filters-container" style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="filter-select">
          <option value="">Status (todos)</option>
          <option value="PENDENTE">Pendente</option>
          <option value="PENDENTE_CONFLITO">Em Conflito</option>
          <option value="APTO">Apto</option>
          <option value="EXECUTADO">Executado</option>
          <option value="FINALIZADO">Finalizado</option>
          <option value="REJEITADO">Rejeitado</option>
        </select>
        <select value={filtroPrioridade} onChange={e => setFiltroPrioridade(e.target.value)} className="filter-select">
          <option value="">Prioridade (todas)</option>
          <option value="Alta">Alta</option>
          <option value="Média">Média</option>
          <option value="Baixa">Baixa</option>
        </select>
        <input
          type="text"
          value={filtroDepartamento}
          onChange={e => setFiltroDepartamento(e.target.value)}
          placeholder="Departamento (filtro)"
          className="filter-input"
          style={{ minWidth: 180 }}
        />
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
              { key: 'status', label: 'Status', render: (value, row) => (
                <span style={{
                  color: row.status === 'PENDENTE_CONFLITO' ? '#b85c00' : row.status === 'APTO' ? '#2d8cff' : row.status === 'REJEITADO' ? '#d32f2f' : '#333',
                  fontWeight: row.status === 'PENDENTE_CONFLITO' ? 700 : 500,
                  background: row.status === 'PENDENTE_CONFLITO' ? '#fff3cd' : 'none',
                  borderRadius: row.status === 'PENDENTE_CONFLITO' ? 8 : 0,
                  padding: row.status === 'PENDENTE_CONFLITO' ? '2px 10px' : 0,
                  display: 'inline-block',
                }}>
                  {row.status === 'PENDENTE_CONFLITO' ? '⚠️ Em conflito' : value}
                </span>
              ) },
              { key: 'prioridade', label: 'Prioridade', render: value => value || '-' },
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
              {
                key: 'comprovantes',
                label: 'Comprovantes',
                render: (value, row) => {
                  console.log('🔍 Renderizando botão comprovantes para:', row);
                  return (
                    <Button 
                      variant="info" 
                      size="sm" 
                      onClick={() => handleVerComprovantes(row)}
                    >
                    Comprovantes
                    </Button>
                  );
                }
              },
              // Coluna única de ações com todos os botões
              {
                key: 'actions',
                label: 'Ações',
                render: (value, row) => {
                  const actions = [];
                  
                  // Botão Aprovar para ADM/PASTOR e status PENDENTE ou PENDENTE_CONFLITO
                  if (user && (user.role === 'ADM' || user.role === 'PASTOR') && (row.status === 'PENDENTE' || row.status === 'PENDENTE_CONFLITO')) {
                    actions.push(
                      <Button 
                        key="aprovar" 
                        variant="success" 
                        size="sm" 
                        onClick={() => handleAprovar(row.id)}
                        style={{ marginRight: '4px' }}
                      >
                        ✅ Aprovar
                      </Button>
                    );
                  }
                  
                  // Botão Executar para AUDIOVISUAL/SEC e status APTO
                  if (user && (user.role === 'AUDIOVISUAL' || user.role === 'SEC') && row.status === 'APTO') {
                    actions.push(
                      <Button 
                        key="executar" 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleExecutar(row.id)}
                        style={{ marginRight: '4px' }}
                      >
                        ▶️ Executar
                      </Button>
                    );
                  }
                  
                  // Botão Finalizar para quem executou e status EXECUTADO
                  if (user && row.status === 'EXECUTADO' && row.executed_by === user.id) {
                    actions.push(
                      <Button 
                        key="finalizar" 
                        variant="warning" 
                        size="sm" 
                        onClick={() => handleOpenFinishModal(row)}
                        style={{ marginRight: '4px' }}
                      >
                        🔄 Finalizar
                      </Button>
                    );
                  }
                  
                  // Botão Rejeitar para ADM/PASTOR e status PENDENTE ou PENDENTE_CONFLITO
                  if (user && (user.role === 'ADM' || user.role === 'PASTOR') && (row.status === 'PENDENTE' || row.status === 'PENDENTE_CONFLITO')) {
                    actions.push(
                      <Button 
                        key="rejeitar" 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleRejeitar(row.id)}
                      >
                        ❌ Rejeitar
                      </Button>
                    );
                  }
                  
                  return actions.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {actions}
                    </div>
                  ) : (
                    <span style={{ color: '#999', fontSize: '0.9rem' }}>Nenhuma ação disponível</span>
                  );
                }
              }
            ]}
            data={requisicoesFiltradas}
            emptyMessage="Nenhuma requisição encontrada."
          />
        )}
      </div>

      <Modal
        open={showComprovantesModal}
        title="Comprovantes da Requisição"
        onClose={handleFecharComprovantes}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={handleFecharComprovantes}>
              Fechar
            </Button>
          </>
        }
      >
        {requisicaoComprovantes && (
          <Comprovantes 
            requisicao={requisicaoComprovantes} 
            onClose={handleFecharComprovantes}
          />
        )}
      </Modal>
    </div>
  );
} 