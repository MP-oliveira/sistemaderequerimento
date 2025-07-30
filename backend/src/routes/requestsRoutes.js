import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { 
  createRequest, 
  listRequests, 
  getRequest, 
  approveRequest, 
  executeRequest, 
  rejectRequest, 
  finishRequest,
  uploadComprovante,
  listComprovantes,
  downloadComprovante,
  removeComprovante,
  updateRequest,
  deleteRequest,
  returnInstruments,
  getApprovedRequestsForCalendar,
  checkConflicts,
  checkRealTimeConflicts,
  checkInventoryAvailability
} from '../controllers/RequestsController.js';

const router = express.Router();

// Rotas para requisições
router.post('/', authenticateToken, createRequest);
router.get('/', authenticateToken, listRequests);
router.get('/calendar', authenticateToken, getApprovedRequestsForCalendar);
router.get('/:id', authenticateToken, getRequest);
router.put('/:id', authenticateToken, updateRequest);
router.delete('/:id', authenticateToken, deleteRequest);

// Rotas para aprovação e execução
router.put('/:id/approve', authenticateToken, approveRequest);
router.put('/:id/execute', authenticateToken, executeRequest);
router.put('/:id/reject', authenticateToken, rejectRequest);
router.put('/:id/finish', authenticateToken, finishRequest);

// Rotas para comprovantes
router.post('/:id/comprovantes', authenticateToken, uploadComprovante);
router.get('/:id/comprovantes', authenticateToken, listComprovantes);
router.get('/:id/comprovantes/:filename', authenticateToken, downloadComprovante);
router.delete('/:id/comprovantes/:filename', authenticateToken, removeComprovante);

// Rotas para retorno de instrumentos
router.put('/:id/return-instruments', authenticateToken, returnInstruments);

// Rotas para verificação de conflitos
router.post('/check-conflicts', authenticateToken, checkConflicts);
router.post('/check-realtime-conflicts', authenticateToken, checkRealTimeConflicts);
router.post('/check-inventory-availability', authenticateToken, checkInventoryAvailability);

export default router;
