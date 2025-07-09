import express from 'express';
import { 
  addToCart, 
  getCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart,
  addToWishlist, 
  getWishlist, 
  removeFromWishlist,
  getUserOrders,
  checkout
} from '../Controllers/userOperations.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

router.post('/cart', authenticateToken, addToCart);
router.get('/cart', authenticateToken, getCart);
router.put('/cart/:cartItemId', authenticateToken, updateCartItem);
router.delete('/cart/:cartItemId', authenticateToken, removeFromCart);
router.delete('/cart', authenticateToken, clearCart);

router.post('/wishlist', authenticateToken, addToWishlist);
router.get('/wishlist', authenticateToken, getWishlist);
router.delete('/wishlist/:wishlistItemId', authenticateToken, removeFromWishlist);

router.get('/orders', authenticateToken, getUserOrders);
router.post('/checkout', authenticateToken, checkout);

export default router;
