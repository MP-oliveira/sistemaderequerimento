import { supabase } from '../config/supabaseClient.js';

// Listar todos os locais ativos
export const listLocations = async (req, res) => {
  try {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Erro ao buscar locais:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar locais',
        error: error.message 
      });
    }

    res.json({ 
      success: true, 
      data: locations || [] 
    });
  } catch (error) {
    console.error('Erro interno ao buscar locais:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Criar novo local
export const createLocation = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome do local é obrigatório' 
      });
    }

    const { data: location, error } = await supabase
      .from('locations')
      .insert([{
        name,
        description: description || '',
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar local:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar local',
        error: error.message 
      });
    }

    res.status(201).json({ 
      success: true, 
      data: location,
      message: 'Local criado com sucesso' 
    });
  } catch (error) {
    console.error('Erro interno ao criar local:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Atualizar local
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const { data: location, error } = await supabase
      .from('locations')
      .update({
        name,
        description,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar local:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar local',
        error: error.message 
      });
    }

    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Local não encontrado' 
      });
    }

    res.json({ 
      success: true, 
      data: location,
      message: 'Local atualizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro interno ao atualizar local:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Deletar local (soft delete)
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: location, error } = await supabase
      .from('locations')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao deletar local:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao deletar local',
        error: error.message 
      });
    }

    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Local não encontrado' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Local deletado com sucesso' 
    });
  } catch (error) {
    console.error('Erro interno ao deletar local:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};
