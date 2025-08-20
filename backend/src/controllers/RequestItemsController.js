import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Adicionar item a uma requisição
const createRequestItem = async (req, res) => {
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
        estimated_value,
        is_separated: false,
        separated_by: null,
        separated_at: null
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
const getRequestItems = async (req, res) => {
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

// Marcar item como separado (AUDIOVISUAL)
const markItemAsSeparated = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_separated } = req.body;
    
    console.log('🔍 [markItemAsSeparated] Iniciando...');
    console.log('   Item ID:', id);
    console.log('   is_separated:', is_separated);
    console.log('   User:', req.user);
    console.log('   User role:', req.user?.role);
    
    // Verificar se o usuário é AUDIOVISUAL ou SERVICO_GERAL
    if (req.user.role !== 'AUDIOVISUAL' && req.user.role !== 'SERVICO_GERAL') {
      console.log('❌ [markItemAsSeparated] Usuário não tem permissão:', req.user.role);
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas audiovisual e serviço geral podem marcar itens como separados.' 
      });
    }
    
    console.log('✅ [markItemAsSeparated] Usuário autorizado');
    
    const updateData = {
      is_separated: is_separated,
      separated_by: is_separated ? req.user.userId : null,
      separated_at: is_separated ? new Date().toISOString() : null
    };
    
    console.log('🔍 [markItemAsSeparated] Dados para atualização:', updateData);
    
    const { data: item, error } = await supabase
      .from('request_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error || !item) {
      console.error('❌ [markItemAsSeparated] Erro ao atualizar item:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao atualizar item.', 
        error: error?.message 
      });
    }
    
    console.log('✅ [markItemAsSeparated] Item atualizado com sucesso:', item);
    
    res.json({ 
      success: true, 
      message: is_separated ? 'Item marcado como separado!' : 'Item desmarcado como separado!',
      data: item 
    });
  } catch (error) {
    console.error('❌ [markItemAsSeparated] Erro interno:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Buscar itens do dia para audiovisual
const getTodayItems = async (req, res) => {
  try {
    // Usar fuso horário local (Brasília)
    const today = new Date();
    const todayLocal = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
    const todayStr = todayLocal.toISOString().split('T')[0];
    
    console.log('🔍 [getTodayItems] Buscando itens para hoje (local):', todayStr);

    // Buscar requisições aprovadas para hoje (apenas pela data)
    const { data: todayRequests, error: requestsError } = await supabase
      .from('requests')
      .select('id, event_name, start_datetime, end_datetime, location, expected_audience, status, date, department, description')
      .eq('status', 'APTO')
      .eq('date', todayStr);

    if (requestsError) {
      console.error('❌ Erro ao buscar requisições de hoje:', requestsError);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }

    console.log('🔍 [getTodayItems] Requisições de hoje encontradas:', todayRequests?.length || 0);

    if (!todayRequests || todayRequests.length === 0) {
      return res.json({ 
        success: true, 
        data: [] 
      });
    }

    // Buscar itens dessas requisições
    const requestIds = todayRequests.map(req => req.id);

    const { data, error } = await supabase
      .from('request_items')
      .select(`
        id,
        request_id,
        inventory_id,
        item_name,
        quantity_requested,
        description,
        is_separated,
        separated_by,
        separated_at,
        inventory (
          name,
          description
        ),
        requests (
          event_name,
          start_datetime,
          end_datetime,
          location,
          expected_audience,
          status,
          date,
          department,
          description
        )
      `)
      .in('request_id', requestIds);

    if (error) {
      console.error('❌ Erro ao buscar itens do dia:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }

    console.log('🔍 [getTodayItems] Itens encontrados:', data?.length || 0);

    res.json({ 
      success: true, 
      data: data || [] 
    });
  } catch (error) {
    console.error('❌ Erro ao buscar itens do dia:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// Listar itens do dia filtrados por categoria (AUDIOVISUAL ou SERVICO_GERAL)
const getTodayItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Usar fuso horário local (Brasília)
    const today = new Date();
    const todayLocal = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
    const todayStr = todayLocal.toISOString().split('T')[0];
    
    console.log('🔍 [getTodayItemsByCategory] Buscando itens para hoje (local):', todayStr);
    console.log('🔍 [getTodayItemsByCategory] Categoria:', category);

    // Definir categorias baseado no parâmetro
    let targetCategories = [];
    if (category === 'audiovisual') {
      targetCategories = ['AUDIO_VIDEO', 'INSTRUMENTO_MUSICAL', 'Instrumento Musical', 'Som', 'SOM', 'AUDIO'];
    } else if (category === 'servico-geral') {
      targetCategories = ['SERVICO_GERAL'];
    } else if (category === 'decoracao') {
      targetCategories = ['DECORACAO'];
    } else if (category === 'esportes') {
      targetCategories = ['ESPORTES'];
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Categoria inválida. Use "audiovisual", "servico-geral", "decoracao" ou "esportes".' 
      });
    }

    console.log('🔍 [getTodayItemsByCategory] Target categories:', targetCategories);

    // Buscar apenas requisições aprovadas para hoje (material do dia)
    const { data: todayRequests, error: requestsError } = await supabase
      .from('requests')
      .select('id, event_name, start_datetime, end_datetime, location, expected_audience, status, date, department, description')
      .eq('status', 'APTO')
      .eq('date', todayStr);

    if (requestsError) {
      console.error('❌ Erro ao buscar requisições de hoje:', requestsError);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }

    console.log('🔍 [getTodayItemsByCategory] Requisições de hoje encontradas:', todayRequests?.length || 0);
    if (todayRequests && todayRequests.length > 0) {
      console.log('🔍 [getTodayItemsByCategory] Detalhes das requisições:');
      todayRequests.forEach(req => {
        console.log('   - ID:', req.id, 'Date:', req.date, 'Status:', req.status, 'Department:', req.department);
      });
    }

    if (!todayRequests || todayRequests.length === 0) {
      return res.json({ 
        success: true, 
        data: [] 
      });
    }

    // Buscar itens dessas requisições
    const requestIds = todayRequests.map(req => req.id);

    console.log('🔍 [getTodayItemsByCategory] Request IDs para buscar:', requestIds);
    
    const { data, error } = await supabase
      .from('request_items')
      .select(`
        id,
        request_id,
        inventory_id,
        item_name,
        quantity_requested,
        description,
        is_separated,
        separated_by,
        separated_at,
        inventory (
          name,
          description,
          category
        ),
        requests (
          event_name,
          start_datetime,
          end_datetime,
          location,
          expected_audience,
          status,
          date,
          department,
          description
        )
      `)
      .in('request_id', requestIds);

    console.log('🔍 [getTodayItemsByCategory] Query executada. Erro:', error);
    console.log('🔍 [getTodayItemsByCategory] Dados retornados:', data?.length || 0);

    if (error) {
      console.error('❌ Erro ao buscar itens do dia:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }

    // Filtrar itens por categoria do inventário
    const filteredData = data.filter(item => {
      console.log('🔍 [getTodayItemsByCategory] Verificando item:', item.item_name, 'Categoria:', item.inventory?.category);
      if (!item.inventory || !item.inventory.category) {
        console.log('🔍 [getTodayItemsByCategory] Item sem categoria:', item.item_name);
        return false; // Se não tem categoria, não mostrar
      }
      const isIncluded = targetCategories.includes(item.inventory.category);
      console.log('🔍 [getTodayItemsByCategory] Item incluído:', item.item_name, isIncluded);
      return isIncluded;
    });

    console.log('🔍 [getTodayItemsByCategory] Itens filtrados encontrados:', filteredData?.length || 0);
    if (filteredData && filteredData.length > 0) {
      console.log('🔍 [getTodayItemsByCategory] Detalhes dos itens filtrados:');
      filteredData.forEach(item => {
        console.log('   - Item:', item.item_name, 'Categoria:', item.inventory?.category, 'Request ID:', item.request_id);
      });
    }

    // Debug: mostrar todos os itens (não filtrados) para entender o problema
    console.log('🔍 [getTodayItemsByCategory] Todos os itens encontrados (antes do filtro):', data?.length || 0);
    if (data && data.length > 0) {
      console.log('🔍 [getTodayItemsByCategory] Detalhes de todos os itens:');
      data.forEach(item => {
        console.log('   - Item:', item.item_name, 'Categoria:', item.inventory?.category || 'SEM CATEGORIA', 'Request ID:', item.request_id, 'Inventory ID:', item.inventory_id);
      });
    } else {
      console.log('🔍 [getTodayItemsByCategory] Nenhum item encontrado na query principal');
    }

    res.json({ 
      success: true, 
      data: filteredData || [] 
    });
  } catch (error) {
    console.error('❌ Erro ao buscar itens do dia por categoria:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// Remover item de uma requisição
const deleteRequestItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('request_items')
      .delete()
      .eq('id', id);
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao remover item.', error: error.message });
    }
    res.json({ success: true, message: 'Item removido com sucesso!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Atualizar item de uma requisição
const updateRequestItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, description, quantity_requested, estimated_value } = req.body;
    const { data: item, error } = await supabase
      .from('request_items')
      .update({
        item_name,
        description,
        quantity_requested,
        estimated_value
      })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return res.status(400).json({ success: false, message: 'Erro ao atualizar item.', error: error.message });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
}; 

const getExecutedItems = async (req, res) => {
  try {
    console.log('🔍 [getExecutedItems] Buscando itens executados...');
    
    // Primeiro, buscar requisições aprovadas (excluindo FINALIZADO)
    const { data: approvedRequests, error: requestsError } = await supabase
      .from('requests')
      .select('id')
      .in('status', ['APTO', 'PREENCHIDO', 'EXECUTADO']);
    
    if (requestsError) {
      console.error('❌ Erro ao buscar requisições:', requestsError);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
    
    console.log('🔍 [getExecutedItems] Requisições aprovadas encontradas:', approvedRequests?.length || 0);
    
    if (!approvedRequests || approvedRequests.length === 0) {
      return res.json({ 
        success: true, 
        data: [] 
      });
    }
    
    // Buscar itens dessas requisições
    const requestIds = approvedRequests.map(req => req.id);
    
    const { data, error } = await supabase
      .from('request_items')
      .select(`
        id,
        request_id,
        inventory_id,
        item_name,
        quantity_requested,
        description,
        is_separated,
        separated_by,
        separated_at,
        is_returned,
        returned_by,
        returned_at,
        inventory (
          name,
          description,
          category
        ),
        requests (
          event_name,
          start_datetime,
          end_datetime,
          status,
          department,
          date
        )
      `)
      .in('request_id', requestIds);

    if (error) {
      console.error('❌ Erro ao buscar itens executados:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }

    console.log('🔍 [getExecutedItems] Itens encontrados:', data?.length || 0);

    res.json({ 
      success: true, 
      data: data || [] 
    });
  } catch (error) {
    console.error('❌ Erro ao buscar itens executados:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// Buscar itens executados filtrados por categoria
const getExecutedItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    console.log('🔍 [getExecutedItemsByCategory] Buscando itens executados para categoria:', category);
    
    // Definir categorias baseado no parâmetro
    let targetCategories = [];
    if (category === 'audiovisual') {
      targetCategories = ['AUDIO_VIDEO', 'INSTRUMENTO_MUSICAL', 'Instrumento Musical', 'Som', 'SOM', 'AUDIO'];
    } else if (category === 'servico-geral') {
      targetCategories = ['SERVICO_GERAL'];
    } else if (category === 'decoracao') {
      targetCategories = ['DECORACAO'];
    } else if (category === 'esportes') {
      targetCategories = ['ESPORTES'];
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Categoria inválida. Use "audiovisual", "servico-geral", "decoracao" ou "esportes".' 
      });
    }

    console.log('🔍 [getExecutedItemsByCategory] Target categories:', targetCategories);
    
    // Primeiro, buscar requisições aprovadas (excluindo FINALIZADO)
    const { data: approvedRequests, error: requestsError } = await supabase
      .from('requests')
      .select('id')
      .in('status', ['APTO', 'PREENCHIDO', 'EXECUTADO']);
    
    if (requestsError) {
      console.error('❌ Erro ao buscar requisições:', requestsError);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
    
    console.log('🔍 [getExecutedItemsByCategory] Requisições aprovadas encontradas:', approvedRequests?.length || 0);
    
    if (!approvedRequests || approvedRequests.length === 0) {
      return res.json({ 
        success: true, 
        data: [] 
      });
    }
    
    // Buscar itens dessas requisições
    const requestIds = approvedRequests.map(req => req.id);
    
    const { data, error } = await supabase
      .from('request_items')
      .select(`
        id,
        request_id,
        inventory_id,
        item_name,
        quantity_requested,
        description,
        is_separated,
        separated_by,
        separated_at,
        is_returned,
        returned_by,
        returned_at,
        inventory (
          name,
          description,
          category
        ),
        requests (
          event_name,
          start_datetime,
          end_datetime,
          status,
          department,
          date
        )
      `)
      .in('request_id', requestIds);

    if (error) {
      console.error('❌ Erro ao buscar itens executados:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }

    console.log('🔍 [getExecutedItemsByCategory] Total de itens encontrados:', data?.length || 0);

    // Filtrar itens por categoria do inventário
    const filteredData = data.filter(item => {
      if (!item.inventory || !item.inventory.category) {
        return false; // Se não tem categoria, não mostrar
      }
      const isIncluded = targetCategories.includes(item.inventory.category);
      return isIncluded;
    });

    console.log('🔍 [getExecutedItemsByCategory] Itens filtrados encontrados:', filteredData?.length || 0);

    res.json({ 
      success: true, 
      data: filteredData || [] 
    });
  } catch (error) {
    console.error('❌ Erro ao buscar itens executados por categoria:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

const markItemAsReturned = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 [markItemAsReturned] Iniciando...');
    console.log('   Item ID:', id);
    console.log('   User:', req.user);
    console.log('   User role:', req.user?.role);
    
    // Verificar se o usuário é AUDIOVISUAL ou SERVICO_GERAL
    if (req.user.role !== 'AUDIOVISUAL' && req.user.role !== 'SERVICO_GERAL') {
      console.log('❌ [markItemAsReturned] Usuário não tem permissão:', req.user.role);
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas audiovisual e serviço geral podem marcar itens como retornados.' 
      });
    }
    
    console.log('✅ [markItemAsReturned] Usuário autorizado');
    
    // Verificar se o item existe e está separado
    const { data: item, error: fetchError } = await supabase
      .from('request_items')
      .select('id, is_separated, is_returned')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      console.error('❌ [markItemAsReturned] Item não encontrado:', fetchError);
      return res.status(404).json({ 
        success: false, 
        message: 'Item não encontrado' 
      });
    }
    
    console.log('🔍 [markItemAsReturned] Item encontrado:', item);
    
    // Verificar se o item está separado (pré-requisito para retorno)
    if (!item.is_separated) {
      console.log('❌ [markItemAsReturned] Item não está separado');
      return res.status(400).json({ 
        success: false, 
        message: 'Item deve estar separado antes de ser marcado como retornado.' 
      });
    }
    
    // Alternar o status de retorno
    const newReturnedStatus = !item.is_returned;
    
    const updateData = {
      is_returned: newReturnedStatus,
      returned_by: newReturnedStatus ? req.user.userId : null,
      returned_at: newReturnedStatus ? new Date().toISOString() : null
    };
    
    console.log('🔍 [markItemAsReturned] Dados para atualização:', updateData);
    
    const { data: updatedItem, error } = await supabase
      .from('request_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error || !updatedItem) {
      console.error('❌ [markItemAsReturned] Erro ao atualizar item:', error);
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao atualizar item.', 
        error: error?.message 
      });
    }
    
    console.log('✅ [markItemAsReturned] Item atualizado com sucesso:', updatedItem);
    
    res.json({ 
      success: true, 
      message: newReturnedStatus ? 'Item marcado como retornado!' : 'Item desmarcado como retornado!',
      data: updatedItem 
    });
  } catch (error) {
    console.error('❌ [markItemAsReturned] Erro interno:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Marcar item como indisponível com motivo
const markItemAsUnavailable = async (req, res) => {
  try {
    const { id } = req.params;
    const { unavailable_reason, audiovisual_notes } = req.body;
    
    // Verificar se o usuário é AUDIOVISUAL ou SERVICO_GERAL
    if (req.user.role !== 'AUDIOVISUAL' && req.user.role !== 'SERVICO_GERAL') {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas audiovisual e serviço geral podem marcar itens como indisponíveis.' 
      });
    }
    
    const updateData = {
      item_status: 'INDISPONIVEL',
      unavailable_reason: unavailable_reason || null,
      audiovisual_notes: audiovisual_notes || null,
      is_separated: false,
      separated_by: null,
      separated_at: null
    };
    
    const { data: item, error } = await supabase
      .from('request_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error || !item) {
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao atualizar item.', 
        error: error?.message 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Item marcado como indisponível!',
      data: item 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Marcar item como disponível e separado
const markItemAsAvailableAndSeparated = async (req, res) => {
  try {
    const { id } = req.params;
    const { audiovisual_notes } = req.body;
    
    // Verificar se o usuário é AUDIOVISUAL ou SERVICO_GERAL
    if (req.user.role !== 'AUDIOVISUAL' && req.user.role !== 'SERVICO_GERAL') {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas audiovisual e serviço geral podem marcar itens como disponíveis.' 
      });
    }
    
    const updateData = {
      item_status: 'SEPARADO',
      is_separated: true,
      separated_by: req.user.userId,
      separated_at: new Date().toISOString(),
      separation_datetime: new Date().toISOString(),
      unavailable_reason: null,
      audiovisual_notes: audiovisual_notes || null
    };
    
    const { data: item, error } = await supabase
      .from('request_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error || !item) {
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao atualizar item.', 
        error: error?.message 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Item marcado como disponível e separado!',
      data: item 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Buscar itens de uma requisição com detalhes do inventário
const getRequestItemsWithInventory = async (req, res) => {
  try {
    const { request_id } = req.params;
    
    const { data: items, error } = await supabase
      .from('request_items')
      .select(`
        *,
        inventory:inventory_id (
          id,
          name,
          category,
          location,
          quantity_available,
          status
        )
      `)
      .eq('request_id', request_id)
      .order('created_at', { ascending: true });
      
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao buscar itens.', 
        error: error.message 
      });
    }
    
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Atualizar observações do audiovisual
const updateAudiovisualNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { audiovisual_notes } = req.body;
    
    // Verificar se o usuário é AUDIOVISUAL ou SERVICO_GERAL
    if (req.user.role !== 'AUDIOVISUAL' && req.user.role !== 'SERVICO_GERAL') {
      return res.status(403).json({ 
        success: false, 
        message: 'Apenas audiovisual e serviço geral podem atualizar observações.' 
      });
    }
    
    const { data: item, error } = await supabase
      .from('request_items')
      .update({ audiovisual_notes })
      .eq('id', id)
      .select()
      .single();
      
    if (error || !item) {
      return res.status(400).json({ 
        success: false, 
        message: 'Erro ao atualizar observações.', 
        error: error?.message 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Observações atualizadas!',
      data: item 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
};

// Listar todos os requerimentos futuros para serviço geral
const getAllFutureRequestsForServicoGeral = async (req, res) => {
  try {
    console.log('🔍 [getAllFutureRequestsForServicoGeral] Buscando todos os requerimentos futuros...');
    
    // Usar fuso horário local (Brasília)
    const today = new Date();
    const todayLocal = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
    const todayStr = todayLocal.toISOString().split('T')[0];
    
    console.log('🔍 [getAllFutureRequestsForServicoGeral] Data de hoje (local):', todayStr);

    // Buscar todas as requisições aprovadas futuras (incluindo hoje)
    const { data: futureRequests, error: requestsError } = await supabase
      .from('requests')
      .select(`
        id, 
        event_name, 
        start_datetime, 
        end_datetime, 
        location, 
        expected_audience, 
        status, 
        date, 
        department, 
        description,
        approved_by_name,
        approved_by_email
      `)
      .eq('status', 'APTO')
      .gte('date', todayStr)
      .order('date', { ascending: true });

    if (requestsError) {
      console.error('❌ Erro ao buscar requisições futuras:', requestsError);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }

    console.log('🔍 [getAllFutureRequestsForServicoGeral] Requisições futuras encontradas:', futureRequests?.length || 0);

    if (!futureRequests || futureRequests.length === 0) {
      return res.json({ 
        success: true, 
        data: [] 
      });
    }

    // Buscar itens de serviço geral dessas requisições
    const requestIds = futureRequests.map(req => req.id);

    console.log('🔍 [getAllFutureRequestsForServicoGeral] Request IDs para buscar:', requestIds);
    
    const { data: items, error: itemsError } = await supabase
      .from('request_items')
      .select(`
        id,
        request_id,
        inventory_id,
        item_name,
        quantity_requested,
        description,
        is_separated,
        separated_by,
        separated_at,
        inventory (
          name,
          description,
          category
        )
      `)
      .in('request_id', requestIds);

    if (itemsError) {
      console.error('❌ Erro ao buscar itens:', itemsError);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }

    console.log('🔍 [getAllFutureRequestsForServicoGeral] Itens encontrados:', items?.length || 0);

    // Filtrar apenas itens de serviço geral
    const servicoGeralItems = items.filter(item => {
      const category = item.inventory?.category || '';
      return category === 'SERVICO_GERAL';
    });

    console.log('🔍 [getAllFutureRequestsForServicoGeral] Itens de serviço geral:', servicoGeralItems.length);

    // Agrupar itens por requisição
    const requestsWithItems = futureRequests.map(request => {
      const requestItems = servicoGeralItems.filter(item => item.request_id === request.id);
      return {
        ...request,
        items: requestItems
      };
    }).filter(request => request.items.length > 0); // Apenas requisições que têm itens de serviço geral

    console.log('🔍 [getAllFutureRequestsForServicoGeral] Requisições com itens de serviço geral:', requestsWithItems.length);

    res.json({ 
      success: true, 
      data: requestsWithItems 
    });

  } catch (error) {
    console.error('❌ Erro ao buscar requerimentos futuros:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

export {
  createRequestItem,
  getRequestItems,
  markItemAsSeparated,
  getTodayItems,
  getTodayItemsByCategory,
  deleteRequestItem,
  updateRequestItem,
  getExecutedItems,
  getExecutedItemsByCategory,
  markItemAsReturned,
  markItemAsUnavailable,
  markItemAsAvailableAndSeparated,
  getRequestItemsWithInventory,
  updateAudiovisualNotes,
  getAllFutureRequestsForServicoGeral
}; 