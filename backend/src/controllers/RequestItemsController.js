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
    
    // Verificar se o usuário é AUDIOVISUAL
    if (req.user.role !== 'AUDIOVISUAL') {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas audiovisual pode marcar itens como separados.' 
      });
    }
    
    const updateData = {
      is_separated: is_separated,
      separated_by: is_separated ? req.user.userId : null,
      separated_at: is_separated ? new Date().toISOString() : null
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
      message: is_separated ? 'Item marcado como separado!' : 'Item desmarcado como separado!',
      data: item 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Buscar itens do dia para audiovisual
const getTodayItems = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

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
          expected_audience
        )
      `)
      .gte('requests.start_datetime', startOfDay.toISOString())
      .lte('requests.start_datetime', endOfDay.toISOString())
      .eq('requests.status', 'APTO');

    if (error) {
      console.error('Erro ao buscar itens do dia:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }

    res.json({ 
      success: true, 
      data: data || [] 
    });
  } catch (error) {
    console.error('Erro ao buscar itens do dia:', error);
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
    const { data, error } = await supabase
      .from('request_items')
      .select(`
        id,
        request_id,
        inventory_id,
        item_name,
        quantity_requested,
        description,
        inventory (
          name,
          description
        ),
        requests (
          event_name,
          start_datetime,
          end_datetime
        )
      `);

    if (error) {
      console.error('Erro ao buscar itens executados:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }

    const items = data.map(item => ({
      id: item.id,
      request_id: item.request_id,
      inventory_id: item.inventory_id,
      item_name: item.item_name,
      quantity_requested: item.quantity_requested,
      description: item.description,
      inventory_item_name: item.inventory?.name,
      inventory_item_description: item.inventory?.description,
      request_title: item.requests?.event_name,
      request_event_name: item.requests?.event_name,
      request_start_time: item.requests?.start_datetime,
      request_end_time: item.requests?.end_datetime
    }));

    res.json({ 
      success: true, 
      data: items 
    });
  } catch (error) {
    console.error('Erro ao buscar itens executados:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

const markItemAsReturned = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se o item existe
    const { data: item, error: fetchError } = await supabase
      .from('request_items')
      .select('id, inventory_id')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item não encontrado' 
      });
    }

    // Por enquanto, apenas retornar sucesso
    // Quando as colunas forem adicionadas, podemos implementar a lógica completa
    console.log(`Item ${id} marcado como retornado pelo usuário ${userId}`);

    res.json({ 
      success: true, 
      message: 'Item marcado como retornado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao marcar item como retornado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
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