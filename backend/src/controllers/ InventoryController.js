import { supabase } from '../config/supabaseClient.js';

// Função utilitária para montar o objeto de insert/update SEM status
function buildInventoryData(body) {
  const data = {
    name: body.name,
    description: body.description,
    category: body.category,
    quantity_available: body.quantity_available,
    quantity_total: body.quantity_total,
    last_used_date: body.last_used_date,
    location: body.location
  };
  // NÃO grava status manualmente
  if (body.image_url) data.image_url = body.image_url;
  return data;
}

// Função para registrar histórico
export async function logInventoryHistory({ inventory_id, user_id, action, status_anterior, status_novo, quantidade_anterior, quantidade_nova, observacao }) {
  await supabase.from('inventory_history').insert([{
    inventory_id,
    user_id,
    action,
    status_anterior,
    status_novo,
    quantidade_anterior,
    quantidade_nova,
    observacao,
    created_at: new Date().toISOString()
  }]);
}

// Função utilitária para validar quantidade
function validateQuantities({ quantity_available, quantity_total }) {
  if (quantity_available < 0 || quantity_total < 0) {
    return 'Quantidade não pode ser negativa.';
  }
  if (quantity_available > quantity_total) {
    return 'Quantidade disponível não pode ser maior que a quantidade total.';
  }
  return null;
}

// Função utilitária para checar permissão de ADM/SEC/PASTOR
function checkAdminOrSecOrPastor(req, res) {
  if (!req.user || !['ADM', 'SEC', 'PASTOR'].includes(req.user.role)) {
    res.status(403).json({ success: false, message: 'Acesso negado. Apenas ADM, SEC ou PASTOR podem realizar esta ação.' });
    return false;
  }
  return true;
}

