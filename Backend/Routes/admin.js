import express from 'express';
import { 
    getAllUsers, 
    getUserById, 
    updateUser, 
    updateUserStatus, 
    getUsersStats, 
    deleteUser 
} from '../Controllers/users.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllUsers);
router.get('/stats', getUsersStats);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.put('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

export default router;
