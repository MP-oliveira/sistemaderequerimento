import { supabase } from '../config/supabaseClient.js';

// Listar todos os departamentos ativos
export const listDepartments = async (req, res) => {
  try {
    const { data: departments, error } = await supabase
      .from('departments')
      .select('*')
      .order('nome');

    if (error) {
      console.error('Erro ao buscar departamentos:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar departamentos',
        error: error.message 
      });
    }

    res.json({ 
      success: true, 
      data: departments || [] 
    });
  } catch (error) {
    console.error('Erro interno ao buscar departamentos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Criar novo departamento
export const createDepartment = async (req, res) => {
  try {
    const { nome, prioridade } = req.body;

    if (!nome) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome do departamento é obrigatório' 
      });
    }

    const { data: department, error } = await supabase
      .from('departments')
      .insert([{
        nome,
        prioridade: prioridade || 'Média'
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar departamento:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao criar departamento',
        error: error.message 
      });
    }

    res.status(201).json({ 
      success: true, 
      data: department,
      message: 'Departamento criado com sucesso' 
    });
  } catch (error) {
    console.error('Erro interno ao criar departamento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Atualizar departamento
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, prioridade } = req.body;

    const { data: department, error } = await supabase
      .from('departments')
      .update({
        nome,
        prioridade
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar departamento:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao atualizar departamento',
        error: error.message 
      });
    }

    if (!department) {
      return res.status(404).json({ 
        success: false, 
        message: 'Departamento não encontrado' 
      });
    }

    res.json({ 
      success: true, 
      data: department,
      message: 'Departamento atualizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro interno ao atualizar departamento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Deletar departamento (soft delete)
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: department, error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao deletar departamento:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao deletar departamento',
        error: error.message 
      });
    }

    if (!department) {
      return res.status(404).json({ 
        success: false, 
        message: 'Departamento não encontrado' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Departamento deletado com sucesso' 
    });
  } catch (error) {
    console.error('Erro interno ao deletar departamento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};