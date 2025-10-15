import { supabase } from '../src/config/supabaseClient.js';
import jwt from 'jsonwebtoken';

// Função para verificar autenticação
async function authenticateUser(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new Error('Token de acesso não fornecido');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  const { data: user, error } = await supabase
    .from('users')
    .select('id, full_name, email, role, is_active')
    .eq('id', decoded.userId)
    .single();

  if (error || !user || !user.is_active) {
    throw new Error('Token inválido ou usuário inativo');
  }

  return user;
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const user = await authenticateUser(req);
    const userId = user.id;

    switch (req.method) {
      case 'GET':
        // Listar favoritos
        const { data: favorites, error: getError } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (getError) {
          throw new Error('Erro ao buscar favoritos');
        }

        res.status(200).json({
          success: true,
          data: favorites || []
        });
        break;

      case 'POST':
        // Adicionar favorito
        const { request_id, custom_name, description } = req.body;

        if (!request_id) {
          return res.status(400).json({
            success: false,
            message: 'ID do requerimento é obrigatório'
          });
        }

        // Verificar se já está nos favoritos
        const { data: existing } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', userId)
          .eq('request_id', request_id)
          .single();

        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Requerimento já está nos favoritos'
          });
        }

        // Adicionar aos favoritos
        const { data: favorite, error: insertError } = await supabase
          .from('favorites')
          .insert({
            user_id: userId,
            request_id,
            custom_name: custom_name || '',
            description: description || ''
          })
          .select()
          .single();

        if (insertError) {
          throw new Error('Erro ao adicionar aos favoritos');
        }

        res.status(200).json({
          success: true,
          message: 'Requerimento adicionado aos favoritos',
          data: favorite
        });
        break;

      case 'DELETE':
        // Remover favorito
        const requestId = req.query.request_id;

        if (!requestId) {
          return res.status(400).json({
            success: false,
            message: 'ID do requerimento é obrigatório'
          });
        }

        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('request_id', requestId);

        if (deleteError) {
          throw new Error('Erro ao remover dos favoritos');
        }

        res.status(200).json({
          success: true,
          message: 'Requerimento removido dos favoritos'
        });
        break;

      default:
        res.status(405).json({
          success: false,
          message: 'Método não permitido'
        });
    }

  } catch (error) {
    console.error('Erro na API de favoritos:', error);
    
    if (error.message.includes('Token')) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
}
