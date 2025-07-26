import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabaseClient.js';

// Gerar token JWT
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// 📝 CADASTRO DE USUÁRIO
export const register = async (req, res) => {
  try {
    // Logs de depuração para ambiente e chave
    console.log('🔑 SUPABASE_URL:', process.env.SUPABASE_URL);
    console.log('🔑 SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);

    const { name, email, password, role } = req.body;

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Valores permitidos para o ENUM
    const allowedRoles = ['LIDER', 'PASTOR', 'ADM', 'SEC', 'AUDIOVISUAL'];
    // Se não vier role, usa 'LIDER'. Se vier, valida.
    const userRole = allowedRoles.includes(role) ? role : 'LIDER';

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        full_name: name,
        email,
        password_hash: hashedPassword,
        role: userRole,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário no Supabase:', error);
      // Logar o erro completo para depuração
      return res.status(400).json({
        success: false,
        message: 'Não foi possível criar o usuário.',
        error: error
      });
    }

    // Gerar token
    const token = generateToken(newUser.id, newUser.role);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: newUser.id,
          name: newUser.full_name,
          email: newUser.email,
          role: newUser.role
        },
        token
      }
    });

  } catch (error) {
    console.error('Erro no controller de cadastro:', error);
    res.status(500).json({
      success: false,
      message: 'Ocorreu um erro inesperado no servidor.',
      error: error.message
    });
  }
};

// 🔐 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validações
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário diretamente na tabela users
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo. Contate o administrador.'
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar token JWT
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// 👤 PERFIL DO USUÁRIO
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};