import { supabase, supabaseAdmin } from '../config/supabaseClient.js';

// Criar novo usuário (apenas para administradores)
export const createUser = async (req, res) => {
  try {
    console.log('🔍 createUser - Iniciando criação de usuário');
    console.log('🔍 createUser - Usuário autenticado:', req.user);
    
    // Verifica se o usuário é ADM
    if (!req.user || req.user.role !== 'ADM') {
      console.log('❌ createUser - Acesso negado. Usuário não é ADM');
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem criar usuários.'
      });
    }

    const { nome, email, papel, senha } = req.body;
    console.log('🔍 createUser - Dados recebidos:', { nome, email, papel, senha: senha ? '***' : 'undefined' });

    // Validações
    if (!nome || !email || !papel || !senha) {
      console.log('❌ createUser - Campos obrigatórios faltando');
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios: nome, email, papel, senha'
      });
    }

    // Verificar se o email já existe
    console.log('🔍 createUser - Verificando se email já existe');
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('❌ createUser - Email já cadastrado');
      return res.status(400).json({
        success: false,
        message: 'E-mail já cadastrado'
      });
    }

    // Verificar se temos o cliente admin
    if (!supabaseAdmin) {
      console.log('❌ createUser - Cliente admin não disponível');
      return res.status(500).json({
        success: false,
        message: 'Erro de configuração do servidor. Contate o administrador.'
      });
    }

    console.log('🔍 createUser - Criando usuário no Supabase Auth');
    // Criar usuário no Supabase Auth usando o cliente admin
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true
    });

    if (authError) {
      console.log('❌ createUser - Erro ao criar usuário no Auth:', authError);
      return res.status(400).json({
        success: false,
        message: 'Erro ao criar usuário',
        error: authError.message
      });
    }

    console.log('🔍 createUser - Usuário criado no Auth, inserindo na tabela users');
    // Inserir dados adicionais na tabela users
    const { data: user, error: dbError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        full_name: nome,
        email: email,
        role: papel,
        is_active: true
      })
      .select('id, full_name, email, role, is_active, created_at')
      .single();

    if (dbError) {
      console.log('❌ createUser - Erro ao inserir na tabela users:', dbError);
      // Se falhar ao inserir na tabela, remover o usuário do auth
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return res.status(400).json({
        success: false,
        message: 'Erro ao criar usuário no banco de dados',
        error: dbError.message
      });
    }

    console.log('✅ createUser - Usuário criado com sucesso:', user);
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: user
    });

  } catch (error) {
    console.error('❌ createUser - Erro interno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Listar todos os usuários (ADM ou PASTOR)
export const listUsers = async (req, res) => {
  try {
    console.log('Usuário autenticado:', req.user);
    // Verifica se o usuário é ADM ou PASTOR
    if (!req.user || (req.user.role !== 'ADM' && req.user.role !== 'PASTOR')) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores ou pastores podem listar usuários.'
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
    const { id } = req.params;
    
    // Permitir que usuários vejam seus próprios dados OU que admins vejam qualquer usuário
    if (!req.user || (req.user.userId !== id && req.user.role !== 'ADM')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado. Você só pode ver seus próprios dados.' 
      });
    }
    
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
  // Permissão ADM
    if (!req.user || req.user.role !== 'ADM') {
      return res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores.' });
    }
  try {
    const { id } = req.params;
    // Buscar usuário atual
    const { data: usuario, error: errUsuario } = await supabase.from('users').select('*').eq('id', id).single();
    console.log('Usuário encontrado no banco:', usuario, 'Erro:', errUsuario);
    if (errUsuario || !usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado para remover.' });
    }
    console.log('Tentando deletar usuário:', id);
    // Deletar do banco
    const { data: deleted, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select();
    console.log('Resultado do delete no banco:', deleted, error);
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao remover usuário.', error: error.message });
    }
    // Deletar do Auth
    if (supabaseAdmin) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (authError) {
        if (authError.message && authError.message.includes('User not found')) {
          console.log('Usuário não encontrado no Auth, mas removido do banco.');
        } else {
          console.log('Erro ao remover do Auth:', authError.message);
        }
        // Nunca retorna erro para o frontend!
      }
    }
    res.json({ success: true, message: 'Usuário removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};
