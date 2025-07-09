import { supabase } from '../config/supabaseClient.js';

// Criar uma nova requisição
export const createRequest = async (req, res) => {
  try {
    const {
      event_id,
      department,
      supplier,
      expected_audience,
      description,
      location,
      start_datetime,
      end_datetime
    } = req.body;
    const requester_id = req.user.userId;
    const status = 'PREENCHIDO';
    const { data: request, error } = await supabase
      .from('requests')
      .insert([{
        event_id,
        requester_id,
        department,
        supplier,
        expected_audience,
        description,
        location,
        start_datetime,
        end_datetime,
        status
      }])
      .select()
      .single();
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao criar requisição.', error: error.message });
    }
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Listar requisições do usuário (ou todas se ADM)
export const listRequests = async (req, res) => {
  try {
    let query = supabase.from('requests').select('*');
    if (req.user.role !== 'ADM') {
      query = query.or(`requester_id.eq.${req.user.userId},approved_by.eq.${req.user.userId},executed_by.eq.${req.user.userId}`);
    }
    const { data: requests, error } = await query;
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao buscar requisições.', error: error.message });
    }
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Detalhar uma requisição
export const getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: request, error } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !request) {
      return res.status(404).json({ success: false, message: 'Requisição não encontrada.' });
    }
    // Permissão: só envolvidos ou ADM podem ver
    if (
      req.user.role !== 'ADM' &&
      ![request.requester_id, request.approved_by, request.executed_by].includes(req.user.userId)
    ) {
      return res.status(403).json({ success: false, message: 'Acesso negado.' });
    }
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Aprovar requisição (ADM ou PASTOR)
export const approveRequest = async (req, res) => {
  try {
    if (!['ADM', 'PASTOR'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Apenas administradores ou pastores podem aprovar requisições.' });
    }
    const { id } = req.params;
    const { data: request, error } = await supabase
      .from('requests')
      .update({
        status: 'APROVADO',
        approved_by: req.user.userId,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error || !request) {
      return res.status(400).json({ success: false, message: 'Erro ao aprovar requisição.', error: error?.message });
    }
    res.json({ success: true, message: 'Requisição aprovada.', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Executar requisição (SEC ou AUDIOVISUAL)
export const executeRequest = async (req, res) => {
  try {
    if (!['SEC', 'AUDIOVISUAL'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Apenas Secretaria ou Audiovisual podem executar requisições.' });
    }
    const { id } = req.params;
    const { data: request, error } = await supabase
      .from('requests')
      .update({
        status: 'EXECUTADO',
        executed_by: req.user.userId,
        executed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error || !request) {
      return res.status(400).json({ success: false, message: 'Erro ao executar requisição.', error: error?.message });
    }
    res.json({ success: true, message: 'Requisição executada.', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Rejeitar requisição (ADM ou PASTOR)
export const rejectRequest = async (req, res) => {
  try {
    if (!['ADM', 'PASTOR'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Apenas administradores ou pastores podem rejeitar requisições.' });
    }
    const { id } = req.params;
    const { rejection_reason } = req.body;
    if (!rejection_reason) {
      return res.status(400).json({ success: false, message: 'Motivo da rejeição é obrigatório.' });
    }
    const { data: request, error } = await supabase
      .from('requests')
      .update({
        status: 'REJEITADO',
        approved_by: req.user.userId,
        approved_at: new Date().toISOString(),
        rejection_reason
      })
      .eq('id', id)
      .select()
      .single();
    if (error || !request) {
      return res.status(400).json({ success: false, message: 'Erro ao rejeitar requisição.', error: error?.message });
    }
    res.json({ success: true, message: 'Requisição rejeitada.', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};
