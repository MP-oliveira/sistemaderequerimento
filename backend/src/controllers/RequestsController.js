import { supabase } from '../config/supabaseClient.js';
// Importar função de log do histórico do inventário
import { logInventoryHistory } from './ InventoryController.js';

// Criar uma nova requisição
export const createRequest = async (req, res) => {
  try {
    console.log('🔍 [createRequest] req.body:', req.body);
    const {
      event_id = null,
      department,
      supplier = null,
      expected_audience = null,
      description,
      location = null,
      start_datetime = null,
      end_datetime = null,
      date,
      itens
    } = req.body;
    const requester_id = req.user.userId;
    const status = 'PENDENTE'; // status inicial
    console.log('Status enviado para o banco:', status);
    const { data: request, error } = await supabase
      .from('requests')
      .insert([{
        event_id,
        requester_id,
        department,
        supplier,
        expected_audience,
        description,
        location,
        start_datetime,
        end_datetime,
        date,
        status
      }])
      .select()
      .single();
    if (error) {
      console.log('❌ Erro ao criar requisição:', error);
      return res.status(400).json({ success: false, message: 'Erro ao criar requisição.', error: error.message });
    }
    // Aqui você pode salvar os itens da requisição em outra tabela se necessário
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Listar requisições do usuário (ou todas se ADM)
export const listRequests = async (req, res) => {
  try {
    let query = supabase.from('requests').select('*');
    if (req.user.role !== 'ADM') {
      query = query.or(`requester_id.eq.${req.user.userId},approved_by.eq.${req.user.userId},executed_by.eq.${req.user.userId}`);
    }
    const { data: requests, error } = await query;
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao buscar requisições.', error: error.message });
    }
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Detalhar uma requisição
export const getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: request, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !request) {
      return res.status(404).json({ success: false, message: 'Requisição não encontrada.' });
    }
    // Permissão: só envolvidos ou ADM podem ver
    if (
      req.user.role !== 'ADM' &&
      ![request.requester_id, request.approved_by, request.executed_by].includes(req.user.userId)
    ) {
      return res.status(403).json({ success: false, message: 'Acesso negado.' });
    }
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Aprovar requisição (PASTOR ou ADM)
export const approveRequest = async (req, res) => {
  try {
    if (!['ADM', 'PASTOR'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Apenas administradores ou pastores podem aprovar requisições.' });
    }
    const { id } = req.params;
    
    // Primeiro, buscar a requisição para obter os dados
    const { data: requestData, error: fetchError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !requestData) {
      return res.status(404).json({ success: false, message: 'Requisição não encontrada.', error: fetchError?.message });
    }
    
    // Atualizar status da requisição para APTO
    const { data: request, error } = await supabase
      .from('requests')
      .update({
        status: 'APTO',
        approved_by: req.user.userId,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !request) {
      return res.status(400).json({ success: false, message: 'Erro ao aprovar requisição.', error: error?.message });
    }
    
    // Criar evento automaticamente baseado na requisição
    if (requestData.start_datetime && requestData.end_datetime) {
      const eventName = `Evento - ${requestData.department}`;
      const eventDescription = requestData.description || `Evento aprovado da requisição ${id}`;
      
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([{
          name: eventName,
          location: requestData.location || 'Local a definir',
          start_datetime: requestData.start_datetime,
          end_datetime: requestData.end_datetime,
          description: eventDescription,
          expected_audience: requestData.expected_audience,
          created_by: req.user.userId,
          status: 'CONFIRMADO'
        }])
        .select()
        .single();
      
      if (eventError) {
        console.log('⚠️ Erro ao criar evento automaticamente:', eventError);
        // Não falha a aprovação se o evento não for criado
      } else {
        // Atualizar a requisição com o ID do evento criado
        await supabase
          .from('requests')
          .update({ event_id: event.id })
          .eq('id', id);
        
        console.log('✅ Evento criado automaticamente:', event.id);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Requisição aprovada e evento criado automaticamente.', 
      data: request 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Executar requisição (SEC ou AUDIOVISUAL)
export const executeRequest = async (req, res) => {
  try {
    if (!['SEC', 'AUDIOVISUAL'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Apenas Secretaria ou Audiovisual podem executar requisições.' });
    }
    const { id } = req.params;
    // Buscar itens da requisição
    const { data: requestItems, error: errorItems } = await supabase
      .from('request_items')
      .select('*')
      .eq('request_id', id);
    if (errorItems) {
      return res.status(400).json({ success: false, message: 'Erro ao buscar itens da requisição.', error: errorItems.message });
    }
    // Atualizar inventário para cada item
    for (const reqItem of requestItems) {
      if (!reqItem.inventory_id || !reqItem.quantity_requested) continue;
      // Buscar item do inventário
      const { data: inv, error: errInv } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', reqItem.inventory_id)
        .single();
      if (errInv || !inv) continue;
      const novaQuantidade = inv.quantity_available - reqItem.quantity_requested;
      const novoStatus = novaQuantidade <= 0 ? 'INDISPONIVEL' : inv.status;
      // Atualizar inventário
      await supabase
        .from('inventory')
        .update({
          quantity_available: novaQuantidade < 0 ? 0 : novaQuantidade,
          status: novoStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reqItem.inventory_id);
      // Registrar histórico
      await logInventoryHistory({
        inventory_id: reqItem.inventory_id,
        user_id: req.user.userId,
        action: 'USO_REQUISICAO',
        status_anterior: inv.status,
        status_novo: novoStatus,
        quantidade_anterior: inv.quantity_available,
        quantidade_nova: novaQuantidade < 0 ? 0 : novaQuantidade,
        observacao: `Item usado na execução da requisição ${id}`
      });
    }
    // Atualizar status da requisição
    const { data: request, error } = await supabase
      .from('requests')
      .update({
        status: 'EXECUTADO',
        executed_by: req.user.userId,
        executed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error || !request) {
      return res.status(400).json({ success: false, message: 'Erro ao executar requisição.', error: error?.message });
    }
    res.json({ success: true, message: 'Requisição executada e inventário atualizado.', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Rejeitar requisição (ADM ou PASTOR)
export const rejectRequest = async (req, res) => {
  try {
    if (!['ADM', 'PASTOR'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Apenas administradores ou pastores podem rejeitar requisições.' });
    }
    const { id } = req.params;
    const { rejection_reason } = req.body;
    if (!rejection_reason) {
      return res.status(400).json({ success: false, message: 'Motivo da rejeição é obrigatório.' });
    }
    const { data: request, error } = await supabase
      .from('requests')
      .update({
        status: 'REJEITADO',
        approved_by: req.user.userId,
        approved_at: new Date().toISOString(),
        rejection_reason
      })
      .eq('id', id)
      .select()
      .single();
    if (error || !request) {
      return res.status(400).json({ success: false, message: 'Erro ao rejeitar requisição.', error: error?.message });
    }
    res.json({ success: true, message: 'Requisição rejeitada.', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Finalizar requisição (devolução de itens)
export const finishRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { itensDevolvidos } = req.body; // [{ id: inventory_id, quantidade }]
    if (!Array.isArray(itensDevolvidos) || itensDevolvidos.length === 0) {
      return res.status(400).json({ success: false, message: 'Informe os itens devolvidos.' });
    }
    // Atualizar inventário para cada item devolvido
    for (const item of itensDevolvidos) {
      const { id: inventory_id, quantidade } = item;
      // Buscar item do inventário
      const { data: inv, error: errInv } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', inventory_id)
        .single();
      if (errInv || !inv) continue;
      const novaQuantidade = inv.quantity_available + quantidade;
      await supabase
        .from('inventory')
        .update({
          quantity_available: novaQuantidade,
          status: novaQuantidade >= 2 ? 'DISPONIVEL' : inv.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', inventory_id);
      // Registrar histórico (opcional)
      await logInventoryHistory({
        inventory_id,
        user_id: req.user.userId,
        action: 'DEVOLUCAO_EVENTO',
        status_anterior: inv.status,
        status_novo: novaQuantidade >= 2 ? 'DISPONIVEL' : inv.status,
        quantidade_anterior: inv.quantity_available,
        quantidade_nova: novaQuantidade,
        observacao: `Item devolvido na finalização da requisição ${id}`
      });
    }
    // Atualizar status da requisição
    const { data: request, error } = await supabase
      .from('requests')
      .update({
        status: 'FINALIZADO',
        finished_by: req.user.userId,
        finished_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error || !request) {
      return res.status(400).json({ success: false, message: 'Erro ao finalizar requisição.', error: error?.message });
    }
    res.json({ success: true, message: 'Requisição finalizada e itens devolvidos.', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};
