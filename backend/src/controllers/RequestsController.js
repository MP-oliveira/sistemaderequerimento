import { supabase } from '../config/supabaseClient.js';
// Importar função de log do histórico do inventário
import { logInventoryHistory } from './ InventoryController.js';
import { enviarEmail, enviarEmailPorPapel } from '../utils/emailService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/comprovantes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Use apenas: jpeg, jpg, png, gif, pdf, doc, docx, xls, xlsx'));
    }
  }
});

// Verificar conflitos em tempo real (para validação no frontend)
export const checkRealTimeConflicts = async (req, res) => {
  try {
    const {
      date = '',
      location = '',
      start_time = '',
      end_time = ''
    } = req.body;

    console.log('🔍 [checkRealTimeConflicts] Dados recebidos:', { date, location, start_time, end_time });

    if (!date || !location || !start_time || !end_time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Data, local, horário de início e fim são obrigatórios.' 
      });
    }

    // Construir datetime completo
    const start_datetime = `${date}T${start_time}`;
    const end_datetime = `${date}T${end_time}`;

    console.log('🔍 [checkRealTimeConflicts] Datetime construído:', { start_datetime, end_datetime });

    // Buscar eventos existentes para o mesmo local na mesma data
    const { data: eventosConflitantes } = await supabase
      .from('events')
      .select('id, name, location, start_datetime, end_datetime')
      .eq('location', location)
      .gte('start_datetime', `${date}T00:00:00`)
      .lte('start_datetime', `${date}T23:59:59`);

    // Buscar requisições já aprovadas para o mesmo local na mesma data
    const { data: reqsConflitantes } = await supabase
      .from('requests')
      .select('id, location, start_datetime, end_datetime, status, event_name')
      .eq('location', location)
      .eq('date', date)
      .in('status', ['APTO', 'EXECUTADO', 'FINALIZADO']);

    console.log('🔍 [checkRealTimeConflicts] Eventos encontrados:', eventosConflitantes?.length || 0);
    console.log('🔍 [checkRealTimeConflicts] Requisições encontradas:', reqsConflitantes?.length || 0);

    function parseUTC(dateStr) {
      if (!dateStr) return NaN;
      if (dateStr.endsWith('Z') || dateStr.includes('+')) return Date.parse(dateStr);
      return Date.parse(dateStr + '+00:00');
    }

    const startA = parseUTC(start_datetime);
    const endA = parseUTC(end_datetime);
    const intervaloMinimoMs = 15 * 60 * 1000; // 15 minutos em ms

    console.log('🔍 [checkRealTimeConflicts] Horários convertidos:', { startA, endA });

    const conflitos = [];
    const horariosDisponiveis = [];

    // Verificar conflitos com eventos
    (eventosConflitantes || []).forEach(ev => {
      const startB = parseUTC(ev.start_datetime);
      const endB = parseUTC(ev.end_datetime);
      if (isNaN(startA) || isNaN(endA) || isNaN(startB) || isNaN(endB)) return;

      console.log('🔍 [checkRealTimeConflicts] Verificando evento:', { 
        nome: ev.name, 
        startB, 
        endB, 
        startA, 
        endA,
        sobreposicao: startA < endB && endA > startB
      });

      // Verificar sobreposição direta
      if (startA < endB && endA > startB) {
        conflitos.push({
          tipo: 'EVENTO',
          nome: ev.name,
          inicio: ev.start_datetime.split('T')[1].substring(0, 5), // apenas HH:MM
          fim: ev.end_datetime.split('T')[1].substring(0, 5),
          conflito: 'SOBREPOSIÇÃO_DIRETA'
        });
      }
      
      // Verificar intervalo mínimo
      if (startA >= endB && (startA - endB) < intervaloMinimoMs) {
        conflitos.push({
          tipo: 'EVENTO',
          nome: ev.name,
          inicio: ev.start_datetime.split('T')[1].substring(0, 5),
          fim: ev.end_datetime.split('T')[1].substring(0, 5),
          conflito: 'INTERVALO_INSUFICIENTE',
          intervalo: Math.round((startA - endB) / 60000)
        });
      }
      if (endA <= startB && (startB - endA) < intervaloMinimoMs) {
        conflitos.push({
          tipo: 'EVENTO',
          nome: ev.name,
          inicio: ev.start_datetime.split('T')[1].substring(0, 5),
          fim: ev.end_datetime.split('T')[1].substring(0, 5),
          conflito: 'INTERVALO_INSUFICIENTE',
          intervalo: Math.round((startB - endA) / 60000)
        });
      }
    });

    // Verificar conflitos com requisições
    (reqsConflitantes || []).forEach(req => {
      const startB = parseUTC(req.start_datetime);
      const endB = parseUTC(req.end_datetime);
      if (isNaN(startA) || isNaN(endA) || isNaN(startB) || isNaN(endB)) return;

      console.log('🔍 [checkRealTimeConflicts] Verificando requisição:', { 
        nome: req.event_name, 
        startB, 
        endB, 
        startA, 
        endA,
        sobreposicao: startA < endB && endA > startB
      });

      // Verificar sobreposição direta
      if (startA < endB && endA > startB) {
        conflitos.push({
          tipo: 'REQUISIÇÃO',
          nome: req.event_name || 'Requisição',
          inicio: req.start_datetime.split('T')[1].substring(0, 5),
          fim: req.end_datetime.split('T')[1].substring(0, 5),
          status: req.status,
          conflito: 'SOBREPOSIÇÃO_DIRETA'
        });
      }
      
      // Verificar intervalo mínimo
      if (startA >= endB && (startA - endB) < intervaloMinimoMs) {
        conflitos.push({
          tipo: 'REQUISIÇÃO',
          nome: req.event_name || 'Requisição',
          inicio: req.start_datetime.split('T')[1].substring(0, 5),
          fim: req.end_datetime.split('T')[1].substring(0, 5),
          status: req.status,
          conflito: 'INTERVALO_INSUFICIENTE',
          intervalo: Math.round((startA - endB) / 60000)
        });
      }
      if (endA <= startB && (startB - endA) < intervaloMinimoMs) {
        conflitos.push({
          tipo: 'REQUISIÇÃO',
          nome: req.event_name || 'Requisição',
          inicio: req.start_datetime.split('T')[1].substring(0, 5),
          fim: req.end_datetime.split('T')[1].substring(0, 5),
          status: req.status,
          conflito: 'INTERVALO_INSUFICIENTE',
          intervalo: Math.round((startB - endA) / 60000)
        });
      }
    });

    console.log('🔍 [checkRealTimeConflicts] Conflitos encontrados:', conflitos.length);

    // Gerar sugestões de horários disponíveis
    if (conflitos.length > 0) {
      const todosEventos = [
        ...(eventosConflitantes || []).map(ev => ({
          inicio: parseUTC(ev.start_datetime),
          fim: parseUTC(ev.end_datetime),
          nome: ev.name
        })),
        ...(reqsConflitantes || []).map(req => ({
          inicio: parseUTC(req.start_datetime),
          fim: parseUTC(req.end_datetime),
          nome: req.event_name || 'Requisição'
        }))
      ].sort((a, b) => a.inicio - b.inicio);

      // Sugerir horários antes do primeiro evento
      if (todosEventos.length > 0 && todosEventos[0].inicio > parseUTC(`${date}T08:00:00`)) {
        const horarioSugerido = new Date(todosEventos[0].inicio - intervaloMinimoMs);
        horariosDisponiveis.push({
          inicio: horarioSugerido.toTimeString().substring(0, 5),
          fim: new Date(todosEventos[0].inicio).toTimeString().substring(0, 5),
          tipo: 'ANTES_DO_PRIMEIRO'
        });
      }

      // Sugerir horários entre eventos
      for (let i = 0; i < todosEventos.length - 1; i++) {
        const eventoAtual = todosEventos[i];
        const proximoEvento = todosEventos[i + 1];
        const intervalo = proximoEvento.inicio - eventoAtual.fim;
        
        if (intervalo >= intervaloMinimoMs * 2) { // Pelo menos 30 min para sugerir
          const inicioSugerido = new Date(eventoAtual.fim + intervaloMinimoMs);
          const fimSugerido = new Date(proximoEvento.inicio - intervaloMinimoMs);
          horariosDisponiveis.push({
            inicio: inicioSugerido.toTimeString().substring(0, 5),
            fim: fimSugerido.toTimeString().substring(0, 5),
            tipo: 'ENTRE_EVENTOS'
          });
        }
      }

      // Sugerir horário após o último evento
      if (todosEventos.length > 0) {
        const ultimoEvento = todosEventos[todosEventos.length - 1];
        if (ultimoEvento.fim < parseUTC(`${date}T22:00:00`)) {
          const horarioSugerido = new Date(ultimoEvento.fim + intervaloMinimoMs);
          horariosDisponiveis.push({
            inicio: horarioSugerido.toTimeString().substring(0, 5),
            fim: '22:00',
            tipo: 'APÓS_ÚLTIMO'
          });
        }
      }
    }

    const temConflitoDireto = conflitos.some(c => c.conflito === 'SOBREPOSIÇÃO_DIRETA');
    const temConflitoIntervalo = conflitos.some(c => c.conflito === 'INTERVALO_INSUFICIENTE');

    const response = {
      success: true,
      temConflito: conflitos.length > 0,
      temConflitoDireto,
      temConflitoIntervalo,
      conflitos,
      horariosDisponiveis,
      message: temConflitoDireto 
        ? 'Horário neste local indisponível. Tente outro local ou horário.'
        : temConflitoIntervalo 
        ? 'Intervalo insuficiente entre eventos. Escolha um horário com pelo menos 15 minutos de intervalo.'
        : 'Horário disponível!'
    };

    console.log('🔍 [checkRealTimeConflicts] Resposta final:', response);

    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Erro ao verificar conflitos em tempo real:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor ao verificar conflitos', 
      error: error.message 
    });
  }
};

