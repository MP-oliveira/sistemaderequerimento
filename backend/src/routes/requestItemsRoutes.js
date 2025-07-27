const express = require('express');
const router = express.Router();
const RequestItemsController = require('../controllers/RequestItemsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas para request items
router.post('/', authMiddleware, RequestItemsController.createRequestItem);
router.get('/', authMiddleware, RequestItemsController.getRequestItems);
router.put('/:id', authMiddleware, RequestItemsController.updateRequestItem);
router.delete('/:id', authMiddleware, RequestItemsController.deleteRequestItem);

// Rota para marcar item como separado
router.patch('/:id/separate', authMiddleware, RequestItemsController.markItemAsSeparated);

// Rota para buscar itens do dia
router.get('/today', authMiddleware, RequestItemsController.getTodayItems);

// Rota para buscar itens executados
router.get('/executed', authMiddleware, RequestItemsController.getExecutedItems);

// Rota para marcar item como retornado
router.patch('/:id/return', authMiddleware, RequestItemsController.markItemAsReturned);

module.exports = router; 