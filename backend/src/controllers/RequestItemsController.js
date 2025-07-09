import { supabase } from '../config/supabaseClient.js';

// Adicionar item a uma requisição
export const addRequestItem = async (req, res) => {
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
        estimated_value
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
export const listRequestItems = async (req, res) => {
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

// Remover item de uma requisição
export const deleteRequestItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('request_items')
      .delete()
      .eq('id', id);
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao remover item.', error: error.message });
    }
    res.json({ success: true, message: 'Item removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Atualizar item de uma requisição (opcional)
export const updateRequestItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, description, quantity_requested, estimated_value, inventory_id } = req.body;
    const updateData = {};
    if (item_name) updateData.item_name = item_name;
    if (description) updateData.description = description;
    if (quantity_requested) updateData.quantity_requested = quantity_requested;
    if (estimated_value) updateData.estimated_value = estimated_value;
    if (inventory_id) updateData.inventory_id = inventory_id;
    const { data: item, error } = await supabase
      .from('request_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error || !item) {
      return res.status(400).json({ success: false, message: 'Erro ao atualizar item.', error: error?.message });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
}; 