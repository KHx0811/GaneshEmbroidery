import { getUsersCount, getProductsCount, getOrdersCount, getPendingOrdersCount } from "../Controllers/stats.js";
import { 
    getAllOrders, 
    getPendingOrders, 
    updateOrderStatus, 
    getOrderById, 
    sendDesignFiles, 
    getOrdersStats,
    retryOrderEmail 
} from "../Controllers/orders.js";
import { authenticateToken } from "../Middleware/auth.js";
import express from 'express';

const router = express.Router();

router.get('/users', getUsersCount);
router.get('/products', getProductsCount);
router.get('/orders', getOrdersCount);
router.get('/pending-count', getPendingOrdersCount);

router.get('/all', authenticateToken, getAllOrders);
router.get('/pending', authenticateToken, getPendingOrders);
router.get('/stats', authenticateToken, getOrdersStats);
router.get('/:id', authenticateToken, getOrderById);
router.put('/:id/status', authenticateToken, updateOrderStatus);
router.post('/:id/send-files', authenticateToken, sendDesignFiles);
router.post('/:id/retry-email', authenticateToken, retryOrderEmail);


export default router;