import express from 'express';
import { 
  registerProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct,
  deleteMachineType,
  getProductCategories,
  getValidCategories
} from '../Controllers/productRegistration.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/categories', getProductCategories);
router.get('/valid-categories', getValidCategories);
router.get('/:id', getProductById);

router.post('/', authenticateToken, registerProduct);
router.put('/:id', authenticateToken, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);
router.delete('/:id/machine-type/:machineType', authenticateToken, deleteMachineType);

export default router;
