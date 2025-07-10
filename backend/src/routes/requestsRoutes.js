import express from 'express';
import { createRequest, listRequests, getRequest, approveRequest, executeRequest, rejectRequest, finishRequest } from '../controllers/RequestsController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Criar requisição
router.post('/', authenticateToken, createRequest);

// Listar requisições (do usuário ou todas se ADM)
router.get('/', authenticateToken, listRequests);

// Detalhar requisição
router.get('/:id', authenticateToken, getRequest);

// Aprovar requisição
router.patch('/:id/approve', authenticateToken, approveRequest);

// Executar requisição
router.patch('/:id/execute', authenticateToken, executeRequest);

// Rejeitar requisição
router.patch('/:id/reject', authenticateToken, rejectRequest);

// Finalizar requisição (devolução de itens)
router.patch('/:id/finish', authenticateToken, finishRequest);

export default router;
