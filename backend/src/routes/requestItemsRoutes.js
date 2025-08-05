import express from 'express';
import * as RequestItemsController from '../controllers/RequestItemsController.js';
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

// Rota para buscar itens do dia por categoria
router.get('/today/:category', authenticateToken, RequestItemsController.getTodayItemsByCategory);

// Rota para buscar itens executados
router.get('/executed', authenticateToken, RequestItemsController.getExecutedItems);

// Rotas para buscar itens executados por categoria
router.get('/executed/:category', authenticateToken, RequestItemsController.getExecutedItemsByCategory);

// Rota para marcar item como retornado
router.patch('/:id/return', authenticateToken, RequestItemsController.markItemAsReturned);

// Novas rotas para checklist
router.get('/request/:request_id/with-inventory', authenticateToken, RequestItemsController.getRequestItemsWithInventory);
router.patch('/:id/unavailable', authenticateToken, RequestItemsController.markItemAsUnavailable);
router.patch('/:id/available-separated', authenticateToken, RequestItemsController.markItemAsAvailableAndSeparated);
router.patch('/:id/notes', authenticateToken, RequestItemsController.updateAudiovisualNotes);

export default router; 