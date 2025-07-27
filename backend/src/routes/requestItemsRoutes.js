import express from 'express';
import {
  addRequestItem,
  listRequestItems,
  deleteRequestItem,
  updateRequestItem,
  markItemAsSeparated,
  getTodayItems
} from '../controllers/RequestItemsController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Adicionar item
router.post('/', authenticateToken, addRequestItem);

// Listar itens de uma requisição
router.get('/:request_id', authenticateToken, listRequestItems);

// Listar itens do dia para audiovisual
router.get('/today/items', authenticateToken, getTodayItems);

// Marcar item como separado (AUDIOVISUAL)
router.patch('/:id/separate', authenticateToken, markItemAsSeparated);

// Atualizar item
router.put('/:id', authenticateToken, updateRequestItem);

// Remover item
router.delete('/:id', authenticateToken, deleteRequestItem);

export default router; 