import express from 'express';
import { rootController } from '../Controllers/index.js';
import auth from './auth.js';
import products from './products.js';
import orders from './orders.js';
import admin from './admin.js';
import user from './user.js';
import payment from './payment.js';

const router = express.Router();

router.get('/', rootController);
router.use('/auth', auth);
router.use('/products', products);
router.use('/orders', orders);
router.use('/admin/users', admin);
router.use('/user', user);
router.use('/payment', payment);

export default router;