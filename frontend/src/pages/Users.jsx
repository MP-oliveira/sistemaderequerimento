import { useState, useEffect } from 'react';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { listarUsuarios, criarUsuario, atualizarUsuario, deletarUsuario } from '../services/usersService';
import './Users.css';

export default function Users() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER'
  });

  // Estado para notificações
  const [notificacao, setNotificacao] = useState({ mensagem: '', tipo: '', mostrar: false });

  useEffect(() => {
    buscarUsuarios();
  }, []);

  // Auto-hide das notificações
  useEffect(() => {
    if (notificacao.mostrar) {
      const timer = setTimeout(() => setNotificacao({ mensagem: '', tipo: '', mostrar: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [notificacao.mostrar]);

  function mostrarNotificacao(mensagem, tipo) {
    setNotificacao({ mensagem, tipo, mostrar: true });
  }

  const buscarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await listarUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      mostrarNotificacao('Erro ao buscar usuários', 'erro');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUser) {
        await atualizarUsuario(editingUser.id, formData);
        mostrarNotificacao('Usuário atualizado com sucesso!', 'sucesso');
      } else {
        await criarUsuario(formData);
        mostrarNotificacao('Usuário criado com sucesso!', 'sucesso');
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'USER' });
      buscarUsuarios();
    } catch (err) {
      mostrarNotificacao('Erro ao salvar usuário', 'erro');
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || user.full_name || '',
      email: user.email || '',
      role: user.role || 'USER'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletarUsuario(id);
      mostrarNotificacao('Usuário deletado com sucesso!', 'sucesso');
      buscarUsuarios();
    } catch (err) {
      mostrarNotificacao('Erro ao deletar usuário', 'erro');
    }
  };

  const handleOpenModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'USER' });
    setShowModal(true);
  };

  return (
    <div className="users-page">
      {/* Notificação */}
      {notificacao.mostrar && (
        <div className={`notificacao ${notificacao.tipo}`}>
          {notificacao.mensagem}
        </div>
      )}

      <div className="card users-card">
        <div className="users-header">
          <h2 className="users-title">Usuários</h2>
          <Button variant="primary" size="sm" onClick={handleOpenModal}>
            + Adicionar Usuário
          </Button>
        </div>
        {loading ? (
          <div className="users-loading">Carregando...</div>
        ) : (
          <Table
            columns={[
              { key: 'name', label: 'Nome' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Função' },
              {
                key: 'actions',
                label: 'Ações',
                render: (value, row) => (
                  <>
                    <Button size="sm" variant="primary" onClick={() => handleEdit(row)} style={{ marginRight: 6 }}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>Deletar</Button>
                  </>
                )
              }
            ]}
            data={usuarios}
            emptyMessage="Nenhum usuário encontrado."
          />
        )}
      </div>

      <Modal
        open={showModal}
        title={editingUser ? "Editar Usuário" : "Adicionar Usuário"}
        onClose={() => setShowModal(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} loading={loading}>
              {editingUser ? 'Salvar' : 'Adicionar'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Nome"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
            className="input-full"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
            className="input-full"
          />
          <div className="input-group">
            <label className="input-label">Função</label>
            <select
              className="input-field"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="USER">Usuário</option>
              <option value="ADM">Administrador</option>
              <option value="PASTOR">Pastor</option>
              <option value="SEC">Secretário</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
} 