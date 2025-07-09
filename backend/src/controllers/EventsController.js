import { supabase } from '../config/supabaseClient.js';

// Função utilitária para checar permissão de ADM/PASTOR/LIDER
function checkEventManager(req, res) {
  if (!req.user || !['ADM', 'PASTOR', 'LIDER'].includes(req.user.role)) {
    res.status(403).json({ success: false, message: 'Acesso negado. Apenas ADM, PASTOR ou LIDER podem realizar esta ação.' });
    return false;
  }
  return true;
}

// Função para registrar histórico
async function logEventHistory({ event_id, user_id, action, status_anterior, status_novo, campo_alterado, valor_anterior, valor_novo, observacao }) {
  await supabase.from('event_history').insert([{
    event_id,
    user_id,
    action,
    status_anterior,
    status_novo,
    campo_alterado,
    valor_anterior,
    valor_novo,
    observacao,
    created_at: new Date().toISOString()
  }]);
}

// Criar evento
export const createEvent = async (req, res) => {
  if (!checkEventManager(req, res)) return;
  try {
    const { name, location, start_datetime, end_datetime, description, expected_audience } = req.body;
    if (!name || !location || !start_datetime || !end_datetime) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios: name, location, start_datetime, end_datetime.' });
    }
    const { data: event, error } = await supabase
      .from('events')
      .insert([{
        name,
        location,
        start_datetime,
        end_datetime,
        description,
        expected_audience,
        created_by: req.user.userId
      }])
      .select()
      .single();
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao criar evento.', error: error.message });
    }
    // Log histórico
    await logEventHistory({
      event_id: event.id,
      user_id: req.user.userId,
      action: 'CRIACAO',
      status_anterior: null,
      status_novo: event.status,
      campo_alterado: null,
      valor_anterior: null,
      valor_novo: null,
      observacao: 'Evento criado'
    });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Listar eventos (com filtros)
export const listEvents = async (req, res) => {
  try {
    let query = supabase.from('events').select('*');
    const { name, location, status, start, end } = req.query;
    if (name) query = query.ilike('name', `%${name}%`);
    if (location) query = query.ilike('location', `%${location}%`);
    if (status) query = query.eq('status', status);
    if (start) query = query.gte('start_datetime', start);
    if (end) query = query.lte('end_datetime', end);
    const { data: events, error } = await query;
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao buscar eventos.', error: error.message });
    }
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Detalhar evento
export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !event) {
      return res.status(404).json({ success: false, message: 'Evento não encontrado.' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Atualizar evento
export const updateEvent = async (req, res) => {
  if (!checkEventManager(req, res)) return;
  try {
    const { id } = req.params;
    // Buscar evento atual para log
    const { data: atual, error: errAtual } = await supabase.from('events').select('*').eq('id', id).single();
    if (errAtual || !atual) {
      return res.status(404).json({ success: false, message: 'Evento não encontrado para atualizar.' });
    }
    const { name, location, start_datetime, end_datetime, description, expected_audience, status } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (start_datetime) updateData.start_datetime = start_datetime;
    if (end_datetime) updateData.end_datetime = end_datetime;
    if (description) updateData.description = description;
    if (expected_audience !== undefined) updateData.expected_audience = expected_audience;
    if (status) updateData.status = status;
    updateData.updated_at = new Date().toISOString();
    const { data: event, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error || !event) {
      return res.status(400).json({ success: false, message: 'Erro ao atualizar evento.', error: error?.message });
    }
    // Log histórico para cada campo alterado
    const campos = ['name', 'location', 'start_datetime', 'end_datetime', 'description', 'expected_audience', 'status'];
    for (const campo of campos) {
      if (req.body[campo] !== undefined && req.body[campo] !== atual[campo]) {
        await logEventHistory({
          event_id: id,
          user_id: req.user.userId,
          action: 'EDICAO',
          status_anterior: atual.status,
          status_novo: event.status,
          campo_alterado: campo,
          valor_anterior: atual[campo] !== undefined ? String(atual[campo]) : null,
          valor_novo: req.body[campo] !== undefined ? String(req.body[campo]) : null,
          observacao: `Campo ${campo} alterado`
        });
      }
    }
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Remover evento (soft delete: marcar como CANCELADO)
export const cancelEvent = async (req, res) => {
  if (!checkEventManager(req, res)) return;
  try {
    const { id } = req.params;
    // Buscar evento atual para log
    const { data: atual, error: errAtual } = await supabase.from('events').select('*').eq('id', id).single();
    if (errAtual || !atual) {
      return res.status(404).json({ success: false, message: 'Evento não encontrado para cancelar.' });
    }
    const { data: event, error } = await supabase
      .from('events')
      .update({ status: 'CANCELADO', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error || !event) {
      return res.status(400).json({ success: false, message: 'Erro ao cancelar evento.', error: error?.message });
    }
    // Log histórico
    await logEventHistory({
      event_id: id,
      user_id: req.user.userId,
      action: 'CANCELAMENTO',
      status_anterior: atual.status,
      status_novo: event.status,
      campo_alterado: 'status',
      valor_anterior: atual.status,
      valor_novo: 'CANCELADO',
      observacao: 'Evento cancelado'
    });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Listar histórico de um evento
export const listEventHistory = async (req, res) => {
  try {
    const { id } = req.params; // id do evento
    const { data, error } = await supabase
      .from('event_history')
      .select('id, action, status_anterior, status_novo, campo_alterado, valor_anterior, valor_novo, observacao, created_at, user_id')
      .eq('event_id', id)
      .order('created_at', { ascending: false });
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao buscar histórico.', error: error.message });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};
