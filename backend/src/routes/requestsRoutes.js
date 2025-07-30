import express from 'express';
import { 
  createRequest, 
  listRequests, 
  getRequest, 
  approveRequest, 
  executeRequest, 
  rejectRequest, 
  finishRequest,
  returnInstruments,
  getApprovedRequestsForCalendar,
  uploadComprovante,
  listComprovantes,
  downloadComprovante,
  removeComprovante,
  uploadMiddleware,
  deleteRequest,
  updateRequest,
  checkConflicts
} from '../controllers/RequestsController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Verificar conflitos de horário
router.post('/check-conflicts', authenticateToken, checkConflicts);

// Criar requisição
router.post('/', authenticateToken, createRequest);

// Listar requisições (do usuário ou todas se ADM)
router.get('/', authenticateToken, listRequests);

// Buscar requisições aprovadas para calendário
router.get('/calendar/approved', authenticateToken, getApprovedRequestsForCalendar);

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

// Retornar instrumentos ao inventário
router.patch('/:id/return-instruments', authenticateToken, returnInstruments);

// Atualizar requisição
router.patch('/:id', authenticateToken, updateRequest);

// Comprovantes
router.post('/:request_id/comprovantes', authenticateToken, uploadMiddleware, uploadComprovante);
router.get('/:request_id/comprovantes', authenticateToken, listComprovantes);
router.get('/comprovantes/:id/download', authenticateToken, downloadComprovante);
router.delete('/comprovantes/:id', authenticateToken, removeComprovante);

// Deletar requisição
router.delete('/:id', authenticateToken, deleteRequest);

export default router;
