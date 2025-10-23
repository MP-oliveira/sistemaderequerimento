import express from 'express';
import {
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation
} from '../controllers/LocationsController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Listar locais
router.get('/', authenticateToken, listLocations);
// Criar local
router.post('/', authenticateToken, createLocation);
// Atualizar local
router.put('/:id', authenticateToken, updateLocation);
// Deletar local
router.delete('/:id', authenticateToken, deleteLocation);

export default router;
