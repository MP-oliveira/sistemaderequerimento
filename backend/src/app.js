import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { testConnection } from './config/supabaseClient.js';

// Importar rotas
import authRoutes from './routes/authRoutes.js';
import userRouts from './routes/userRouts.js';
import requestsRoutes from './routes/requestsRoutes.js';
import requestItemsRoutes from './routes/requestItemsRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import eventsRoutes from './routes/eventsRouts.js';
import departmentsRoutes from './routes/departmentsRoutes.js';

dotenv.config();

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(cors());

// Rate limiting (aumentado para desenvolvimento)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Muitas requisições, tente novamente em 15 minutos'
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'Sistema de Requisições da Igreja API',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Rota para testar conexão com Supabase
app.get('/test-connection', async (req, res) => {
  const isConnected = await testConnection();

  if (isConnected) {
    res.json({
      message: 'Conexão com Supabase funcionando!',
      status: 'success'
    });
  } else {
    res.status(500).json({
      message: 'Erro na conexão com Supabase',
      status: 'error'
    });
  }
});

// 🔐 Rotas de autenticação
app.use('/api/auth', authRoutes);

// 👤 Rotas de usuários
app.use('/api/users', userRouts);

// 📦 Rotas de requisições
app.use('/api/requests', requestsRoutes);

// 📦 Rotas de itens de requisição
app.use('/api/request-items', requestItemsRoutes);
// 📦 Rotas de inventário
app.use('/api/inventory', inventoryRoutes);
// 📅 Rotas de eventos
app.use('/api/events', eventsRoutes);
// 🏢 Rotas de departamentos
app.use('/api/departments', departmentsRoutes);

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada',
    status: 'error'
  });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err.stack);

  res.status(500).json({
    message: 'Erro interno do servidor',
    status: 'error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

export default app;


