import { useState, useEffect } from 'react';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { listarRequisicoes, aprovarRequisicao, rejeitarRequisicao, getRequisicaoDetalhada } from '../services/requestsService';
import './Requests.css';

export default function RequestsAdmin() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalDetalhe, setModalDetalhe] = useState(false);
  const [reqDetalhe, setReqDetalhe] = useState(null);
  const [modalRejeitar, setModalRejeitar] = useState(false);
  const [rejeitarId, setRejeitarId] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  
  // Estados para notificações
  const [notificacao, setNotificacao] = useState({ mensagem: '', tipo: '', mostrar: false });
  const [notificacaoModal, setNotificacaoModal] = useState({ mensagem: '', tipo: '', mostrar: false });

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

  async function aprovar(id) {
    try {
      await aprovarRequisicao(id);
      mostrarNotificacao('Requisição aprovada com sucesso!', 'sucesso');
      mostrarNotificacaoModal('Requisição aprovada com sucesso!', 'sucesso');
      buscarRequisicoes();
      setModalDetalhe(false);
    } catch {
      mostrarNotificacao('Erro ao aprovar requisição', 'erro');
      mostrarNotificacaoModal('Erro ao aprovar requisição', 'erro');
    }
  }

  function abrirRejeitar(id) {
    setRejeitarId(id);
    setMotivoRejeicao('');
    setModalRejeitar(true);
  }

  async function rejeitar() {
    try {
      await rejeitarRequisicao(rejeitarId, motivoRejeicao);
      mostrarNotificacao('Requisição rejeitada com sucesso!', 'sucesso');
      buscarRequisicoes();
      setModalRejeitar(false);
      setModalDetalhe(false);
    } catch {
      mostrarNotificacao('Erro ao rejeitar requisição', 'erro');
    }
  }

  return (
    <div className="requests-page">
      {/* Notificação da página */}
      {notificacao.mostrar && (
        <div className={`notificacao ${notificacao.tipo}`}>
          {notificacao.mensagem}
        </div>
      )}

      <div className="card requests-list-card">
        <h2 className="requests-list-title">Administração de Requisições</h2>
        <div className="filters-container">
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="filter-select">
            <option value="">Status (todos)</option>
            <option value="PENDENTE">Pendente</option>
            <option value="PENDENTE_CONFLITO">Em Conflito</option>
            <option value="APTO">Apto</option>
            <option value="EXECUTADO">Executado</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="REJEITADO">Rejeitado</option>
          </select>
          <input
            type="text"
            value={filtroDepartamento}
            onChange={e => setFiltroDepartamento(e.target.value)}
            placeholder="Departamento (filtro)"
            className="filter-input"
            style={{ minWidth: 180 }}
          />
          <input
            type="date"
            value={filtroData}
            onChange={e => setFiltroData(e.target.value)}
            className="filter-input"
          />
        </div>
        {loading ? (
          <div className="requests-loading">Carregando...</div>
        ) : (
          <Table
            columns={[
              { key: 'department', label: 'Departamento' },
              { key: 'event_name', label: 'Evento' },
              { key: 'date', label: 'Data' },
              { key: 'status', label: 'Status' },
              {
                key: 'actions',
                label: 'Ações',
                render: (value, row) => (
                  <>
                    <Button size="sm" variant="primary" onClick={() => abrirDetalhe(row.id)} style={{ marginRight: 6 }}>Detalhes</Button>
                  </>
                )
              }
            ]}
            data={filtrar(requisicoes)}
            emptyMessage="Nenhuma requisição encontrada."
          />
        )}
      </div>

      {/* Modal de detalhes */}
      <Modal
        open={modalDetalhe}
        title="Detalhes da Requisição"
        onClose={() => setModalDetalhe(false)}
        actions={
          reqDetalhe && reqDetalhe.status === 'PENDENTE' ? (
            <>
              <Button variant="danger" size="sm" onClick={() => abrirRejeitar(reqDetalhe.id)}>Rejeitar</Button>
              <Button variant="primary" size="sm" onClick={() => aprovar(reqDetalhe.id)}>Aprovar</Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setModalDetalhe(false)}>Fechar</Button>
          )
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

      {/* Modal de rejeição */}
      <Modal
        open={modalRejeitar}
        title="Motivo da Rejeição"
        onClose={() => setModalRejeitar(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalRejeitar(false)}>Cancelar</Button>
            <Button variant="danger" size="sm" onClick={rejeitar} disabled={!motivoRejeicao}>Rejeitar</Button>
          </>
        }
      >
        <Input
          label="Descreva o motivo da rejeição"
          value={motivoRejeicao}
          onChange={e => setMotivoRejeicao(e.target.value)}
          className="input-full"
        />
      </Modal>
    </div>
  );
} 