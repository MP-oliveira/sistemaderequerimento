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
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [categoria, setCategoria] = useState("");
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
    if (!nome || quantidade < 1 || !categoria) {
      setFormError('Preencha o nome, a categoria e a quantidade corretamente.');
      return;
    }
    setLoadingForm(true);
    try {
      await criarItemInventario({ name: nome, category: categoria, quantity: quantidade });
      setSuccessMsg('Item adicionado com sucesso!');
      setNome('');
      setQuantidade(1);
      setCategoria('Geral');
      buscarItens();
    } catch (err) {
      setFormError(err.message || 'Erro ao adicionar item');
    }
    setLoadingForm(false);
  };

  return (
    <div className="inventory-page">
      <div className="card inventory-form-card">
        <h1 className="inventory-form-title">Inventário</h1>
        <form className="inventory-form" onSubmit={handleSubmit}>
          <Input
            label="Nome do item"
            placeholder="Ex: Microfone, Projetor..."
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
          />
          <Input
            label="Categoria"
            placeholder="Ex: Som, Projeção, Geral..."
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            required
          />
          <Input
            label="Quantidade"
            type="number"
            min={1}
            placeholder="1"
            value={quantidade}
            onChange={e => setQuantidade(e.target.value)}
            required
          />
          {/* Campo de status removido do formulário */}
          {formError && <div className="inventory-error">{formError}</div>}
          {successMsg && <div className="inventory-success-msg">{successMsg}</div>}
          <Button type="submit" variant="primary" size="md" className="inventory-submit-btn" loading={loadingForm} disabled={loadingForm}>
            Adicionar Item
          </Button>
        </form>
      </div>
      <div className="card inventory-list-card">
        <h2 className="inventory-list-title">Itens do Inventário</h2>
        {loading ? (
          <div className="inventory-loading">Carregando...</div>
        ) : listError ? (
          <div className="inventory-error">{listError}</div>
        ) : (
          <Table
            columns={[
              { key: 'name', label: 'Nome' },
              { key: 'quantity_available', label: 'Quantidade' },
              { key: 'disponibilidade', label: 'Disponibilidade' },
            ]}
            data={itens.map(item => ({
              ...item,
              disponibilidade: Number(item.quantity_available) >= 2 ? 'Disponível' : (
                <span style={{ color: 'red', fontWeight: 'bold' }}>Baixo estoque</span>
              )
            }))}
            emptyMessage="Nenhum item encontrado."
          />
        )}
      </div>
    </div>
  );
} 