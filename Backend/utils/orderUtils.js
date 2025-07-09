import Order from '../Models/orders.js';

/**
 * Generates a unique order ID with retry logic
 * @param {number} maxAttempts - Maximum number of attempts to generate unique ID
 * @returns {Promise<string>} - Unique order ID
 * @throws {Error} - If unable to generate unique ID after maxAttempts
 */
export const generateUniqueOrderId = async (maxAttempts = 10) => {
  let orderId;
  let orderExists = true;
  let attempts = 0;

  while (orderExists && attempts < maxAttempts) {
    // Generate order ID with timestamp and random component for uniqueness
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    orderId = `ORD-${timestamp}${random}`;
    
    // Check if this order ID already exists
    const existingOrder = await Order.findOne({ orderId });
    orderExists = !!existingOrder;
    attempts++;
  }

  if (orderExists) {
    throw new Error('Failed to generate unique order ID after maximum attempts');
  }

  return orderId;
};

/**
 * Handles MongoDB duplicate key errors specifically for order and payment collections
 * @param {Error} error - The MongoDB error object
 * @param {string} context - Context where the error occurred (e.g., 'order creation', 'payment creation')
 * @returns {object} - Formatted error response
 */
export const handleDuplicateKeyError = (error, context = 'operation') => {
  if (error.code === 11000) {
    if (error.keyPattern && error.keyPattern.orderId) {
      return {
        success: false,
        error: `Order ID conflict during ${context}. Please try again.`,
        errorType: 'DUPLICATE_ORDER_ID'
      };
    } else if (error.keyPattern && error.keyPattern.razorpayOrderId) {
      return {
        success: false,
        error: `Payment order conflict during ${context}. Please try again.`,
        errorType: 'DUPLICATE_PAYMENT_ORDER'
      };
    } else {
      return {
        success: false,
        error: `Duplicate entry detected during ${context}. Please try again.`,
        errorType: 'DUPLICATE_ENTRY'
      };
    }
  }

  // Not a duplicate key error, return generic error
  return {
    success: false,
    error: `An error occurred during ${context}. Please try again.`,
    errorType: 'GENERAL_ERROR'
  };
};

/**
 * Retry function wrapper for database operations that might fail due to race conditions
 * @param {Function} operation - The async operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise<any>} - Result of the operation
 */
export const retryOperation = async (operation, maxRetries = 3, delay = 100) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's not a duplicate key error
      if (error.code !== 11000) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
    }
  }
  
  throw lastError;
};
