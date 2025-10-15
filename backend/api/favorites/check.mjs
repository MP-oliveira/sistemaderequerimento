import { supabase } from '../../src/config/supabaseClient.js';
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido'
    });
  }

  try {
    const user = await authenticateUser(req);
    const userId = user.id;
    const requestId = req.query.request_id;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'ID do requerimento é obrigatório'
      });
    }

    const { data: favorite, error } = await supabase
      .from('favorites')
      .select('id, custom_name')
      .eq('user_id', userId)
      .eq('request_id', requestId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error('Erro ao verificar favorito');
    }

    res.status(200).json({
      success: true,
      data: {
        is_favorite: !!favorite,
        favorite_id: favorite?.id || null,
        custom_name: favorite?.custom_name || null
      }
    });

  } catch (error) {
    console.error('Erro na verificação de favorito:', error);
    
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