// Verificar conflitos de horário sem criar requisição
export const checkConflicts = async (req, res) => {
  try {
    const {
      location = '',
      start_datetime = '',
      end_datetime = '',
    } = req.body;

    if (!location || !start_datetime || !end_datetime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Local, data de início e data de término são obrigatórios para verificar conflitos.' 
      });
    }

    // Buscar eventos existentes para o mesmo local
    const { data: eventosConflitantes } = await supabase
      .from('events')
      .select('id, name, location, start_datetime, end_datetime')
      .eq('location', location);

    // Buscar requisições já aprovadas para o mesmo local
    const { data: reqsConflitantes } = await supabase
      .from('requests')
      .select('id, location, start_datetime, end_datetime, status, event_name')
      .eq('location', location)
      .in('status', ['APTO', 'EXECUTADO', 'FINALIZADO']);

    function parseUTC(dateStr) {
      if (!dateStr) return NaN;
      if (dateStr.endsWith('Z') || dateStr.includes('+')) return Date.parse(dateStr);
      return Date.parse(dateStr + '+00:00');
    }

    const startA = parseUTC(start_datetime);
    const endA = parseUTC(end_datetime);
    const intervaloMinimoMs = 15 * 60 * 1000; // 15 minutos em ms

    const conflitos = [];

    // Verificar conflitos com eventos
    (eventosConflitantes || []).forEach(ev => {
      const startB = parseUTC(ev.start_datetime);
      const endB = parseUTC(ev.end_datetime);
      if (isNaN(startA) || isNaN(endA) || isNaN(startB) || isNaN(endB)) return;

      // Verificar sobreposição direta
      if (startA < endB && endA > startB) {
        conflitos.push({
          tipo: 'EVENTO',
          nome: ev.name,
          inicio: ev.start_datetime,
          fim: ev.end_datetime,
          conflito: 'SOBREPOSIÇÃO_DIRETA'
        });
      }
      
      // Verificar intervalo mínimo
      if (startA >= endB && (startA - endB) < intervaloMinimoMs) {
        conflitos.push({
          tipo: 'EVENTO',
          nome: ev.name,
          inicio: ev.start_datetime,
          fim: ev.end_datetime,
          conflito: 'INTERVALO_INSUFICIENTE',
          intervalo: Math.round((startA - endB) / 60000) // minutos
        });
      }
      if (endA <= startB && (startB - endA) < intervaloMinimoMs) {
        conflitos.push({
          tipo: 'EVENTO',
          nome: ev.name,
          inicio: ev.start_datetime,
          fim: ev.end_datetime,
          conflito: 'INTERVALO_INSUFICIENTE',
          intervalo: Math.round((startB - endA) / 60000) // minutos
        });
      }
    });

    // Verificar conflitos com requisições
    (reqsConflitantes || []).forEach(req => {
      const startB = parseUTC(req.start_datetime);
      const endB = parseUTC(req.end_datetime);
      if (isNaN(startA) || isNaN(endA) || isNaN(startB) || isNaN(endB)) return;

      // Verificar sobreposição direta
      if (startA < endB && endA > startB) {
        conflitos.push({
          tipo: 'REQUISIÇÃO',
          nome: req.event_name || 'Requisição',
          inicio: req.start_datetime,
          fim: req.end_datetime,
          status: req.status,
          conflito: 'SOBREPOSIÇÃO_DIRETA'
        });
      }
      
      // Verificar intervalo mínimo
      if (startA >= endB && (startA - endB) < intervaloMinimoMs) {
        conflitos.push({
          tipo: 'REQUISIÇÃO',
          nome: req.event_name || 'Requisição',
          inicio: req.start_datetime,
          fim: req.end_datetime,
          status: req.status,
          conflito: 'INTERVALO_INSUFICIENTE',
          intervalo: Math.round((startA - endB) / 60000) // minutos
        });
      }
      if (endA <= startB && (startB - endA) < intervaloMinimoMs) {
        conflitos.push({
          tipo: 'REQUISIÇÃO',
          nome: req.event_name || 'Requisição',
          inicio: req.start_datetime,
          fim: req.end_datetime,
          status: req.status,
          conflito: 'INTERVALO_INSUFICIENTE',
          intervalo: Math.round((startB - endA) / 60000) // minutos
        });
      }
    });

    const temConflitoDireto = conflitos.some(c => c.conflito === 'SOBREPOSIÇÃO_DIRETA');
    const temConflitoIntervalo = conflitos.some(c => c.conflito === 'INTERVALO_INSUFICIENTE');

    return res.status(200).json({
      success: true,
      temConflito: conflitos.length > 0,
      temConflitoDireto,
      temConflitoIntervalo,
      conflitos,
      message: temConflitoDireto 
        ? 'Existe conflito direto de horário. Não é possível criar esta requisição.'
        : temConflitoIntervalo 
        ? 'Existe conflito de intervalo. A requisição será marcada como pendente de conflito.'
        : 'Nenhum conflito encontrado.'
    });

  } catch (error) {
    console.error('❌ Erro ao verificar conflitos:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor ao verificar conflitos', 
      error: error.message 
    });
  }
};

