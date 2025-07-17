import Order from '../Models/orders.js';


export const generateUniqueOrderId = async (maxAttempts = 10) => {
  let orderId;
  let orderExists = true;
  let attempts = 0;

  while (orderExists && attempts < maxAttempts) {
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    orderId = `ORD-${timestamp}${random}`;
    
    const existingOrder = await Order.findOne({ orderId });
    orderExists = !!existingOrder;
    attempts++;
  }

  if (orderExists) {
    throw new Error('Failed to generate unique order ID after maximum attempts');
  }

  return orderId;
};


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

  return {
    success: false,
    error: `An error occurred during ${context}. Please try again.`,
    errorType: 'GENERAL_ERROR'
  };
};


export const retryOperation = async (operation, maxRetries = 3, delay = 100) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (error.code !== 11000) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
    }
  }
  
  throw lastError;
};
