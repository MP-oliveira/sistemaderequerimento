import React, { useState, useEffect } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { criarRequisicao, listarRequisicoes } from '../services/requestsService';
import './Requests.css';

// Mock de itens do inventário (substituir por fetch real depois)
const INVENTORY_ITEMS = [
  { id: 1, name: 'Microfone' },
  { id: 2, name: 'Projetor' },
  { id: 3, name: 'Cabo HDMI' },
  { id: 4, name: 'Caixa de Som' },
];

export default function Requests() {
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [itens, setItens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [requisicoes, setRequisicoes] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState('');

  useEffect(() => {
    buscarRequisicoes();
  }, []);

  const buscarRequisicoes = async () => {
    setLoadingList(true);
    setListError('');
    try {
      const data = await listarRequisicoes();
      setRequisicoes(data);
    } catch (err) {
      setListError(err.message || 'Erro ao buscar requisições');
    }
    setLoadingList(false);
  };

  const handleAddItem = () => {
    if (!itemSelecionado || quantidade < 1) return;
    const item = INVENTORY_ITEMS.find(i => i.id === Number(itemSelecionado));
    if (!item) return;
    setItens([...itens, { ...item, quantidade }]);
    setItemSelecionado('');
    setQuantidade(1);
    setShowModal(false);
  };

  const handleRemoveItem = (index) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');
    if (!descricao || !data || itens.length === 0) {
      setFormError('Preencha todos os campos e adicione pelo menos um item.');
      return;
    }
    setLoading(true);
    try {
      await criarRequisicao({
        descricao,
        data,
        itens: itens.map(item => ({
          id: item.id,
          quantidade: item.quantidade
        }))
      });
      setSuccessMsg('Requisição enviada com sucesso!');
      setDescricao('');
      setData('');
      setItens([]);
      buscarRequisicoes();
    } catch (err) {
      setFormError(err.message || 'Erro ao enviar requisição');
    }
    setLoading(false);
  };

  return (
    <div className="requests-page">
      <div className="card requests-form-card">
        <h1 className="requests-form-title">Nova Requisição</h1>
        <form className="requests-form" onSubmit={handleSubmit}>
          <Input
            label="Descrição"
            placeholder="Motivo ou detalhes da requisição"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            required
          />
          <Input
            label="Data de uso"
            type="date"
            value={data}
            onChange={e => setData(e.target.value)}
            required
          />
          <div className="requests-items-header">
            <span>Itens da requisição</span>
            <Button type="button" variant="primary" size="sm" onClick={() => setShowModal(true)}>
              + Adicionar Item
            </Button>
          </div>
          <Table
            columns={[
              { key: 'name', label: 'Item' },
              { key: 'quantidade', label: 'Quantidade' },
              {
                key: 'actions',
                label: 'Ações',
                render: (_, row, i) => (
                  <Button variant="danger" size="sm" onClick={() => handleRemoveItem(i)}>
                    Remover
                  </Button>
                ),
              },
            ]}
            data={itens}
            emptyMessage="Nenhum item adicionado."
          />
          {formError && <div className="requests-error">{formError}</div>}
          {successMsg && <div className="requests-success-msg">{successMsg}</div>}
          <Button type="submit" variant="primary" size="lg" className="requests-submit-btn" loading={loading} disabled={loading}>
            Enviar Requisição
          </Button>
        </form>
      </div>

      <Modal
        open={showModal}
        title="Adicionar Item"
        onClose={() => setShowModal(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddItem}>
              Adicionar
            </Button>
          </>
        }
      >
        <div className="input-group">
          <label className="input-label">Item</label>
          <select
            className="input-field"
            value={itemSelecionado}
            onChange={e => setItemSelecionado(e.target.value)}
          >
            <option value="">Selecione um item</option>
            {INVENTORY_ITEMS.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <Input
          label="Quantidade"
          type="number"
          min={1}
          value={quantidade}
          onChange={e => setQuantidade(Number(e.target.value))}
          required
        />
      </Modal>

      <div className="card requests-list-card">
        <h2 className="requests-list-title">Minhas Requisições</h2>
        {loadingList ? (
          <div className="requests-loading">Carregando...</div>
        ) : listError ? (
          <div className="requests-error">{listError}</div>
        ) : (
          <Table
            columns={[
              { key: 'descricao', label: 'Descrição' },
              { key: 'data', label: 'Data' },
              { key: 'status', label: 'Status' },
              {
                key: 'itens',
                label: 'Itens',
                render: (row) => (
                  <ul className="requests-items-list">
                    {row.itens?.map((item, i) => (
                      <li key={i}>{item.name} ({item.quantidade})</li>
                    ))}
                  </ul>
                ),
              },
            ]}
            data={requisicoes}
            emptyMessage="Nenhuma requisição encontrada."
          />
        )}
      </div>
    </div>
  );
} 