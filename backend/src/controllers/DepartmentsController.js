import { supabase } from '../config/supabaseClient.js';

// Verifica permissão de ADM ou PASTOR
function checkAdminOrPastor(req, res) {
  if (!req.user || !['ADM', 'PASTOR'].includes(req.user.role)) {
    res.status(403).json({ success: false, message: 'Acesso negado. Apenas ADM ou PASTOR.' });
    return false;
  }
  return true;
}

// Listar departamentos
export const listDepartments = async (req, res) => {
  if (!checkAdminOrPastor(req, res)) return;
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id, nome, prioridade');
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao buscar departamentos.', error: error.message });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Criar departamento
export const createDepartment = async (req, res) => {
  if (!checkAdminOrPastor(req, res)) return;
  try {
    const { nome, prioridade } = req.body;
    if (!nome || !prioridade) {
      return res.status(400).json({ success: false, message: 'Nome e prioridade são obrigatórios.' });
    }
    const { data, error } = await supabase
      .from('departments')
      .insert([{ nome, prioridade }])
      .select()
      .single();
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao criar departamento.', error: error.message });
    }
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Editar departamento
export const updateDepartment = async (req, res) => {
  if (!checkAdminOrPastor(req, res)) return;
  try {
    const { id } = req.params;
    const { nome, prioridade } = req.body;
    if (!nome && !prioridade) {
      return res.status(400).json({ success: false, message: 'Informe nome ou prioridade para atualizar.' });
    }
    const updateData = {};
    if (nome) updateData.nome = nome;
    if (prioridade) updateData.prioridade = prioridade;
    const { data, error } = await supabase
      .from('departments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error || !data) {
      return res.status(400).json({ success: false, message: 'Erro ao atualizar departamento.', error: error?.message });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Remover departamento
export const deleteDepartment = async (req, res) => {
  if (!checkAdminOrPastor(req, res)) return;
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error || !data) {
      return res.status(400).json({ success: false, message: 'Erro ao remover departamento.', error: error?.message });
    }
    res.json({ success: true, message: 'Departamento removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
}; 