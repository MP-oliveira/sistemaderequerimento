import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { listarUsuarios, criarUsuario, atualizarUsuario, deletarUsuario } from '../services/usersService';
import './Users.css';

export default function Users() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER',
    password: ''
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
    } catch {
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
      setFormData({ name: '', email: '', role: 'USER', password: '' });
      buscarUsuarios();
    } catch {
      mostrarNotificacao('Erro ao salvar usuário', 'erro');
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || user.full_name || '',
      email: user.email || '',
      role: user.role || 'USER',
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletarUsuario(id);
      mostrarNotificacao('Usuário deletado com sucesso!', 'sucesso');
      buscarUsuarios();
    } catch {
      mostrarNotificacao('Erro ao deletar usuário', 'erro');
    }
  };

  const handleOpenModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'USER', password: '' });
    setShowModal(true);
  };

  const handleVoltar = () => {
    // Verificar o role do usuário para redirecionar para o dashboard correto
    if (user && (user.role === 'ADM' || user.role === 'PASTOR')) {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
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
          <div className="users-header-top">
            <Button 
              variant="primary"
              size="sm" 
              onClick={handleVoltar}
            >
              <FiArrowLeft size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Voltar
            </Button>
          </div>
          <div className="users-header-bottom">
            <h2 className="users-title">Usuários</h2>
            <Button variant="primary" size="sm" onClick={handleOpenModal}>
              + Adicionar Usuário
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="users-loading">Carregando...</div>
        ) : (
          <div className="users-list">
            {usuarios.length === 0 ? (
              <div className="users-empty">
                <span>👥</span>
                <p>Nenhum usuário encontrado.</p>
              </div>
            ) : (
              <div className="users-list-container">
                {usuarios.map(user => (
                  <div key={user.id} className="user-item">
                    <div className="user-item-content">
                      <div className="user-item-header">
                        <span className="user-item-name">
                          {user.full_name || user.name}
                        </span>
                        <span className="user-item-role">
                          ({user.role})
                        </span>
                        <span className="user-item-email">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    
                    <div className="user-item-actions">
                      <Button 
                        onClick={() => handleEdit(user)}
                        variant="icon-blue" 
                        size="sm"
                        className="edit-button"
                        title="Editar"
                      >
                        <FiEdit size={18} className="edit-icon" />
                      </Button>
                      <Button 
                        onClick={() => handleDelete(user.id)}
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
          {!editingUser && (
            <Input
              label="Senha"
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
              className="input-full"
            />
          )}
          <div className="input-group">
            <label className="input-label">Função</label>
            <select
              className="input-field"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="" disabled>Selecione uma função</option>
              <option value="USER">Usuário</option>
              <option value="LIDER">Líder</option>
              <option value="SEC">Secretário</option>
              <option value="AUDIOVISUAL">Audiovisual</option>
              <option value="PASTOR">Pastor</option>
              <option value="ADM">Administrador</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
} 