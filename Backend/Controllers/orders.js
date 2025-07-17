import Order from "../Models/orders.js";
import User from "../Models/user.js";
import Product from "../Models/product.js";

export const getAllOrders = async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }

    try {
        const { status, userId, page = 1, limit = 10 } = req.query;
        
        const query = {};
        if (status) {
            query.status = status;
        }
        if (userId) {
            query.userId = userId;
        }

        const skip = (page - 1) * limit;
        const orders = await Order.find(query)
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const ordersWithUserDetails = await Promise.all(
            orders.map(async (order) => {
                const user = await User.findById(order.userId).select('username email');
                return {
                    ...order.toObject(),
                    userName: user?.username || 'Unknown User',
                    userEmail: user?.email || 'Unknown Email'
                };
            })
        );

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            orders: ordersWithUserDetails,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / limit),
                total_orders: total,
                orders_per_page: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getPendingOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'Pending' })
            .sort({ orderDate: -1 });

        const ordersWithUserDetails = await Promise.all(
            orders.map(async (order) => {
                const user = await User.findById(order.userId).select('username email');
                return {
                    ...order.toObject(),
                    userName: user?.username || 'Unknown User',
                    userEmail: user?.email || 'Unknown Email',
                    priority: 'normal' // Default priority, could be enhanced
                };
            })
        );

        res.status(200).json({
            success: true,
            orders: ordersWithUserDetails
        });
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Mail Sent', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        
        let order = await Order.findOne({ orderId: id });
        if (!order) {
            order = await Order.findById(id);
        }
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        const user = await User.findById(order.userId).select('username email');
        
        const enrichedProducts = await Promise.all(
            order.products.map(async (orderProduct) => {
                try {
                    const fullProduct = await Product.findById(orderProduct.productId);
                    if (fullProduct) {
                        return {
                            ...orderProduct.toObject(),
                            image: fullProduct.image,
                            category: fullProduct.category,
                            description: fullProduct.description,
                            productName: orderProduct.productName,
                            machine_type: orderProduct.machine_type,
                            price: orderProduct.price,
                            quantity: orderProduct.quantity,
                            designFiles: orderProduct.designFiles
                        };
                    } else {
                        return orderProduct.toObject();
                    }
                } catch (error) {
                    console.warn(`Failed to fetch product details for ${orderProduct.productId}:`, error.message);
                    return orderProduct.toObject();
                }
            })
        );
        
        const orderWithUserDetails = {
            ...order.toObject(),
            userName: user?.username || 'Unknown User',
            userEmail: user?.email || 'Unknown Email',
            products: enrichedProducts
        };

        res.status(200).json({
            success: true,
            order: orderWithUserDetails
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const sendDesignFiles = async (req, res) => {
    try {
        const { id } = req.params;
        
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        const user = await User.findById(order.userId).select('username email');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Customer not found'
            });
        }
        
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status: 'Mail Sent' },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: `Design files sent to ${user.email}`,
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error sending design files:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getOrdersStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const completedOrders = await Order.countDocuments({ status: 'Mail Sent' });
        const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });

        const recentOrders = await Order.find()
            .sort({ orderDate: -1 })
            .limit(5)
            .select('orderId totalAmount orderDate status');

        res.status(200).json({
            success: true,
            stats: {
                total: totalOrders,
                pending: pendingOrders,
                completed: completedOrders,
                cancelled: cancelledOrders
            },
            recentOrders
        });
    } catch (error) {
        console.error('Error fetching orders stats:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const retryOrderEmail = async (req, res) => {
    try {
        const { id: orderId } = req.params;
        
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        if (order.status !== 'Email Failed' && 
            order.emailStatus !== 'failed' && 
            !(order.status === 'Paid' && order.emailStatus === 'failed') &&
            !(order.status === 'Sending Email' && order.emailStatus === 'failed')) {
            return res.status(400).json({
                success: false,
                error: 'Order email status does not require retry',
                debugLog: [
                    `Order status: ${order.status}`,
                    `Email status: ${order.emailStatus}`,
                    `Retry not needed for this order state`
                ]
            });
        }

        const { retryPaymentConfirmationEmail } = await import('./mailOperations.js');
        
        const result = await retryPaymentConfirmationEmail(orderId);
        
        if (result.success) {
            return res.status(200).json({
                success: true,
                message: 'Email sent successfully',
                debugLog: result.debugLog,
                alreadySent: result.messageId === 'already_sent'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: result.error,
                debugLog: result.debugLog
            });
        }

    } catch (error) {
        console.error('Error retrying order email:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal Server Error',
            debugLog: [
                `Server Error: ${error.message}`,
                `Error time: ${new Date().toLocaleString()}`
            ]
        });
    }
};
