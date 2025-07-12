import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { listarUsuarios, criarUsuario, atualizarUsuario, deletarUsuario, alternarStatusUsuario } from '../services/usersService';
import toast from 'react-hot-toast';
import './Users.css';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const PAPEL_OPTIONS = [
  { value: 'ADM', label: 'Administrador' },
  { value: 'PASTOR', label: 'Pastor' },
  { value: 'LIDER', label: 'Líder' },
  { value: 'SEC', label: 'Secretário' },
  { value: 'AUDIOVISUAL', label: 'Audiovisual' },
];

export default function Users() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [papel, setPapel] = useState('ADM');
  const [senha, setSenha] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  
  // Estados para edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPapel, setEditPapel] = useState('ADM');
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  
  // Estados para confirmação de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    // Verificar se está logado
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Verificar se é administrador
    if (user.role !== 'ADM') {
      setListError('Acesso negado. Apenas administradores podem gerenciar usuários.');
      return;
    }
    
    buscarUsuarios();
  }, [user, navigate]);

  const buscarUsuarios = async () => {
    setLoading(true);
    setListError('');
    try {
      const res = await listarUsuarios();
      setUsuarios(res.data || res || []);
    } catch (err) {
      if (err.message.includes('Sessão expirada')) {
        logout();
        navigate('/login');
        return;
      }
      setListError(err.message || 'Erro ao buscar usuários');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');
    if (!nome || !email || !papel || !senha) {
      setFormError('Preencha todos os campos.');
      return;
    }
    setLoadingForm(true);
    try {
      await criarUsuario({ nome, email, papel, senha });
      toast.success('✅ Usuário criado com sucesso!');
      setSuccessMsg('Usuário criado com sucesso!');
      setNome('');
      setEmail('');
      setPapel('ADM');
      setSenha('');
      buscarUsuarios();
    } catch (err) {
      if (err.message.includes('Sessão expirada')) {
        logout();
        navigate('/login');
        return;
      }
      setFormError(err.message || 'Erro ao criar usuário');
      toast.error('❌ Erro ao criar usuário: ' + err.message);
    }
    setLoadingForm(false);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditNome(user.full_name || '');
    setEditEmail(user.email || '');
    setEditPapel(user.role || 'ADM');
    setEditError('');
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editNome || !editEmail || !editPapel) {
      setEditError('Preencha todos os campos.');
      return;
    }
    
    setLoadingEdit(true);
    setEditError('');
    
    try {
      await atualizarUsuario(editingUser.id, {
        nome: editNome,
        email: editEmail,
        papel: editPapel
      });
      
      toast.success('✅ Usuário atualizado com sucesso!');
      setShowEditModal(false);
      setEditingUser(null);
      buscarUsuarios();
    } catch (err) {
      if (err.message.includes('Sessão expirada')) {
        logout();
        navigate('/login');
        return;
      }
      setEditError(err.message || 'Erro ao atualizar usuário');
      toast.error('❌ Erro ao atualizar usuário: ' + err.message);
    }
    
    setLoadingEdit(false);
  };

  const handleDeleteUser = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    setLoadingDelete(true);
    try {
      console.log('Tentando deletar usuário:', deletingUser);
      await deletarUsuario(deletingUser.id);
      toast.success('✅ Usuário deletado com sucesso!');
      setShowDeleteModal(false);
      setDeletingUser(null);
      buscarUsuarios();
    } catch (err) {
      if (err.message.includes('Sessão expirada')) {
        logout();
        navigate('/login');
        return;
      }
      toast.error('❌ Erro ao deletar usuário: ' + (err.message || JSON.stringify(err)));
      console.error('Erro ao deletar usuário:', err);
    }
    setLoadingDelete(false);
  };

  const handleToggleStatus = async (user) => {
    try {
      await alternarStatusUsuario(user.id, !user.is_active);
      toast.success(`✅ Usuário ${user.is_active ? 'desativado' : 'ativado'} com sucesso!`);
      buscarUsuarios();
    } catch (err) {
      if (err.message.includes('Sessão expirada')) {
        logout();
        navigate('/login');
        return;
      }
      toast.error('❌ Erro ao alterar status: ' + err.message);
    }
  };

  // Se não for administrador, mostrar mensagem
  if (user && user.role !== 'ADM') {
    return (
      <div className="users-page">
        <div className="card users-card">
          <h1>Acesso Negado</h1>
          <p>Apenas administradores podem gerenciar usuários.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="card users-card">
        <h1>Usuários</h1>
        <form className="users-form" onSubmit={handleSubmit}>
          <Input
            label="Nome"
            placeholder="Nome completo"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <div className="input-group">
            <label className="input-label">Papel</label>
            <select
              className="input-field"
              value={papel}
              onChange={e => setPapel(e.target.value)}
            >
              {PAPEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Senha"
            type="password"
            placeholder="Senha temporária"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />
          {formError && <div className="users-error">{formError}</div>}
          {successMsg && <div className="users-success-msg">{successMsg}</div>}
          <Button type="submit" variant="primary" size="md" className="users-submit-btn" loading={loadingForm} disabled={loadingForm}>
            Adicionar Usuário
          </Button>
        </form>
      </div>
      <div className="card users-list-card">
        <h2>Lista de Usuários</h2>
        {loading ? (
          <div className="users-loading">Carregando...</div>
        ) : listError ? (
          <div className="users-error">{listError}</div>
        ) : (
          <Table
            columns={[
              { key: 'full_name', label: 'Nome' },
              { key: 'email', label: 'E-mail' },
              { key: 'role', label: 'Papel' },
              { 
                key: 'is_active', 
                label: 'Status',
                render: (value) => (
                  <span style={{ 
                    color: value ? '#28a745' : '#dc3545',
                    fontWeight: 'bold'
                  }}>
                    {value ? 'Ativo' : 'Inativo'}
                  </span>
                )
              },
              {
                key: 'actions',
                label: 'Ações',
                render: (value, row) => (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button
                      onClick={() => handleEditUser(row)}
                      variant="icon-blue"
                      size="sm"
                      style={{ background: 'none', border: 'none', padding: 0, color: '#2d8cff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Editar"
                    >
                      <FiEdit className="icon-outline-blue" size={16} />
                    </Button>
                    <Button
                      onClick={() => handleDeleteUser(row)}
                      variant="icon-blue"
                      size="sm"
                      style={{ background: 'none', border: 'none', padding: 0, color: '#2d8cff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Deletar"
                    >
                      <FiTrash2 className="icon-outline-blue" size={16} />
                    </Button>
                    <Button
                      onClick={() => handleToggleStatus(row)}
                      variant="icon-blue"
                      size="sm"
                      className="icon-action-btn"
                      title={row.is_active ? 'Desativar' : 'Ativar'}
                    >
                      {row.is_active ? '🚫' : '✅'}
                    </Button>
                  </div>
                )
              }
            ]}
            data={usuarios}
            emptyMessage="Nenhum usuário encontrado."
          />
        )}
      </div>

      {/* Modal de Edição */}
      <Modal
        open={showEditModal}
        title="Editar Usuário"
        onClose={() => setShowEditModal(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpdateUser} loading={loadingEdit} disabled={loadingEdit}>
              Salvar
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Nome"
            placeholder="Nome completo"
            value={editNome}
            onChange={e => setEditNome(e.target.value)}
            required
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="email@exemplo.com"
            value={editEmail}
            onChange={e => setEditEmail(e.target.value)}
            required
          />
          <div className="input-group">
            <label className="input-label">Papel</label>
            <select
              className="input-field"
              value={editPapel}
              onChange={e => setEditPapel(e.target.value)}
            >
              {PAPEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {editError && <div className="users-error">{editError}</div>}
        </div>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        open={showDeleteModal}
        title="Confirmar Exclusão"
        onClose={() => setShowDeleteModal(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDeleteUser} loading={loadingDelete} disabled={loadingDelete}>
              Confirmar Exclusão
            </Button>
          </>
        }
      >
        <div>
          <p>Tem certeza que deseja deletar o usuário <strong>{deletingUser?.full_name}</strong>?</p>
          <p style={{ color: '#dc3545', fontSize: '14px' }}>
            ⚠️ Esta ação não pode ser desfeita.
          </p>
        </div>
      </Modal>
    </div>
  );
} 