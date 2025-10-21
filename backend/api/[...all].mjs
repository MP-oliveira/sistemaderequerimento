import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Importar rotas
import authRoutes from '../src/routes/authRoutes.js';
import userRouts from '../src/routes/userRouts.js';
import requestsRoutes from '../src/routes/requestsRoutes.js';
import requestItemsRoutes from '../src/routes/requestItemsRoutes.js';
import inventoryRoutes from '../src/routes/inventoryRoutes.js';
import eventsRoutes from '../src/routes/eventsRouts.js';
import departmentsRoutes from '../src/routes/departmentsRoutes.js';
import favoritesRoutes from '../src/routes/favorites.js';

dotenv.config();

const app = express();

// CORS configurável
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // limite aumentado para produção
  message: {
    message: 'Muitas requisições, tente novamente mais tarde',
    status: 'error'
  }
});

app.use(limiter);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRouts);
app.use('/api/requests', requestsRoutes);
app.use('/api/request-items', requestItemsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/favorites', favoritesRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Backend funcionando!', 
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada',
    status: 'error',
    path: req.originalUrl
  });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err.stack);
  res.status(500).json({
    message: 'Erro interno do servidor',
    status: 'error'
  });
});

export default app;


