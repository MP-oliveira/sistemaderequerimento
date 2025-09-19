import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { 
  addToFavorites, 
  removeFromFavorites, 
  getFavorites, 
  checkFavorite 
} from '../controllers/FavoritesController.js';

const router = express.Router();

// Todas as rotas de favoritos precisam de autenticação
router.use(authenticateToken);

// Adicionar requerimento aos favoritos
router.post('/', addToFavorites);

// Remover requerimento dos favoritos
router.delete('/:request_id', removeFromFavorites);

// Listar favoritos do usuário
router.get('/', getFavorites);

// Verificar se um requerimento está nos favoritos
router.get('/check/:request_id', checkFavorite);

export default router;
