import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { departamentosOptions } from '../utils/departamentosConfig';
import { PRIORIDADE_OPTIONS } from '../utils/prioridadeConfig';
import { salasOptions } from '../utils/salasConfig';
import { FiSearch, FiPlus, FiX } from 'react-icons/fi';

export default function EditRequestModal({ open, onClose, request, onSave }) {
      // Log removido para limpeza
  console.log('🔍 EditRequestModal - open é boolean?', typeof open);
  console.log('🔍 EditRequestModal - request é null?', request === null);
  console.log('🔍 EditRequestModal - request é undefined?', request === undefined);
  console.log('🔍 request.itens:', request?.itens);
  console.log('🔍 request.servicos:', request?.servicos);
  
  const [editedRequest, setEditedRequest] = useState(request || {});
  const [saving, setSaving] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  
  // Processar dados diretamente no render
  const processedItems = React.useMemo(() => {
    if (request && request.itens) {
      return (request.itens || []).map(item => ({
        id: item.inventory_id,
        name: item.item_name,
        quantity: item.quantity_requested,
        ...item
      }));
    }
    return [];
  }, [request?.itens]);
  
  const processedServices = React.useMemo(() => {
    if (request && request.servicos) {
      return (request.servicos || []).map((service, index) => ({
        ...service,
        id: service.id || `service_${Date.now()}_${index}_${Math.random()}`,
        tipo: service.tipo,
        nome: service.nome,
        quantidade: service.quantidade || 1
      }));
    }
    return [];
  }, [request?.servicos]);
  
  // Atualizar estados quando os dados processados mudarem
  React.useEffect(() => {
    setSelectedItems(processedItems);
    setSelectedServices(processedServices);
  }, [processedItems, processedServices]);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);

  // Função para formatar horário para o input time
  const formatTimeForInput = (datetime) => {
    console.log('🕐 Formatando datetime:', datetime);
  console.log('🔄 EditRequestModal - useEffect será executado?');
    
    if (!datetime) {
      console.log('🕐 Datetime vazio, retornando vazio');
      return '';
    }
    
    // Se já está no formato HH:MM, retorna como está
    if (typeof datetime === 'string' && datetime.match(/^\d{2}:\d{2}$/)) {
      console.log('🕐 Já está no formato HH:MM:', datetime);
      return datetime;
    }
    
    // Se é um datetime completo com timezone (+00:00), extrai a hora
    if (typeof datetime === 'string' && datetime.includes('T')) {
      const timePart = datetime.split('T')[1];
      const timeWithoutTimezone = timePart.split('+')[0]; // Remove timezone
      const formattedTime = timeWithoutTimezone.substring(0, 5); // Pega apenas HH:MM
      console.log('🕐 Extraindo hora de datetime:', datetime, '→', formattedTime);
      return formattedTime;
    }
    
    console.log('🕐 Formato não reconhecido, retornando vazio');
    return '';
  };

    // Atualizar dados quando o request mudar
  React.useEffect(() => {
    console.log('🔄 useEffect executado!');
    console.log('🔄 request:', request);
    console.log('🔄 open:', open);
    
    if (request) {
      // Formatar os horários corretamente
      const formattedRequest = {
        ...request,
        start_datetime: request.start_datetime || '',
        end_datetime: request.end_datetime || ''
      };
      
      setEditedRequest(formattedRequest);
      
      // Processar itens do backend para o formato esperado pelo modal
      const processedItems = (request.itens || []).map(item => ({
        id: item.inventory_id, // Usar inventory_id como id
        name: item.item_name, // Usar item_name como name
        quantity: item.quantity_requested, // Usar quantity_requested como quantity
        ...item // Manter todos os outros campos
      }));
      
      setSelectedItems(processedItems);
      // Processar serviços do backend para garantir IDs únicos
      const processedServices = (request.servicos || []).map((service, index) => ({
        ...service,
        id: service.id || `service_${Date.now()}_${index}_${Math.random()}`, // ID único garantido
        tipo: service.tipo,
        nome: service.nome,
        quantidade: service.quantidade || 1
      }));
      setSelectedServices(processedServices);
      
      console.log('🕐 Horários do request:', {
        start_datetime: request.start_datetime,
        end_datetime: request.end_datetime,
        formatted_start: formatTimeForInput(request.start_datetime),
        formatted_end: formatTimeForInput(request.end_datetime)
      });
    } else {
      setEditedRequest({});
    }
  }, [request, open]);

  // Funções para gerenciar itens
  const alterarQuantidadeItem = (itemId, novaQuantidade) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: novaQuantidade }
          : item
      )
    );
  };

  const removerItem = (itemId) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Funções para gerenciar serviços
  const alterarQuantidadeServico = (id, novaQuantidade) => {
    setSelectedServices(prev => 
      prev.map(servico => 
        servico.id === id 
          ? { ...servico, quantidade: novaQuantidade }
          : servico
      )
    );
  };

  const removerServico = (id) => {
    setSelectedServices(prev => prev.filter(servico => servico.id !== id));
  };

  // Funções para gerenciar inventário
  const carregarInventario = async () => {
    try {
      const response = await fetch('/api/inventory', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInventory(data.data || []);
        setFilteredInventory(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar inventário:', error);
    }
  };

  // Filtrar inventário por termo de busca
  useEffect(() => {
    if (searchTerm) {
      const filtered = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredInventory(filtered);
    } else {
      setFilteredInventory(inventory);
    }
  }, [searchTerm, inventory]);

  // Carregar inventário quando abrir modal
  useEffect(() => {
    if (showInventoryModal) {
      carregarInventario();
    }
  }, [showInventoryModal]);

  // Funções para adicionar itens e serviços
  const adicionarItem = (item) => {
    const itemComQuantidade = {
      ...item,
      quantity: 1
    };
    setSelectedItems(prev => [...prev, itemComQuantidade]);
  };

  const adicionarServico = (tipo, quantidade) => {
    const servicos = {
      'DIACONIA': { nome: 'Diaconia', descricao: 'Apoio e assistência durante o evento' },
      'SERVICOS_GERAIS': { nome: 'Serviços Gerais', descricao: 'Limpeza e organização' },
      'SEGURANCA': { nome: 'Segurança', descricao: 'Controle de acesso e segurança' },
      'TRANSPORTE': { nome: 'Transporte', descricao: 'Transporte de participantes' },
      'ALIMENTACAO': { nome: 'Alimentação', descricao: 'Fornecimento de refeições' }
    };

    const servico = servicos[tipo];
    if (servico) {
      setSelectedServices(prev => {
        // Verificar se já existe um serviço deste tipo
        const existingIndex = prev.findIndex(s => s.tipo === tipo);
        
        if (existingIndex >= 0) {
          // Atualizar serviço existente
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantidade
          };
          return updated;
        } else {
          // Adicionar novo serviço
          const servicoComQuantidade = {
            id: `new_service_${Date.now()}_${Math.random()}`,
            tipo,
            nome: servico.nome,
            descricao: servico.descricao,
            quantidade
          };
          return [...prev, servicoComQuantidade];
        }
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      console.log('💾 Modal - Iniciando salvamento...');
      console.log('💾 Modal - selectedItems antes do map:', selectedItems);
      console.log('💾 Modal - selectedServices antes do map:', selectedServices);
      console.log('💾 Modal - selectedItems.length:', selectedItems.length);
      console.log('💾 Modal - selectedServices.length:', selectedServices.length);
      
      const requestCompleto = {
        ...editedRequest,
        // Enviar dados no formato que o backend espera
        request_items: selectedItems.map(item => ({
          inventory_id: item.id,
          quantity_requested: item.quantity
        })),
                          servicos: selectedServices.map(servico => ({
                    tipo: servico.tipo,
                    quantidade: servico.quantidade,
                    nome: servico.nome
                  }))
      };
      
      console.log('💾 Modal - Dados completos para salvar:', requestCompleto);
      console.log('💾 Modal - selectedItems:', selectedItems);
      console.log('💾 Modal - selectedServices:', selectedServices);
      console.log('💾 Modal - itens formatados:', requestCompleto.itens);
      console.log('💾 Modal - servicos formatados:', requestCompleto.servicos);
      console.log('💾 Modal - itens.length:', requestCompleto.itens.length);
      console.log('💾 Modal - servicos.length:', requestCompleto.servicos.length);
      
      await onSave(requestCompleto);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedRequest(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!request) {
    console.log('🔍 EditRequestModal - request é null, não renderizando');
    return null;
  }

  // Log para debug dos campos de hora
  console.log('🕐 Renderizando modal com editedRequest:', {
    start_datetime: editedRequest.start_datetime,
    end_datetime: editedRequest.end_datetime,
    formatted_start: formatTimeForInput(editedRequest.start_datetime),
    formatted_end: formatTimeForInput(editedRequest.end_datetime)
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar Requisição"
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </>
      }
      style={{ width: '800px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
    >
      <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Primeira linha - Departamento e Nome do Evento */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Departamento</label>
              <select
                className="input-field"
                value={editedRequest.department || ''}
                onChange={e => handleInputChange('department', e.target.value)}
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
            <div className="input-group">
              <label className="input-label">Nome do Evento</label>
              <input
                className="input-field"
                type="text"
                value={editedRequest.event_name || ''}
                onChange={e => handleInputChange('event_name', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Segunda linha - Data e Local */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Data</label>
              <input
                className="input-field"
                type="date"
                value={editedRequest.start_datetime ? editedRequest.start_datetime.split('T')[0] : ''}
                onChange={e => {
                  const currentTime = editedRequest.start_datetime ? editedRequest.start_datetime.split('T')[1] : '00:00';
                  handleInputChange('start_datetime', `${e.target.value}T${currentTime}`);
                  if (editedRequest.end_datetime) {
                    handleInputChange('end_datetime', `${e.target.value}T${editedRequest.end_datetime.split('T')[1]}`);
                  }
                }}
                required
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Local</label>
              <select
                className="input-field"
                value={editedRequest.location || ''}
                onChange={e => handleInputChange('location', e.target.value)}
              >
                {salasOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Terceira linha - Hora de Início e Fim */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Hora de Início</label>
              <input
                className="input-field"
                type="time"
                value={formatTimeForInput(editedRequest.start_datetime)}
              placeholder="00:00"
                            onChange={e => {
                console.log('🕐 Alterando hora de início para:', e.target.value);
                const currentDate = editedRequest.start_datetime ? editedRequest.start_datetime.split('T')[0] : new Date().toISOString().split('T')[0];
                handleInputChange('start_datetime', `${currentDate}T${e.target.value}`);
              }}
                required
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Hora de Fim</label>
              <input
                className="input-field"
                type="time"
                value={formatTimeForInput(editedRequest.end_datetime)}
              placeholder="00:00"
                              onChange={e => {
                console.log('🕐 Alterando hora de fim para:', e.target.value);
                const currentDate = editedRequest.end_datetime ? editedRequest.end_datetime.split('T')[0] : new Date().toISOString().split('T')[0];
                handleInputChange('end_datetime', `${currentDate}T${e.target.value}`);
              }}
                required
              />
            </div>
          </div>
        </div>

        {/* Quarta linha - Público Esperado e Prioridade */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Público Esperado</label>
              <input
                className="input-field"
                type="number"
                value={editedRequest.expected_audience || ''}
                onChange={e => handleInputChange('expected_audience', e.target.value)}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="input-group">
              <label className="input-label">Prioridade</label>
              <select
                className="input-field"
                value={editedRequest.prioridade || ''}
                onChange={e => handleInputChange('prioridade', e.target.value)}
              >
                {PRIORIDADE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="input-group">
          <label className="input-label">Descrição</label>
          <textarea
            className="input-field"
            value={editedRequest.description || ''}
            onChange={e => handleInputChange('description', e.target.value)}
            rows={4}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Seção de Itens do Inventário */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: '#374151' }}>Itens do Inventário</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setShowInventoryModal(true)}
              >
                Adicionar Item
              </Button>
            </div>
          </div>
          
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
                        Disponível: {item.quantity_available}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        min="1"
                        max={item.quantity_available}
                        value={item.quantity}
                        onChange={(e) => alterarQuantidadeItem(item.id, parseInt(e.target.value) || 0)}
                        style={{
                          width: '50px',
                          padding: '0.25rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontSize: '0.75rem'
                        }}
                      />
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removerItem(item.id)}
                        style={{ padding: '0.25rem', minWidth: 'auto' }}
                      >
                        ✕
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: '#374151' }}>Serviços Solicitados</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                  <div key={servico.id} style={{ 
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
                        onChange={(e) => alterarQuantidadeServico(servico.id, parseInt(e.target.value) || 0)}
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
                        onClick={() => removerServico(servico.id)}
                        style={{ padding: '0.25rem', minWidth: 'auto' }}
                      >
                        ✕
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
      </form>

      {/* Modal de Seleção de Itens do Inventário */}
      <Modal
        open={showInventoryModal}
        title="Selecionar Itens do Inventário"
        onClose={() => setShowInventoryModal(false)}
        actions={
          <Button variant="secondary" size="sm" onClick={() => setShowInventoryModal(false)}>
            Fechar
          </Button>
        }
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

        {/* Lista de Itens */}
        <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '8px' }}>
          {filteredInventory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredInventory.map((item) => {
                const isSelected = selectedItems.some(selected => selected.id === item.id);
                return (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem',
                    border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#eff6ff' : '#fff',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '500', 
                        color: isSelected ? '#1e40af' : '#111827',
                        marginBottom: '2px'
                      }}>
                        {item.name}
                        {isSelected && (
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
                        color: item.quantity_available > 0 ? '#059669' : '#dc2626',
                        fontWeight: '500'
                      }}>
                        Disponível: {item.quantity_available}
                      </div>
                    </div>
                    <Button
                      variant={isSelected ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => {
                        if (isSelected) {
                          removerItem(item.id);
                        } else {
                          adicionarItem(item);
                        }
                      }}
                      disabled={!isSelected && item.quantity_available <= 0}
                      style={{ marginLeft: '12px' }}
                    >
                      {isSelected ? (
                        <>
                          <FiX size={14} style={{ marginRight: '4px' }} />
                          Remover
                        </>
                      ) : (
                        <>
                          <FiPlus size={14} style={{ marginRight: '4px' }} />
                          Adicionar
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem 2rem', 
              color: '#6b7280',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb'
            }}>
              {searchTerm ? (
                <>
                  <FiSearch size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                    Nenhum item encontrado
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    Tente buscar com outros termos
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                    Nenhum item disponível
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    Não há itens no inventário
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Resumo dos itens selecionados */}
        {selectedItems.length > 0 && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '12px', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#1e40af', 
              marginBottom: '4px' 
            }}>
              Itens Selecionados: {selectedItems.length}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#1e40af',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {selectedItems.map(item => (
                <span key={item.id} style={{ 
                  backgroundColor: '#dbeafe', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  fontWeight: '500'
                }}>
                  {item.name} ({item.quantity})
                </span>
              ))}
            </div>
          </div>
        )}
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
                    adicionarServico('SERVICOS_GERAIS', quantidade);
                  } else {
                    removerServico('SERVICOS_GERAIS');
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
              <div style={{ fontWeight: '600', color: '#111827' }}>
                Segurança
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Controle de acesso e segurança
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

          {/* Transporte */}
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
              <div style={{ fontWeight: '600', color: '#111827' }}>
                Transporte
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Transporte de participantes
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
                    adicionarServico('TRANSPORTE', quantidade);
                  } else {
                    removerServico('TRANSPORTE');
                  }
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>pessoas</span>
            </div>
          </div>

          {/* Alimentação */}
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
              <div style={{ fontWeight: '600', color: '#111827' }}>
                Alimentação
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Fornecimento de refeições
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
                    adicionarServico('ALIMENTACAO', quantidade);
                  } else {
                    removerServico('ALIMENTACAO');
                  }
                }}
              />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>pessoas</span>
            </div>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}
