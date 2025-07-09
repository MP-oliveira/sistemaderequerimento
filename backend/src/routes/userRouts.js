import express from 'express';
import {
  createUser,
  listUsers,
  getUser,
  updateUser,
  toggleUserActive,
  deleteUser
} from '../controllers/UsersController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rota protegida: criar novo usuário (apenas ADM)
router.post('/', authenticateToken, createUser);

// Rota protegida: listar todos os usuários (apenas ADM)
router.get('/', authenticateToken, listUsers);

// Detalhar um usuário
router.get('/:id', authenticateToken, getUser);

// Editar dados de um usuário
router.put('/:id', authenticateToken, updateUser);

// Ativar/desativar usuário
router.patch('/:id/activate', authenticateToken, toggleUserActive);

// Remover usuário
router.delete('/:id', authenticateToken, deleteUser);

export default router;
