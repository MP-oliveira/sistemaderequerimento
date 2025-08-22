import { useState, useEffect, useRef } from 'react';
import { FiEdit, FiTrash2, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { listarUsuarios, criarUsuario, atualizarUsuario, deletarUsuario } from '../services/usersService';
import './Users.css';

export default function Users() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const passwordInputRef = useRef(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER',
    password: ''
  });

  // Forçar atualização do input de senha
  useEffect(() => {
    console.log('🔍 useEffect - showPassword mudou para:', showPassword);
    if (passwordInputRef.current) {
      passwordInputRef.current.type = showPassword ? 'text' : 'password';
      console.log('🔍 Input type alterado para:', passwordInputRef.current.type);
    }
  }, [showPassword]);

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
      // Se estiver editando e a senha for apenas pontos, remover a senha do formData
      const dataToSend = { ...formData };
      if (editingUser && dataToSend.password === '••••••••') {
        delete dataToSend.password;
      }
      
      if (editingUser) {
        await atualizarUsuario(editingUser.id, dataToSend);
        mostrarNotificacao('Usuário atualizado com sucesso!', 'sucesso');
      } else {
        await criarUsuario(dataToSend);
        mostrarNotificacao('Usuário criado com sucesso!', 'sucesso');
      }
      setShowModal(false);
      setEditingUser(null);
      setShowPassword(false);
      setFormData({ name: '', email: '', role: 'USER', password: '' });
      buscarUsuarios();
    } catch {
      mostrarNotificacao('Erro ao salvar usuário', 'erro');
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowPassword(false);
    setFormData({
      name: user.name || user.full_name || '',
      email: user.email || '',
      role: user.role || 'USER',
      password: '••••••••' // Mostra pontos para indicar que há uma senha
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
    setShowPassword(false);
    setFormData({ name: '', email: '', role: 'USER', password: '' });
    setShowModal(true);
  };

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
        style={{
          width: '500px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            <label className="input-label">
              {editingUser ? "Senha (digite nova senha ou mantenha a atual)" : "Senha"}
            </label>
            {editingUser && (
              <div style={{ 
                marginBottom: '8px', 
                padding: '8px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '4px',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                💡 <strong>Senha atual:</strong> •••••••• (protegida por segurança)
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <input
                key={`password-${showPassword}`}
                type={showPassword ? "text" : "password"}
                className="input-field"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                placeholder={editingUser ? "Digite nova senha ou deixe em branco para manter a atual" : "Digite a senha"}
                style={{ paddingRight: '40px' }}
                onFocus={() => console.log('🔍 Input focado, showPassword:', showPassword, 'tipo:', showPassword ? "text" : "password")}
                ref={passwordInputRef}
              />
              <button
                type="button"
                onClick={() => {
                  console.log('🔍 Clique no ícone de senha');
                  console.log('🔍 showPassword antes:', showPassword);
                  setShowPassword(!showPassword);
                  console.log('🔍 showPassword depois:', !showPassword);
                }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
              </button>
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Função</label>
            <select
              className="input-field"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              required
              style={{ width: '100%' }}
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