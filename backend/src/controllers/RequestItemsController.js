import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Adicionar item a uma requisição
const createRequestItem = async (req, res) => {
  try {
    const { request_id, inventory_id, item_name, description, quantity_requested, estimated_value } = req.body;
    if (!request_id || !item_name || !quantity_requested) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios: request_id, item_name, quantity_requested.' });
    }
    const { data: item, error } = await supabase
      .from('request_items')
      .insert([{
        request_id,
        inventory_id,
        item_name,
        description,
        quantity_requested,
        estimated_value,
        is_separated: false,
        separated_by: null,
        separated_at: null
      }])
      .select()
      .single();
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao adicionar item.', error: error.message });
    }
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Listar itens de uma requisição
const getRequestItems = async (req, res) => {
  try {
    const { request_id } = req.params;
    const { data: items, error } = await supabase
      .from('request_items')
      .select('*')
      .eq('request_id', request_id);
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao buscar itens.', error: error.message });
    }
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Marcar item como separado (AUDIOVISUAL)
const markItemAsSeparated = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_separated } = req.body;
    
    console.log('🔍 [markItemAsSeparated] Iniciando...');
    console.log('   Item ID:', id);
    console.log('   is_separated:', is_separated);
    console.log('   User:', req.user);
    console.log('   User role:', req.user?.role);
    
    // Verificar se o usuário é AUDIOVISUAL
    if (req.user.role !== 'AUDIOVISUAL') {
      console.log('❌ [markItemAsSeparated] Usuário não é AUDIOVISUAL:', req.user.role);
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas audiovisual pode marcar itens como separados.' 
      });
    }
    
    console.log('✅ [markItemAsSeparated] Usuário autorizado');
    
    const updateData = {
      is_separated: is_separated,
      separated_by: is_separated ? req.user.userId : null,
      separated_at: is_separated ? new Date().toISOString() : null
    };
    
    console.log('🔍 [markItemAsSeparated] Dados para atualização:', updateData);
    
    const { data: item, error } = await supabase
      .from('request_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error || !item) {
      console.error('❌ [markItemAsSeparated] Erro ao atualizar item:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao atualizar item.', 
        error: error?.message 
      });
    }
    
    console.log('✅ [markItemAsSeparated] Item atualizado com sucesso:', item);
    
    res.json({ 
      success: true, 
      message: is_separated ? 'Item marcado como separado!' : 'Item desmarcado como separado!',
      data: item 
    });
  } catch (error) {
    console.error('❌ [markItemAsSeparated] Erro interno:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Buscar itens do dia para audiovisual
const getTodayItems = async (req, res) => {
  try {
    // Usar fuso horário local (Brasília)
    const today = new Date();
    const todayLocal = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
    const todayStr = todayLocal.toISOString().split('T')[0];
    
    console.log('🔍 [getTodayItems] Buscando itens para hoje (local):', todayStr);

    // Buscar requisições aprovadas para hoje (apenas pela data)
    const { data: todayRequests, error: requestsError } = await supabase
      .from('requests')
      .select('id, event_name, start_datetime, end_datetime, location, expected_audience, status, date, department, description')
      .eq('status', 'APTO')
      .eq('date', todayStr);

    if (requestsError) {
      console.error('❌ Erro ao buscar requisições de hoje:', requestsError);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }

    console.log('🔍 [getTodayItems] Requisições de hoje encontradas:', todayRequests?.length || 0);

    if (!todayRequests || todayRequests.length === 0) {
      return res.json({ 
        success: true, 
        data: [] 
      });
    }

    // Buscar itens dessas requisições
    const requestIds = todayRequests.map(req => req.id);

    const { data, error } = await supabase
      .from('request_items')
      .select(`
        id,
        request_id,
        inventory_id,
        item_name,
        quantity_requested,
        description,
        is_separated,
        separated_by,
        separated_at,
        inventory (
          name,
          description
        ),
        requests (
          event_name,
          start_datetime,
          end_datetime,
          location,
          expected_audience,
          status,
          date,
          department,
          description
        )
      `)
      .in('request_id', requestIds);

    if (error) {
      console.error('❌ Erro ao buscar itens do dia:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }

    console.log('🔍 [getTodayItems] Itens encontrados:', data?.length || 0);

    res.json({ 
      success: true, 
      data: data || [] 
    });
  } catch (error) {
    console.error('❌ Erro ao buscar itens do dia:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// Remover item de uma requisição
const deleteRequestItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('request_items')
      .delete()
      .eq('id', id);
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao remover item.', error: error.message });
    }
    res.json({ success: true, message: 'Item removido com sucesso!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Atualizar item de uma requisição
const updateRequestItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, description, quantity_requested, estimated_value } = req.body;
    const { data: item, error } = await supabase
      .from('request_items')
      .update({
        item_name,
        description,
        quantity_requested,
        estimated_value
      })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao atualizar item.', error: error.message });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
}; 

const getExecutedItems = async (req, res) => {
  try {
    console.log('🔍 [getExecutedItems] Buscando itens executados...');
    
    // Primeiro, buscar requisições aprovadas (excluindo FINALIZADO)
    const { data: approvedRequests, error: requestsError } = await supabase
      .from('requests')
      .select('id')
      .in('status', ['APTO', 'PREENCHIDO', 'EXECUTADO']);
    
    if (requestsError) {
      console.error('❌ Erro ao buscar requisições:', requestsError);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
    
    console.log('🔍 [getExecutedItems] Requisições aprovadas encontradas:', approvedRequests?.length || 0);
    
    if (!approvedRequests || approvedRequests.length === 0) {
      return res.json({ 
        success: true, 
        data: [] 
      });
    }
    
    // Buscar itens dessas requisições
    const requestIds = approvedRequests.map(req => req.id);
    
    const { data, error } = await supabase
      .from('request_items')
      .select(`
        id,
        request_id,
        inventory_id,
        item_name,
        quantity_requested,
        description,
        is_separated,
        separated_by,
        separated_at,
        is_returned,
        returned_by,
        returned_at,
        inventory (
          name,
          description
        ),
        requests (
          event_name,
          start_datetime,
          end_datetime,
          status,
          department
        )
      `)
      .in('request_id', requestIds);

    if (error) {
      console.error('❌ Erro ao buscar itens executados:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }

    console.log('🔍 [getExecutedItems] Itens encontrados:', data?.length || 0);

    res.json({ 
      success: true, 
      data: data || [] 
    });
  } catch (error) {
    console.error('❌ Erro ao buscar itens executados:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

const markItemAsReturned = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 [markItemAsReturned] Iniciando...');
    console.log('   Item ID:', id);
    console.log('   User:', req.user);
    console.log('   User role:', req.user?.role);
    
    // Verificar se o usuário é AUDIOVISUAL
    if (req.user.role !== 'AUDIOVISUAL') {
      console.log('❌ [markItemAsReturned] Usuário não é AUDIOVISUAL:', req.user.role);
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas audiovisual pode marcar itens como retornados.' 
      });
    }
    
    console.log('✅ [markItemAsReturned] Usuário autorizado');
    
    // Verificar se o item existe e está separado
    const { data: item, error: fetchError } = await supabase
      .from('request_items')
      .select('id, is_separated, is_returned')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      console.error('❌ [markItemAsReturned] Item não encontrado:', fetchError);
      return res.status(404).json({ 
        success: false, 
        message: 'Item não encontrado' 
      });
    }
    
    console.log('🔍 [markItemAsReturned] Item encontrado:', item);
    
    // Verificar se o item está separado (pré-requisito para retorno)
    if (!item.is_separated) {
      console.log('❌ [markItemAsReturned] Item não está separado');
      return res.status(400).json({ 
        success: false, 
        message: 'Item deve estar separado antes de ser marcado como retornado.' 
      });
    }
    
    // Alternar o status de retorno
    const newReturnedStatus = !item.is_returned;
    
    const updateData = {
      is_returned: newReturnedStatus,
      returned_by: newReturnedStatus ? req.user.userId : null,
      returned_at: newReturnedStatus ? new Date().toISOString() : null
    };
    
    console.log('🔍 [markItemAsReturned] Dados para atualização:', updateData);
    
    const { data: updatedItem, error } = await supabase
      .from('request_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error || !updatedItem) {
      console.error('❌ [markItemAsReturned] Erro ao atualizar item:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao atualizar item.', 
        error: error?.message 
      });
    }
    
    console.log('✅ [markItemAsReturned] Item atualizado com sucesso:', updatedItem);
    
    res.json({ 
      success: true, 
      message: newReturnedStatus ? 'Item marcado como retornado!' : 'Item desmarcado como retornado!',
      data: updatedItem 
    });
  } catch (error) {
    console.error('❌ [markItemAsReturned] Erro interno:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Marcar item como indisponível com motivo
const markItemAsUnavailable = async (req, res) => {
  try {
    const { id } = req.params;
    const { unavailable_reason, audiovisual_notes } = req.body;
    
    // Verificar se o usuário é AUDIOVISUAL
    if (req.user.role !== 'AUDIOVISUAL') {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas audiovisual pode marcar itens como indisponíveis.' 
      });
    }
    
    const updateData = {
      item_status: 'INDISPONIVEL',
      unavailable_reason: unavailable_reason || null,
      audiovisual_notes: audiovisual_notes || null,
      is_separated: false,
      separated_by: null,
      separated_at: null
    };
    
    const { data: item, error } = await supabase
      .from('request_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error || !item) {
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao atualizar item.', 
        error: error?.message 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Item marcado como indisponível!',
      data: item 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Marcar item como disponível e separado
const markItemAsAvailableAndSeparated = async (req, res) => {
  try {
    const { id } = req.params;
    const { audiovisual_notes } = req.body;
    
    // Verificar se o usuário é AUDIOVISUAL
    if (req.user.role !== 'AUDIOVISUAL') {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas audiovisual pode marcar itens como disponíveis.' 
      });
    }
    
    const updateData = {
      item_status: 'SEPARADO',
      is_separated: true,
      separated_by: req.user.userId,
      separated_at: new Date().toISOString(),
      separation_datetime: new Date().toISOString(),
      unavailable_reason: null,
      audiovisual_notes: audiovisual_notes || null
    };
    
    const { data: item, error } = await supabase
      .from('request_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error || !item) {
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao atualizar item.', 
        error: error?.message 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Item marcado como disponível e separado!',
      data: item 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Buscar itens de uma requisição com detalhes do inventário
const getRequestItemsWithInventory = async (req, res) => {
  try {
    const { request_id } = req.params;
    
    const { data: items, error } = await supabase
      .from('request_items')
      .select(`
        *,
        inventory:inventory_id (
          id,
          name,
          category,
          location,
          quantity_available,
          status
        )
      `)
      .eq('request_id', request_id)
      .order('created_at', { ascending: true });
      
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao buscar itens.', 
        error: error.message 
      });
    }
    
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Atualizar observações do audiovisual
const updateAudiovisualNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { audiovisual_notes } = req.body;
    
    // Verificar se o usuário é AUDIOVISUAL
    if (req.user.role !== 'AUDIOVISUAL') {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas audiovisual pode atualizar observações.' 
      });
    }
    
    const { data: item, error } = await supabase
      .from('request_items')
      .update({ audiovisual_notes })
      .eq('id', id)
      .select()
      .single();
      
    if (error || !item) {
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao atualizar observações.', 
        error: error?.message 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Observações atualizadas!',
      data: item 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

export {
  createRequestItem,
  getRequestItems,
  markItemAsSeparated,
  getTodayItems,
  deleteRequestItem,
  updateRequestItem,
  getExecutedItems,
  markItemAsReturned,
  markItemAsUnavailable,
  markItemAsAvailableAndSeparated,
  getRequestItemsWithInventory,
  updateAudiovisualNotes
}; 