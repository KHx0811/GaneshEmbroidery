import Product from "../Models/product.js";
import user from "../Models/user.js";
import Order from "../Models/orders.js";

export const getUsersCount = async (req, res) => {
    try {
        const count = await user.countDocuments();
        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error('Error fetching user count:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

export const getProductsCount = async (req, res) => {
    try {
        const count = await Product.countDocuments();
        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error('Error fetching product count:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

export const getOrdersCount = async (req, res) => {
    try {
        const count = await Order.countDocuments();
        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error('Error fetching order count:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getPendingOrdersCount = async (req, res) => {
    try {
        const count = await Order.countDocuments({ status: 'Pending' });
        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error('Error fetching pending order count:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
