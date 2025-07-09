import React, { useState, useEffect } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import Table from '../components/Table';
import { listarItensInventario, criarItemInventario } from '../services/inventoryService';
import './Inventory.css';

const STATUS_OPTIONS = [
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'RESERVADO', label: 'Reservado' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
  { value: 'INDISPONIVEL', label: 'Indisponível' },
];

export default function Inventory() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [status, setStatus] = useState('DISPONIVEL');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  useEffect(() => {
    buscarItens();
  }, []);

  const buscarItens = async () => {
    setLoading(true);
    setListError('');
    try {
      const data = await listarItensInventario();
      setItens(data);
    } catch (err) {
      setListError(err.message || 'Erro ao buscar inventário');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');
    if (!nome || quantidade < 1) {
      setFormError('Preencha o nome e a quantidade corretamente.');
      return;
    }
    setLoadingForm(true);
    try {
      await criarItemInventario({ nome, quantidade, status });
      setSuccessMsg('Item adicionado com sucesso!');
      setNome('');
      setQuantidade(1);
      setStatus('DISPONIVEL');
      buscarItens();
    } catch (err) {
      setFormError(err.message || 'Erro ao adicionar item');
    }
    setLoadingForm(false);
  };

  return (
    <div className="inventory-page">
      <h1>Inventário</h1>
      <form className="inventory-form" onSubmit={handleSubmit}>
        <Input
          label="Nome do item"
          placeholder="Ex: Microfone, Projetor..."
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />
        <Input
          label="Quantidade"
          type="number"
          min={1}
          value={quantidade}
          onChange={e => setQuantidade(Number(e.target.value))}
          required
        />
        <div className="input-group">
          <label className="input-label">Status</label>
          <select
            className="input-field"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {formError && <div className="inventory-error">{formError}</div>}
        {successMsg && <div style={{ color: '#2d8cff', marginTop: 12, textAlign: 'center', fontWeight: 500 }}>{successMsg}</div>}
        <Button type="submit" variant="primary" size="md" style={{ marginTop: 12 }} loading={loadingForm} disabled={loadingForm}>
          Adicionar Item
        </Button>
      </form>
      <h2 style={{ marginTop: 40, marginBottom: 16, color: '#2d8cff', textAlign: 'center' }}>Itens do Inventário</h2>
      {loading ? (
        <div style={{ textAlign: 'center', color: '#888' }}>Carregando...</div>
      ) : listError ? (
        <div className="inventory-error">{listError}</div>
      ) : (
        <Table
          columns={[
            { key: 'nome', label: 'Nome' },
            { key: 'quantidade', label: 'Quantidade' },
            { key: 'status', label: 'Status' },
          ]}
          data={itens}
          emptyMessage="Nenhum item encontrado."
        />
      )}
    </div>
  );
} 