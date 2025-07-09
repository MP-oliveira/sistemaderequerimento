import express from 'express';
import {
  addRequestItem,
  listRequestItems,
  deleteRequestItem,
  updateRequestItem
} from '../controllers/RequestItemsController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Adicionar item
router.post('/', authenticateToken, addRequestItem);

// Listar itens de uma requisição
router.get('/:request_id', authenticateToken, listRequestItems);

// Atualizar item
router.put('/:id', authenticateToken, updateRequestItem);

// Remover item
router.delete('/:id', authenticateToken, deleteRequestItem);

export default router; 