import { signup, login, logout, googleAuth, googleCallback, getProfile } from '../Controllers/auth.js';
import express from 'express';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authenticateToken, getProfile);

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;