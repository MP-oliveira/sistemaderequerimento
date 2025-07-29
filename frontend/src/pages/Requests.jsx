import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiEye, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { listarRequisicoes, getRequisicaoDetalhada, criarRequisicao, deletarRequisicao, atualizarRequisicao } from '../services/requestsService';
import { salasOptions } from '../utils/salasConfig';
import { departamentosOptions } from '../utils/departamentosConfig.js';
import { PRIORIDADE_OPTIONS, PRIORIDADE_DEFAULT } from '../utils/prioridadeConfig';
import './Requests.css';

export default function Requests() {
  const navigate = useNavigate();
  
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
  
  // Estados para notificações
  const [notificacao, setNotificacao] = useState({ mensagem: '', tipo: '', mostrar: false });
  const [notificacaoModal, setNotificacaoModal] = useState({ mensagem: '', tipo: '', mostrar: false });

  // Estados para edição e deleção
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editReq, setEditReq] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReq, setDeleteReq] = useState(null);

  useEffect(() => {
    buscarRequisicoes();
  }, []);

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

  function mostrarNotificacaoModal(mensagem, tipo) {
    setNotificacaoModal({ mensagem, tipo, mostrar: true });
  }

  async function buscarRequisicoes() {
    setLoading(true);
    try {
      const data = await listarRequisicoes();
      setRequisicoes(Array.isArray(data) ? data : []);
    } catch (err) {
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
        prioridade: PRIORIDADE_DEFAULT,
    
      });
      buscarRequisicoes();
    } catch (error) {
      mostrarNotificacao('Erro ao criar requisição', 'erro');
    }
    setLoading(false);
  };

  const handleEdit = async (id) => {
    try {
      const detalhe = await getRequisicaoDetalhada(id);
      setEditReq(detalhe);
      setEditModalOpen(true);
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      mostrarNotificacao('Erro ao deletar requisição', 'erro');
    }
  };

  const handleEditField = (field, value) => {
    setEditReq(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVoltar = () => {
    navigate('/dashboard');
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
              onChange={e => handleEditField('start_datetime', e.target.value)}
                  required
            />
              </div>
              <div style={{ flex: 1 }}>
            <Input
              label="Hora de Fim"
              type="time"
              value={editReq.end_datetime || ''}
              onChange={e => handleEditField('end_datetime', e.target.value)}
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
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <div className="input-group">
                <label className="input-label">Local</label>
                <select
                  className="input-field"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
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
                onChange={e => setFormData({ ...formData, start_datetime: e.target.value })}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label="Hora de Fim"
                type="time"
                value={formData.end_datetime}
                onChange={e => setFormData({ ...formData, end_datetime: e.target.value })}
                required
              />
            </div>
          </div>

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
        </form>
      </Modal>
    </div>
  );
} 