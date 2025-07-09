import React, { useState, useEffect } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import Table from '../components/Table';
import { listarUsuarios, criarUsuario } from '../services/usersService';
import './Users.css';

const PAPEL_OPTIONS = [
  { value: 'ADM', label: 'Administrador' },
  { value: 'PASTOR', label: 'Pastor' },
  { value: 'LIDER', label: 'Líder' },
  { value: 'SEC', label: 'Secretário' },
  { value: 'AUDIOVISUAL', label: 'Audiovisual' },
];

export default function Users() {
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

  useEffect(() => {
    buscarUsuarios();
  }, []);

  const buscarUsuarios = async () => {
    setLoading(true);
    setListError('');
    try {
      const res = await listarUsuarios();
      setUsuarios(res.data || []);
    } catch (err) {
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
      setSuccessMsg('Usuário criado com sucesso!');
      setNome('');
      setEmail('');
      setPapel('ADM');
      setSenha('');
      buscarUsuarios();
    } catch (err) {
      setFormError(err.message || 'Erro ao criar usuário');
    }
    setLoadingForm(false);
  };

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
              { key: 'nome', label: 'Nome' },
              { key: 'email', label: 'E-mail' },
              { key: 'papel', label: 'Papel' },
            ]}
            data={usuarios}
            emptyMessage="Nenhum usuário encontrado."
          />
        )}
      </div>
    </div>
  );
} 