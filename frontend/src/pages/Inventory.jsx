import React, { useState, useEffect } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import Table from '../components/Table';
import { listarItensInventario, criarItemInventario } from '../services/inventoryService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
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

  // Função para exportar para PDF
  const exportarParaPDF = () => {
    if (itens.length === 0) {
      toast.error('Não há itens para exportar');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text('Relatório de Inventário', 105, 20, { align: 'center' });
      
      // Data de geração
      doc.setFontSize(12);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 105, 30, { align: 'center' });
      
      // Preparar dados para a tabela
      const tableData = itens.map(item => [
        item.name || '-',
        item.category || '-',
        item.quantity_available || 0,
        Number(item.quantity_available) >= 2 ? 'Disponível' : 'Baixo estoque',
        item.location || '-',
        item.description || '-'
      ]);

      // Criar tabela
      autoTable(doc, {
        head: [['Nome', 'Categoria', 'Quantidade', 'Status', 'Local', 'Descrição']],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [45, 140, 255],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // Salvar arquivo
      const fileName = `inventario_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success('✅ Relatório PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('❌ Erro ao exportar PDF');
    }
  };

  // Função para exportar para Excel
  const exportarParaExcel = () => {
    if (itens.length === 0) {
      toast.error('Não há itens para exportar');
      return;
    }

    try {
      // Preparar dados para o Excel
      const dadosParaExcel = itens.map(item => ({
        'Nome': item.name || '-',
        'Categoria': item.category || '-',
        'Quantidade Disponível': item.quantity_available || 0,
        'Quantidade Total': item.quantity_total || 0,
        'Status': Number(item.quantity_available) >= 2 ? 'Disponível' : 'Baixo estoque',
        'Local': item.location || '-',
        'Descrição': item.description || '-',
        'Última Atualização': item.updated_at ? new Date(item.updated_at).toLocaleString('pt-BR') : '-'
      }));

      // Criar workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dadosParaExcel);

      // Ajustar largura das colunas
      const colWidths = [
        { wch: 25 }, // Nome
        { wch: 15 }, // Categoria
        { wch: 15 }, // Quantidade Disponível
        { wch: 15 }, // Quantidade Total
        { wch: 12 }, // Status
        { wch: 20 }, // Local
        { wch: 30 }, // Descrição
        { wch: 20 }  // Última Atualização
      ];
      ws['!cols'] = colWidths;

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Inventário');

      // Salvar arquivo
      const fileName = `inventario_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('✅ Relatório Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('❌ Erro ao exportar Excel');
    }
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
        <div className="inventory-header">
          <h2 className="inventory-list-title">Itens do Inventário</h2>
          <div className="export-buttons">
            <Button 
              onClick={exportarParaPDF} 
              variant="secondary" 
              size="sm"
              style={{ marginRight: '8px' }}
            >
              📄 Exportar PDF
            </Button>
            <Button 
              onClick={exportarParaExcel} 
              variant="secondary" 
              size="sm"
            >
              📊 Exportar Excel
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="inventory-loading">Carregando...</div>
        ) : listError ? (
          <div className="inventory-error">{listError}</div>
        ) : (
          <Table
            columns={[
              { key: 'name', label: 'Nome' },
              { key: 'category', label: 'Categoria' },
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