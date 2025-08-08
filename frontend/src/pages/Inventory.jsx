import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiArrowLeft, FiEye, FiX } from 'react-icons/fi';
import Input from '../components/Input';
import Button from '../components/Button';
import ActivityLog from '../components/ActivityLog';
import { listarItensInventario, criarItemInventario, atualizarItemInventario, deletarItemInventario } from '../services/inventoryService';
import { buscarHistoricoInventario } from '../services/activityLogService';
import { useAuth } from '../context/AuthContext';
import { INVENTORY_CATEGORIES } from '../utils/inventoryCategories';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import './Inventory.css';
import Modal from '../components/Modal';

const STATUS_OPTIONS = [
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'RESERVADO', label: 'Reservado' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
  { value: 'INDISPONIVEL', label: 'Indisponível' },
];

export default function Inventory() {
  console.log('🎯 Inventory renderizado');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  console.log('🎯 Inventory - User:', user);
  console.log('🎯 Inventory - User role:', user?.role);
  
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [categoria, setCategoria] = useState("");
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);
  
  // Estados para busca e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filteredItens, setFilteredItens] = useState([]);
  
  // Estados para logs
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemLogs, setItemLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  // Estados para edição e deleção
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    quantity_available: '',
    quantity_total: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Estado para notificações
  const [notificacao, setNotificacao] = useState({ mensagem: '', tipo: '', mostrar: false });

  useEffect(() => {
    buscarItens();
  }, []);

  // Função para aplicar filtros e ordenação
  const aplicarFiltrosEOrdenacao = (itensParaFiltrar = itens) => {
    let itensFiltrados = [...itensParaFiltrar];

    // Aplicar filtro de busca por nome
    if (searchTerm.trim()) {
      itensFiltrados = itensFiltrados.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Aplicar filtro de categoria
    if (filterCategory) {
      itensFiltrados = itensFiltrados.filter(item =>
        item.category === filterCategory
      );
    }

    // Ordenar alfabeticamente por nome
    itensFiltrados.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    setFilteredItens(itensFiltrados);
  };

  // Aplicar filtros quando searchTerm ou filterCategory mudar
  useEffect(() => {
    aplicarFiltrosEOrdenacao();
  }, [searchTerm, filterCategory, itens]);

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

  const handleVoltar = () => {
    console.log('🎯 Inventory - handleVoltar chamado');
    console.log('🎯 Inventory - User role:', user?.role);
    
    // Verificar o role do usuário para redirecionar para o dashboard correto
    if (user && (user.role === 'ADM' || user.role === 'PASTOR')) {
      console.log('🎯 Inventory - Navegando para /admin/dashboard');
      navigate('/admin/dashboard');
    } else if (user && user.role === 'AUDIOVISUAL') {
      console.log('🎯 Inventory - Navegando para /audiovisual/dashboard');
      navigate('/audiovisual/dashboard');
    } else {
      console.log('🎯 Inventory - Navegando para /dashboard');
      navigate('/dashboard');
    }
  };

  const buscarItens = async () => {
    setLoading(true);
    setListError('');
    try {
      console.log('🔄 Buscando itens do inventário...');
      const data = await listarItensInventario();
      console.log('✅ Itens recebidos:', data);
      setItens(data);
      aplicarFiltrosEOrdenacao(data);
    } catch (err) {
      setListError(err.message || 'Erro ao buscar inventário');
    }
    setLoading(false);
  };

  // Função para buscar logs de um item
  const buscarLogsItem = async (itemId, itemName) => {
    setLoadingLogs(true);
    try {
      const logs = await buscarHistoricoInventario(itemId);
      setItemLogs(logs || []);
      setSelectedItem({ id: itemId, name: itemName });
      setShowLogs(true);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      mostrarNotificacao('Erro ao carregar histórico do item', 'erro');
    }
    setLoadingLogs(false);
  };

  // Função para fechar logs
  const fecharLogs = () => {
    setShowLogs(false);
    setSelectedItem(null);
    setItemLogs([]);
  };

  // Função para exportar para PDF
  const exportarParaPDF = () => {
    if (itens.length === 0) {
      mostrarNotificacao('Não há itens para exportar', 'erro');
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
      
      mostrarNotificacao('✅ Relatório PDF exportado com sucesso!', 'sucesso');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      mostrarNotificacao('❌ Erro ao exportar PDF', 'erro');
    }
  };

  // Função para exportar para Excel
  const exportarParaExcel = () => {
    if (itens.length === 0) {
      mostrarNotificacao('Não há itens para exportar', 'erro');
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
      
      mostrarNotificacao('✅ Relatório Excel exportado com sucesso!', 'sucesso');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      mostrarNotificacao('❌ Erro ao exportar Excel', 'erro');
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
      setQuantidade('');
      setCategoria('');
      buscarItens();
      // Fechar modal após sucesso
      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Erro ao adicionar item');
    }
    setLoadingForm(false);
  };

  // Função para abrir modal de edição
  const handleEdit = (item) => {
    console.log('🔧 Item para edição:', item);
    console.log('🔧 quantity_available:', item.quantity_available);
    console.log('🔧 quantity_total:', item.quantity_total);
    setEditItem(item);
    setEditForm({
      name: item.name || '',
      category: item.category || '',
      quantity_available: item.quantity_available?.toString() || '',
      quantity_total: (item.quantity_total || item.quantity_available)?.toString() || ''
    });
    setShowEditModal(true);
  };

  // Função para abrir modal de deleção
  const handleDelete = (item) => {
    setDeleteItem(item);
    setShowDeleteModal(true);
  };

  // Função para salvar edição
  const handleSalvarEdicao = async () => {
    if (!editItem) return;
    try {
      console.log('🔧 Tentando atualizar item:', editItem);
      console.log('🔧 Formulário de edição:', editForm);
      const dadosParaEnviar = {
        name: editForm.name,
        category: editForm.category,
        quantity_available: Number(editForm.quantity_available),
        quantity_total: Number(editForm.quantity_total)
      };
      
      // Validação adicional no frontend - mais flexível para permitir ajustes
      if (dadosParaEnviar.quantity_available > dadosParaEnviar.quantity_total) {
        // Se a quantidade disponível for maior que a total, ajustar automaticamente
        const quantidadeAnterior = dadosParaEnviar.quantity_available;
        dadosParaEnviar.quantity_available = dadosParaEnviar.quantity_total;
        console.log('🔄 Ajustando quantidade disponível para:', dadosParaEnviar.quantity_available);
        mostrarNotificacao(`Quantidade disponível ajustada automaticamente de ${quantidadeAnterior} para ${dadosParaEnviar.quantity_available}`, 'info');
      }
      console.log('📤 Dados para enviar:', dadosParaEnviar);
      
      await atualizarItemInventario(editItem.id, dadosParaEnviar);
      mostrarNotificacao('Item atualizado com sucesso!', 'sucesso');
      setShowEditModal(false);
      setEditItem(null);
      setEditForm({ name: '', category: '', quantity_available: '', quantity_total: '' });
      buscarItens();
    } catch (err) {
      console.error('❌ Erro ao atualizar item:', err);
      console.error('❌ Detalhes do erro:', err.message, err.stack);
      mostrarNotificacao('Erro ao atualizar item: ' + (err.message || 'Erro desconhecido'), 'erro');
    }
  };

  // Função para deletar item
  const handleConfirmarDelete = async () => {
    if (!deleteItem) return;
    try {
      await deletarItemInventario(deleteItem.id);
      mostrarNotificacao('Item deletado com sucesso!', 'sucesso');
      setShowDeleteModal(false);
      setDeleteItem(null);
      setTimeout(() => {
        console.log('🔁 Atualizando lista após deleção...');
        buscarItens();
      }, 200);
    } catch (err) {
      mostrarNotificacao('Erro ao deletar item: ' + (err.message || 'Erro desconhecido'), 'erro');
    }
  };

  return (
    <div className="inventory-page">
      {/* Notificação */}
      {notificacao.mostrar && (
        <div className={`notificacao ${notificacao.tipo}`}>
          {notificacao.mensagem}
        </div>
      )}

      <div className="card inventory-list-card">
        <div className="inventory-header">
          <div className="inventory-header-top">
            <Button 
              variant="primary"
              size="sm" 
              onClick={handleVoltar}
              className="back-button"
            >
              <FiArrowLeft size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Voltar
            </Button>
          </div>
          <div className="inventory-header-bottom">
            <div className="inventory-title-row">
              <h1 className="inventory-list-title">Itens do Inventário</h1>
              {user && (user.role === 'ADM' || user.role === 'SEC' || user.role === 'PASTOR') && (
                <Button 
                  onClick={() => setShowAddModal(true)}
                  variant="primary" 
                  size="sm"
                  className="add-item-button"
                >
                  <span style={{ color: 'white', marginRight: '6px' }}>+</span>
                  Adicionar Item
                </Button>
              )}
            </div>
            
            {/* Filtros e Busca */}
            <div className="inventory-filters">
              <div className="search-container">
                <Input
                  label="Buscar por nome"
                  placeholder="Digite o nome do item..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ minWidth: '250px' }}
                />
              </div>
              <div className="category-filter">
                <Input
                  label="Filtrar por categoria"
                  type="select"
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  options={[
                    { value: '', label: 'Todas as categorias' },
                    ...INVENTORY_CATEGORIES
                  ]}
                  style={{ minWidth: '200px' }}
                />
              </div>
              {(searchTerm || filterCategory) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('');
                  }}
                  style={{ marginLeft: '8px' }}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
            
            {/* Contador de itens */}
            <div className="inventory-counter">
              <span>
                {filteredItens.length} de {itens.length} itens
                {(searchTerm || filterCategory) && ' encontrados'}
              </span>
            </div>
            
            <div className="inventory-actions">
              <div className="export-buttons">
                <Button 
                  onClick={exportarParaPDF} 
                  variant="secondary" 
                  size="sm"
                  style={{ marginRight: '8px' }}
                >
                  <span className="export-icon">📄</span>
                  Exportar PDF
                </Button>
                <Button 
                  onClick={exportarParaExcel} 
                  variant="secondary" 
                  size="sm"
                >
                  <span className="export-icon">📊</span>
                  Exportar Excel
                </Button>
              </div>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="inventory-loading">Carregando...</div>
        ) : listError ? (
          <div className="inventory-error">{listError}</div>
        ) : (
          <div className="inventory-list-container">
            {filteredItens.length === 0 ? (
              <div className="inventory-empty">
                <span>📦</span>
                <p>
                  {itens.length === 0 
                    ? 'Nenhum item encontrado.' 
                    : 'Nenhum item encontrado com os filtros aplicados.'
                  }
                </p>
                {(searchTerm || filterCategory) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('');
                    }}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className="inventory-list">
                {filteredItens.map((item) => {
                  const quantidade = Number(item.quantity_available);
                  const categoria = item.category?.toLowerCase() || '';
                  
                  // Lógica de disponibilidade
                  let isLowStock = false;
                  if (categoria.includes('instrumento') || categoria.includes('musical')) {
                    isLowStock = quantidade === 0;
                  } else {
                    isLowStock = quantidade < 2;
                    console.log('isLowStock', isLowStock);
                  }
                  
                  return (
                    <div key={item.id} className="inventory-item">
                      <div className="inventory-item-content">
                        <div className="inventory-item-header">
                          <span className="inventory-item-name">
                            {item.name}
                          </span>
                          <span className="inventory-item-category">
                            ({item.category})
                          </span>
                          <span className="inventory-item-quantity">
                            {quantidade}
                          </span>
                        </div>
                        
                        {item.last_used_at && (
                          <div className="inventory-item-usage">
                            <span className="inventory-item-last-used">
                              Última utilização: {new Date(item.last_used_at).toLocaleDateString('pt-BR')}
                            </span>
                            {item.last_used_by_name && (
                              <span className="inventory-item-last-user">
                                Por: {item.last_used_by_name}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="inventory-item-actions">
                        <Button 
                          onClick={() => buscarLogsItem(item.id, item.name)}
                          variant="secondary" 
                          size="sm"
                          className="action-button logs-button"
                          title="Histórico"
                        >
                          <FiEye size={18} className="logs-icon" />
                        </Button>
                        <Button
                          onClick={() => handleEdit(item)}
                          variant="secondary"
                          size="sm"
                          className="action-button edit-button"
                          title="Editar"
                        >
                          <FiEdit size={18} className="edit-icon" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(item)}
                          variant="secondary"
                          size="sm"
                          className="action-button delete-button"
                          title="Deletar"
                        >
                          <FiTrash2 size={18} className="delete-icon" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Logs */}
      {showLogs && (
        <div className="logs-modal-overlay" onClick={fecharLogs}>
          <div className="logs-modal-content" onClick={e => e.stopPropagation()}>
            <div className="logs-modal-header">
              <div className="logs-modal-title-section">
                <h3>Histórico de Atividades</h3>
                <p className="logs-modal-subtitle">Histórico do Item: {selectedItem?.name}</p>
              </div>
              <button className="logs-modal-close" onClick={fecharLogs}>
                <FiX size={20} />
              </button>
            </div>
            <div className="logs-modal-body">
              {loadingLogs ? (
                <div className="logs-loading">
                  <div className="loading-spinner"></div>
                  <p>Carregando histórico...</p>
                </div>
              ) : (
                <ActivityLog 
                  logs={itemLogs}
                  title={`Histórico do Item: ${selectedItem?.name}`}
                  emptyMessage="Nenhuma atividade registrada para este item."
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && editItem && (
        <Modal open={showEditModal} onClose={() => { setShowEditModal(false); setEditItem(null); setEditForm({ name: '', category: '', quantity_available: '', quantity_total: '' }); }} title="✏️ Editar Item do Inventário">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Nome do item"
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
            <Input
              label="Categoria"
              type="select"
              value={editForm.category}
              onChange={e => setEditForm({ ...editForm, category: e.target.value })}
              required
              options={[
                { value: "", label: "Selecione uma categoria" },
                ...INVENTORY_CATEGORIES
              ]}
            />
            <Input
              label="Quantidade Disponível"
              type="number"
              min={1}
              value={editForm.quantity_available}
              onChange={e => setEditForm({ ...editForm, quantity_available: e.target.value })}
              required
            />
            <Input
              label="Quantidade Total"
              type="number"
              min={1}
              value={editForm.quantity_total}
              onChange={e => setEditForm({ ...editForm, quantity_total: e.target.value })}
              required
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <Button variant="secondary" onClick={() => { setShowEditModal(false); setEditItem(null); setEditForm({ name: '', category: '', quantity_available: '', quantity_total: '' }); }}>Cancelar</Button>
              <Button variant="primary" onClick={handleSalvarEdicao}>Salvar</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Confirmação de Deleção */}
      {showDeleteModal && deleteItem && (
        <Modal open={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeleteItem(null); }} title="🗑️ Confirmar Deleção">
          <div style={{ padding: 8 }}>
            <p>Tem certeza que deseja <b>deletar</b> o item <b>{deleteItem.name}</b>?</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setDeleteItem(null); }}>Cancelar</Button>
              <Button variant="danger" onClick={handleConfirmarDelete}>Deletar</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Cadastro */}
      {showAddModal && (
        <Modal open={showAddModal} onClose={() => { setShowAddModal(false); setNome(''); setCategoria(''); setQuantidade(''); setFormError(''); setSuccessMsg(''); }} title="➕ Adicionar Item ao Inventário">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Nome do item"
              placeholder="Ex: Microfone, Projetor..."
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
            <Input
              label="Categoria"
              type="select"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              required
              options={[
                { value: "", label: "Selecione uma categoria" },
                ...INVENTORY_CATEGORIES
              ]}
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
            {formError && <div className="inventory-error">{formError}</div>}
            {successMsg && <div className="inventory-success-msg">{successMsg}</div>}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <Button variant="secondary" onClick={() => { setShowAddModal(false); setNome(''); setCategoria(''); setQuantidade(''); setFormError(''); setSuccessMsg(''); }}>Cancelar</Button>
              <Button type="submit" variant="primary" loading={loadingForm} disabled={loadingForm}>Adicionar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
} 