import { supabase } from '../config/supabaseClient.js';

// Adicionar requerimento aos favoritos
export const addToFavorites = async (req, res) => {
  try {
    const { request_id, custom_name, description } = req.body;
    const user_id = req.user.userId;

    if (!request_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do requerimento é obrigatório' 
      });
    }

    // Verificar se o requerimento existe
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('id, event_name, department')
      .eq('id', request_id)
      .single();

    if (requestError || !request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Requerimento não encontrado' 
      });
    }

    // Verificar se já está nos favoritos
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('request_id', request_id)
      .single();

    if (existingFavorite) {
      return res.status(400).json({ 
        success: false, 
        message: 'Requerimento já está nos favoritos' 
      });
    }

    // Adicionar aos favoritos
    const { data: favorite, error: insertError } = await supabase
      .from('favorites')
      .insert({
        user_id,
        request_id,
        custom_name: custom_name || `${request.event_name} - ${request.department}`,
        description: description || ''
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao adicionar favorito:', insertError);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao adicionar aos favoritos' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Requerimento adicionado aos favoritos',
      data: favorite
    });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: error.message 
    });
  }
};

// Remover requerimento dos favoritos
export const removeFromFavorites = async (req, res) => {
  try {
    const { request_id } = req.params;
    const user_id = req.user.userId;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user_id)
      .eq('request_id', request_id);

    if (error) {
      console.error('❌ Erro ao remover favorito:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao remover dos favoritos' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Requerimento removido dos favoritos'
    });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: error.message 
    });
  }
};

// Listar favoritos do usuário
export const getFavorites = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        *,
        requests!inner(
          id,
          event_name,
          department,
          date,
          location,
          start_datetime,
          end_datetime,
          description,
          status,
          created_at,
          users!requests_requester_id_fkey(full_name)
        )
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar favoritos:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar favoritos' 
      });
    }

    // Processar os dados para retornar informações úteis
    const processedFavorites = (favorites || []).map(fav => ({
      id: fav.id,
      custom_name: fav.custom_name,
      description: fav.description,
      created_at: fav.created_at,
      request: {
        id: fav.requests.id,
        event_name: fav.requests.event_name,
        department: fav.requests.department,
        date: fav.requests.date,
        location: fav.requests.location,
        start_datetime: fav.requests.start_datetime,
        end_datetime: fav.requests.end_datetime,
        description: fav.requests.description,
        status: fav.requests.status,
        created_at: fav.requests.created_at,
        requester_name: fav.requests.users?.full_name || 'N/A'
      }
    }));

    res.json({ 
      success: true, 
      data: processedFavorites
    });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: error.message 
    });
  }
};

// Verificar se um requerimento está nos favoritos
export const checkFavorite = async (req, res) => {
  try {
    const { request_id } = req.params;
    const user_id = req.user.userId;

    const { data: favorite, error } = await supabase
      .from('favorites')
      .select('id, custom_name')
      .eq('user_id', user_id)
      .eq('request_id', request_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar favorito:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao verificar favorito' 
      });
    }

    res.json({ 
      success: true, 
      data: {
        is_favorite: !!favorite,
        favorite_id: favorite?.id || null,
        custom_name: favorite?.custom_name || null
      }
    });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor', 
      error: error.message 
    });
  }
};
