import { supabase } from '../config/supabaseClient.js';
// Importar função de log do histórico do inventário
import { logInventoryHistory } from './ InventoryController.js';
import { enviarEmail, enviarEmailPorPapel } from '../utils/emailService.js';

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

    // Buscar dados do solicitante para o e-mail
    const { data: solicitante } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', requester_id)
      .single();

    // Enviar e-mail para todos os pastores sobre a nova requisição
    try {
      const mensagemPastores = `Nova requisição criada!

Departamento: ${department}
Solicitante: ${solicitante?.full_name || 'N/A'}
Data: ${date}
Descrição: ${description}
Local: ${location || 'Não informado'}

Acesse o sistema para aprovar ou rejeitar esta requisição.`;

      await enviarEmailPorPapel('PASTOR', 'Nova Requisição Aguardando Aprovação', mensagemPastores);
      console.log('✅ E-mail enviado para pastores sobre nova requisição');
    } catch (e) {
      console.error('❌ Erro ao enviar e-mail para pastores:', e);
      // Não falha a criação da requisição se o e-mail falhar
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
    let query = supabase
      .from('requests')
      .select(`
        *,
        events:event_id (
          id,
          name,
          start_datetime,
          end_datetime
        )
      `);
    
    if (req.user.role !== 'ADM') {
      query = query.or(`requester_id.eq.${req.user.userId},approved_by.eq.${req.user.userId},executed_by.eq.${req.user.userId}`);
    }
    
    const { data: requests, error } = await query;
    
    if (error) {
      console.log('❌ Erro ao buscar requisições:', error);
      return res.status(400).json({ success: false, message: 'Erro ao buscar requisições.', error: error.message });
    }
    
    // Garantir que todos os campos necessários estejam presentes
    const processedRequests = (requests || []).map(request => ({
      id: request.id,
      department: request.department || '',
      description: request.description || '',
      date: request.date || '',
      status: request.status || 'PENDENTE',
      event_id: request.event_id || null,
      event_name: request.events?.name || null,
      requester_id: request.requester_id,
      approved_by: request.approved_by,
      executed_by: request.executed_by,
      created_at: request.created_at,
      updated_at: request.updated_at
    }));
    
    res.json({ success: true, data: processedRequests });
  } catch (error) {
    console.log('❌ Erro interno:', error);
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
    
    // Enviar e-mail automático ao usuário solicitante
    const { data: usuario } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', requestData.requester_id)
      .single();
    if (usuario && usuario.email) {
      try {
        await enviarEmail(
          usuario.email,
          'Sua requisição foi aprovada!',
          `Olá ${usuario.full_name},\n\nSua requisição #${id} foi aprovada e está apta para execução.\n\nAcesse o sistema para mais detalhes.`
        );
      } catch (e) {
        console.error('Erro ao enviar e-mail de aprovação:', e);
      }
    }

    // Enviar e-mail para audiovisual sobre a requisição aprovada
    try {
      const mensagemAudiovisual = `Requisição aprovada e aguardando execução!

ID da Requisição: ${id}
Departamento: ${requestData.department}
Solicitante: ${usuario?.full_name || 'N/A'}
Data: ${requestData.date}
Descrição: ${requestData.description}
Local: ${requestData.location || 'Não informado'}

Acesse o sistema para executar esta requisição.`;

      await enviarEmailPorPapel('AUDIOVISUAL', 'Requisição Aprovada - Aguardando Execução', mensagemAudiovisual);
      console.log('✅ E-mail enviado para audiovisual sobre requisição aprovada');
    } catch (e) {
      console.error('❌ Erro ao enviar e-mail para audiovisual:', e);
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
    // Enviar e-mail automático ao usuário solicitante
    const { data: usuario } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', request.requester_id)
      .single();
    if (usuario && usuario.email) {
      try {
        await enviarEmail(
          usuario.email,
          'Sua requisição foi executada!',
          `Olá ${usuario.full_name},\n\nSua requisição #${id} foi executada.\n\nAcesse o sistema para mais detalhes.`
        );
      } catch (e) {
        console.error('Erro ao enviar e-mail de execução:', e);
      }
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

    // Buscar dados do solicitante
    const { data: solicitante } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', request.requester_id)
      .single();

    // Enviar e-mail automático ao usuário solicitante
    if (solicitante && solicitante.email) {
      try {
        await enviarEmail(
          solicitante.email,
          'Sua requisição foi rejeitada!',
          `Olá ${solicitante.full_name},\n\nSua requisição #${id} foi rejeitada.\nMotivo: ${rejection_reason}\n\nAcesse o sistema para mais detalhes.`
        );
      } catch (e) {
        console.error('Erro ao enviar e-mail de rejeição:', e);
      }
    }

    // Enviar e-mail para secretários sobre a rejeição
    try {
      const mensagemSecretarios = `Requisição rejeitada!

ID da Requisição: ${id}
Departamento: ${request.department}
Solicitante: ${solicitante?.full_name || 'N/A'}
Data: ${request.date}
Motivo da Rejeição: ${rejection_reason}

A requisição foi rejeitada pelo pastor/administrador.`;

      await enviarEmailPorPapel('SEC', 'Requisição Rejeitada', mensagemSecretarios);
      console.log('✅ E-mail enviado para secretários sobre rejeição');
    } catch (e) {
      console.error('❌ Erro ao enviar e-mail para secretários:', e);
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
