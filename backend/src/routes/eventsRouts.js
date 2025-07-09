import express from 'express';
import {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  cancelEvent,
  listEventHistory
} from '../controllers/EventsController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Criar evento
router.post('/', authenticateToken, createEvent);
// Listar eventos
router.get('/', authenticateToken, listEvents);
// Detalhar evento
router.get('/:id', authenticateToken, getEvent);
// Atualizar evento
router.put('/:id', authenticateToken, updateEvent);
// Cancelar evento (soft delete)
router.patch('/:id/cancel', authenticateToken, cancelEvent);
// Listar histórico de um evento
router.get('/:id/history', authenticateToken, listEventHistory);

export default router;
