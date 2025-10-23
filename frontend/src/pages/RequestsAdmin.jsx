import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit, FiTrash2, FiEye, FiArrowLeft, FiPlus, FiX, FiSearch, FiPrinter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { listarRequisicoes, getRequisicaoDetalhada, criarRequisicao, deletarRequisicao, atualizarRequisicao, aprovarRequisicao, rejeitarRequisicao, verificarDisponibilidadeMateriais } from '../services/requestsService';

import { listarItensInventario } from '../services/inventoryService';
import { addToFavorites, removeFromFavorites, checkFavorite, getFavorites } from '../services/favoritesService';
import { getSalasOptions } from '../utils/salasConfig';
import { getDepartamentosOptions } from '../utils/departamentosConfig.js';
import { PRIORIDADE_OPTIONS, PRIORIDADE_DEFAULT } from '../utils/prioridadeConfig';
import { formatTimeUTC } from '../utils/dateUtils';
import './Requests.css';

export default function RequestsAdmin() {
  const [requisicoes, setRequisicoes] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalDetalhe, setModalDetalhe] = useState(false);
  const [reqDetalhe, setReqDetalhe] = useState(null);
  const [modalRejeitar, setModalRejeitar] = useState(false);
  const [rejeitarId, setRejeitarId] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    event_name: '',
    date: '',
    end_date: '',
    location: '',
    locations: [], // Array para múltiplos locais
    description: '',
    start_datetime: '',
    end_datetime: '',
    expected_audience: '',
    prioridade: PRIORIDADE_DEFAULT
  });
  
  // Estados para itens do inventário
  const [inventory, setInventory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Campo de busca
  
  // Estados para serviços solicitados
  const [selectedServices, setSelectedServices] = useState([]);
  const [showServicesModal, setShowServicesModal] = useState(false);
  
  // Estados para locais
  const [showLocationsModal, setShowLocationsModal] = useState(false);
  const [salasOptions, setSalasOptions] = useState([]);
  const [departamentosOptions, setDepartamentosOptions] = useState([]);
  
  // Estados para notificações
  const [notificacao, setNotificacao] = useState({ mensagem: '', tipo: '', mostrar: false });
  const [notificacaoModal, setNotificacaoModal] = useState({ mensagem: '', tipo: '', mostrar: false });

  // Estados para validação de disponibilidade de materiais
  const [disponibilidadeInfo, setDisponibilidadeInfo] = useState({
    temConflito: false,
    temBaixoEstoque: false,
    mensagem: '',
    materiaisIndisponiveis: [],
    materiaisBaixoEstoque: []
  });
  const [validandoDisponibilidade, setValidandoDisponibilidade] = useState(false);

  // Estados para validação de conflito em tempo real
  const [conflitoInfo, setConflitoInfo] = useState({
    temConflito: false,
    mensagem: '',
    conflitos: [],
    horariosDisponiveis: []
  });
  const [validandoConflito, setValidandoConflito] = useState(false);
  const [sugestaoAplicada, setSugestaoAplicada] = useState(false);

  // Estados para edição e deleção
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editReq, setEditReq] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReq, setDeleteReq] = useState(null);
  
  // Estados para copiar Requerimento
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyReq, setCopyReq] = useState(null);

  // Estados para favoritos
  const [favorites, setFavorites] = useState([]);
  const [favoriteStatus, setFavoriteStatus] = useState({}); // { requestId: boolean }
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const buscarRequisicoes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listarRequisicoes();
      setRequisicoes(Array.isArray(data) ? data : []);
    } catch {
      mostrarNotificacao('Erro ao buscar Requerimentos', 'erro');
    }
    setLoading(false);
  }, []);

  // Carregar locais da API
  const carregarLocais = async () => {
    try {
      const options = await getSalasOptions();
      setSalasOptions(options);
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
      // Em caso de erro, usar dados mocados
      const fallbackOptions = [
        { value: '', label: 'Selecione um local' },
        { value: 'Templo', label: '🏛️ Templo' },
        { value: 'Estúdio', label: '🎬 Estúdio' },
        { value: 'Copa', label: '🍽️ Copa' },
        { value: 'Outro', label: '📍 Outro local' }
      ];
      setSalasOptions(fallbackOptions);
    }
  };

  // Carregar departamentos da API
  const carregarDepartamentos = async () => {
    try {
      const options = await getDepartamentosOptions();
      setDepartamentosOptions(options);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
      // Em caso de erro, usar dados mocados
      const fallbackOptions = [
        { value: '', label: 'Selecione um departamento' },
        { value: 'Diaconia', label: '🤝 Diaconia' },
        { value: 'Audiovisual', label: '📹 Audiovisual' },
        { value: 'Jovens', label: '👥 Jovens' }
      ];
      setDepartamentosOptions(fallbackOptions);
    }
  };

  const checkFavoritesStatus = useCallback(async () => {
    if (requisicoes.length === 0) return;
    
    try {
      // Adicionar um pequeno delay para evitar chamadas muito rápidas
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const statusPromises = requisicoes.map(req => 
        checkFavorite(req.id).then(response => ({ id: req.id, isFavorite: response.data.is_favorite }))
      );
      const results = await Promise.all(statusPromises);
      
      const statusMap = results.reduce((acc, { id, isFavorite }) => {
        acc[id] = isFavorite;
        return acc;
      }, {});
      
      setFavoriteStatus(statusMap);
    } catch (error) {
      console.error('Erro ao verificar status dos favoritos:', error);
      // Em caso de erro, definir todos como não favoritos
      const statusMap = requisicoes.reduce((acc, req) => {
        acc[req.id] = false;
        return acc;
      }, {});
      setFavoriteStatus(statusMap);
    }
  }, [requisicoes]);

  useEffect(() => {
    buscarRequisicoes();
    carregarLocais();
    carregarDepartamentos();
  }, [buscarRequisicoes]);

  // Carregar favoritos quando a página carregar
  useEffect(() => {
    loadFavorites();
  }, []);

  // Verificar status dos favoritos quando as requisições carregarem
  useEffect(() => {
    if (requisicoes.length > 0) {
      checkFavoritesStatus();
    }
  }, [requisicoes, checkFavoritesStatus]);

  // Carregar inventário quando abrir o modal
  useEffect(() => {
    if (showAddModal) {
      carregarInventario();
    } else {
      // Limpar informações de disponibilidade quando fechar o modal
      setDisponibilidadeInfo({
        temConflito: false,
        temBaixoEstoque: false,
        mensagem: '',
        materiaisIndisponiveis: [],
        materiaisBaixoEstoque: []
      });
    }
  }, [showAddModal]);

  // Auto-hide das notificações
  useEffect(() => {
    if (notificacao.mostrar) {
      const timer = setTimeout(() => setNotificacao({ mensagem: '', tipo: '', mostrar: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [notificacao.mostrar]);

  useEffect(() => {
    if (notificacaoModal.mostrar) {
      const timer = setTimeout(() => setNotificacaoModal({ mensagem: '', tipo: '', mostrar: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [notificacaoModal.mostrar]);

  function mostrarNotificacao(mensagem, tipo) {
    setNotificacao({ mensagem, tipo, mostrar: true });
  }

  function mostrarNotificacaoModal(mensagem, tipo) {
    setNotificacaoModal({ mensagem, tipo, mostrar: true });
  }

  // Função para formatar data e hora
  const formatarDataHora = (dataString) => {
    if (!dataString) return '';
    try {
      const date = new Date(dataString);
      // Formato dia/mês/ano em vez de ano/mês/dia
      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const ano = date.getFullYear();
      const data = `${dia}/${mes}/${ano}`;
      const hora = formatTimeUTC(dataString);
      return `${data} ${hora}`;
    } catch {
      return '';
    }
  };

  async function carregarInventario() {
    try {
      const data = await listarItensInventario();
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar inventário:', err);
    }
  }

  // Função para verificar disponibilidade de materiais em tempo real
  const verificarDisponibilidadeTempoReal = async (itens) => {
    if (!itens || itens.length === 0) {
      setDisponibilidadeInfo({
        temConflito: false,
        temBaixoEstoque: false,
        mensagem: '',
        materiaisIndisponiveis: [],
        materiaisBaixoEstoque: []
      });
      return;
    }

    setValidandoDisponibilidade(true);
    try {
      // Preparar informações de data se disponíveis
      const dataInfo = formData.date && formData.start_datetime && formData.end_datetime ? {
        date: formData.date,
        start_datetime: formData.start_datetime,
        end_datetime: formData.end_datetime
      } : null;

      const resultado = await verificarDisponibilidadeMateriais(itens, dataInfo);

      setDisponibilidadeInfo({
        temConflito: resultado.temConflito,
        temBaixoEstoque: resultado.temBaixoEstoque,
        mensagem: resultado.message,
        materiaisIndisponiveis: resultado.materiaisIndisponiveis || [],
        materiaisBaixoEstoque: resultado.materiaisBaixoEstoque || []
      });
    } catch (err) {
      console.error('Erro ao verificar disponibilidade de materiais:', err);
      setDisponibilidadeInfo({
        temConflito: false,
        temBaixoEstoque: false,
        mensagem: '',
        materiaisIndisponiveis: [],
        materiaisBaixoEstoque: []
      });
    } finally {
      setValidandoDisponibilidade(false);
    }
  };

  // Função para verificar conflitos em tempo real
  const verificarConflitoTempoReal = async (date, location, start_time, end_time) => {
    
    // Verificar se todos os campos necessários estão preenchidos
    if (!date || !location || !start_time || !end_time) {
      setConflitoInfo({
        temConflito: false,
        mensagem: '',
        conflitos: [],
        horariosDisponiveis: []
      });
      return;
    }

    // Se uma sugestão foi aplicada, pular verificação
    if (sugestaoAplicada) {
      return;
    }

    setValidandoConflito(true);

    try {
      const response = await fetch(`http://localhost:3000/api/requests/check-realtime-conflicts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          date,
          location,
          start_time,
          end_time
        })
      });

      const result = await response.json();

      if (result.success) {
        setConflitoInfo({
          temConflito: result.temConflito,
          mensagem: result.mensagem || 'Conflito de horário detectado!',
          conflitos: result.conflitos || [],
          horariosDisponiveis: result.horariosDisponiveis || []
        });
      } else {
        console.error('Erro na verificação de conflitos:', result.message);
        setConflitoInfo({
          temConflito: false,
          mensagem: '',
          conflitos: [],
          horariosDisponiveis: []
        });
      }
    } catch (err) {
      console.error('Erro na verificação de conflitos:', err);
      setConflitoInfo({
        temConflito: false,
        mensagem: '',
        conflitos: [],
        horariosDisponiveis: []
      });
    } finally {
      setValidandoConflito(false);
    }
  };

  const adicionarItem = (item) => {
    const itemExistente = selectedItems.find(i => i.id === item.id);
    if (itemExistente) {
      // Verificar se já está no limite máximo
      if (itemExistente.quantity >= item.quantity_available) {
        mostrarNotificacao(`Quantidade máxima disponível para ${item.name} é ${item.quantity_available}`, 'erro');
        return;
      }
      alterarQuantidade(item.id, itemExistente.quantity + 1);
    } else {
      const novoItem = {
        id: item.id,
        name: item.name,
        quantity: 1,
        inventory_id: item.id,
        item_name: item.name,
        quantity_requested: 1,
        quantity_available: item.quantity_available
      };
      const novosItens = [...selectedItems, novoItem];
      setSelectedItems(novosItens);
      
      // Verificar disponibilidade em tempo real
      verificarDisponibilidadeTempoReal(novosItens);
    }
  };

  const removerItem = (itemId) => {
    const novosItens = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(novosItens);
    
    // Verificar disponibilidade em tempo real
    verificarDisponibilidadeTempoReal(novosItens);
  };

  const alterarQuantidade = (itemId, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removerItem(itemId);
      return;
    }
    
    // Buscar o item no inventário para verificar a quantidade disponível
    const itemInventario = inventory.find(inv => inv.id === itemId);
    if (itemInventario && novaQuantidade > itemInventario.quantity_available) {
      // Não permitir quantidade maior que a disponível
      mostrarNotificacao(`Quantidade máxima disponível para ${itemInventario.name} é ${itemInventario.quantity_available}`, 'erro');
      return;
    }
    
    const novosItens = selectedItems.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            quantity: novaQuantidade,
            quantity_requested: novaQuantidade
          }
        : item
    );
    setSelectedItems(novosItens);
    
    // Verificar disponibilidade em tempo real
    verificarDisponibilidadeTempoReal(novosItens);
  };

  // Funções para gerenciar múltiplos locais
  const toggleLocation = (locationValue) => {
    setFormData(prev => {
      const newLocations = prev.locations.includes(locationValue)
        ? prev.locations.filter(loc => loc !== locationValue)
        : [...prev.locations, locationValue];
      
      // Manter compatibilidade com location único
      const newLocation = newLocations.length === 1 ? newLocations[0] : 
                         newLocations.length > 1 ? newLocations.join(', ') : '';
      
      return {
        ...prev,
        locations: newLocations,
        location: newLocation
      };
    });
  };

  // Função para remover um local específico
  const removeLocation = (locationToRemove) => {
    setFormData(prev => {
      const newLocations = prev.locations.filter(loc => loc !== locationToRemove);
      
      // Manter compatibilidade com location único
      const newLocation = newLocations.length === 1 ? newLocations[0] : 
                         newLocations.length > 1 ? newLocations.join(', ') : '';
      
      return {
        ...prev,
        locations: newLocations,
        location: newLocation
      };
    });
  };

  // Funções para gerenciar favoritos
  const toggleFavorite = async (requestId) => {
    try {
      const isFavorite = favoriteStatus[requestId];
      
      if (isFavorite) {
        await removeFromFavorites(requestId);
        setFavoriteStatus(prev => ({ ...prev, [requestId]: false }));
        mostrarNotificacao('Requerimento removido dos favoritos', 'sucesso');
      } else {
        await addToFavorites(requestId);
        setFavoriteStatus(prev => ({ ...prev, [requestId]: true }));
        mostrarNotificacao('Requerimento adicionado aos favoritos', 'sucesso');
      }
      
      // Recarregar lista de favoritos com delay
      setTimeout(() => {
        loadFavorites();
      }, 200);
      
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
      mostrarNotificacao('Erro ao alterar favorito', 'erro');
    }
  };

  const loadFavorites = async () => {
    try {
      // Adicionar um pequeno delay para evitar chamadas muito rápidas
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await getFavorites();
      setFavorites(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      // Em caso de erro, definir lista vazia
      setFavorites([]);
    }
  };

  // Funções para gerenciar serviços
  const adicionarServico = (tipo, quantidade) => {
    const servicoExistente = selectedServices.find(s => s.tipo === tipo);
    if (servicoExistente) {
      alterarQuantidadeServico(tipo, servicoExistente.quantidade + quantidade);
    } else {
      const novoServico = {
        tipo,
        quantidade,
        nome: getNomeServico(tipo)
      };
      setSelectedServices([...selectedServices, novoServico]);
    }
  };

  const removerServico = (tipo) => {
    setSelectedServices(selectedServices.filter(s => s.tipo !== tipo));
  };

  const alterarQuantidadeServico = (tipo, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removerServico(tipo);
      return;
    }
    
    setSelectedServices(selectedServices.map(servico => 
      servico.tipo === tipo 
        ? { ...servico, quantidade: novaQuantidade }
        : servico
    ));
  };

  const getNomeServico = (tipo) => {
    const nomes = {
      'DIACONIA': 'Diaconia',
      'SERVICO_GERAL': 'Serviços Gerais',
      'AUDIOVISUAL': 'Audiovisual',
      'SEGURANCA': 'Segurança'
    };
    return nomes[tipo] || tipo;
  };

  function filtrar(requisicoes) {
    return requisicoes.filter(r => {
      if (filtroStatus && r.status !== filtroStatus) return false;
      if (filtroDepartamento && !(r.department || '').toLowerCase().includes(filtroDepartamento.toLowerCase())) return false;
      if (filtroData && r.date !== filtroData) return false;
      return true;
    });
  }

  async function abrirDetalhe(id) {
    try {
      const detalhe = await getRequisicaoDetalhada(id);
      console.log('🔍 Dados do requerimento:', detalhe);
      console.log('🔍 Itens:', detalhe.itens);
      console.log('🔍 Serviços:', detalhe.servicos);
      setReqDetalhe(detalhe);
      setModalDetalhe(true);
    } catch {
      mostrarNotificacao('Erro ao buscar detalhes', 'erro');
    }
  }

  async function aprovar(id) {
    try {
      const resultado = await aprovarRequisicao(id);
      
      // Verificar se há conflitos
      if (resultado.tipoConflito) {
        if (resultado.tipoConflito === 'DIRETO') {
          mostrarNotificacao('Não é possível aprovar. Existe conflito direto de horário.', 'erro');
          mostrarNotificacaoModal('Não é possível aprovar. Existe conflito direto de horário.', 'erro');
        } else if (resultado.tipoConflito === 'INTERVALO') {
          mostrarNotificacao('Requisição marcada como PENDENTE_CONFLITO devido a conflito de intervalo.', 'aviso');
          mostrarNotificacaoModal('Requisição marcada como PENDENTE_CONFLITO devido a conflito de intervalo.', 'aviso');
        }
      } else {
        mostrarNotificacao(`Requisição aprovada por ${user?.name || 'Administrador'}!`, 'sucesso');
        mostrarNotificacaoModal(`Requisição aprovada por ${user?.name || 'Administrador'}!`, 'sucesso');
      }
      
      buscarRequisicoes();
      setModalDetalhe(false);
    } catch (err) {
      try {
        // Tentar parsear o erro como JSON para verificar se há conflitos
        const errorData = JSON.parse(err.message);
        if (errorData.tipoConflito) {
          if (errorData.tipoConflito === 'DIRETO') {
            mostrarNotificacao('Não é possível aprovar. Existe conflito direto de horário.', 'erro');
            mostrarNotificacaoModal('Não é possível aprovar. Existe conflito direto de horário.', 'erro');
          } else if (errorData.tipoConflito === 'INTERVALO') {
            mostrarNotificacao('Requisição marcada como PENDENTE_CONFLITO devido a conflito de intervalo.', 'aviso');
            mostrarNotificacaoModal('Requisição marcada como PENDENTE_CONFLITO devido a conflito de intervalo.', 'aviso');
          }
        } else {
          mostrarNotificacao(errorData.message || 'Erro ao aprovar Requerimento', 'erro');
          mostrarNotificacaoModal(errorData.message || 'Erro ao aprovar Requerimento', 'erro');
        }
      } catch {
        // Se não conseguir parsear como JSON, mostrar erro genérico
        mostrarNotificacao('Erro ao aprovar Requerimento', 'erro');
        mostrarNotificacaoModal('Erro ao aprovar Requerimento', 'erro');
      }
    }
  }

  function abrirRejeitar(id) {
    setRejeitarId(id);
    setMotivoRejeicao('');
    setModalRejeitar(true);
  }

  async function rejeitar() {
    try {
      await rejeitarRequisicao(rejeitarId, motivoRejeicao);
      mostrarNotificacao(`Requisição rejeitada por ${user?.name || 'Administrador'}!`, 'sucesso');
      buscarRequisicoes();
      setModalRejeitar(false);
      setModalDetalhe(false);
    } catch {
      mostrarNotificacao('Erro ao rejeitar Requerimento', 'erro');
    }
  }

  // Função para editar Requerimento
  const handleEdit = async (id) => {
    try {
      const detalhe = await getRequisicaoDetalhada(id);
      
      // Processar locais para múltipla seleção
      if (detalhe.location) {
        const locations = detalhe.location.includes(',') 
          ? detalhe.location.split(',').map(loc => loc.trim())
          : [detalhe.location];
        detalhe.locations = locations;
      } else {
        detalhe.locations = [];
      }
      
      setEditReq(detalhe);
      setEditModalOpen(true);
    } catch {
      mostrarNotificacao('Erro ao carregar dados para edição', 'erro');
    }
  };

  // Função para salvar edição
  const handleEditSave = async () => {
    if (!editReq) return;
    
    try {
      // Validar campos obrigatórios
      const camposObrigatorios = ['department', 'event_name', 'date'];
      const camposVazios = camposObrigatorios.filter(campo => !editReq[campo]);
      
      // Validar se pelo menos um local foi selecionado
      if (!editReq.locations || editReq.locations.length === 0) {
        mostrarNotificacao('Selecione pelo menos um local para o evento', 'erro');
        return;
      }
      
      if (camposVazios.length > 0) {
        mostrarNotificacao(`Campos obrigatórios vazios: ${camposVazios.join(', ')}`, 'erro');
        return;
      }
      
      // Criar objeto limpo para envio
      const dataToSend = {
        department: editReq.department || '',
        event_name: editReq.event_name || '',
        location: editReq.location || '',
        locations: editReq.locations || [],
        description: editReq.description || '',
        date: editReq.date || '',
        end_date: editReq.end_date || '',
        expected_audience: editReq.expected_audience || 0,
        prioridade: editReq.prioridade || 'Média'
      };
      
      // Processar datas corretamente
      if (editReq.date) {
        // Limpar e processar start_datetime
        if (editReq.start_datetime) {
          // Se já tem data duplicada, extrair apenas a parte final
          if (editReq.start_datetime.includes('T') && editReq.start_datetime.split('T').length > 2) {
            const parts = editReq.start_datetime.split('T');
            dataToSend.start_datetime = `${parts[parts.length - 2]}T${parts[parts.length - 1]}`;
          } else if (editReq.start_datetime.includes('T')) {
            // Se é um datetime válido, usar como está
            dataToSend.start_datetime = editReq.start_datetime;
          } else if (editReq.date && editReq.start_datetime) {
            // Se é apenas hora, combinar com a data
            dataToSend.start_datetime = `${editReq.date}T${editReq.start_datetime}`;
          }
        }
        
        // Limpar e processar end_datetime
        if (editReq.end_datetime) {
          // Se já tem data duplicada, extrair apenas a parte final
          if (editReq.end_datetime.includes('T') && editReq.end_datetime.split('T').length > 2) {
            const parts = editReq.end_datetime.split('T');
            dataToSend.end_datetime = `${parts[parts.length - 2]}T${parts[parts.length - 1]}`;
          } else if (editReq.end_datetime.includes('T')) {
            // Se é um datetime válido, usar como está
            dataToSend.end_datetime = editReq.end_datetime;
          } else if (editReq.end_date && editReq.end_datetime) {
            // Se é apenas hora, combinar com a data final
            dataToSend.end_datetime = `${editReq.end_date}T${editReq.end_datetime}`;
          } else if (editReq.date && editReq.end_datetime) {
            // Se é apenas hora, combinar com a data de início
            dataToSend.end_datetime = `${editReq.date}T${editReq.end_datetime}`;
          }
        }
      }
      
      // Adicionar itens e serviços ao dataToSend
      if (editReq.itens && editReq.itens.length > 0) {
        dataToSend.request_items = editReq.itens.map(item => ({
          id: item.id,
          inventory_id: item.inventory_id,
          item_name: item.item_name || item.inventory?.name,
          quantity_requested: item.quantity_requested || item.quantity || 1,
          description: item.description || ''
        }));
      }
      
      if (editReq.servicos && editReq.servicos.length > 0) {
        dataToSend.request_services = editReq.servicos.map(service => ({
          id: service.id,
          tipo: service.tipo,
          quantidade: service.quantidade || 1,
          nome: service.nome || service.tipo
        }));
      }
      
      console.log('📝 Dados para atualização:', dataToSend);
      
      // Atualizar a Requerimento com itens e serviços
      await atualizarRequisicao(editReq.id, dataToSend);
      
      mostrarNotificacao('Requisição atualizada com sucesso!', 'sucesso');
      setEditModalOpen(false);
      setEditReq(null);
      buscarRequisicoes();
    } catch (err) {
      console.error('❌ Erro ao atualizar Requerimento:', err);
      mostrarNotificacao(`Erro ao atualizar Requerimento: ${err.message}`, 'erro');
    }
  };

  // Função para deletar Requerimento
  const handleDelete = (id) => {
    setDeleteReq(id);
    setDeleteModalOpen(true);
  };

  // Função para confirmar deleção
  const handleDeleteConfirm = async () => {
    if (!deleteReq) return;
    
    try {
      await deletarRequisicao(deleteReq);
      mostrarNotificacao('Requisição deletada com sucesso!', 'sucesso');
      setDeleteModalOpen(false);
      setDeleteReq(null);
      
      // Remover o item da lista localmente em vez de buscar novamente
      setRequisicoes(prevRequisicoes => 
        prevRequisicoes.filter(req => req.id !== deleteReq)
      );
    } catch {
      mostrarNotificacao('Erro ao deletar Requerimento', 'erro');
    }
  };

  // Função para copiar Requerimento
  const handleCopyRequest = async (id) => {
    try {
      const detalhe = await getRequisicaoDetalhada(id);
      setCopyReq(detalhe);
      setCopyModalOpen(true);
    } catch {
      mostrarNotificacao('Erro ao buscar detalhes da Requerimento', 'erro');
    }
  };

  // Função para confirmar cópia
  const handleCopyConfirm = (requestData = null) => {
    const dataToCopy = requestData || copyReq;
    if (!dataToCopy) return;
    
    // Se for um favorito, usar os dados do request
    const sourceData = dataToCopy.request || dataToCopy;
    
    // Preencher o formulário com os dados copiados
    setFormData({
      department: sourceData.department || '',
      event_name: `${sourceData.event_name || ''} (Cópia)`,
      date: '',
      end_date: '',
      location: sourceData.location || '',
      locations: sourceData.location ? [sourceData.location] : [],
      description: sourceData.description || '',
      start_datetime: '',
      end_datetime: '',
      expected_audience: sourceData.expected_audience || '',
      prioridade: sourceData.prioridade || PRIORIDADE_DEFAULT
    });
    
    // Copiar itens do inventário
    setSelectedItems(sourceData.itens || []);
    
    // Copiar serviços
    setSelectedServices(sourceData.servicos || []);
    
    // Fechar modal de cópia e abrir modal de adicionar
    setCopyModalOpen(false);
    setCopyReq(null);
    setShowAddModal(true);
    
    mostrarNotificacao('Dados copiados com sucesso! Preencha a nova data e horário.', 'sucesso');
  };

  // Função para imprimir Requerimento
  const handlePrint = async (id) => {
    try {
      const detalhe = await getRequisicaoDetalhada(id);
      generatePDF(detalhe);
    } catch {
      mostrarNotificacao('Erro ao buscar detalhes da Requerimento para impressão', 'erro');
    }
  };

  // Função para gerar PDF
  const generatePDF = (requisicao) => {
    // Criar um novo documento HTML para impressão
    const printWindow = window.open('', '_blank');
    
    // Formatar data para o padrão brasileiro
    const formatarData = (data) => {
      if (!data) return '';
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    };

    // Formatar horário
    const formatarHorario = (data) => {
      if (!data) return '';
      const date = new Date(data);
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Formatar data de solicitação (data atual)
    const dataSolicitacao = formatarData(new Date());
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Requerimento para Evento - ${requisicao.event_name}</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 0;
            background: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
            padding: 20px;
          }
          
          .a4-container {
            width: 210mm;
            min-height: 297mm;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            padding: 20mm;
            box-sizing: border-box;
          }
          
          .header {
            text-align: center;
            margin-bottom: 25px;
          }
          
          .title {
            font-size: 18px;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: 0 0 8px 0;
          }
          
          .instruction {
            font-size: 10px;
            color: #333;
            margin-bottom: 20px;
            font-weight: normal;
            margin: 0 0 20px 0;
          }
          
          .form-section {
            margin-bottom: 20px;
          }
          
          .form-row {
            display: flex;
            margin-bottom: 12px;
            align-items: center;
            min-height: 20px;
          }
          
          .form-row-inline {
            display: flex;
            margin-bottom: 12px;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
          }
          
          .form-field {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 200px;
          }
          
          /* Campos com 2 itens por linha */
          .form-field-2 {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 300px;
          }
          
          /* Campos com 3 itens por linha */
          .form-field-3 {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 200px;
          }
          
          .form-label {
            font-weight: bold !important;
            min-width: 100px;
            margin-right: 0px;
            font-size: 11px;
            white-space: nowrap;
          }
          
          /* Labels para 2 itens por linha */
          .form-label-2 {
            font-weight: bold !important;
            min-width: 100px;
            margin-right: 0px;
            font-size: 11px;
            white-space: nowrap;
          }
          
          /* Labels para 3 itens por linha */
          .form-label-3 {
            font-weight: bold !important;
            min-width: 80px;
            margin-right: 0px;
            font-size: 11px;
            white-space: nowrap;
          }
          
          /* Classe específica para LÍDER - aproximar da resposta */
          .form-label-lider {
            font-weight: bold !important;
            min-width: 60px;
            margin-right: 0px;
            font-size: 11px;
            white-space: nowrap;
          }
          
          /* Classe específica para margin-bottom do SOLICITAÇÕES */
          .solicitacoes-margin {
            margin-bottom: 15px !important;
          }
          
          /* Classe específica para margin-bottom da última linha do Parecer IBVA */
          .parecer-ibva-margin {
            margin-bottom: 15px !important;
          }
          
          /* Classe mais específica para forçar o margin-bottom */
          .signature-row.parecer-ibva-margin {
            margin-bottom: 15px !important;
            padding-bottom: 15px !important;
          }
          
          /* Regra universal para qualquer elemento com essa classe */
          *[class*="parecer-ibva-margin"] {
            margin-bottom: 15px !important;
            padding-bottom: 15px !important;
          }
          
          /* Classes específicas para evitar quebra de texto e ajustar tamanhos */
          .print-signature-title {
            white-space: nowrap !important;
            font-weight: bold !important;
          }
          
          .data-solicitacao-field {
            min-width: 80px !important;
            max-width: 120px !important;
          }
          
          /* Classe para data sem linha, bem próxima dos dois pontos */
          .data-solicitacao-simples {
            display: inline !important;
            margin-left: 5px !important;
            font-weight: normal !important;
            border: none !important;
            background: none !important;
          }
          
          /* Classe para assinatura do solicitante na mesma linha */
          .assinatura-solicitante-inline {
            display: inline-block !important;
            margin-left: 5px !important;
            min-width: 200px !important;
            border-bottom: 1px solid #000 !important;
            height: 18px !important;
          }
          
          /* Classe para margin-top do SOLICITADO */
          .solicitado-margin-top {
            margin-top: 50px !important;
          }
          
          /* Ajustar espaçamentos entre textos */
          .signature-row {
            margin-bottom: 10px !important;
          }
          
          .print-signature-title {
            margin-bottom: 8px !important;
          }
          
          /* Reduzir espaçamento específico entre DATA DA SOLICITAÇÃO e ASSINATURA DO SOLICITANTE */
          .signature-row.parecer-ibva-margin {
            margin-bottom: 0px !important;
            padding-bottom: 0px !important;
          }
          
          /* Classe específica para reduzir ainda mais o espaçamento */
          .assinatura-solicitante-container {
            margin-top: 0px !important;
            padding-top: 0px !important;
          }
          
          /* Ajustar alinhamento das opções de solicitação */
          .solicitation-method {
            display: inline !important;
            margin-left: 5px !important;
          }
          
          .method-option {
            margin-right: 15px !important;
          }
          
          /* Ajustar tamanho e espaçamento do logo IBVA */
          .logo {
            margin-top: 20px !important;
            text-align: center !important;
          }
          
          .logo h1, .logo > div:first-child {
            font-size: 14px !important;
            font-weight: bold !important;
            color: #000 !important;
            margin: 0 !important;
          }
          
          .logo-full {
            font-size: 18px !important;
            font-weight: normal !important;
            color: #000 !important;
            margin-top: 100px !important;
            text-transform: uppercase !important;
          }
          
          .assinatura-lider-field {
            min-width: 200px !important;
            flex: 1 !important;
          }
          
          .form-value {
            flex: 1;
            border-bottom: 1px solid #000;
            padding: 2px 5px;
            min-height: 18px;
            font-size: 13px;
            font-weight: 500;
            margin-right: 8px;
          }
          
          .checkbox {
            font-size: 14px;
            color: #000;
            margin-left: 5px;
          }
          
          .requests-section {
            margin: 25px 0;
          }
          
          .requests-title {
            font-weight: bold !important;
            margin-bottom: 15px;
            text-decoration: underline;
            font-size: 12px;
          }
          
          .requests-container {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            width: 100%;
          }
          
          .request-item {
            margin-bottom: 2px;
            padding-left: 15px;
            font-size: 13px;
            font-weight: 500;
            line-height: 1.2;
            flex: 1;
            min-width: 45%;
            max-width: 48%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .signature-section {
            margin-top: 40px;
          }
          
          .signature-row {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            gap: 10px;
          }
          
          .signature-line {
            border-bottom: 1px solid #000;
            margin-bottom: 15px;
            height: 18px;
            width: 100%;
          }
          
          .signature-label {
            font-size: 12px;
            margin-bottom: 5px;
            font-weight: bold !important;
          }
          
          .solicitation-method {
            margin: 8px 0;
            font-size: 10px;
          }
          
          /* Forçar negrito em todos os títulos */
          .form-label,
          .requests-title,
          .signature-label,
          .print-section-title,
          .print-signature-title {
            font-weight: bold !important;
          }
          
          .method-option {
            margin-right: 15px;
          }
          
          .logo {
            text-align: center;
            margin-top: 40px;
            font-size: 18px;
            font-weight: bold;
            color: #0066cc;
          }
          
          .logo-full {
            font-size: 9px;
            margin-top: 3px;
            color: #333;
            font-weight: normal;
          }
          
          .date-input {
            width: 80px;
            border-bottom: 1px solid #000;
            text-align: center;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="a4-container">
          <div class="header">
          <h1 class="print-main-title">REQUERIMENTO PARA EVENTO</h1>
          <p class="instruction">ESTE DOCUMENTO DEVERÁ SER ENTREGUE TENDO UM PRAZO MÍNIMO DE 10 DIAS ANTES DO EVENTO.</p>
        </div>
        
        <div class="form-section">
          <!-- Solicitante e Líder na mesma linha -->
          <div class="form-row-inline">
            <div class="form-field-2">
              <span class="form-label-2">SOLICITANTE:</span>
              <span class="form-value">${requisicao.user?.name || 'N/A'}</span>
            </div>
            <div class="form-field-2">
              <span class="form-label-lider">LÍDER:</span>
              <span class="form-value">${requisicao.user?.name || 'N/A'}</span>
            </div>
          </div>
          
          <!-- Departamento -->
          <div class="form-row">
            <span class="form-label">DEPARTAMENTO:</span>
            <span class="form-value">${requisicao.department || 'N/A'}</span>
          </div>
          
          <!-- Evento -->
          <div class="form-row">
            <span class="form-label">EVENTO:</span>
            <span class="form-value">${requisicao.event_name || 'N/A'}</span>
          </div>
          
          <!-- Data de Início, Data Final e Horário -->
          <div class="form-row-inline">
            <div class="form-field-3">
              <span class="form-label-3">DATA DE INÍCIO:</span>
              <span class="form-value">${formatarData(requisicao.start_datetime || requisicao.date)}</span>
            </div>
            <div class="form-field-3">
              <span class="form-label-3">DATA FINAL:</span>
              <span class="form-value">${requisicao.end_date ? formatarData(requisicao.end_date) : formatarData(requisicao.start_datetime || requisicao.date)}</span>
            </div>
            <div class="form-field-3">
              <span class="form-label-3">HORÁRIO:</span>
              <span class="form-value">
                <span>${formatarHorario(requisicao.start_datetime)}</span>
                ${requisicao.end_datetime ? '<span>-</span><span>' + formatarHorario(requisicao.end_datetime) + '</span>' : ''}
              </span>
            </div>
          </div>
          
          <!-- Público Previsto em linha separada -->
          <div class="form-row-inline">
            <div class="form-field-3">
              <span class="form-label-3">PÚBLICO PREVISTO:</span>
              <span class="form-value">${requisicao.expected_audience || 'N/A'}</span>
            </div>
          </div>
          
          <!-- Local do Evento -->
          <div class="form-row">
            <span class="form-label">LOCAL${requisicao.location && requisicao.location.includes(',') ? 'IS' : ''} DO EVENTO:</span>
            <span class="form-value">${requisicao.location || 'N/A'}</span>
          </div>
        </div>
        
        <div class="requests-section">
          <div class="print-section-title solicitacoes-margin">SOLICITAÇÕES:</div>
          <div class="requests-container">
            ${requisicao.itens && requisicao.itens.length > 0 ? 
              requisicao.itens.map((item, index) => `
                <div class="request-item">
                  ${index + 1}. ${item.item_name || item.inventory?.name || 'Item'} - Qtd: ${item.quantity_requested || item.quantity || 1}
                  ${item.description ? ` (${item.description})` : ''}
                </div>
              `).join('') : ''
            }
            ${requisicao.servicos && requisicao.servicos.length > 0 ? 
              requisicao.servicos.map((servico, index) => `
                <div class="request-item">
                  ${(requisicao.itens?.length || 0) + index + 1}. ${servico.nome || servico.tipo} - Qtd: ${servico.quantidade || 1}
                </div>
              `).join('') : ''
            }
          </div>
        </div>
        
        <div class="signature-section">
          <div class="print-signature-title">PARECER IBVA:</div>
          <div class="signature-line"></div>
          <div class="signature-line"></div>
          <div class="signature-line"></div>
          <div class="signature-line"></div>
          
          <div class="signature-row solicitado-margin-top">
            <div class="print-signature-title">SOLICITADO: <span class="solicitation-method">
              <span class="method-option">WHATS APP ( )</span>
              <span class="method-option">EMAIL ( )</span>
              <span class="method-option">PESSOALMENTE (☑)</span>
            </span></div>
          </div>
          
          <div class="signature-row parecer-ibva-margin">
            <div class="print-signature-title">DATA DA SOLICITAÇÃO: <span class="data-solicitacao-simples">${dataSolicitacao}</span></div>
            <div class="print-signature-title print-signature-label-spaced">ASSINATURA DO LÍDER:</div>
            <div class="signature-line print-signature-line-flex assinatura-lider-field"></div>
          </div>
          
          <div class="print-signature-title assinatura-solicitante-container">ASSINATURA DO SOLICITANTE: <span class="assinatura-solicitante-inline"></span></div>
          
          <div class="signature-row">
            <div class="print-signature-title">AUTORIZADO POR:</div>
            <div class="signature-line print-signature-line-flex print-signature-line-margin"></div>
            <div class="print-signature-title">ASSINATURA DA SECRETÁRIA:</div>
            <div class="signature-line print-signature-line-flex"></div>
          </div>
        </div>
        
        <div class="logo">
          IBVA
          <div class="logo-full">Igreja Batista Vilas do Atlantico</div>
        </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Aguardar o conteúdo carregar
    printWindow.onload = function() {
      // Abrir diretamente o diálogo de impressão
      printWindow.print();
      printWindow.close();
    };
  };

  // Função para editar campo
  const handleEditField = (field, value) => {
    if (editReq) {
      setEditReq({ ...editReq, [field]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validar se pelo menos um local foi selecionado
      if (formData.locations.length === 0) {
        mostrarNotificacao('Selecione pelo menos um local para o evento', 'erro');
        setLoading(false);
        return;
      }

      // Combinar data com horas para criar datetime completo
      const dataToSend = { ...formData };
      
      if (formData.date && formData.start_datetime) {
        dataToSend.start_datetime = `${formData.date}T${formData.start_datetime}`;
      }
      
      if (formData.end_date && formData.end_datetime) {
        dataToSend.end_datetime = `${formData.end_date}T${formData.end_datetime}`;
      } else if (formData.date && formData.end_datetime) {
        dataToSend.end_datetime = `${formData.date}T${formData.end_datetime}`;
      }
      
      // Adicionar itens selecionados
      dataToSend.itens = selectedItems.map(item => ({
        inventory_id: item.id,
        item_name: item.name,
        quantity_requested: item.quantity
      }));

      // Adicionar serviços solicitados
      dataToSend.servicos = selectedServices.map(servico => ({
        tipo: servico.tipo,
        quantidade: servico.quantidade,
        nome: servico.nome
      }));
      
      await criarRequisicao(dataToSend);
      mostrarNotificacao('Requisição criada com sucesso!', 'sucesso');
      setShowAddModal(false);
      setFormData({
        department: '',
        event_name: '',
        date: '',
        end_date: '',
        location: '',
        locations: [],
        description: '',
        start_datetime: '',
        end_datetime: '',
        expected_audience: '',
        prioridade: PRIORIDADE_DEFAULT
      });
      setSelectedItems([]); // Limpar itens selecionados
      setSelectedServices([]); // Limpar serviços selecionados
      buscarRequisicoes();
    } catch {
      mostrarNotificacao('Erro ao criar Requerimento', 'erro');
    }
    setLoading(false);
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

  // Função para filtrar itens do inventário baseado na busca
  const filteredInventory = inventory.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  });

  // Função para calcular quantidade disponível atualizada para um item
  const getQuantidadeDisponivelAtualizada = (item) => {
    const itemSelecionado = selectedItems.find(selected => selected.id === item.id);
    if (itemSelecionado) {
      return item.quantity_available - itemSelecionado.quantity;
    }
    return item.quantity_available;
  };

  // Função para verificar se o botão deve estar desabilitado
  const isBotaoDesabilitado = (item) => {
    const quantidadeDisponivel = getQuantidadeDisponivelAtualizada(item);
    return quantidadeDisponivel <= 0;
  };

  // Função para obter texto da quantidade disponível
  const getTextoQuantidadeDisponivel = (item) => {
    const quantidadeDisponivel = getQuantidadeDisponivelAtualizada(item);
    const itemSelecionado = selectedItems.find(selected => selected.id === item.id);
    
    if (itemSelecionado) {
      return `Disponível: ${quantidadeDisponivel} (${itemSelecionado.quantity} selecionado${itemSelecionado.quantity > 1 ? 's' : ''})`;
    }
    return `Disponível: ${quantidadeDisponivel}`;
  };

  // Função para obter cor da quantidade disponível
  const getCorQuantidadeDisponivel = (item) => {
    const quantidadeDisponivel = getQuantidadeDisponivelAtualizada(item);
    if (quantidadeDisponivel <= 0) {
      return '#dc2626'; // Vermelho
    } else if (quantidadeDisponivel <= 2) {
      return '#f59e0b'; // Amarelo/Laranja
    }
    return '#059669'; // Verde
  };

  return (
    <div className="requests-page">
      {/* Botão Voltar */}
      <div className="requests-header-top">
        <Button
          variant="primary"
          size="sm"
          onClick={handleVoltar}
        >
          <FiArrowLeft size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Voltar
        </Button>
      </div>

      {/* Notificação da página */}
      {notificacao.mostrar && (
        <div className={`notificacao ${notificacao.tipo}`}>
          {notificacao.mensagem}
        </div>
      )}

      <div className="card requests-list-card">
        <div className="requests-header">
          <h2 className="requests-list-title">Gerenciar Requerimentos</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setShowAddModal(true)}
              className="add-request-btn"
            >
              + Adicionar Requerimento
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => {
                loadFavorites();
                setShowFavoritesModal(true);
              }}
              className="favorites-btn"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              ⭐ Favoritos ({favorites.length})
            </Button>
          </div>
        </div>
        <div className="filters-section">
          <h3 className="filters-title">Filtros</h3>
          <div className="filters-container">
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select 
                value={filtroStatus} 
                onChange={e => setFiltroStatus(e.target.value)} 
                className="filter-select"
                required
              >
                <option value="">Selecione um status</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PENDENTE_CONFLITO">Em Conflito</option>
                <option value="APTO">Apto</option>
                <option value="EXECUTADO">Executado</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="REJEITADO">Rejeitado</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Departamento</label>
              <select
                value={filtroDepartamento}
                onChange={e => setFiltroDepartamento(e.target.value)}
                className="filter-select"
              >
                <option value="">Selecione um departamento</option>
                {departamentosOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Data</label>
              <input
                type="date"
                value={filtroData}
                onChange={e => setFiltroData(e.target.value)}
                placeholder="Selecione uma data"
                className="filter-input"
              />
            </div>
            
            <div className="filter-actions">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => {
                  setFiltroStatus('');
                  setFiltroDepartamento('');
                  setFiltroData('');
                }}
                className="clear-filters-btn"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="requests-loading">Carregando...</div>
        ) : filtrar(requisicoes).length === 0 ? (
          <div className="requests-empty">
            <span>📋</span>
            <p>Nenhuma Requerimento encontrada.</p>
          </div>
        ) : (
          <div className="requests-list-container">
            {filtrar(requisicoes).map((req) => (
              <div key={req.id} className="request-item" style={{ position: 'relative' }}>
                {/* Coração de favorito no canto superior direito */}
                <button 
                  onClick={() => toggleFavorite(req.id)}
                  className="favorite-heart"
                  title={favoriteStatus[req.id] ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: favoriteStatus[req.id] ? '#ef4444' : '#d1d5db',
                    transition: 'color 0.2s, transform 0.2s',
                    zIndex: 10,
                    padding: '4px',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  {favoriteStatus[req.id] ? '❤️' : '🤍'}
                </button>
                
                <div className="request-item-content">
                  <div className="request-item-header">
                    <span className="request-item-title">
                      {req.department}
                    </span>
                    <span className="request-item-status">
                      ({req.status})
                    </span>
                    <span className="request-item-event">
                      {req.event_name || ''}
                    </span>
                  </div>
                  <div className="request-item-details">
                    <span className="request-item-date">
                      Data: {req.date}
                    </span>
                    {req.location && (
                      <span className="request-item-location">
                        Local: {req.location}
                      </span>
                    )}
                    <span className="request-item-requester">
                      Solicitante: {req.requester_name || req.requester || req.user?.name || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="request-item-actions">
                  <Button 
                    onClick={() => abrirDetalhe(req.id)}
                    variant="icon-blue" 
                    size="sm"
                    className="details-button"
                    title="Ver Detalhes"
                  >
                    <FiEye size={18} className="details-icon" />
                  </Button>
                  <Button 
                    onClick={() => handleEdit(req.id)}
                    variant="icon-blue" 
                    size="sm"
                    className="edit-button"
                    title="Editar"
                  >
                    <FiEdit size={18} className="edit-icon" />
                  </Button>
                  <button 
                    onClick={() => handleCopyRequest(req.id)}
                    className="copy-request-button"
                    title="Copiar Requisição"
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      cursor: 'pointer',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      minWidth: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    C
                  </button>
                  <button 
                    onClick={() => handlePrint(req.id)}
                    className="print-request-button"
                    title="Imprimir"
                    style={{
                      backgroundColor: '#374151',
                      color: 'white',
                      cursor: 'pointer',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      minWidth: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FiPrinter size={18} style={{ color: 'white' }} />
                  </button>
                  <Button 
                    onClick={() => handleDelete(req.id)}
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

      {/* Modal de detalhes */}
      <Modal
        open={modalDetalhe}
        title="Detalhes do Requerimento"
        onClose={() => setModalDetalhe(false)}
        actions={
          reqDetalhe && reqDetalhe.status === 'PENDENTE' ? (
            <>
              <Button variant="danger" size="sm" onClick={() => abrirRejeitar(reqDetalhe.id)}>Rejeitar</Button>
              <Button variant="primary" size="sm" onClick={() => aprovar(reqDetalhe.id)}>Aprovar</Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setModalDetalhe(false)}>Fechar</Button>
          )
        }
      >
        {/* Notificação do modal */}
        {notificacaoModal.mostrar && (
          <div className={`notificacao ${notificacaoModal.tipo}`} style={{ marginBottom: 12 }}>
            {notificacaoModal.mensagem}
          </div>
        )}

        {reqDetalhe && (
          <div className="request-details-admin">
            <div className="detail-item-admin">
              <strong>Evento:</strong> {reqDetalhe.event_name || reqDetalhe.description || 'Sem título'}
            </div>
            
            <div className="detail-item-admin">
              <strong>Status:</strong> 
              <span className={`status-badge ${reqDetalhe.status.toLowerCase()}`}>
                {reqDetalhe.status}
              </span>
            </div>
            
            <div className="detail-row-admin">
              {reqDetalhe.start_datetime && (
                <div className="detail-item-admin">
                  <strong>Data de Início:</strong> {formatarDataHora(reqDetalhe.start_datetime)}
                </div>
              )}
              
              {reqDetalhe.end_datetime && (
                <div className="detail-item-admin">
                  <strong>Data de Fim:</strong> {formatarDataHora(reqDetalhe.end_datetime)}
                </div>
              )}
              
              {reqDetalhe.end_date && reqDetalhe.end_date !== reqDetalhe.date && (
                <div className="detail-item-admin">
                  <strong>Data Final:</strong> {formatarDataHora(reqDetalhe.end_date)}
                </div>
              )}
            </div>
            
            <div className="detail-row-admin">
              {reqDetalhe.location && (
                <div className="detail-item-admin">
                  <strong>Local{reqDetalhe.location.includes(',') ? 'is' : ''}:</strong> {reqDetalhe.location}
                </div>
              )}
              
              {reqDetalhe.department && (
                <div className="detail-item-admin">
                  <strong>Departamento:</strong> {reqDetalhe.department}
                </div>
              )}
            </div>
            
            <div className="detail-row-admin">
              <div className="detail-item-admin">
                <strong>Solicitante:</strong> {reqDetalhe.requester_name || reqDetalhe.requester || 'Usuário não encontrado'}
              </div>
              
              {reqDetalhe.expected_audience && (
                <div className="detail-item-admin">
                  <strong>Público Esperado:</strong> {reqDetalhe.expected_audience}
                </div>
              )}
            </div>
            
            {reqDetalhe.description && (
              <div className="detail-item-admin">
                <strong>Descrição:</strong> {reqDetalhe.description}
              </div>
            )}
            
            {reqDetalhe.prioridade && (
              <div className="detail-item-admin">
                <strong>Prioridade:</strong> {reqDetalhe.prioridade}
              </div>
            )}
            
            {reqDetalhe.department_leader && (
              <div className="detail-item-admin">
                <strong>Líder:</strong> {reqDetalhe.department_leader}
              </div>
            )}
            
            {reqDetalhe.status === 'PENDENTE_CONFLITO' && (
              <div className="requests-alert-conflito" style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>
                ⚠️ Conflito de agenda detectado! Esta Requerimento precisa de avaliação manual.
              </div>
            )}
            
            {/* Itens solicitados */}
            <div className="request-items-section">
              <h4>Itens Solicitados</h4>
              {Array.isArray(reqDetalhe.itens) && reqDetalhe.itens.length > 0 ? (
                <div className="request-items-list">
                  {reqDetalhe.itens.map((item, idx) => (
                    <div key={idx} className="request-item-detail">
                      <div className="item-info">
                        <strong>{item.inventory?.name || item.inventory_name || item.name || item.item_name || 'Item'}</strong>
                        <span className="item-quantity">Qtd: {item.quantity_requested || item.quantity || 1}</span>
                      </div>
                      {(item.inventory?.description || item.description) && (
                        <div className="item-description">{item.inventory?.description || item.description}</div>
                      )}
                      {item.inventory?.category && (
                        <div className="item-category">Categoria: {item.inventory.category}</div>
                      )}
                      {item.status && (
                        <div className="item-status">
                          <span className={`status-badge ${item.status.toLowerCase()}`}>
                            {item.status}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-items-message" style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: '#6b7280',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px dashed #d1d5db'
                }}>
                  📝 Nenhum item solicitado para esta Requerimento
                </div>
              )}
            </div>
            
            {/* Serviços solicitados */}
            <div className="request-services-section">
              <h4>Serviços Solicitados</h4>
              {Array.isArray(reqDetalhe.servicos) && reqDetalhe.servicos.length > 0 ? (
                <div className="request-services-list">
                  {reqDetalhe.servicos.map((servico, idx) => (
                    <div key={idx} className="request-service-detail service-spacing">
                      <div className="service-info">
                        <strong>{(servico.nome || servico.service_name || servico.name || 'Serviço').toUpperCase()}:</strong>
                        <span className="service-quantity"> Qtd de pessoas: {servico.quantidade || 1}</span>
                        {servico.notes && (
                          <div className="service-notes">{servico.notes}</div>
                        )}
                      </div>
                      {servico.status && (
                        <div className="service-status">
                          <span className={`status-badge ${servico.status.toLowerCase()}`}>
                            {servico.status}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-services-message" style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: '#6b7280',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px dashed #d1d5db'
                }}>
                  📝 Nenhum serviço solicitado para esta Requerimento
                </div>
              )}
            </div>
            
            
            {/* Histórico de status */}
            {Array.isArray(reqDetalhe.status_history) && reqDetalhe.status_history.length > 0 && (
              <div className="status-history-section">
                <h4>📋 Histórico de Status</h4>
                <div className="status-history-list">
                  {reqDetalhe.status_history.map((h, idx) => (
                    <div key={idx} className="status-history-item">
                      <div className="status-history-header">
                        <span className={`status-badge status-${h.status.toLowerCase()}`}>
                          {h.status}
                        </span>
                        <span className="status-date">
                          {h.date ? new Date(h.date).toLocaleString('pt-BR') : ''}
                        </span>
                      </div>
                      {h.user_name && (
                        <div className="status-user">
                          <strong>Por:</strong> {h.user_name}
                        </div>
                      )}
                      {h.reason && (
                        <div className="status-reason">
                          <strong>Motivo:</strong> {h.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de rejeição */}
      <Modal
        open={modalRejeitar}
        title="Motivo da Rejeição"
        onClose={() => setModalRejeitar(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalRejeitar(false)}>Cancelar</Button>
            <Button variant="danger" size="sm" onClick={rejeitar} disabled={!motivoRejeicao}>Rejeitar</Button>
          </>
        }
      >
        <Input
          label="Descreva o motivo da rejeição"
          value={motivoRejeicao}
          onChange={e => setMotivoRejeicao(e.target.value)}
          className="input-full"
        />
      </Modal>

      {/* Modal de Adicionar Requisição */}
      <Modal
        open={showAddModal}
        title="Adicionar Requerimento"
        onClose={() => setShowAddModal(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={loading}>Criar</Button>
          </>
        }
        style={{ width: '800px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
      >

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Primeira linha - Departamento e Nome do Evento */}
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div className="input-group">
                <label className="input-label">Departamento</label>
                <select
                  className="input-field"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  {departamentosOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label="Nome do Evento"
                value={formData.event_name}
                onChange={e => setFormData({ ...formData, event_name: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Segunda linha - Data e Local */}
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Data de Início"
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                onBlur={e => {
                  // Verificação imediata quando sair do campo
                  verificarConflitoTempoReal(e.target.value, formData.location, formData.start_datetime, formData.end_datetime);
                }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label="Data Final"
                type="date"
                value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                onBlur={() => {
                  // Verificação imediata quando sair do campo
                  verificarConflitoTempoReal(formData.date, formData.location, formData.start_datetime, formData.end_datetime);
                }}
              />
            </div>
          </div>
          

          {/* Terceira linha - Hora de Início e Fim */}
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Hora de Início"
                type="time"
                value={formData.start_datetime}
                onChange={e => setFormData({ ...formData, start_datetime: e.target.value })}
                onBlur={e => {
                  // Verificação imediata quando sair do campo
                  verificarConflitoTempoReal(formData.date, formData.location, e.target.value, formData.end_datetime);
                }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label="Hora de Fim"
                type="time"
                value={formData.end_datetime}
                onChange={e => setFormData({ ...formData, end_datetime: e.target.value })}
                onBlur={e => {
                  // Verificação imediata quando sair do campo
                  verificarConflitoTempoReal(formData.date, formData.location, formData.start_datetime, e.target.value);
                }}
                required
              />
            </div>
          </div>

          {/* Quarta linha - Público Esperado e Prioridade */}
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Público Esperado"
                type="number"
                value={formData.expected_audience}
                onChange={e => setFormData({ ...formData, expected_audience: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input
                label="Prioridade"
                value={formData.prioridade}
                onChange={e => setFormData({ ...formData, prioridade: e.target.value })}
                type="select"
                options={PRIORIDADE_OPTIONS}
              />
            </div>
          </div>

          {/* Sexta linha - Descrição (largura total) */}
          <Input
            label="Descrição"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            multiline
          />

          {/* Seção de Itens do Inventário */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: '#374151' }}>Itens do Inventário</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowLocationsModal(true)}
                >
                  {formData.locations.length === 0 
                    ? 'Selecionar Locais' 
                    : `Locais (${formData.locations.length})`
                  }
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowInventoryModal(true)}
                >
                  Adicionar Itens
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowServicesModal(true)}
                >
                  Adicionar Serviços
                </Button>
              </div>
            </div>
            
            {/* Seção de Locais Selecionados */}
            {formData.locations.length > 0 && (
              <div style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                marginBottom: '1rem'
              }}>
                <h4 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '4px'
                }}>
                  📍 Locais Selecionados ({formData.locations.length})
                </h4>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '8px'
                }}>
                  {formData.locations.map((location, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      padding: '6px 12px',
                      backgroundColor: '#dbeafe',
                      border: '1px solid #93c5fd',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#1e40af',
                      fontWeight: '500',
                      gap: '8px'
                    }}>
                      <span style={{ flex: 1 }}>{location}</span>
                      <button
                        type="button"
                        onClick={() => removeLocation(location)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '30px',
                          height: '30px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        title="Remover local"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedItems.length > 0 ? (
              <div style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {selectedItems.map((item) => (
                    <div key={item.id} style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      backgroundColor: '#fff'
                    }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{item.name}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                          {getTextoQuantidadeDisponivel(item)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          min="1"
                          max={getQuantidadeDisponivelAtualizada(item)}
                          value={item.quantity}
                          onChange={(e) => alterarQuantidade(item.id, parseInt(e.target.value) || 0)}
                          style={{
                            width: '50px',
                            padding: '0.25rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            color: getCorQuantidadeDisponivel(item)
                          }}
                        />
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removerItem(item.id)}
                          style={{ padding: '0.25rem', minWidth: 'auto' }}
                        >
                          <FiX size={10} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '1rem',
                textAlign: 'center',
                color: '#6b7280',
                backgroundColor: '#f9fafb'
              }}>
                Nenhum item selecionado
              </div>
            )}
          </div>

          {/* Seção de Serviços Solicitados */}
          <div style={{ marginTop: '1rem' }}>
            {selectedServices.length > 0 ? (
              <div style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {selectedServices.map((servico) => (
                    <div key={servico.tipo} style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      backgroundColor: '#fff'
                    }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>{servico.nome}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          min="1"
                          value={servico.quantidade}
                          onChange={(e) => alterarQuantidadeServico(servico.tipo, parseInt(e.target.value) || 0)}
                          style={{
                            width: '50px',
                            padding: '0.25rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontSize: '0.75rem'
                          }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>pessoas</span>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removerServico(servico.tipo)}
                          style={{ padding: '0.25rem', minWidth: 'auto' }}
                        >
                          <FiX size={10} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '1rem',
                textAlign: 'center',
                color: '#6b7280',
                backgroundColor: '#f9fafb'
              }}>
                Nenhum serviço selecionado
              </div>
            )}
          </div>

          {/* Validação de Disponibilidade de Materiais */}
          {(disponibilidadeInfo.temConflito || disponibilidadeInfo.temBaixoEstoque) && (
            <div className={`conflict-validation-container ${disponibilidadeInfo.temConflito ? 'conflict-error' : 'conflict-warning'}`}>
              <div className="conflict-header">
                <span className="conflict-icon">
                  {disponibilidadeInfo.temConflito ? '❌' : '⚠️'}
                </span>
                <span className="conflict-message">
                  {disponibilidadeInfo.mensagem}
                </span>
                {validandoDisponibilidade && (
                  <span className="loading-spinner">⏳</span>
                )}
              </div>

              {/* Materiais Indisponíveis */}
              {disponibilidadeInfo.materiaisIndisponiveis.length > 0 && (
                <div className="conflicts-list">
                  <div className="conflicts-title">
                    📦 Materiais indisponíveis:
                  </div>
                  {disponibilidadeInfo.materiaisIndisponiveis.map((material, index) => (
                    <div key={index} className="conflict-item">
                      <span className="conflict-type-icon">📦</span>
                      <span className="conflict-name">{material.nome}</span>
                      <span className="conflict-separator">•</span>
                      <span className="conflict-time">
                        Disponível: {material.quantidade_disponivel} | 
                        Solicitado: {material.quantidade_solicitada} | 
                        Faltam: {material.quantidade_faltante}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Materiais com Baixo Estoque */}
              {disponibilidadeInfo.materiaisBaixoEstoque.length > 0 && (
                <div className="conflicts-list">
                  <div className="conflicts-title">
                    ⚠️ Materiais com baixo estoque após uso:
                  </div>
                  {disponibilidadeInfo.materiaisBaixoEstoque.map((material, index) => (
                    <div key={index} className="conflict-item">
                      <span className="conflict-type-icon">⚠️</span>
                      <span className="conflict-name">{material.nome}</span>
                      <span className="conflict-separator">•</span>
                      <span className="conflict-time">
                        Disponível: {material.quantidade_disponivel} | 
                        Solicitado: {material.quantidade_solicitada} | 
                        Restarão: {material.quantidade_restante}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          
          {/* Mensagem de conflito em tempo real */}
          {conflitoInfo.temConflito && (
            <div className={`conflict-validation-container ${
              conflitoInfo.conflitos.some(c => c.conflito === 'SOBREPOSIÇÃO_DIRETA') 
                ? 'conflict-container-error' 
                : 'conflict-container-warning'
            }`}
            style={{
              padding: '16px',
              borderRadius: '12px',
              marginTop: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              {/* Header da mensagem */}
              <div className="conflict-header">
                <div className="conflict-icon">
                  {validandoConflito ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    conflitoInfo.conflitos.some(c => c.conflito === 'SOBREPOSIÇÃO_DIRETA') ? '❌' : '⚠️'
                  )}
                </div>
                <div className="conflict-message">
                  {validandoConflito ? 'Verificando disponibilidade...' : conflitoInfo.mensagem}
                </div>
              </div>
              
              {/* Lista de conflitos */}
              {conflitoInfo.conflitos.length > 0 && (
                <div className="conflicts-list">
                  <div className="conflicts-title">
                    📋 Conflitos encontrados:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {conflitoInfo.conflitos.map((conflito, index) => (
                      <div key={index} className="conflict-item">
                        <span className={`conflict-type-icon ${
                          conflito.tipo === 'EVENTO' ? 'conflict-type-event' : 'conflict-type-request'
                        }`}>
                          {conflito.tipo === 'EVENTO' ? '📅' : '📋'}
                        </span>
                        <span className="conflict-name">{conflito.nome}</span>
                        <span className="conflict-separator">•</span>
                        <span className="conflict-time">
                          {conflito.inicio} - {conflito.fim}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugestões de horários */}
              {conflitoInfo.horariosDisponiveis.length > 0 && (
                <div className="suggestions-list">
                  <div className="suggestions-title">
                    🕐 Horários disponíveis sugeridos:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {conflitoInfo.horariosDisponiveis.map((horario, index) => (
                      <div key={index} className="suggestion-item">
                        <div className="suggestion-time">
                          <span className="suggestion-time-icon">🕐</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span className="suggestion-time-text">
                              {horario.inicio} - {horario.fim}
                            </span>
                          </div>
                        </div>
                        <button
                          className="use-button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              start_datetime: horario.inicio,
                              end_datetime: horario.fim
                            });
                            setSugestaoAplicada(true);
                            setConflitoInfo({
                              temConflito: false,
                              mensagem: '',
                              conflitos: [],
                              horariosDisponiveis: []
                            });
                          }}
                        >
                          Usar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </Modal>

      {/* Modal de Seleção de Itens do Inventário */}
      <Modal
        open={showInventoryModal}
        title="Selecionar Itens do Inventário"
        onClose={() => setShowInventoryModal(false)}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" size="sm" onClick={() => setShowInventoryModal(false)}>
              Cancelar
          </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setShowInventoryModal(false)}
              disabled={selectedItems.length === 0}
            >
              Continuar ({selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''})
            </Button>
          </div>
        }
        style={{
          width: '600px',
          maxWidth: '90vw',
          height: 'auto',
          maxHeight: '80vh'
        }}
      >
        {/* Campo de Busca */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#6b7280',
                zIndex: 1
              }} 
            />
            <input
              type="text"
              placeholder="Buscar itens do inventário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{
                width: '98%',
                padding: '12px 16px 12px 44px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                backgroundColor: '#fff'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
              }}
            />
          </div>
          {searchTerm && (
            <div style={{ 
              fontSize: '12px', 
              color: '#6b7280', 
              marginTop: '4px',
              paddingLeft: '4px'
            }}>
              {filteredInventory.length} item(ns) encontrado(s)
            </div>
          )}
        </div>

        {/* Resumo dos Itens Selecionados */}
        {selectedItems.length > 0 && (
          <div style={{ 
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '6px'
          }}>
            <div style={{ 
              fontWeight: '600', 
              color: '#0c4a6e',
              marginBottom: '0.5rem',
              fontSize: '0.875rem'
            }}>
              📦 Itens Selecionados ({selectedItems.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {selectedItems.map((item) => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: '#0c4a6e'
                }}>
                  <span>{item.name}</span>
                  <span style={{ fontWeight: '600' }}>Qtd: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Itens - Container com altura fixa */}
        <div style={{ 
          height: '400px',
          overflowY: 'auto', 
          paddingRight: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
          backgroundColor: '#f9fafb'
        }}>
          {filteredInventory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem' }}>
              {filteredInventory.map((item) => {
                // const quantidadeDisponivel = getQuantidadeDisponivelAtualizada(item);
                const itemSelecionado = selectedItems.find(selected => selected.id === item.id);
                const isSelecionado = !!itemSelecionado;
                
                return (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem',
                    border: `2px solid ${isSelecionado ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    backgroundColor: isSelecionado ? '#eff6ff' : '#fff',
                    transition: 'all 0.2s ease',
                    minHeight: '80px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '500',
                        color: isSelecionado ? '#1e40af' : '#111827'
                      }}>
                        {item.name}
                        {isSelecionado && (
                          <span style={{ 
                            marginLeft: '8px', 
                            fontSize: '12px', 
                            color: '#059669',
                            fontWeight: '600'
                          }}>
                            ✓ Selecionado
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div style={{ 
                          fontSize: '0.875rem', 
                          color: '#6b7280',
                          marginBottom: '4px'
                        }}>
                      {item.description}
                    </div>
                      )}
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: getCorQuantidadeDisponivel(item),
                        fontWeight: '500'
                      }}>
                        {getTextoQuantidadeDisponivel(item)}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      adicionarItem(item);
                        // Não fechar o modal automaticamente
                      }}
                      disabled={isBotaoDesabilitado(item)}
                      style={{
                        opacity: isBotaoDesabilitado(item) ? 0.5 : 1,
                        cursor: isBotaoDesabilitado(item) ? 'not-allowed' : 'pointer'
                      }}
                  >
                    <FiPlus size={14} />
                  </Button>
                </div>
                );
              })}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: '#6b7280',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {searchTerm ? 'Nenhum item encontrado com essa busca' : 'Nenhum item disponível no inventário'}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        open={editModalOpen}
        title="Editar Requisição"
        onClose={() => setEditModalOpen(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleEditSave}>Salvar</Button>
          </>
        }
        style={{
          width: '700px',
          maxWidth: '90vw'
        }}
      >
        {editReq && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Primeira linha: Departamento e Nome do Evento */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Departamento"
                  value={editReq.department || ''}
                  onChange={(e) => handleEditField('department', e.target.value)}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  label="Nome do Evento"
                  value={editReq.event_name || ''}
                  onChange={(e) => handleEditField('event_name', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Segunda linha: Data de Início e Data Final */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Data de Início"
                  type="date"
                  value={editReq.date || ''}
                  onChange={(e) => handleEditField('date', e.target.value)}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  label="Data Final"
                  type="date"
                  value={editReq.end_date || ''}
                  onChange={(e) => handleEditField('end_date', e.target.value)}
                />
              </div>
            </div>
            

            {/* Terceira linha: Hora de Início e Hora de Fim */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Hora de Início"
                  type="time"
                  value={editReq.start_datetime ? editReq.start_datetime.slice(11, 16) : ''}
                  onChange={(e) => handleEditField('start_datetime', e.target.value)}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  label="Hora de Fim"
                  type="time"
                  value={editReq.end_datetime ? editReq.end_datetime.slice(11, 16) : ''}
                  onChange={(e) => handleEditField('end_datetime', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Quarta linha: Público Específico e Prioridade */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Público Específico"
                  type="number"
                  value={editReq.expected_audience || ''}
                  onChange={(e) => handleEditField('expected_audience', e.target.value)}
                />
              </div>
                                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '6px'
                      }}>
                        Prioridade
                      </label>
                    </div>
                    <select
                      value={editReq.prioridade || 'Média'}
                      onChange={(e) => handleEditField('prioridade', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        color: '#374151',
                        height: '40px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'border-color 0.15s ease-in-out',
                        marginTop: '7px'
                      }}
                    >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
            </div>

            {/* Quinta linha: Descrição (largura total) */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Descrição"
                  value={editReq.description || ''}
                  onChange={(e) => handleEditField('description', e.target.value)}
                  multiline
                />
              </div>
            </div>

            {/* Seção de Itens e Serviços */}
            <div style={{ marginTop: '16px' }}>
              {/* Botões de Ação */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '16px',
                flexWrap: 'wrap'
              }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowLocationsModal(true)}
                >
                  {(!editReq.locations || editReq.locations.length === 0)
                    ? 'Selecionar Locais' 
                    : `Locais (${editReq.locations.length})`
                  }
                </Button>
              </div>
              
              {/* Seção de Locais Selecionados */}
              {editReq.locations && editReq.locations.length > 0 && (
                <div style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px',
                    borderBottom: '1px solid #e5e7eb',
                    paddingBottom: '4px'
                  }}>
                    📍 Locais Selecionados ({editReq.locations.length})
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px'
                  }}>
                    {editReq.locations.map((location, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '6px 12px',
                        backgroundColor: '#dbeafe',
                        border: '1px solid #93c5fd',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#1e40af',
                        fontWeight: '500',
                        gap: '8px'
                      }}>
                        <span style={{ flex: 1 }}>{location}</span>
                        <button
                          type="button"
                          onClick={() => {
                            // Atualizar editReq.locations
                            const newLocations = editReq.locations.filter(loc => loc !== location);
                            setEditReq(prev => ({
                              ...prev,
                              locations: newLocations,
                              location: newLocations.join(', ')
                            }));
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '30px',
                            height: '30px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          title="Remover local"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Itens do Inventário */}
              {editReq.itens && editReq.itens.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px',
                    borderBottom: '1px solid #e5e7eb',
                    paddingBottom: '4px'
                  }}>
                    📦 Itens do Inventário
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    padding: '8px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px'
                  }}>
                    {editReq.itens.map((item, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <span style={{ fontSize: '13px', color: '#374151', flex: 1 }}>
                          {item.item_name || item.inventory?.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity_requested || item.quantity || 1}
                            onChange={(e) => {
                              const newItens = [...editReq.itens];
                              newItens[index] = {
                                ...newItens[index],
                                quantity_requested: parseInt(e.target.value) || 1
                              };
                              setEditReq({ ...editReq, itens: newItens });
                            }}
                            style={{
                              width: '60px',
                              padding: '4px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '12px'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newItens = editReq.itens.filter((_, i) => i !== index);
                              setEditReq({ ...editReq, itens: newItens });
                            }}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Serviços */}
              {editReq.servicos && editReq.servicos.length > 0 && (
                <div>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px',
                    borderBottom: '1px solid #e5e7eb',
                    paddingBottom: '4px'
                  }}>
                    🛠️ Serviços
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    padding: '8px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px'
                  }}>
                    {editReq.servicos.map((service, index) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <span style={{ fontSize: '13px', color: '#374151', flex: 1 }}>
                          {service.tipo === 'DIACONIA' ? 'Diaconia' : 
                           service.tipo === 'SERVICO_GERAL' ? 'Serviço Geral' : 
                           service.tipo === 'AUDIOVISUAL' ? 'Audiovisual' : service.tipo}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            min="1"
                            value={service.quantidade || 1}
                            onChange={(e) => {
                              const newServicos = [...editReq.servicos];
                              newServicos[index] = {
                                ...newServicos[index],
                                quantidade: parseInt(e.target.value) || 1
                              };
                              setEditReq({ ...editReq, servicos: newServicos });
                            }}
                            style={{
                              width: '60px',
                              padding: '4px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              textAlign: 'center',
                              fontSize: '12px'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newServicos = editReq.servicos.filter((_, i) => i !== index);
                              setEditReq({ ...editReq, servicos: newServicos });
                            }}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensagem quando não há itens ou serviços */}
              {(!editReq.itens || editReq.itens.length === 0) && 
               (!editReq.servicos || editReq.servicos.length === 0) && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '16px',
                  color: '#6b7280',
                  fontSize: '13px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px dashed #d1d5db'
                }}>
                  📝 Nenhum item ou serviço selecionado para esta Requerimento
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmação de Deleção */}
      <Modal
        open={deleteModalOpen}
        title="Confirmar Deleção"
        onClose={() => setDeleteModalOpen(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>Deletar</Button>
          </>
        }
      >
        <div style={{ padding: 16 }}>
          <p>Tem certeza que deseja deletar esta Requerimento?</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 8 }}>
            Esta ação não pode ser desfeita.
          </p>
        </div>
      </Modal>

      {/* Modal de Seleção de Serviços */}
      <Modal
        open={showServicesModal}
        title="Selecionar Serviços"
        onClose={() => setShowServicesModal(false)}
        actions={
          <Button variant="secondary" size="sm" onClick={() => setShowServicesModal(false)}>
            Fechar
          </Button>
        }
        style={{
          width: '500px',
          maxWidth: '90vw'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Diaconia */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#fff'
          }}>
            <div>
              <div className="service-title">
                Diaconia
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Apoio e assistência durante o evento
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                min="0"
                placeholder="0"
                style={{
                  width: '60px',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}
                onChange={(e) => {
                  const quantidade = parseInt(e.target.value) || 0;
                  if (quantidade > 0) {
                    adicionarServico('DIACONIA', quantidade);
                  } else {
                    removerServico('DIACONIA');
                  }
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>pessoas</span>
            </div>
          </div>

          {/* Serviços Gerais */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#fff'
          }}>
            <div>
              <div className="service-title">
                Serviços Gerais
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Limpeza, organização e logística
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                min="0"
                placeholder="0"
                style={{
                  width: '60px',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}
                onChange={(e) => {
                  const quantidade = parseInt(e.target.value) || 0;
                  if (quantidade > 0) {
                    adicionarServico('SERVICO_GERAL', quantidade);
                  } else {
                    removerServico('SERVICO_GERAL');
                  }
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>pessoas</span>
            </div>
          </div>

          {/* Audiovisual */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#fff'
          }}>
            <div>
              <div className="service-title">
                Audiovisual
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Som, vídeo e equipamentos técnicos
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                min="0"
                placeholder="0"
                style={{
                  width: '60px',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}
                onChange={(e) => {
                  const quantidade = parseInt(e.target.value) || 0;
                  if (quantidade > 0) {
                    adicionarServico('AUDIOVISUAL', quantidade);
                  } else {
                    removerServico('AUDIOVISUAL');
                  }
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>pessoas</span>
            </div>
          </div>

          {/* Segurança */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#fff'
          }}>
            <div>
              <div className="service-title">
                Segurança
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Controle de acesso e segurança do evento
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                min="0"
                placeholder="0"
                style={{
                  width: '60px',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}
                onChange={(e) => {
                  const quantidade = parseInt(e.target.value) || 0;
                  if (quantidade > 0) {
                    adicionarServico('SEGURANCA', quantidade);
                  } else {
                    removerServico('SEGURANCA');
                  }
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>pessoas</span>
            </div>
          </div>

          {/* Resumo dos Serviços Selecionados */}
          {selectedServices.length > 0 && (
            <div className="services-summary">
              <div className="services-summary-title">
                📋 Serviços Selecionados ({selectedServices.length})
              </div>
              <div className="services-summary-list">
                {selectedServices.map((servico) => (
                  <div key={servico.tipo} className="services-summary-item">
                    <span>{servico.nome}</span>
                    <span className="services-summary-quantity">{servico.quantidade} pessoa(s)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Confirmação de Cópia */}
      <Modal
        open={copyModalOpen}
        title="Copiar Requisição"
        onClose={() => setCopyModalOpen(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setCopyModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleCopyConfirm}>Copiar</Button>
          </>
        }
      >
        {copyReq && (
          <div className="copy-modal-content">
            <p className="copy-modal-description">
              Você está prestes a copiar a Requerimento:
            </p>
            <div className="copy-modal-details">
              <div className="copy-modal-detail-item">
                <strong>Evento:</strong> {copyReq.event_name || copyReq.description || 'Sem título'}
              </div>
              <div className="copy-modal-detail-item">
                <strong>Local:</strong> {copyReq.location || 'Não informado'}
              </div>
              <div className="copy-modal-detail-item">
                <strong>Itens:</strong> {copyReq.itens?.length || 0} item(s)
              </div>
              <div className="copy-modal-detail-item">
                <strong>Serviços:</strong> {copyReq.servicos?.length || 0} serviço(s)
              </div>
            </div>
            <p className="copy-modal-warning">
              <strong>⚠️ Atenção:</strong> A nova Requerimento será criada com "(Cópia)" no nome e precisará ser aprovada novamente. 
              Data e horário devem ser preenchidos manualmente.
            </p>
          </div>
        )}
      </Modal>

      {/* Modal de Seleção de Locais */}
      <Modal
        open={showLocationsModal}
        title="Selecionar Locais do Evento"
        onClose={() => setShowLocationsModal(false)}
        actions={
          <Button variant="secondary" size="sm" onClick={() => setShowLocationsModal(false)}>
            Fechar
          </Button>
        }
        style={{ width: '600px', maxWidth: '90vw' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            marginBottom: '8px'
          }}>
            Selecione os locais que serão utilizados no evento. Para eventos como congressos, 
            você pode selecionar múltiplas salas para palestras simultâneas.
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '12px',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '8px'
          }}>
            {salasOptions.map(option => (
              <label key={option.value} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                transition: 'all 0.2s',
                backgroundColor: formData.locations.includes(option.value) ? '#dbeafe' : '#ffffff',
                borderColor: formData.locations.includes(option.value) ? '#3b82f6' : '#e5e7eb'
              }}>
                <input
                  type="checkbox"
                  checked={formData.locations.includes(option.value)}
                  onChange={() => toggleLocation(option.value)}
                  style={{ 
                    width: '18px', 
                    height: '18px',
                    accentColor: '#3b82f6'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: formData.locations.includes(option.value) ? '600' : '500',
                    color: formData.locations.includes(option.value) ? '#1e40af' : '#374151',
                    marginBottom: '2px'
                  }}>
                    {option.label}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280'
                  }}>
                    Capacidade e recursos disponíveis
                  </div>
                </div>
              </label>
            ))}
          </div>
          
          {formData.locations.length > 0 && (
            <div style={{ 
              padding: '12px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#0369a1',
                marginBottom: '8px'
              }}>
                📍 Locais Selecionados ({formData.locations.length}):
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#0c4a6e'
              }}>
                {formData.locations.join(' • ')}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Favoritos */}
      <Modal
        open={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        title="⭐ Requerimentos Favoritos"
        size="large"
      >
        <div className="favorites-modal-content">
          {favorites.length === 0 ? (
            <div className="no-favorites">
              <p>Nenhum requerimento favoritado ainda.</p>
              <p>Clique no coração ❤️ em qualquer requerimento para adicioná-lo aos favoritos.</p>
            </div>
          ) : (
            <div className="requests-list">
              {favorites.map((favorite) => {
                const req = favorite.request || favorite;
                return (
                  <div key={favorite.id} className="request-item">
                    <button 
                      onClick={() => toggleFavorite(req.id)}
                      className="favorite-heart"
                      title="Remover dos Favoritos"
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#ef4444',
                        transition: 'color 0.2s, transform 0.2s',
                        zIndex: 10,
                        padding: '4px',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      ❤️
                    </button>
                    
                    <div className="request-item-content">
                      <div className="request-item-header">
                        <span className="request-item-title">
                          {req.department}
                        </span>
                        <span className="request-item-status">
                          ({req.status})
                        </span>
                        <span className="request-item-event">
                          {req.event_name || ''}
                        </span>
                      </div>
                      <div className="request-item-details">
                        <span className="request-item-date">
                          Data: {formatarDataHora(req.date || req.start_datetime)}
                        </span>
                        {req.location && (
                          <span className="request-item-location">
                            Local: {req.location}
                          </span>
                        )}
                        <span className="request-item-requester">
                          Solicitante: {req.requester_name || 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="request-item-actions">
                      <button 
                        onClick={() => {
                          handleCopyConfirm(favorite);
                          setShowFavoritesModal(false);
                        }}
                        className="copy-request-button"
                        title="Copiar Requisição"
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          cursor: 'pointer',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 12px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          minWidth: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        C
                      </button>
                      <Button 
                        onClick={() => toggleFavorite(req.id)}
                        variant="icon-blue" 
                        size="sm"
                        className="delete-button"
                        title="Remover dos Favoritos"
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
      </Modal>
    </div>
  );
} 