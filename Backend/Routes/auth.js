import { 
  signup, 
  login, 
  logout, 
  googleAuth, 
  googleCallback, 
  getProfile,
  changePassword,
  send2FAOTP,
  verify2FASetup,
  disable2FA,
  sendLoginOTP,
  verifyLoginOTP,
  sendGoogleLogin2FAOTP,
  verifyGoogleLogin2FAWithSession,
  sendResetOtp,
  resetPassword,
  verifyTokenStatus,
  sendEmailVerification,
  verifyEmailChange,
  sendAccountVerification,
  verifyAccount
} from '../Controllers/auth.js';
import express from 'express';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', authenticateToken, getProfile);

// Password management
router.post('/change-password', authenticateToken, changePassword);
router.post('/send-reset-otp', sendResetOtp);
router.post('/reset-password', resetPassword);

// Token verification
router.get('/verify-token', authenticateToken, verifyTokenStatus);

// Email verification routes
router.post('/send-email-verification', authenticateToken, sendEmailVerification);
router.post('/verify-email-change', authenticateToken, verifyEmailChange);
router.post('/send-account-verification', authenticateToken, sendAccountVerification);
router.post('/verify-account', authenticateToken, verifyAccount);

// 2FA routes
router.post('/send-2fa-otp', authenticateToken, send2FAOTP);
router.post('/verify-2fa-setup', authenticateToken, verify2FASetup);
router.post('/disable-2fa', authenticateToken, disable2FA);
router.post('/send-login-otp', sendLoginOTP);
router.post('/verify-login-otp', verifyLoginOTP);

// Google 2FA with session management
router.post('/send-google-login-otp', sendGoogleLogin2FAOTP);
router.post('/verify-google-login-otp', verifyGoogleLogin2FAWithSession);

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;