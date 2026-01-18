// Utility functions for order tracking

/**
 * Generate a unique tracking code for orders
 * Format: 6 characters (letters + numbers) - e.g., A1B2C3, X7Y8Z9
 */
export function generateTrackingCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  // Generate 6 random characters
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  // Add timestamp suffix to ensure uniqueness
  const timestamp = Date.now().toString().slice(-3); // Last 3 digits
  result += timestamp;
  
  // Return first 6 characters for clean format
  return result.substring(0, 6);
}

/**
 * Validate tracking code format
 */
export function isValidTrackingCode(code) {
  if (!code || typeof code !== 'string') return false;
  // Should be exactly 6 characters, alphanumeric
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
}

/**
 * Format tracking code for display (add space in middle for readability)
 */
export function formatTrackingCode(code) {
  if (!code) return '';
  // ABC123 -> ABC 123
  const upperCode = code.toUpperCase();
  if (upperCode.length === 6) {
    return `${upperCode.slice(0, 3)} ${upperCode.slice(3)}`;
  }
  return upperCode;
}

/**
 * Get order status display information
 */
export function getOrderStatusInfo(status) {
  const statusMap = {
    pending: {
      label: 'Order Placed',
      description: 'Your order has been received and is being processed',
      color: 'yellow',
      icon: 'clock'
    },
    preparing: {
      label: 'Preparing',
      description: 'Your order is being prepared by our kitchen',
      color: 'blue',
      icon: 'package'
    },
    ready: {
      label: 'Ready',
      description: 'Your order is ready for pickup or delivery',
      color: 'orange',
      icon: 'truck'
    },
    delivered: {
      label: 'Delivered',
      description: 'Your order has been delivered successfully',
      color: 'green',
      icon: 'check-circle'
    }
  };

  return statusMap[status] || statusMap.pending;
}

/**
 * Calculate estimated delivery time based on order status
 */
export function getEstimatedDeliveryTime(status, orderTime) {
  const now = new Date();
  const orderDate = new Date(orderTime);
  
  // Base preparation time in minutes
  const preparationTime = {
    pending: 30,
    preparing: 20,
    ready: 10,
    delivered: 0
  };

  const minutesToAdd = preparationTime[status] || 30;
  const estimatedTime = new Date(now.getTime() + minutesToAdd * 60000);
  
  return estimatedTime;
}