// Criar uma nova requisição
export const createRequest = async (req, res) => {
  try {
    console.log('🔍 [createRequest] req.body:', req.body);
    const {
      department = '',
      expected_audience = '',
      location = '',
      start_datetime = '',
      end_datetime = '',
      description = '',
      date = new Date().toISOString().slice(0, 10),
      event_name = '',
      prioridade: prioridadeInput = '',
      status: statusInput = '',
      itens = [],
      event_id = null,
      rejection_reason = '',
    } = req.body;
    const requester_id = req.user.userId;
    let status = statusInput || 'PENDENTE'; // status inicial
    let conflitoDetectado = false;

    // Buscar prioridade do departamento
    let prioridade = prioridadeInput || 'Média';
    if (department) {
      const { data: dept, error: deptError } = await supabase
        .from('departments')
        .select('prioridade')
        .eq('id', department)
        .single();
      if (dept && dept.prioridade) prioridade = dept.prioridade;
    }

    // Verificação de conflito de local/data/horário
    if (location && start_datetime && end_datetime) {
      // Buscar eventos existentes para o mesmo local
      const { data: eventosConflitantes } = await supabase
        .from('events')
        .select('id, name, location, start_datetime, end_datetime')
        .eq('location', location);

      // Buscar requisições já aprovadas para o mesmo local (apenas APTO, EXECUTADO, FINALIZADO)
      const { data: reqsConflitantes } = await supabase
        .from('requests')
        .select('id, location, start_datetime, end_datetime, status')
        .eq('location', location)
        .in('status', ['APTO', 'EXECUTADO', 'FINALIZADO']);

      function parseUTC(dateStr) {
        if (!dateStr) return NaN;
        if (dateStr.endsWith('Z') || dateStr.includes('+')) return Date.parse(dateStr);
        return Date.parse(dateStr + '+00:00');
      }

      const startA = parseUTC(start_datetime);
      const endA = parseUTC(end_datetime);
      const intervaloMinimoMs = 15 * 60 * 1000; // 15 minutos em ms

      // Checar eventos
      const conflitoEvento = (eventosConflitantes || []).find(ev => {
        const startB = parseUTC(ev.start_datetime);
        const endB = parseUTC(ev.end_datetime);
        if (isNaN(startA) || isNaN(endA) || isNaN(startB) || isNaN(endB)) return false;

        // Verificar sobreposição direta
        if (startA < endB && endA > startB) return true;
        
        // Verificar intervalo mínimo de 15 minutos
        if (startA >= endB && (startA - endB) < intervaloMinimoMs) return true;
        if (endA <= startB && (startB - endA) < intervaloMinimoMs) return true;
        return false;
      });

      // Checar requisições
      const conflitoReq = (reqsConflitantes || []).find(req => {
        const startB = parseUTC(req.start_datetime);
        const endB = parseUTC(req.end_datetime);
        if (isNaN(startA) || isNaN(endA) || isNaN(startB) || isNaN(endB)) return false;

        // Verificar sobreposição direta
        if (startA < endB && endA > startB) return true;
        
        // Verificar intervalo mínimo de 15 minutos
        if (startA >= endB && (startA - endB) < intervaloMinimoMs) return true;
        if (endA <= startB && (startB - endA) < intervaloMinimoMs) return true;
        return false;
      });

      if (conflitoEvento || conflitoReq) {
        // Se há conflito direto (sobreposição), impedir a criação
        const conflitoDireto = (eventosConflitantes || []).find(ev => {
          const startB = parseUTC(ev.start_datetime);
          const endB = parseUTC(ev.end_datetime);
          if (isNaN(startA) || isNaN(endA) || isNaN(startB) || isNaN(endB)) return false;
          return startA < endB && endA > startB;
        }) || (reqsConflitantes || []).find(req => {
          const startB = parseUTC(req.start_datetime);
          const endB = parseUTC(req.end_datetime);
          if (isNaN(startA) || isNaN(endA) || isNaN(startB) || isNaN(endB)) return false;
          return startA < endB && endA > startB;
        });

        if (conflitoDireto) {
          return res.status(400).json({ 
            success: false, 
            message: 'Não é possível criar esta requisição. Existe conflito de horário com uma requisição/evento já aprovado para este local.',
            conflito: true
          });
        }

        // Se há apenas conflito de intervalo (menos de 15 min), marcar como PENDENTE_CONFLITO
        status = 'PENDENTE_CONFLITO';
        conflitoDetectado = true;
      }
    }

    const { data: request, error } = await supabase
      .from('requests')
      .insert([{
        requester_id,
        department,
        expected_audience,
        location,
        start_datetime,
        end_datetime,
        status,
        prioridade,
        description,
        date,
        event_name,
        event_id,
        rejection_reason
      }])
      .select()
      .single();
    if (error) {
      console.log('❌ Erro ao criar requisição:', error);
      return res.status(400).json({ success: false, message: 'Erro ao criar requisição.', error: error.message });
    }

    // Aqui você pode salvar os itens da requisição em outra tabela se necessário
    if (itens && itens.length > 0) {
      try {
        const itemsToInsert = itens.map(item => ({
          request_id: request.id,
          inventory_id: item.inventory_id,
          item_name: item.item_name,
          quantity_requested: item.quantity_requested
        }));

        const { error: itemsError } = await supabase
          .from('request_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('❌ Erro ao inserir itens da requisição:', itemsError);
          // Não falha a criação da requisição se os itens falharem
        } else {
          console.log('✅ Itens da requisição inseridos com sucesso');
        }
      } catch (itemsError) {
        console.error('❌ Erro ao processar itens da requisição:', itemsError);
        // Não falha a criação da requisição se os itens falharem
      }
    }

    // Buscar dados do solicitante para o e-mail
    const { data: solicitante } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', requester_id)
      .single();

    // Enviar e-mail para todos os pastores sobre a nova requisição
    try {
      const mensagemPastores = `Nova requisição criada!

Departamento: ${department}
Solicitante: ${solicitante?.full_name || 'N/A'}
Data: ${request.date}
Descrição: ${request.description}
Local: ${request.location || 'Não informado'}

Acesse o sistema para aprovar ou rejeitar esta requisição.`;

      await enviarEmailPorPapel('PASTOR', 'Nova Requisição Aguardando Aprovação', mensagemPastores);
      console.log('✅ E-mail enviado para pastores sobre nova requisição');
    } catch (e) {
      console.error('❌ Erro ao enviar e-mail para pastores:', e);
      // Não falha a criação da requisição se o e-mail falhar
    }

    // Aqui você pode salvar os itens da requisição em outra tabela se necessário
    if (conflitoDetectado) {
      return res.status(201).json({
        success: true,
        data: request,
        conflito: true,
        message: 'Requisição criada, mas há conflito de agenda. O pastor/ADM irá decidir qual será priorizada.'
      });
    }
    res.status(201).json({ success: true, data: request, conflito: false });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Listar requisições do usuário (ou todas se ADM)
export const listRequests = async (req, res) => {
  try {
    let query = supabase
      .from('requests')
      .select(`
        *,
        events:event_id (
          id,
          name,
          start_datetime,
          end_datetime
        )
      `);
    
    // Usuários AUDIOVISUAL podem ver todas as requisições (especialmente as aprovadas)
    if (req.user.role !== 'ADM' && req.user.role !== 'PASTOR' && req.user.role !== 'SEC' && req.user.role !== 'AUDIOVISUAL') {
      query = query.or(`requester_id.eq.${req.user.userId},approved_by.eq.${req.user.userId},executed_by.eq.${req.user.userId}`);
    }
    
    const { data: requests, error } = await query;
    
    if (error) {
      console.log('❌ Erro ao buscar requisições:', error);
      return res.status(400).json({ success: false, message: 'Erro ao buscar requisições.', error: error.message });
    }
    
    // Garantir que todos os campos necessários estejam presentes
    const processedRequests = (requests || []).map(request => ({
      id: request.id,
      department: request.department || '',
      status: request.status || 'PENDENTE',
      requester_id: request.requester_id,
      approved_by: request.approved_by,
      executed_by: request.executed_by,
      created_at: request.created_at,
      updated_at: request.updated_at,
      description: request.description || '',
      date: request.date || '',
      event_name: request.event_name || '',
      itens: request.itens || [],
      location: request.location || '',
      start_datetime: request.start_datetime || '',
      end_datetime: request.end_datetime || '',
      expected_audience: request.expected_audience || '',
      prioridade: request.prioridade || '',
      conflito: request.status === 'PENDENTE_CONFLITO',
      // Adicione outros campos que desejar exibir
    }));
    
    res.json({ success: true, data: processedRequests });
  } catch (error) {
    console.log('❌ Erro interno:', error);
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
    // Permissão: só ADM, PASTOR ou SEC podem ver detalhes completos para edição
    if (
      req.user.role !== 'ADM' && req.user.role !== 'PASTOR' && req.user.role !== 'SEC'
    ) {
      return res.status(403).json({ success: false, message: 'Acesso negado.' });
    }
    // Buscar itens relacionados à requisição
    const { data: itens, error: itensError } = await supabase
      .from('request_items')
      .select('*')
      .eq('request_id', id);
    // Retornar os dados da requisição + itens
    res.json({ success: true, data: { ...request, itens: itens || [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Aprovar requisição (PASTOR ou ADM)
export const approveRequest = async (req, res) => {
  try {
    if (!['ADM', 'PASTOR'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Apenas administradores ou pastores podem aprovar requisições.' });
    }
    const { id } = req.params;
    
    // Primeiro, buscar a requisição para obter os dados
    const { data: requestData, error: fetchError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !requestData) {
      return res.status(404).json({ success: false, message: 'Requisição não encontrada.', error: fetchError?.message });
    }
    
    // Só pode aprovar se status for PENDENTE ou PENDENTE_CONFLITO
    if (!['PENDENTE', 'PENDENTE_CONFLITO'].includes(requestData.status)) {
      return res.status(400).json({ success: false, message: 'Só é possível aprovar requisições com status PENDENTE ou PENDENTE_CONFLITO.' });
    }

    // Preparar histórico de status
    // const statusHistory = requestData.status_history || [];
    // statusHistory.push({
    //   status: 'APTO',
    //   date: new Date().toISOString(),
    //   user_id: req.user.userId,
    //   user_name: req.user.full_name || req.user.email,
    //   reason: 'Aprovado pelo administrador/pastor'
    // });

    // Atualizar status da requisição para APTO
    const { data: request, error } = await supabase
      .from('requests')
      .update({
        status: 'APTO',
        approved_at: new Date().toISOString()
        // approved_by: req.user.userId, // Comentado - pode causar erro de UUID
        // status_history: statusHistory // Comentado até a coluna existir
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !request) {
      return res.status(400).json({ success: false, message: 'Erro ao aprovar requisição.', error: error?.message });
    }
    
    // Enviar e-mail automático ao usuário solicitante
    const { data: usuario } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', requestData.requester_id)
      .single();
    if (usuario && usuario.email) {
      try {
        await enviarEmail(
          usuario.email,
          'Sua requisição foi aprovada!',
          `Olá ${usuario.full_name},\n\nSua requisição #${id} foi aprovada e está apta para execução.\n\nAcesse o sistema para mais detalhes.`
        );
      } catch (e) {
        console.error('Erro ao enviar e-mail de aprovação:', e);
      }
    }

    // Enviar e-mail para audiovisual sobre a requisição aprovada
    try {
      const mensagemAudiovisual = `Requisição aprovada e aguardando execução!

ID da Requisição: ${id}
Departamento: ${requestData.department}
Solicitante: ${usuario?.full_name || 'N/A'}
Data: ${requestData.date}
Descrição: ${requestData.description}
Local: ${requestData.location || 'Não informado'}

Acesse o sistema para executar esta requisição.`;

      await enviarEmailPorPapel('AUDIOVISUAL', 'Requisição Aprovada - Aguardando Execução', mensagemAudiovisual);
      console.log('✅ E-mail enviado para audiovisual sobre requisição aprovada');
    } catch (e) {
      console.error('❌ Erro ao enviar e-mail para audiovisual:', e);
    }
    
    // Criar evento automaticamente baseado na requisição
    if (requestData.start_datetime && requestData.end_datetime) {
      const eventName = `Evento - ${requestData.department}`;
      const eventDescription = requestData.description || `Evento aprovado da requisição ${id}`;
      
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([{
          name: eventName,
          location: requestData.location || 'Local a definir',
          start_datetime: requestData.start_datetime,
          end_datetime: requestData.end_datetime,
          description: eventDescription,
          expected_audience: requestData.expected_audience,
          created_by: req.user.userId,
          status: 'CONFIRMADO'
        }])
        .select()
        .single();
      
      if (eventError) {
        console.log('⚠️ Erro ao criar evento automaticamente:', eventError);
        // Não falha a aprovação se o evento não for criado
      } else {
        // Atualizar a requisição com o ID do evento criado
        await supabase
          .from('requests')
          .update({ event_id: event.id })
          .eq('id', id);
        
        console.log('✅ Evento criado automaticamente:', event.id);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Requisição aprovada e evento criado automaticamente.', 
      data: request 
    });
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
    // Buscar itens da requisição
    const { data: requestItems, error: errorItems } = await supabase
      .from('request_items')
      .select('*')
      .eq('request_id', id);
    if (errorItems) {
      return res.status(400).json({ success: false, message: 'Erro ao buscar itens da requisição.', error: errorItems.message });
    }
    // Atualizar inventário para cada item
    for (const reqItem of requestItems) {
      if (!reqItem.inventory_id || !reqItem.quantity_requested) continue;
      // Buscar item do inventário
      const { data: inv, error: errInv } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', reqItem.inventory_id)
        .single();
      if (errInv || !inv) continue;
      const novaQuantidade = inv.quantity_available - reqItem.quantity_requested;
      const novoStatus = novaQuantidade <= 0 ? 'INDISPONIVEL' : inv.status;
      // Atualizar inventário
      await supabase
        .from('inventory')
        .update({
          quantity_available: novaQuantidade < 0 ? 0 : novaQuantidade,
          status: novoStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reqItem.inventory_id);
      // Registrar histórico
      await logInventoryHistory({
        inventory_id: reqItem.inventory_id,
        user_id: req.user.userId,
        action: 'USO_REQUISICAO',
        status_anterior: inv.status,
        status_novo: novoStatus,
        quantidade_anterior: inv.quantity_available,
        quantidade_nova: novaQuantidade < 0 ? 0 : novaQuantidade,
        observacao: `Item usado na execução da requisição ${id}`
      });
    }
    // Atualizar status da requisição
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
    // Enviar e-mail automático ao usuário solicitante
    const { data: usuario } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', request.requester_id)
      .single();
    if (usuario && usuario.email) {
      try {
        await enviarEmail(
          usuario.email,
          'Sua requisição foi executada!',
          `Olá ${usuario.full_name},\n\nSua requisição #${id} foi executada.\n\nAcesse o sistema para mais detalhes.`
        );
      } catch (e) {
        console.error('Erro ao enviar e-mail de execução:', e);
      }
    }
    res.json({ success: true, message: 'Requisição executada e inventário atualizado.', data: request });
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

    // Buscar dados da requisição atual
    const { data: requestData, error: fetchError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !requestData) {
      return res.status(404).json({ success: false, message: 'Requisição não encontrada.', error: fetchError?.message });
    }

    // Preparar histórico de status
    // const statusHistory = requestData.status_history || [];
    // statusHistory.push({
    //   status: 'REJEITADO',
    //   date: new Date().toISOString(),
    //   user_id: req.user.userId,
    //   user_name: req.user.full_name || req.user.email,
    //   reason: rejection_reason
    // });

    const { data: request, error } = await supabase
      .from('requests')
      .update({
        status: 'REJEITADO',
        approved_at: new Date().toISOString(),
        rejection_reason
        // approved_by: req.user.userId, // Comentado - pode causar erro de UUID
        // status_history: statusHistory // Comentado até a coluna existir
      })
      .eq('id', id)
      .select()
      .single();
    if (error || !request) {
      return res.status(400).json({ success: false, message: 'Erro ao rejeitar requisição.', error: error?.message });
    }

    // Buscar dados do solicitante
    const { data: solicitante } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', request.requester_id)
      .single();

    // Enviar e-mail automático ao usuário solicitante
    if (solicitante && solicitante.email) {
      try {
        await enviarEmail(
          solicitante.email,
          'Sua requisição foi rejeitada!',
          `Olá ${solicitante.full_name},\n\nSua requisição #${id} foi rejeitada.\nMotivo: ${rejection_reason}\n\nAcesse o sistema para mais detalhes.`
        );
      } catch (e) {
        console.error('Erro ao enviar e-mail de rejeição:', e);
      }
    }

    // Enviar e-mail para secretários sobre a rejeição
    try {
      const mensagemSecretarios = `Requisição rejeitada!

ID da Requisição: ${id}
Departamento: ${request.department}
Solicitante: ${solicitante?.full_name || 'N/A'}
Data: ${request.date}
Motivo da Rejeição: ${rejection_reason}

A requisição foi rejeitada pelo pastor/administrador.`;

      await enviarEmailPorPapel('SEC', 'Requisição Rejeitada', mensagemSecretarios);
      console.log('✅ E-mail enviado para secretários sobre rejeição');
    } catch (e) {
      console.error('❌ Erro ao enviar e-mail para secretários:', e);
    }

    res.json({ success: true, message: 'Requisição rejeitada.', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Finalizar requisição (devolução de itens)
export const finishRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { itensDevolvidos } = req.body; // [{ id: inventory_id, quantidade }]
    if (!Array.isArray(itensDevolvidos) || itensDevolvidos.length === 0) {
      return res.status(400).json({ success: false, message: 'Informe os itens devolvidos.' });
    }
    // Atualizar inventário para cada item devolvido
    for (const item of itensDevolvidos) {
      const { id: inventory_id, quantidade } = item;
      // Buscar item do inventário
      const { data: inv, error: errInv } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', inventory_id)
        .single();
      if (errInv || !inv) continue;
      const novaQuantidade = inv.quantity_available + quantidade;
      await supabase
        .from('inventory')
        .update({
          quantity_available: novaQuantidade,
          status: novaQuantidade >= 2 ? 'DISPONIVEL' : inv.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', inventory_id);
      // Registrar histórico (opcional)
      await logInventoryHistory({
        inventory_id,
        user_id: req.user.userId,
        action: 'DEVOLUCAO_EVENTO',
        status_anterior: inv.status,
        status_novo: novaQuantidade >= 2 ? 'DISPONIVEL' : inv.status,
        quantidade_anterior: inv.quantity_available,
        quantidade_nova: novaQuantidade,
        observacao: `Item devolvido na finalização da requisição ${id}`
      });
    }
    // Atualizar status da requisição
    const { data: request, error } = await supabase
      .from('requests')
      .update({
        status: 'FINALIZADO',
        finished_by: req.user.userId,
        finished_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error || !request) {
      return res.status(400).json({ success: false, message: 'Erro ao finalizar requisição.', error: error?.message });
    }
    res.json({ success: true, message: 'Requisição finalizada e itens devolvidos.', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Upload de comprovante para uma requisição
export const uploadComprovante = async (req, res) => {
  try {
    const { request_id } = req.params;
    const { description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado.' });
    }

    // Verificar se a requisição existe
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (requestError || !request) {
      return res.status(404).json({ success: false, message: 'Requisição não encontrada.' });
    }

    // Verificar permissão: só o solicitante, aprovador, executor ou ADM podem adicionar comprovantes
    if (
      req.user.role !== 'ADM' &&
      ![request.requester_id, request.approved_by, request.executed_by].includes(req.user.userId)
    ) {
      return res.status(403).json({ success: false, message: 'Acesso negado.' });
    }

    // Salvar informações do comprovante no banco
    const { data: comprovante, error } = await supabase
      .from('request_comprovantes')
      .insert([{
        request_id,
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        description: description || 'Comprovante anexado',
        uploaded_by: req.user.userId
      }])
      .select()
      .single();

    if (error) {
      // Se falhar ao salvar no banco, remover o arquivo
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Erro ao salvar comprovante.', error: error.message });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Comprovante enviado com sucesso.',
      data: comprovante 
    });
  } catch (error) {
    // Se houver erro, remover arquivo se existir
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Listar comprovantes de uma requisição
export const listComprovantes = async (req, res) => {
  try {
    const { request_id } = req.params;

    // Verificar se a requisição existe
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (requestError || !request) {
      return res.status(404).json({ success: false, message: 'Requisição não encontrada.' });
    }

    // Verificar permissão: só o solicitante, aprovador, executor ou ADM podem ver comprovantes
    if (
      req.user.role !== 'ADM' &&
      ![request.requester_id, request.approved_by, request.executed_by].includes(req.user.userId)
    ) {
      return res.status(403).json({ success: false, message: 'Acesso negado.' });
    }

    const { data: comprovantes, error } = await supabase
      .from('request_comprovantes')
      .select(`
        *,
        users:uploaded_by (
          id,
          full_name
        )
      `)
      .eq('request_id', request_id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao buscar comprovantes.', error: error.message });
    }

    // Mapear para incluir nome do usuário
    const comprovantesComUsuario = comprovantes.map(comp => ({
      ...comp,
      uploaded_by_name: comp.users ? comp.users.full_name : 'Usuário não encontrado'
    }));

    res.json({ success: true, data: comprovantesComUsuario });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Download de um comprovante
export const downloadComprovante = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar comprovante
    const { data: comprovante, error } = await supabase
      .from('request_comprovantes')
      .select(`
        *,
        requests!inner (
          requester_id,
          approved_by,
          executed_by
        )
      `)
      .eq('id', id)
      .single();

    if (error || !comprovante) {
      return res.status(404).json({ success: false, message: 'Comprovante não encontrado.' });
    }

    // Verificar permissão
    const request = comprovante.requests;
    if (
      req.user.role !== 'ADM' &&
      ![request.requester_id, request.approved_by, request.executed_by].includes(req.user.userId)
    ) {
      return res.status(403).json({ success: false, message: 'Acesso negado.' });
    }

    // Verificar se arquivo existe
    if (!fs.existsSync(comprovante.file_path)) {
      return res.status(404).json({ success: false, message: 'Arquivo não encontrado no servidor.' });
    }

    // Enviar arquivo
    res.download(comprovante.file_path, comprovante.original_name);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Remover comprovante
export const removeComprovante = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar comprovante
    const { data: comprovante, error } = await supabase
      .from('request_comprovantes')
      .select(`
        *,
        requests!inner (
          requester_id,
          approved_by,
          executed_by
        )
      `)
      .eq('id', id)
      .single();

    if (error || !comprovante) {
      return res.status(404).json({ success: false, message: 'Comprovante não encontrado.' });
    }

    // Verificar permissão: só quem enviou ou ADM pode remover
    const request = comprovante.requests;
    if (
      req.user.role !== 'ADM' &&
      comprovante.uploaded_by !== req.user.userId
    ) {
      return res.status(403).json({ success: false, message: 'Acesso negado.' });
    }

    // Remover arquivo do servidor
    if (fs.existsSync(comprovante.file_path)) {
      fs.unlinkSync(comprovante.file_path);
    }

    // Remover registro do banco
    const { error: deleteError } = await supabase
      .from('request_comprovantes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(400).json({ success: false, message: 'Erro ao remover comprovante.', error: deleteError.message });
    }

    res.json({ success: true, message: 'Comprovante removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Atualizar uma requisição
export const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { data: updated, error } = await supabase
      .from('requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error || !updated) {
      return res.status(400).json({ success: false, message: 'Erro ao atualizar requisição', error: error?.message });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Deletar uma requisição
export const deleteRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', id);
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao deletar requisição', error: error.message });
    }
    return res.status(200).json({ success: true, message: 'Requisição deletada com sucesso' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erro interno do servidor', error: err.message });
  }
};

// Middleware para upload de arquivo
export const uploadMiddleware = upload.single('comprovante');

// Retornar instrumentos ao inventário (AUDIOVISUAL)
export const returnInstruments = async (req, res) => {
  try {
    if (req.user.role !== 'AUDIOVISUAL') {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas audiovisual pode retornar instrumentos.' 
      });
    }

    const { id } = req.params;
    const { return_notes } = req.body;

    // Buscar requisição
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single();

    if (requestError || !request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Requisição não encontrada.' 
      });
    }

    if (request.status !== 'EXECUTADO') {
      return res.status(400).json({ 
        success: false, 
        message: 'Apenas requisições executadas podem ter instrumentos retornados.' 
      });
    }

    // Buscar itens da requisição
    const { data: requestItems, error: errorItems } = await supabase
      .from('request_items')
      .select('*')
      .eq('request_id', id);

    if (errorItems) {
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao buscar itens da requisição.', 
        error: errorItems.message 
      });
    }

    // Retornar cada item ao inventário
    for (const reqItem of requestItems) {
      if (!reqItem.inventory_id || !reqItem.quantity_requested) continue;

      // Buscar item do inventário
      const { data: inv, error: errInv } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', reqItem.inventory_id)
        .single();

      if (errInv || !inv) continue;

      const novaQuantidade = inv.quantity_available + reqItem.quantity_requested;
      const novoStatus = novaQuantidade > 0 ? 'DISPONIVEL' : inv.status;

      // Atualizar inventário
      await supabase
        .from('inventory')
        .update({
          quantity_available: novaQuantidade,
          status: novoStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reqItem.inventory_id);

      // Registrar histórico
      await logInventoryHistory({
        inventory_id: reqItem.inventory_id,
        user_id: req.user.userId,
        action: 'RETORNO_REQUISICAO',
        status_anterior: inv.status,
        status_novo: novoStatus,
        quantidade_anterior: inv.quantity_available,
        quantidade_nova: novaQuantidade,
        observacao: `Item retornado da requisição ${id}${return_notes ? ` - ${return_notes}` : ''}`
      });
    }

    // Atualizar status da requisição para FINALIZADO
    const { data: updatedRequest, error } = await supabase
      .from('requests')
      .update({
        status: 'FINALIZADO',
        // returned_by: req.user.userId, // Comentado até a coluna existir
        // returned_at: new Date().toISOString(), // Comentado até a coluna existir
        // return_notes: return_notes || null // Comentado até a coluna existir
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao finalizar requisição.', 
        error: error?.message 
      });
    }

    // Enviar e-mail ao solicitante
    const { data: usuario } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', request.requester_id)
      .single();

    if (usuario && usuario.email) {
      try {
        await enviarEmail(
          usuario.email,
          'Requisição finalizada - Instrumentos retornados',
          `Olá ${usuario.full_name},\n\nSua requisição #${id} foi finalizada e todos os instrumentos foram retornados ao inventário.\n\nAcesse o sistema para mais detalhes.`
        );
      } catch (e) {
        console.error('Erro ao enviar e-mail de finalização:', e);
      }
    }

    res.json({ 
      success: true, 
      message: 'Instrumentos retornados e requisição finalizada.', 
      data: updatedRequest 
    });

  } catch (error) {
    console.error('Erro ao retornar instrumentos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: error.message 
    });
  }
};

// Buscar requisições aprovadas para histórico no calendário
export const getApprovedRequestsForCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Construir filtro de data
    let dateFilter = {};
    if (month && year) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${month.padStart(2, '0')}-31`;
      dateFilter = {
        gte: startDate,
        lte: endDate
      };
    }

    // Buscar requisições aprovadas, executadas e finalizadas
    const { data: requests, error } = await supabase
      .from('requests')
      .select(`
        id,
        event_name,
        description,
        location,
        start_datetime,
        end_datetime,
        status,
        department,
        requester_id,
        approved_at,
        executed_at,
        users!requests_requester_id_fkey(full_name)
      `)
      .in('status', ['APTO', 'EXECUTADO', 'FINALIZADO'])
      .order('start_datetime', { ascending: true });

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao buscar requisições.', 
        error: error.message 
      });
    }

    // Formatar dados para o calendário
    const calendarEvents = requests.map(request => ({
      id: request.id,
      title: request.event_name || request.description || 'Evento',
      location: request.location,
      start: request.start_datetime,
      end: request.end_datetime,
      status: request.status,
      department: request.department,
      requester: request.users?.full_name || 'Usuário',
      approvedAt: request.approved_at,
      executedAt: request.executed_at,
      returnedAt: null, // Será adicionado quando as colunas existirem
      color: getStatusColor(request.status)
    }));

    res.json({ 
      success: true, 
      data: calendarEvents 
    });

  } catch (error) {
    console.error('Erro ao buscar requisições para calendário:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: error.message 
    });
  }
};

// Função auxiliar para definir cor baseada no status
const getStatusColor = (status) => {
  const colors = {
    'APTO': '#10b981',      // Verde
    'EXECUTADO': '#3b82f6',  // Azul
    'FINALIZADO': '#8b5cf6'  // Roxo
  };
  return colors[status] || '#6b7280';
};
