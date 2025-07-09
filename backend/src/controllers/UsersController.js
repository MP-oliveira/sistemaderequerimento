import { supabase } from '../config/supabaseClient.js';

// Listar todos os usuários (apenas para administradores)
export const listUsers = async (req, res) => {
  try {
    // Verifica se o usuário é ADM
    if (!req.user || req.user.role !== 'ADM') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem listar usuários.'
      });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, is_active, created_at');

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Erro ao buscar usuários.',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Detalhar um usuário (apenas ADM)
export const getUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'ADM') {
      return res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores.' });
    }
    const { id } = req.params;
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, is_active, created_at')
      .eq('id', id)
      .single();
    if (error || !user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Editar dados de um usuário (apenas ADM)
export const updateUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'ADM') {
      return res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores.' });
    }
    const { id } = req.params;
    const { full_name, email, role } = req.body;
    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, full_name, email, role, is_active, created_at')
      .single();
    if (error || !user) {
      return res.status(400).json({ success: false, message: 'Erro ao atualizar usuário.', error: error?.message });
    }
    res.json({ success: true, message: 'Usuário atualizado com sucesso.', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Ativar/desativar usuário (apenas ADM)
export const toggleUserActive = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'ADM') {
      return res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores.' });
    }
    const { id } = req.params;
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'O campo is_active deve ser booleano.' });
    }
    const { data: user, error } = await supabase
      .from('users')
      .update({ is_active })
      .eq('id', id)
      .select('id, full_name, email, role, is_active, created_at')
      .single();
    if (error || !user) {
      return res.status(400).json({ success: false, message: 'Erro ao atualizar status.', error: error?.message });
    }
    res.json({ success: true, message: 'Status do usuário atualizado.', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Remover usuário (apenas ADM)
export const deleteUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'ADM') {
      return res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores.' });
    }
    const { id } = req.params;
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao remover usuário.', error: error?.message });
    }
    res.json({ success: true, message: 'Usuário removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};
