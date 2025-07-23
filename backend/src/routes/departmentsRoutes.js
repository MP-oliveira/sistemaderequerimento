import express from 'express';
import { listDepartments, createDepartment, updateDepartment, deleteDepartment } from '../controllers/DepartmentsController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// Listar departamentos
router.get('/', listDepartments);
// Criar departamento
router.post('/', createDepartment);
// Editar departamento
router.put('/:id', updateDepartment);
// Remover departamento
router.delete('/:id', deleteDepartment);

export default router; 