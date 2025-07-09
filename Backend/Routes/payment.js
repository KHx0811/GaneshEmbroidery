import express from 'express';
import { 
    createPaymentOrder, 
    verifyPayment, 
    handlePaymentFailure, 
    getPaymentStatus, 
    getPaymentHistory 
} from '../Controllers/paymentGateway.js';
import { sendTestEmail, sendPaymentConfirmationEmail, testGmailConfig } from '../Controllers/mailOperations.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

router.post('/create-order', authenticateToken, createPaymentOrder);
router.post('/verify', authenticateToken, verifyPayment);
router.post('/failure', authenticateToken, handlePaymentFailure);
router.get('/status/:orderId', authenticateToken, getPaymentStatus);
router.get('/history', authenticateToken, getPaymentHistory);

// Test email routes
router.post('/test-email', authenticateToken, async (req, res) => {
    try {
        const { email, fromEmail } = req.body;
        const result = await sendTestEmail(email, fromEmail);
        res.json({ success: true, messageId: result.messageId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/test-gmail-config', authenticateToken, async (req, res) => {
    try {
        const result = await testGmailConfig();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/resend-confirmation/:orderId', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { fromEmail } = req.body;
        const result = await sendPaymentConfirmationEmail(orderId, fromEmail);
        res.json({ success: true, messageId: result.messageId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;