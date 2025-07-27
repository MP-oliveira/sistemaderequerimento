import express from 'express';
import RequestItemsController from '../controllers/RequestItemsController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas para request items
router.post('/', authenticateToken, RequestItemsController.createRequestItem);
router.get('/', authenticateToken, RequestItemsController.getRequestItems);
router.put('/:id', authenticateToken, RequestItemsController.updateRequestItem);
router.delete('/:id', authenticateToken, RequestItemsController.deleteRequestItem);

// Rota para marcar item como separado
router.patch('/:id/separate', authenticateToken, RequestItemsController.markItemAsSeparated);

// Rota para buscar itens do dia
router.get('/today', authenticateToken, RequestItemsController.getTodayItems);

// Rota para buscar itens executados
router.get('/executed', authenticateToken, RequestItemsController.getExecutedItems);

// Rota para marcar item como retornado
router.patch('/:id/return', authenticateToken, RequestItemsController.markItemAsReturned);

export default router; 