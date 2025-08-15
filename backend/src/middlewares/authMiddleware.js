import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient.js';

// 🔐 Middleware para verificar JWT
export const authenticateToken = async (req, res, next) => {
  console.log('🔐 [authenticateToken] Middleware chamado para:', req.method, req.url);
  console.log('🔐 [authenticateToken] Headers:', req.headers);
  
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }

    // Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se usuário ainda existe e está ativo
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, is_active')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido - usuário não encontrado'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo. Contate o administrador.'
      });
    }

    // Adicionar informações do usuário ao request
    req.user = {
      userId: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role
    };

    next();

  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};