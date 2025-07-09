import User from "../Models/user.js";
import Order from "../Models/orders.js";
import Product from "../Models/product.js";
import { generateUniqueOrderId, handleDuplicateKeyError } from '../utils/orderUtils.js';

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, machineTypes, machineType, quantity = 1, totalPrice } = req.body;

    let finalMachineTypes = [];
    let finalTotalPrice = 0;

    if (machineTypes && Array.isArray(machineTypes) && machineTypes.length > 0) {
      finalMachineTypes = machineTypes;
      if (totalPrice !== undefined && totalPrice !== null && !isNaN(totalPrice) && totalPrice >= 0) {
        finalTotalPrice = parseFloat(totalPrice);
      } else {
        finalTotalPrice = machineTypes.reduce((sum, type) => {
          const price = Number(type.price) || 0;
          return sum + price;
        }, 0);
      }
    } else if (machineType) {
      finalMachineTypes = [];
      finalTotalPrice = 0;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Product ID and machine type(s) are required'
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (machineType && finalMachineTypes.length === 0) {
      const machineTypeMap = {
        'DST-BERNINA-14x8': 'DST_BERNINA_14x8',
        'DST-BROTHER-V3SE-12x8': 'DST_BROTHER_V3SE_12x8',
        'DST-FULL': 'DST_FULL',
        'JEF-USHA-450-11x8': 'JEF_USHA_450_11x8',
        'JEF-USHA-550-14x8': 'JEF_USHA_550_14x8',
        'PES-BROTHER-BP3600-14x9.5': 'PES_BROTHER_BP3600_14x9_5'
      };

      const dbKey = machineTypeMap[machineType] || machineType.replace(/-/g, '_').replace(/\./g, '_');
      
      if (!product.design_files[dbKey] || 
          (!product.design_files[dbKey].file_url && !product.design_files[dbKey].google_drive_id)) {
        return res.status(400).json({
          success: false,
          error: `Machine type ${machineType} not available for this product`
        });
      }

      const machinePrice = product.design_files[dbKey].price || product.price || 0;
      finalMachineTypes = [{
        type: dbKey,
        price: machinePrice
      }];
      finalTotalPrice = machinePrice;
    }

    if (!finalMachineTypes || finalMachineTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid machine types selected'
      });
    }

    if (isNaN(finalTotalPrice) || finalTotalPrice === undefined || finalTotalPrice === null) {
      return res.status(400).json({
        success: false,
        error: 'Invalid total price calculated'
      });
    }

    finalTotalPrice = Math.max(0, Number(finalTotalPrice));

    for (const mt of finalMachineTypes) {
      if (!product.design_files[mt.type] || 
          (!product.design_files[mt.type].file_url && !product.design_files[mt.type].google_drive_id)) {
        return res.status(400).json({
          success: false,
          error: `Machine type ${mt.type} not available for this product`
        });
      }
    }

    if (finalTotalPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid total price'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const existingCartItemIndex = user.cart.findIndex(
      item => item.productId.toString() === productId
    );

    const cartItemToSave = {
      productId,
      machineTypes: finalMachineTypes,
      quantity: parseInt(quantity),
      totalPrice: Number(finalTotalPrice)
    };

    if (existingCartItemIndex > -1) {
      user.cart[existingCartItemIndex].set({
        machineTypes: cartItemToSave.machineTypes,
        totalPrice: cartItemToSave.totalPrice,
        quantity: cartItemToSave.quantity
      });
    } else {
      user.cart.push(cartItemToSave);
    }

    user.cart.forEach((item, index) => {
      if (item.totalPrice === undefined || item.totalPrice === null || isNaN(item.totalPrice)) {
        item.totalPrice = 0;
      }
    });

    user.markModified('cart');

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Product added to cart successfully'
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate({
      path: 'cart.productId',
      model: 'Product',
      select: 'product_name category price image design_files'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const validCartItems = user.cart.filter(item => item.productId);

    const cartItems = validCartItems.map(item => ({
      _id: item._id,
      productId: item.productId._id,
      productName: item.productId.product_name,
      category: item.productId.category,
      image: item.productId.image,
      machineTypes: item.machineTypes,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      price: item.quantity > 0 ? Math.round((item.totalPrice || 0) / item.quantity) : 0, // Calculate per-item price
      addedAt: item.addedAt
    }));

    res.status(200).json({
      success: true,
      cartItems
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const cartItem = user.cart.id(cartItemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    cartItem.quantity = parseInt(quantity);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully'
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cartItemId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.cart = user.cart.filter(item => item._id.toString() !== cartItemId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if item already exists in wishlist
    const existingWishlistItem = user.wishlist.find(
      item => item.productId.toString() === productId
    );

    if (existingWishlistItem) {
      return res.status(400).json({
        success: false,
        error: 'Item already in wishlist'
      });
    }

    // Add new item to wishlist
    user.wishlist.push({ productId });
    
    // Clean up any existing cart items with invalid totalPrice before saving
    user.cart.forEach((item) => {
      if (item.totalPrice === undefined || item.totalPrice === null || isNaN(item.totalPrice)) {
        item.totalPrice = 0;
      }
    });
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Item added to wishlist successfully'
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate({
      path: 'wishlist.productId',
      model: 'Product',
      select: 'product_name category price image design_files'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Filter out any wishlist items where product no longer exists
    const validWishlistItems = user.wishlist.filter(item => item.productId);

    // Format wishlist items for frontend
    const wishlistItems = validWishlistItems.map(item => ({
      _id: item._id,
      productId: item.productId._id,
      productName: item.productId.product_name,
      category: item.productId.category,
      price: item.productId.price,
      image: item.productId.image,
      addedAt: item.addedAt,
      availableMachineTypes: Object.keys(item.productId.design_files).filter(
        key => item.productId.design_files[key] && 
               (item.productId.design_files[key].file_url || item.productId.design_files[key].google_drive_id)
      )
    }));

    res.status(200).json({
      success: true,
      wishlistItems
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { wishlistItemId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Filter out the item to remove
    user.wishlist = user.wishlist.filter(item => item._id.toString() !== wishlistItemId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({ userId }).sort({ orderDate: -1 });

    if (!orders) {
      return res.status(200).json({
        success: true,
        orders: []
      });
    }

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const checkout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items are required for checkout'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate unique order ID
    const orderId = await generateUniqueOrderId();

    // Populate product details for each item
    const orderProducts = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product not found: ${item.productId}`
        });
      }

      const productOrderItem = {
        productId: product._id.toString(),
        productName: product.product_name,
        machine_type: item.machineType,
        price: product.price,
        quantity: item.quantity || 1
      };

      orderProducts.push(productOrderItem);
      totalAmount += product.price * (item.quantity || 1);
    }

    // Create new order
    const newOrder = new Order({
      orderId,
      userId: userId,
      products: orderProducts,
      totalAmount,
      status: 'Pending'
    });

    await newOrder.save();

    // Remove checked out items from user's cart
    const itemIds = items.map(item => item._id);
    user.cart = user.cart.filter(cartItem => !itemIds.includes(cartItem._id.toString()));
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    
    // Handle duplicate key error specifically
    const errorResponse = handleDuplicateKeyError(error, 'checkout');
    if (errorResponse.errorType !== 'GENERAL_ERROR') {
      return res.status(400).json(errorResponse);
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const buyNow = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, machineTypes, quantity = 1, totalPrice } = req.body;

    if (!productId || !machineTypes || !Array.isArray(machineTypes) || machineTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Product ID and machine types are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Generate unique order ID
    const orderId = await generateUniqueOrderId();

    // Create order products with machine types
    const orderProducts = machineTypes.map(machineType => ({
      productId: product._id.toString(),
      productName: product.product_name,
      machine_type: machineType.type,
      price: machineType.price,
      quantity: quantity
    }));

    const finalTotalAmount = totalPrice || machineTypes.reduce((total, type) => total + type.price, 0) * quantity;

    // Create new order directly (Buy Now)
    const newOrder = new Order({
      orderId,
      userId: userId,
      products: orderProducts,
      totalAmount: finalTotalAmount,
      status: 'Pending'
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully for Buy Now',
      order: {
        orderId: newOrder.orderId,
        totalAmount: newOrder.totalAmount,
        products: newOrder.products,
        status: newOrder.status
      }
    });
  } catch (error) {
    console.error('Error during buy now:', error);
    
    // Handle duplicate key error specifically
    const errorResponse = handleDuplicateKeyError(error, 'buy now');
    if (errorResponse.errorType !== 'GENERAL_ERROR') {
      return res.status(400).json(errorResponse);
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
