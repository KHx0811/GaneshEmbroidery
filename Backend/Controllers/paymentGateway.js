import Razorpay from 'razorpay';
import crypto from 'crypto';
import config from '../config.js';
import Payment from '../Models/payment.js';
import Order from '../Models/orders.js';
import User from '../Models/user.js';
import { sendPaymentConfirmationEmail } from './mailOperations.js';

const { razorpay_key_id, razorpay_key_secret } = config;

const razorpay = new Razorpay({
    key_id: razorpay_key_id,
    key_secret: razorpay_key_secret,
});

export const createPaymentOrder = async (req, res) => {
    try {
        const { orderId, amount, currency = 'INR' } = req.body;
        const userId = req.user.userId;

        if (!orderId || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Order ID and amount are required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Check if payment already exists for this order
        let existingPayment = await Payment.findOne({ orderId });
        
        // If payment exists and is already successful, don't create new payment
        if (existingPayment && (existingPayment.status === 'captured' || existingPayment.status === 'authorized')) {
            return res.status(400).json({
                success: false,
                error: 'Payment already completed for this order'
            });
        }

        const receipt = `receipt_${orderId}_${Date.now()}`;

        const options = {
            amount: Math.round(amount * 100), // Amount in paise
            currency: currency,
            receipt: receipt,
            notes: {
                orderId: orderId,
                userId: userId.toString(),
                userEmail: user.email,
                userName: user.username
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // If payment record exists but failed/pending, update it instead of creating new
        if (existingPayment) {
            existingPayment.razorpayOrderId = razorpayOrder.id;
            existingPayment.amount = amount;
            existingPayment.currency = currency;
            existingPayment.receipt = receipt;
            existingPayment.status = 'created';
            existingPayment.razorpayPaymentId = null; // Reset previous payment ID
            existingPayment.razorpaySignature = null; // Reset previous signature
            existingPayment.userDetails = {
                email: user.email,
                contact: user.phone || '',
                name: user.username
            };
            existingPayment.notes = options.notes;
            existingPayment.createdAt = new Date();

            await existingPayment.save();

            res.status(200).json({
                success: true,
                razorpayOrder: {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    receipt: razorpayOrder.receipt
                },
                paymentId: existingPayment._id,
                key: razorpay_key_id
            });
        } else {
            // Create new payment record
            const payment = new Payment({
                userId: userId,
                orderId: orderId,
                razorpayOrderId: razorpayOrder.id,
                amount: amount,
                currency: currency,
                receipt: receipt,
                status: 'created',
                userDetails: {
                    email: user.email,
                    contact: user.phone || '',
                    name: user.username
                },
                notes: options.notes
            });

            await payment.save();

            res.status(200).json({
                success: true,
                razorpayOrder: {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    receipt: razorpayOrder.receipt
                },
                paymentId: payment._id,
                key: razorpay_key_id
            });
        }

    } catch (error) {
        console.error('Error creating payment order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create payment order'
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            paymentId 
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                error: 'Missing payment verification parameters'
            });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", razorpay_key_secret)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                error: 'Payment signature verification failed'
            });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment record not found'
            });
        }

        try {
            const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
            
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = paymentDetails.status;
            payment.paymentMethod = paymentDetails.method;
            payment.paymentMethodDetails = {
                bank: paymentDetails.bank,
                wallet: paymentDetails.wallet,
                vpa: paymentDetails.vpa,
                card_id: paymentDetails.card_id
            };
            payment.paidAt = new Date(paymentDetails.created_at * 1000);
            payment.attempts = paymentDetails.attempts || 0;

            await payment.save();

            await Order.findOneAndUpdate(
                { orderId: payment.orderId },
                { 
                    status: 'Paid',
                    paymentId: payment._id,
                    paidAt: payment.paidAt
                }
            );

            // Send payment confirmation email after successful payment
            try {
                console.log(`Sending payment confirmation email for order: ${payment.orderId}`);
                await sendPaymentConfirmationEmail(payment.orderId);
                console.log(`Payment confirmation email sent successfully for order: ${payment.orderId}`);
            } catch (emailError) {
                console.error(`Error sending payment confirmation email for order ${payment.orderId}:`, emailError);
                // Don't fail the payment verification if email fails
            }

        } catch (razorpayError) {
            console.error('Error fetching payment details from Razorpay:', razorpayError);
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = 'captured';
            payment.paidAt = new Date();
            await payment.save();

            await Order.findOneAndUpdate(
                { orderId: payment.orderId },
                { 
                    status: 'Paid',
                    paymentId: payment._id,
                    paidAt: payment.paidAt
                }
            );
        }

        // Send payment confirmation email after successful payment
        try {
            console.log(`Sending payment confirmation email for order: ${payment.orderId}`);
            await sendPaymentConfirmationEmail(payment.orderId);
            console.log(`Payment confirmation email sent successfully for order: ${payment.orderId}`);
        } catch (emailError) {
            console.error(`Error sending payment confirmation email for order ${payment.orderId}:`, emailError);
            // Don't fail the payment verification if email fails
            // Email status is already updated in the sendPaymentConfirmationEmail function
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            paymentStatus: payment.status,
            orderId: payment.orderId
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            error: 'Payment verification failed'
        });
    }
};

export const handlePaymentFailure = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, error } = req.body;

        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
        if (payment) {
            payment.status = 'failed';
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.errorCode = error?.code || 'PAYMENT_FAILED';
            payment.errorDescription = error?.description || 'Payment failed';
            await payment.save();

            await Order.findOneAndUpdate(
                { orderId: payment.orderId },
                { status: 'Payment Failed' }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Payment failure recorded'
        });

    } catch (error) {
        console.error('Error handling payment failure:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record payment failure'
        });
    }
};

export const getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.userId;

        const payment = await Payment.findOne({ 
            orderId: orderId, 
            userId: userId 
        }).populate('userId', 'username email');

        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }

        res.status(200).json({
            success: true,
            payment: {
                orderId: payment.orderId,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                paymentMethod: payment.paymentMethod,
                paidAt: payment.paidAt,
                createdAt: payment.createdAt
            }
        });

    } catch (error) {
        console.error('Error getting payment status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get payment status'
        });
    }
};

export const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 10 } = req.query;

        const payments = await Payment.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('userId', 'username email');

        const total = await Payment.countDocuments({ userId });

        res.status(200).json({
            success: true,
            payments: payments.map(payment => ({
                orderId: payment.orderId,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                paymentMethod: payment.paymentMethod,
                paidAt: payment.paidAt,
                createdAt: payment.createdAt
            })),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPayments: total
            }
        });

    } catch (error) {
        console.error('Error getting payment history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get payment history'
        });
    }
};