// Criar item de inventário
export const createInventoryItem = async (req, res) => {
  if (!checkAdminOrSecOrPastor(req, res)) return;
  try {
    const { name, category, quantity_available, quantity_total } = req.body;
    if (!name || !category || quantity_available === undefined || quantity_total === undefined) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios: name, category, quantity_available, quantity_total.' });
    }
    const validationError = validateQuantities({ quantity_available, quantity_total });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }
    // Monta dados SEM status
    const data = buildInventoryData(req.body);
    const { data: item, error } = await supabase
      .from('inventory')
      .insert([data])
      .select()
      .single();
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao criar item.', error: error.message });
    }
    // Log histórico
    await logInventoryHistory({
      inventory_id: item.id,
      user_id: req.user.userId,
      action: 'CRIACAO',
      status_anterior: null,
      status_novo: null, // Não há status
      quantidade_anterior: null,
      quantidade_nova: item.quantity_available,
      observacao: 'Item criado'
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Listar todos os itens de inventário (com filtros e alerta de quantidade baixa)
export const listInventoryItems = async (req, res) => {
  try {
    let query = supabase.from('inventory').select('*');
    const { name, category, status, location } = req.query;
    if (name) query = query.ilike('name', `%${name}%`);
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (location) query = query.ilike('location', `%${location}%`);
    const { data: items, error } = await query;
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao buscar itens.', error: error.message });
    }
    // Adicionar alerta de quantidade baixa + última utilização e usuário audiovisual
    const itemsWithAlert = await Promise.all(items.map(async item => {
      let last_used_at = null;
      let last_used_by_name = null;
      // Buscar último log de uso do tipo USO_REQUISICAO
      const { data: logs } = await supabase
        .from('inventory_history')
        .select('created_at, user_id, action')
        .eq('inventory_id', item.id)
        .eq('action', 'USO_REQUISICAO')
        .order('created_at', { ascending: false })
        .limit(1);
      if (logs && logs.length > 0) {
        last_used_at = logs[0].created_at ? logs[0].created_at.slice(0, 10) : null;
        // Buscar nome do usuário
        if (logs[0].user_id) {
          const { data: user } = await supabase
            .from('users')
            .select('full_name, role')
            .eq('id', logs[0].user_id)
            .single();
          if (user && user.role === 'AUDIOVISUAL') {
            last_used_by_name = user.full_name;
          } else {
            last_used_by_name = user ? user.full_name : null;
          }
        }
      }
      return {
      ...item,
        alerta_quantidade_baixa: item.quantity_available <= 2,
        last_used_at,
        last_used_by_name
      };
    }));
    res.json({ success: true, data: itemsWithAlert });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Detalhar um item de inventário
export const getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: item, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !item) {
      return res.status(404).json({ success: false, message: 'Item não encontrado.' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Atualizar item de inventário
export const updateInventoryItem = async (req, res) => {
  if (!checkAdminOrSecOrPastor(req, res)) return;
  try {
    const { id } = req.params;
    // Buscar item atual para log
    const { data: atual, error: errAtual } = await supabase.from('inventory').select('*').eq('id', id).single();
    if (errAtual || !atual) {
      return res.status(404).json({ success: false, message: 'Item não encontrado para atualizar.' });
    }
    // Validação de quantidade com ajuste automático
    let q_avail = req.body.quantity_available !== undefined ? req.body.quantity_available : atual.quantity_available;
    let q_total = req.body.quantity_total !== undefined ? req.body.quantity_total : atual.quantity_total;
    
    // Se a quantidade disponível for maior que a total, ajustar automaticamente
    if (q_avail > q_total) {
      console.log(`🔄 Ajustando quantidade disponível de ${q_avail} para ${q_total}`);
      q_avail = q_total;
    }
    
    const validationError = validateQuantities({ quantity_available: q_avail, quantity_total: q_total });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }
    // Usar os valores ajustados
    const adjustedBody = { ...req.body, quantity_available: q_avail, quantity_total: q_total };
    const data = buildInventoryData(adjustedBody);
    data.updated_at = new Date().toISOString();
    const { data: item, error } = await supabase
      .from('inventory')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error || !item) {
      return res.status(400).json({ success: false, message: 'Erro ao atualizar item.', error: error?.message });
    }
    // Log histórico
    await logInventoryHistory({
      inventory_id: id,
      user_id: req.user.userId,
      action: 'EDICAO',
      status_anterior: atual.status,
      status_novo: item.status,
      quantidade_anterior: atual.quantity_available,
      quantidade_nova: item.quantity_available,
      observacao: 'Item editado'
    });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Remover item de inventário
export const deleteInventoryItem = async (req, res) => {
  if (!checkAdminOrSecOrPastor(req, res)) return;
  try {
    const { id } = req.params;
    // Buscar item atual para log
    const { data: atual, error: errAtual } = await supabase.from('inventory').select('*').eq('id', id).single();
    if (errAtual || !atual) {
      return res.status(404).json({ success: false, message: 'Item não encontrado para remover.' });
    }
    console.log('Tentando deletar item do inventário:', id);
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);
    console.log('Resultado do delete:', error);
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao remover item.', error: error.message });
    }
    // Log histórico
    await logInventoryHistory({
      inventory_id: id,
      user_id: req.user.userId,
      action: 'REMOCAO',
      status_anterior: atual.status,
      status_novo: null,
      quantidade_anterior: atual.quantity_available,
      quantidade_nova: null,
      observacao: 'Item removido'
    });
    res.json({ success: true, message: 'Item removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Alterar status para RESERVADO
export const reserveInventoryItem = async (req, res) => {
  if (!checkAdminOrSecOrPastor(req, res)) return;
  try {
    const { id } = req.params;
    // Buscar item atual para log
    const { data: atual, error: errAtual } = await supabase.from('inventory').select('*').eq('id', id).single();
    if (errAtual || !atual) {
      return res.status(404).json({ success: false, message: 'Item não encontrado para reservar.' });
    }
    const { data: item, error } = await supabase
      .from('inventory')
      .update({ status: 'RESERVADO', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error || !item) {
      return res.status(400).json({ success: false, message: 'Erro ao reservar item.', error: error?.message });
    }
    // Log histórico
    await logInventoryHistory({
      inventory_id: id,
      user_id: req.user.userId,
      action: 'RESERVA',
      status_anterior: atual.status,
      status_novo: item.status,
      quantidade_anterior: atual.quantity_available,
      quantidade_nova: item.quantity_available,
      observacao: 'Item reservado'
    });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Alterar status para DISPONIVEL
export const releaseInventoryItem = async (req, res) => {
  if (!checkAdminOrSecOrPastor(req, res)) return;
  try {
    const { id } = req.params;
    // Buscar item atual para log
    const { data: atual, error: errAtual } = await supabase.from('inventory').select('*').eq('id', id).single();
    if (errAtual || !atual) {
      return res.status(404).json({ success: false, message: 'Item não encontrado para liberar.' });
    }
    const { data: item, error } = await supabase
      .from('inventory')
      .update({ status: 'DISPONIVEL', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error || !item) {
      return res.status(400).json({ success: false, message: 'Erro ao liberar item.', error: error?.message });
    }
    // Log histórico
    await logInventoryHistory({
      inventory_id: id,
      user_id: req.user.userId,
      action: 'LIBERACAO',
      status_anterior: atual.status,
      status_novo: item.status,
      quantidade_anterior: atual.quantity_available,
      quantidade_nova: item.quantity_available,
      observacao: 'Item liberado/disponível'
    });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Alterar status para MANUTENCAO
export const maintenanceInventoryItem = async (req, res) => {
  if (!checkAdminOrSecOrPastor(req, res)) return;
  try {
    const { id } = req.params;
    // Buscar item atual para log
    const { data: atual, error: errAtual } = await supabase.from('inventory').select('*').eq('id', id).single();
    if (errAtual || !atual) {
      return res.status(404).json({ success: false, message: 'Item não encontrado para manutenção.' });
    }
    const { data: item, error } = await supabase
      .from('inventory')
      .update({ status: 'MANUTENCAO', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error || !item) {
      return res.status(400).json({ success: false, message: 'Erro ao colocar item em manutenção.', error: error?.message });
    }
    // Log histórico
    await logInventoryHistory({
      inventory_id: id,
      user_id: req.user.userId,
      action: 'MANUTENCAO',
      status_anterior: atual.status,
      status_novo: item.status,
      quantidade_anterior: atual.quantity_available,
      quantidade_nova: item.quantity_available,
      observacao: 'Item em manutenção'
    });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Alterar status para INDISPONIVEL
export const unavailableInventoryItem = async (req, res) => {
  if (!checkAdminOrSecOrPastor(req, res)) return;
  try {
    const { id } = req.params;
    // Buscar item atual para log
    const { data: atual, error: errAtual } = await supabase.from('inventory').select('*').eq('id', id).single();
    if (errAtual || !atual) {
      return res.status(404).json({ success: false, message: 'Item não encontrado para indisponibilizar.' });
    }
    const { data: item, error } = await supabase
      .from('inventory')
      .update({ status: 'INDISPONIVEL', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error || !item) {
      return res.status(400).json({ success: false, message: 'Erro ao indisponibilizar item.', error: error?.message });
    }
    // Log histórico
    await logInventoryHistory({
      inventory_id: id,
      user_id: req.user.userId,
      action: 'INDISPONIBILIZACAO',
      status_anterior: atual.status,
      status_novo: item.status,
      quantidade_anterior: atual.quantity_available,
      quantidade_nova: item.quantity_available,
      observacao: 'Item indisponível'
    });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Listar histórico de um item (com nome do usuário)
export const listInventoryHistory = async (req, res) => {
  try {
    const { id } = req.params; // id do item
    const { data, error } = await supabase
      .from('inventory_history')
      .select('id, action, status_anterior, status_novo, quantidade_anterior, quantidade_nova, observacao, created_at, user_id, users(full_name)')
      .eq('inventory_id', id)
      .order('created_at', { ascending: false });
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao buscar histórico.', error: error.message });
    }
    // Mapear para trazer o nome do usuário direto no objeto
    const history = data.map(h => ({
      ...h,
      usuario: h.users ? h.users.full_name : null
    }));
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Upload de imagem (mock: recebe URL pronta)
export const uploadInventoryImage = async (req, res) => {
  if (!checkAdminOrSecOrPastor(req, res)) return;
  try {
    const { id } = req.params;
    const { image_url } = req.body;
    if (!image_url) {
      return res.status(400).json({ success: false, message: 'URL da imagem é obrigatória.' });
    }
    const { data: item, error } = await supabase
      .from('inventory')
      .update({ image_url, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error || !item) {
      return res.status(400).json({ success: false, message: 'Erro ao salvar imagem.', error: error?.message });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};
