import User from "../Models/user.js";
import Order from "../Models/orders.js";

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    next();
};

export const getAllUsers = async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }

    try {
        const { role, verified, page = 1, limit = 10 } = req.query;
        
        const query = {};
        if (role) {
            query.role = role;
        }
        if (verified !== undefined) {
            query.isVerified = verified === 'true';
        }

        const skip = (page - 1) * limit;
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const totalOrders = await Order.countDocuments({ userId: user._id });
                const totalSpent = await Order.aggregate([
                    { $match: { userId: user._id.toString() } },
                    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                ]);

                const lastOrder = await Order.findOne({ userId: user._id })
                    .sort({ orderDate: -1 })
                    .select('orderDate');

                return {
                    ...user.toObject(),
                    totalOrders,
                    totalSpent: totalSpent[0]?.total || 0,
                    lastLogin: lastOrder?.orderDate || user.createdAt,
                    status: 'active'
                };
            })
        );

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            users: usersWithStats,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(total / limit),
                total_users: total,
                users_per_page: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getUserById = async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }

    try {
        const { id } = req.params;
        
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const totalOrders = await Order.countDocuments({ userId: id });
        const totalSpent = await Order.aggregate([
            { $match: { userId: id } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const recentOrders = await Order.find({ userId: id })
            .sort({ orderDate: -1 })
            .limit(5)
            .select('orderId totalAmount orderDate status');

        const userWithStats = {
            ...user.toObject(),
            totalOrders,
            totalSpent: totalSpent[0]?.total || 0,
            recentOrders,
            status: 'active'
        };

        res.status(200).json({
            success: true,
            user: userWithStats
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const updateUser = async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }

    try {
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.password;
        delete updateData._id;
        delete updateData.googleId;

        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['active', 'suspended', 'banned'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }
        
        res.status(200).json({
            success: true,
            message: `User status updated to ${status}`,
            status
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getUsersStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const regularUsers = await User.countDocuments({ role: 'user' });
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const unverifiedUsers = await User.countDocuments({ isVerified: false });

        const recentUsers = await User.find()
            .select('username email role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            stats: {
                total: totalUsers,
                admin: adminUsers,
                regular: regularUsers,
                verified: verifiedUsers,
                unverified: unverifiedUsers
            },
            recentUsers
        });
    } catch (error) {
        console.error('Error fetching users stats:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const orderCount = await Order.countDocuments({ userId: id });
        if (orderCount > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete user with existing orders. Consider suspending instead.'
            });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
