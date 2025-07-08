import express from 'express';
import { register, login, getProfile } from '../controllers/AuthController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

// 📝 Rotas públicas (sem autenticação)
router.post('/register', register);
router.post('/login', login);

// 👤 Rotas protegidas (com autenticação)
router.get('/profile', authenticateToken, getProfile);

export default router;