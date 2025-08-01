import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit, FiTrash2, FiEye, FiArrowLeft, FiPlus, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { 
  criarRequisicao, 
  listarRequisicoes, 
  deletarRequisicao, 
  atualizarRequisicao, 
  getRequisicaoDetalhada,
  verificarConflitos,
  verificarConflitosTempoReal,
  verificarDisponibilidadeMateriais
} from '../services/requestsService.js';
import { listarItensInventario } from '../services/inventoryService';
import { salasOptions } from '../utils/salasConfig';
import { departamentosOptions } from '../utils/departamentosConfig.js';
import { PRIORIDADE_OPTIONS, PRIORIDADE_DEFAULT } from '../utils/prioridadeConfig';
import './Requests.css';

// Função debounce para evitar muitas requisições
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function Requests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [requisicoes, setRequisicoes] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalDetalhe, setModalDetalhe] = useState(false);
  const [reqDetalhe, setReqDetalhe] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    event_name: '',
    date: '',
    location: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    expected_audience: '',
    prioridade: PRIORIDADE_DEFAULT
  });
  
  // Estados para itens do inventário
  const [inventory, setInventory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  
  // Estados para notificações
  const [notificacao, setNotificacao] = useState({ mensagem: '', tipo: '', mostrar: false });
  const [notificacaoModal, setNotificacaoModal] = useState({ mensagem: '', tipo: '', mostrar: false });

  // Estados para edição e deleção
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editReq, setEditReq] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReq, setDeleteReq] = useState(null);

  // Estados para validação em tempo real
  const [conflitoInfo, setConflitoInfo] = useState({
    temConflito: false,
    mensagem: '',
    conflitos: [],
    horariosDisponiveis: []
  });
  const [validandoConflito, setValidandoConflito] = useState(false);
  const [sugestaoAplicada, setSugestaoAplicada] = useState(false);

  // Estados para validação de disponibilidade de materiais
  const [disponibilidadeInfo, setDisponibilidadeInfo] = useState({
    temConflito: false,
    temBaixoEstoque: false,
    mensagem: '',
    materiaisIndisponiveis: [],
    materiaisBaixoEstoque: []
  });
  const [validandoDisponibilidade, setValidandoDisponibilidade] = useState(false);

  useEffect(() => {
    buscarRequisicoes();
  }, []);

  // Carregar inventário quando abrir o modal
  useEffect(() => {
    if (showAddModal) {
      carregarInventario();
    } else {
      // Limpar informações de conflito quando fechar o modal
      setConflitoInfo({
        temConflito: false,
        mensagem: '',
        conflitos: [],
        horariosDisponiveis: []
      });
      setSugestaoAplicada(false);
      
      // Limpar informações de disponibilidade quando fechar o modal
      setDisponibilidadeInfo({
        temConflito: false,
        temBaixoEstoque: false,
        mensagem: '',
        materiaisIndisponiveis: [],
        materiaisBaixoEstoque: []
      });
    }
  }, [showAddModal]);

  // Auto-hide das notificações
  useEffect(() => {
    if (notificacao.mostrar) {
      const timer = setTimeout(() => setNotificacao({ mensagem: '', tipo: '', mostrar: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [notificacao.mostrar]);

  useEffect(() => {
    if (notificacaoModal.mostrar) {
      const timer = setTimeout(() => setNotificacaoModal({ mensagem: '', tipo: '', mostrar: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [notificacaoModal.mostrar]);

  function mostrarNotificacao(mensagem, tipo) {
    setNotificacao({ mensagem, tipo, mostrar: true });
  }

  async function carregarInventario() {
    try {
      const data = await listarItensInventario();
      setInventory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar inventário:', error);
      mostrarNotificacao('Erro ao carregar inventário', 'erro');
    }
  }

  const adicionarItem = (item) => {
    const itemExistente = selectedItems.find(i => i.id === item.id);
    if (itemExistente) {
      alterarQuantidade(item.id, itemExistente.quantity + 1);
    } else {
      const novoItem = {
        id: item.id,
        name: item.name,
        quantity: 1,
        inventory_id: item.id,
        item_name: item.name,
        quantity_requested: 1
      };
      const novosItens = [...selectedItems, novoItem];
      setSelectedItems(novosItens);
      
      // Verificar disponibilidade em tempo real
      debouncedVerificarDisponibilidade(novosItens);
    }
  };

  const removerItem = (itemId) => {
    const novosItens = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(novosItens);
    
    // Verificar disponibilidade em tempo real
    debouncedVerificarDisponibilidade(novosItens);
  };

  const alterarQuantidade = (itemId, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removerItem(itemId);
      return;
    }
    
    const novosItens = selectedItems.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            quantity: novaQuantidade,
            quantity_requested: novaQuantidade
          }
        : item
    );
    setSelectedItems(novosItens);
    
    // Verificar disponibilidade em tempo real
    debouncedVerificarDisponibilidade(novosItens);
  };

  async function buscarRequisicoes() {
    setLoading(true);
    try {
      const data = await listarRequisicoes();
      setRequisicoes(Array.isArray(data) ? data : []);
    } catch {
      mostrarNotificacao('Erro ao buscar requisições', 'erro');
    }
    setLoading(false);
  }

  function filtrar(requisicoes) {
    return requisicoes.filter(r => {
      if (filtroStatus && r.status !== filtroStatus) return false;
      if (filtroDepartamento && !(r.department || '').toLowerCase().includes(filtroDepartamento.toLowerCase())) return false;
      if (filtroData && r.date !== filtroData) return false;
      return true;
    });
  }

  async function abrirDetalhe(id) {
    try {
      const detalhe = await getRequisicaoDetalhada(id);
      setReqDetalhe(detalhe);
      setModalDetalhe(true);
    } catch {
      mostrarNotificacao('Erro ao buscar detalhes', 'erro');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Combinar data com horas para criar datetime completo
      const dataToSend = { ...formData };
      
      if (formData.date && formData.start_datetime) {
        dataToSend.start_datetime = `${formData.date}T${formData.start_datetime}`;
      }
      
      if (formData.date && formData.end_datetime) {
        dataToSend.end_datetime = `${formData.date}T${formData.end_datetime}`;
      }
      
      // Verificar conflitos antes de criar a requisição
      if (formData.location && dataToSend.start_datetime && dataToSend.end_datetime) {
        try {
          const conflitoResult = await verificarConflitos({
            location: formData.location,
            start_datetime: dataToSend.start_datetime,
            end_datetime: dataToSend.end_datetime
          });
          
          if (conflitoResult.temConflitoDireto) {
            mostrarNotificacao(conflitoResult.message, 'erro');
            setLoading(false);
            return;
          }
          
          if (conflitoResult.temConflitoIntervalo) {
            const confirmar = window.confirm(
              `${conflitoResult.message}\n\nConflitos encontrados:\n${conflitoResult.conflitos.map(c => 
                `- ${c.tipo}: ${c.nome} (${c.inicio} - ${c.fim})`
              ).join('\n')}\n\nDeseja continuar mesmo assim?`
            );
            
            if (!confirmar) {
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error('Erro ao verificar conflitos:', error);
          // Continuar mesmo se a verificação falhar
        }
      }
      
      // Adicionar itens selecionados
      dataToSend.itens = selectedItems.map(item => ({
        inventory_id: item.id,
        item_name: item.name,
        quantity_requested: item.quantity
      }));
      
      await criarRequisicao(dataToSend);
      mostrarNotificacao('Requisição criada com sucesso!', 'sucesso');
      setShowAddModal(false);
      setFormData({
        department: '',
        event_name: '',
        date: '',
        location: '',
        description: '',
        start_datetime: '',
        end_datetime: '',
        expected_audience: '',
        prioridade: PRIORIDADE_DEFAULT
      });
      setSelectedItems([]); // Limpar itens selecionados
      buscarRequisicoes();
    } catch (error) {
      if (error.message && error.message.includes('conflito')) {
        mostrarNotificacao(error.message, 'erro');
      } else {
        mostrarNotificacao('Erro ao criar requisição', 'erro');
      }
    }
    setLoading(false);
  };

  const handleEdit = async (id) => {
    try {
      const detalhe = await getRequisicaoDetalhada(id);
      setEditReq(detalhe);
      setEditModalOpen(true);
    } catch {
      mostrarNotificacao('Erro ao carregar dados para edição', 'erro');
    }
  };

  const handleEditSave = async () => {
    if (!editReq) return;
    
    try {
      // Combinar data com horas para criar datetime completo
      const dataToSend = { ...editReq };
      
      if (editReq.date && editReq.start_datetime) {
        dataToSend.start_datetime = `${editReq.date}T${editReq.start_datetime}`;
      }
      
      if (editReq.date && editReq.end_datetime) {
        dataToSend.end_datetime = `${editReq.date}T${editReq.end_datetime}`;
      }
      
      await atualizarRequisicao(editReq.id, dataToSend);
      mostrarNotificacao('Requisição atualizada com sucesso!', 'sucesso');
      setEditModalOpen(false);
      setEditReq(null);
      buscarRequisicoes();
    } catch {
      mostrarNotificacao('Erro ao atualizar requisição', 'erro');
    }
  };

  const handleDelete = (id) => {
    setDeleteReq(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteReq) return;
    
    try {
      await deletarRequisicao(deleteReq);
      mostrarNotificacao('Requisição deletada com sucesso!', 'sucesso');
      setDeleteModalOpen(false);
      setDeleteReq(null);
      buscarRequisicoes();
    } catch {
      mostrarNotificacao('Erro ao deletar requisição', 'erro');
    }
  };

  const handleEditField = (field, value) => {
    if (editReq) {
      setEditReq({ ...editReq, [field]: value });
    }
  };

  // Função para verificar conflitos em tempo real
  const verificarConflitoTempoReal = async (date, location, start_time, end_time) => {
    if (!date || !location || !start_time || !end_time) {
      setConflitoInfo({
        temConflito: false,
        mensagem: '',
        conflitos: [],
        horariosDisponiveis: []
      });
      return;
    }

    // Se uma sugestão foi aplicada, não verificar conflitos imediatamente
    if (sugestaoAplicada) {
      setSugestaoAplicada(false);
      return;
    }

    setValidandoConflito(true);
    try {
      const resultado = await verificarConflitosTempoReal({
        date,
        location,
        start_time,
        end_time
      });

      setConflitoInfo({
        temConflito: resultado.temConflito,
        mensagem: resultado.message,
        conflitos: resultado.conflitos || [],
        horariosDisponiveis: resultado.horariosDisponiveis || []
      });
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
      setConflitoInfo({
        temConflito: false,
        mensagem: '',
        conflitos: [],
        horariosDisponiveis: []
      });
    } finally {
      setValidandoConflito(false);
    }
  };

  // Função para verificar disponibilidade de materiais em tempo real
  const verificarDisponibilidadeTempoReal = async (itens) => {
    if (!itens || itens.length === 0) {
      setDisponibilidadeInfo({
        temConflito: false,
        temBaixoEstoque: false,
        mensagem: '',
        materiaisIndisponiveis: [],
        materiaisBaixoEstoque: []
      });
      return;
    }

    setValidandoDisponibilidade(true);
    try {
      const resultado = await verificarDisponibilidadeMateriais(itens);

      setDisponibilidadeInfo({
        temConflito: resultado.temConflito,
        temBaixoEstoque: resultado.temBaixoEstoque,
        mensagem: resultado.message,
        materiaisIndisponiveis: resultado.materiaisIndisponiveis || [],
        materiaisBaixoEstoque: resultado.materiaisBaixoEstoque || []
      });
    } catch (error) {
      console.error('Erro ao verificar disponibilidade de materiais:', error);
      setDisponibilidadeInfo({
        temConflito: false,
        temBaixoEstoque: false,
        mensagem: '',
        materiaisIndisponiveis: [],
        materiaisBaixoEstoque: []
      });
    } finally {
      setValidandoDisponibilidade(false);
    }
  };

  // Debounce para evitar muitas requisições
  const debouncedVerificarConflito = useCallback(
    debounce(verificarConflitoTempoReal, 500),
    []
  );

  const debouncedVerificarDisponibilidade = useCallback(
    debounce(verificarDisponibilidadeTempoReal, 500),
    []
  );

  const handleVoltar = () => {
    // Verificar o role do usuário para redirecionar para o dashboard correto
    if (user && (user.role === 'ADM' || user.role === 'PASTOR')) {
      navigate('/admin/dashboard');
    } else if (user && user.role === 'AUDIOVISUAL') {
      navigate('/audiovisual/dashboard');
    } else {
    navigate('/dashboard');
    }
  };

  return (
    <div className="requests-page">
      {/* Botão Voltar */}
      <div className="requests-header-top">
        <Button
          variant="primary"
          size="sm"
          onClick={handleVoltar}
        >
          <FiArrowLeft size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Voltar
        </Button>
      </div>

      {/* Notificação da página */}
      {notificacao.mostrar && (
        <div className={`notificacao ${notificacao.tipo}`}>
          {notificacao.mensagem}
        </div>
      )}

      <div className="card requests-list-card">
        <div className="requests-header">
          <h2 className="requests-list-title">Gerenciar Requerimentos</h2>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setShowAddModal(true)}
            className="add-request-btn"
          >
            + Adicionar Requerimento
          </Button>
        </div>
        <div className="filters-section">
          <h3 className="filters-title">Filtros</h3>
          <div className="filters-container">
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select 
                value={filtroStatus} 
                onChange={e => setFiltroStatus(e.target.value)} 
                className="filter-select"
          required
              >
                <option value="">Selecione um status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="PENDENTE_CONFLITO">Em Conflito</option>
          <option value="APTO">Apto</option>
          <option value="EXECUTADO">Executado</option>
          <option value="FINALIZADO">Finalizado</option>
          <option value="REJEITADO">Rejeitado</option>
        </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Departamento</label>
        <input
          type="text"
          value={filtroDepartamento}
          onChange={e => setFiltroDepartamento(e.target.value)}
                placeholder="Digite o departamento..."
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Data</label>
              <input
                type="date"
                value={filtroData}
                onChange={e => setFiltroData(e.target.value)}
                placeholder="Selecione uma data"
          className="filter-input"
        />
      </div>

            <div className="filter-actions">
          <Button 
            variant="secondary" 
            size="sm"
                onClick={() => {
                  setFiltroStatus('');
                  setFiltroDepartamento('');
                  setFiltroData('');
                }}
                className="clear-filters-btn"
              >
                Limpar Filtros
          </Button>
        </div>
      </div>
        </div>
        {loading ? (
          <div className="requests-loading">Carregando...</div>
        ) : filtrar(requisicoes).length === 0 ? (
          <div className="requests-empty">
            <span>📋</span>
            <p>Nenhuma requisição encontrada.</p>
          </div>
        ) : (
          <div className="requests-list-container">
            {filtrar(requisicoes).map((req) => (
              <div key={req.id} className="request-item">
                <div className="request-item-content">
                  <div className="request-item-header">
                    <span className="request-item-title">
                      {req.department}
                    </span>
                    <span className="request-item-status">
                      ({req.status})
                    </span>
                    <span className="request-item-event">
                      {req.event_name || ''}
                    </span>
                  </div>
                  <div className="request-item-details">
                    <span className="request-item-date">
                      Data: {req.date}
                    </span>
                    {req.location && (
                      <span className="request-item-location">
                        Local: {req.location}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="request-item-actions">
                  <Button 
                    onClick={() => abrirDetalhe(req.id)}
                    variant="icon-blue" 
                    size="sm"
                    className="details-button"
                    title="Ver Detalhes"
                  >
                    <FiEye size={18} className="details-icon" />
                  </Button>
                  <Button 
                    onClick={() => handleEdit(req.id)}
                    variant="icon-blue" 
                    size="sm"
                    className="edit-button"
                    title="Editar"
                  >
                    <FiEdit size={18} className="edit-icon" />
                  </Button>
                  <Button 
                    onClick={() => handleDelete(req.id)}
                    variant="icon-blue" 
                    size="sm"
                    className="delete-button"
                    title="Deletar"
                  >
                    <FiTrash2 size={18} className="delete-icon" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      <Modal
        open={modalDetalhe}
        title="Detalhes da Requisição"
        onClose={() => setModalDetalhe(false)}
        actions={
          <Button variant="secondary" size="sm" onClick={() => setModalDetalhe(false)}>Fechar</Button>
        }
      >
        {/* Notificação do modal */}
        {notificacaoModal.mostrar && (
          <div className={`notificacao ${notificacaoModal.tipo}`} style={{ marginBottom: 12 }}>
            {notificacaoModal.mensagem}
          </div>
        )}

        {reqDetalhe ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><b>Departamento:</b> {reqDetalhe.department}</div>
            <div><b>Líder:</b> {reqDetalhe.department_leader}</div>
            <div><b>Prioridade:</b> {reqDetalhe.prioridade}</div>
            <div><b>Data:</b> {reqDetalhe.date}</div>
            <div><b>Evento:</b> {reqDetalhe.event_name}</div>
            <div><b>Local:</b> {reqDetalhe.location}</div>
            <div><b>Início:</b> {reqDetalhe.start_datetime}</div>
            <div><b>Fim:</b> {reqDetalhe.end_datetime}</div>
            <div><b>Público Esperado:</b> {reqDetalhe.expected_audience}</div>
            <div><b>Descrição:</b> {reqDetalhe.description}</div>
            <div><b>Solicitante:</b> {reqDetalhe.requester}</div>
            <div><b>Status:</b> {reqDetalhe.status}</div>
            {reqDetalhe.status === 'PENDENTE_CONFLITO' && (
              <div className="requests-alert-conflito" style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>
                ⚠️ Conflito de agenda detectado! Esta requisição precisa de avaliação manual.
              </div>
            )}
            {/* Histórico de status */}
            {Array.isArray(reqDetalhe.status_history) && reqDetalhe.status_history.length > 0 && (
              <div className="status-history-section">
                <h4>📋 Histórico de Status</h4>
                <div className="status-history-list">
                  {reqDetalhe.status_history.map((h, idx) => (
                    <div key={idx} className="status-history-item">
                      <div className="status-history-header">
                        <span className={`status-badge status-${h.status.toLowerCase()}`}>
                          {h.status}
                        </span>
                        <span className="status-date">
                          {h.date ? new Date(h.date).toLocaleString('pt-BR') : ''}
                        </span>
                      </div>
                      {h.user_name && (
                        <div className="status-user">
                          <strong>Por:</strong> {h.user_name}
                        </div>
                      )}
                      {h.reason && (
                        <div className="status-reason">
                          <strong>Motivo:</strong> {h.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Modal de Edição */}
      <Modal
        open={editModalOpen}
        title="Editar Requisição"
        onClose={() => setEditModalOpen(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleEditSave}>Salvar</Button>
          </>
        }
      >
        {editReq && (
          <form style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div className="input-group">
                  <label className="input-label">Departamento</label>
                  <select
                    className="input-field"
                    value={editReq.department || ''}
                    onChange={e => handleEditField('department', e.target.value)}
                    required
                  >
                    {departamentosOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ flex: 1 }}>
            <Input
              label="Nome do Evento"
              value={editReq.event_name || ''}
              onChange={e => handleEditField('event_name', e.target.value)}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div className="input-group">
                  <label className="input-label">Local</label>
                  <select
                    className="input-field"
                    value={editReq.location || ''}
                    onChange={e => handleEditField('location', e.target.value)}
                  >
                    {salasOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  label="Data"
                  type="date"
                  value={editReq.date || ''}
                  onChange={e => handleEditField('date', e.target.value)}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ flex: 1 }}>
            <Input
              label="Hora de Início"
              type="time"
              value={editReq.start_datetime || ''}
              onChange={e => {
                handleEditField('start_datetime', e.target.value);
                debouncedVerificarConflito(editReq.date, editReq.location, e.target.value, editReq.end_datetime);
              }}
                  required
            />
              </div>
              <div style={{ flex: 1 }}>
            <Input
              label="Hora de Fim"
              type="time"
              value={editReq.end_datetime || ''}
              onChange={e => {
                handleEditField('end_datetime', e.target.value);
                debouncedVerificarConflito(editReq.date, editReq.location, editReq.start_datetime, e.target.value);
              }}
                  required
            />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ flex: 1 }}>
            <Input
              label="Público Esperado"
              type="number"
              value={editReq.expected_audience || ''}
              onChange={e => handleEditField('expected_audience', e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  label="Prioridade"
                  value={editReq.prioridade || ''}
                  onChange={e => handleEditField('prioridade', e.target.value)}
                  type="select"
                  options={PRIORIDADE_OPTIONS}
                />
              </div>
            </div>
            <Input
              label="Descrição"
              value={editReq.description || ''}
              onChange={e => handleEditField('description', e.target.value)}
              multiline
            />
          </form>
        )}
      </Modal>

      {/* Modal de Confirmação de Deleção */}
      <Modal
        open={deleteModalOpen}
        title="Confirmar Exclusão"
        onClose={() => setDeleteModalOpen(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>Deletar</Button>
          </>
        }
      >
        <p>Tem certeza que deseja deletar esta requisição? Esta ação não pode ser desfeita.</p>
      </Modal>

      {/* Modal de Adicionar Requisição */}
      <Modal
        open={showAddModal}
        title="Adicionar Requerimento"
        onClose={() => setShowAddModal(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={loading}>Criar</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Primeira linha - Departamento e Nome do Evento */}
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div className="input-group">
                <label className="input-label">Departamento</label>
                <select
                  className="input-field"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  {departamentosOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label="Nome do Evento"
                value={formData.event_name}
                onChange={e => setFormData({ ...formData, event_name: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Segunda linha - Data e Local */}
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Data"
                type="date"
                value={formData.date}
                onChange={e => {
                  setFormData({ ...formData, date: e.target.value });
                  debouncedVerificarConflito(e.target.value, formData.location, formData.start_datetime, formData.end_datetime);
                }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <div className="input-group">
                <label className="input-label">Local</label>
                <select
                  className="input-field"
                  value={formData.location}
                  onChange={e => {
                    setFormData({ ...formData, location: e.target.value });
                    debouncedVerificarConflito(formData.date, e.target.value, formData.start_datetime, formData.end_datetime);
                  }}
                >
                  {salasOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Terceira linha - Hora de Início e Fim */}
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Hora de Início"
                type="time"
                value={formData.start_datetime}
                onChange={e => {
                  setFormData({ ...formData, start_datetime: e.target.value });
                  debouncedVerificarConflito(formData.date, formData.location, e.target.value, formData.end_datetime);
                }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label="Hora de Fim"
                type="time"
                value={formData.end_datetime}
                onChange={e => {
                  setFormData({ ...formData, end_datetime: e.target.value });
                  debouncedVerificarConflito(formData.date, formData.location, formData.start_datetime, e.target.value);
                }}
                required
              />
            </div>
          </div>

          {/* Mensagem de conflito em tempo real */}
          {conflitoInfo.temConflito && (
            <div className={`conflict-validation-container ${
              conflitoInfo.conflitos.some(c => c.conflito === 'SOBREPOSIÇÃO_DIRETA') 
                ? 'conflict-container-error' 
                : 'conflict-container-warning'
            }`}
            style={{
              padding: '16px',
              borderRadius: '12px',
              marginTop: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              {/* Header da mensagem */}
              <div className="conflict-header">
                <div className="conflict-icon">
                  {validandoConflito ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    conflitoInfo.conflitos.some(c => c.conflito === 'SOBREPOSIÇÃO_DIRETA') ? '❌' : '⚠️'
                  )}
                </div>
                <div className="conflict-message">
                  {validandoConflito ? 'Verificando disponibilidade...' : conflitoInfo.mensagem}
                </div>
              </div>
              
              {/* Lista de conflitos */}
              {conflitoInfo.conflitos.length > 0 && (
                <div className="conflicts-list">
                  <div className="conflicts-title">
                    📋 Conflitos encontrados:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {conflitoInfo.conflitos.map((conflito, index) => (
                      <div key={index} className="conflict-item">
                        <span className={`conflict-type-icon ${
                          conflito.tipo === 'EVENTO' ? 'conflict-type-event' : 'conflict-type-request'
                        }`}>
                          {conflito.tipo === 'EVENTO' ? '📅' : '📋'}
                        </span>
                        <span className="conflict-name">{conflito.nome}</span>
                        <span className="conflict-separator">•</span>
                        <span className="conflict-time">
                          {conflito.inicio} - {conflito.fim}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugestões de horários */}
              {conflitoInfo.horariosDisponiveis.length > 0 && (
                <div className="suggestions-list">
                  <div className="suggestions-title">
                    🕐 Horários disponíveis sugeridos:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {conflitoInfo.horariosDisponiveis.map((horario, index) => (
                      <div key={index} className="suggestion-item">
                        <div className="suggestion-time">
                          <span className="suggestion-time-icon">🕐</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span className="suggestion-time-text">
                              {horario.inicio} - {horario.fim}
                            </span>
                            {horario.descricao && (
                              <span style={{ 
                                fontSize: '11px', 
                                color: '#6b7280',
                                fontStyle: 'italic'
                              }}>
                                {horario.descricao}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="use-button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              start_datetime: horario.inicio,
                              end_datetime: horario.fim
                            });
                            // Limpar informações de conflito após aplicar sugestão
                            setConflitoInfo({
                              temConflito: false,
                              mensagem: '',
                              conflitos: [],
                              horariosDisponiveis: []
                            });
                            setSugestaoAplicada(true); // Marcar que uma sugestão foi aplicada
                          }}
                        >
                          Usar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quarta linha - Público Esperado e Prioridade */}
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Público Esperado"
                type="number"
                value={formData.expected_audience}
                onChange={e => setFormData({ ...formData, expected_audience: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label="Prioridade"
                value={formData.prioridade}
                onChange={e => setFormData({ ...formData, prioridade: e.target.value })}
                type="select"
                options={PRIORIDADE_OPTIONS}
              />
            </div>
          </div>

          {/* Sexta linha - Descrição (largura total) */}
          <Input
            label="Descrição"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            multiline
          />

          {/* Seção de Itens do Inventário */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: '#374151' }}>Itens do Inventário</label>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setShowInventoryModal(true)}
              >
                <FiPlus size={14} />
                Adicionar Item
              </Button>
            </div>
            
            {selectedItems.length > 0 ? (
              <div style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {selectedItems.map((item) => (
                    <div key={item.id} style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      backgroundColor: '#fff'
                    }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{item.name}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                          Disponível: {item.quantity_available}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          min="1"
                          max={item.quantity_available}
                          value={item.quantity}
                          onChange={(e) => alterarQuantidade(item.id, parseInt(e.target.value) || 0)}
                          style={{
                            width: '50px',
                            padding: '0.25rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontSize: '0.75rem'
                          }}
                        />
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removerItem(item.id)}
                          style={{ padding: '0.25rem', minWidth: 'auto' }}
                        >
                          <FiX size={10} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '1rem',
                textAlign: 'center',
                color: '#6b7280',
                backgroundColor: '#f9fafb'
              }}>
                Nenhum item selecionado
              </div>
            )}
          </div>

          {/* Validação de Disponibilidade de Materiais */}
          {(disponibilidadeInfo.temConflito || disponibilidadeInfo.temBaixoEstoque) && (
            <div className={`conflict-validation-container ${disponibilidadeInfo.temConflito ? 'conflict-error' : 'conflict-warning'}`}>
              <div className="conflict-header">
                <span className="conflict-icon">
                  {disponibilidadeInfo.temConflito ? '❌' : '⚠️'}
                </span>
                <span className="conflict-message">
                  {disponibilidadeInfo.mensagem}
                </span>
                {validandoDisponibilidade && (
                  <span className="loading-spinner">⏳</span>
                )}
              </div>

              {/* Materiais Indisponíveis */}
              {disponibilidadeInfo.materiaisIndisponiveis.length > 0 && (
                <div className="conflicts-list">
                  <div className="conflicts-title">
                    📦 Materiais indisponíveis:
                  </div>
                  {disponibilidadeInfo.materiaisIndisponiveis.map((material, index) => (
                    <div key={index} className="conflict-item">
                      <span className="conflict-type-icon">📦</span>
                      <span className="conflict-name">{material.nome}</span>
                      <span className="conflict-separator">•</span>
                      <span className="conflict-time">
                        Disponível: {material.quantidade_disponivel} | 
                        Solicitado: {material.quantidade_solicitada} | 
                        Faltam: {material.quantidade_faltante}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Materiais com Baixo Estoque */}
              {disponibilidadeInfo.materiaisBaixoEstoque.length > 0 && (
                <div className="conflicts-list">
                  <div className="conflicts-title">
                    ⚠️ Materiais com baixo estoque após uso:
                  </div>
                  {disponibilidadeInfo.materiaisBaixoEstoque.map((material, index) => (
                    <div key={index} className="conflict-item">
                      <span className="conflict-type-icon">⚠️</span>
                      <span className="conflict-name">{material.nome}</span>
                      <span className="conflict-separator">•</span>
                      <span className="conflict-time">
                        Disponível: {material.quantidade_disponivel} | 
                        Solicitado: {material.quantidade_solicitada} | 
                        Restarão: {material.quantidade_restante}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>
      </Modal>

      {/* Modal de Seleção de Itens do Inventário */}
      <Modal
        open={showInventoryModal}
        title="Selecionar Itens do Inventário"
        onClose={() => setShowInventoryModal(false)}
        actions={
          <Button variant="secondary" size="sm" onClick={() => setShowInventoryModal(false)}>
            Fechar
          </Button>
        }
      >
        <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
          {inventory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {inventory.map((item) => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#fff'
                }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{item.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {item.description}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#059669' }}>
                      Disponível: {item.quantity_available}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      adicionarItem(item);
                      setShowInventoryModal(false);
                    }}
                    disabled={item.quantity_available <= 0}
                  >
                    <FiPlus size={14} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Nenhum item disponível no inventário
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
} 