import express from 'express';
import {
  createInventoryItem,
  listInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  reserveInventoryItem,
  releaseInventoryItem,
  maintenanceInventoryItem,
  unavailableInventoryItem,
  listInventoryHistory,
  uploadInventoryImage
} from '../controllers/ InventoryController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Criar item
router.post('/', authenticateToken, createInventoryItem);
// Listar todos
router.get('/', authenticateToken, listInventoryItems);
// Detalhar um item
router.get('/:id', authenticateToken, getInventoryItem);
// Atualizar
router.put('/:id', authenticateToken, updateInventoryItem);
// Remover
router.delete('/:id', authenticateToken, deleteInventoryItem);
// Alterar status para RESERVADO
router.patch('/:id/reserve', authenticateToken, reserveInventoryItem);
// Alterar status para DISPONIVEL
router.patch('/:id/release', authenticateToken, releaseInventoryItem);
// Alterar status para MANUTENCAO
router.patch('/:id/maintenance', authenticateToken, maintenanceInventoryItem);
// Alterar status para INDISPONIVEL
router.patch('/:id/unavailable', authenticateToken, unavailableInventoryItem);
// Upload de imagem (mock: recebe URL pronta)
router.patch('/:id/image', authenticateToken, uploadInventoryImage);
// Listar histórico de um item
router.get('/:id/history', authenticateToken, listInventoryHistory);

export default router; 