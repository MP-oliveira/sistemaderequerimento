import express from 'express';
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/DepartmentsController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Listar departamentos
router.get('/', authenticateToken, listDepartments);
// Rota temporária para teste (sem autenticação)
router.get('/test', listDepartments);
// Criar departamento
router.post('/', authenticateToken, createDepartment);
// Atualizar departamento
router.put('/:id', authenticateToken, updateDepartment);
// Deletar departamento
router.delete('/:id', authenticateToken, deleteDepartment);

export default router;