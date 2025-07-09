import React, { useState } from 'react';
import { Save, X, Send } from 'lucide-react';

const OrderManagementForm = ({ onClose, onSubmit, orderData = null }) => {
  const [formData, setFormData] = useState({
    status: orderData?.status || 'pending',
    trackingNumber: orderData?.tracking_number || '',
    notes: orderData?.admin_notes || '',
    sendDesignFiles: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const orderStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.status === 'shipped' && !formData.trackingNumber.trim()) {
      newErrors.trackingNumber = 'Tracking number is required for shipped orders';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const submitData = {
        ...formData,
        orderId: orderData?._id || orderData?.id
      };
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.3s ease',
    outline: 'none'
  };

  const errorInputStyle = {
    ...inputStyle,
    borderColor: '#ff4444'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#021d3b',
    fontSize: '14px'
  };

  const errorStyle = {
    color: '#ff4444',
    fontSize: '12px',
    marginTop: '5px'
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: '#f5f5f5',
    color: '#666'
  };

  return (
    <form onSubmit={handleSubmit}>
      {orderData && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #e1e5e9'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#021d3b' }}>Order Details</h4>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
            <strong>Order ID:</strong> {orderData._id || orderData.id}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
            <strong>Customer:</strong> {orderData.user_email || orderData.customer_email}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
            <strong>Product:</strong> {orderData.product_name}
          </p>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
            <strong>Current Status:</strong> 
            <span style={{ 
              textTransform: 'capitalize',
              padding: '2px 8px',
              borderRadius: '4px',
              background: orderData.status === 'pending' ? '#fff3cd' : 
                         orderData.status === 'processing' ? '#cce5ff' :
                         orderData.status === 'shipped' ? '#d4edda' :
                         orderData.status === 'delivered' ? '#d1ecf1' : '#f8d7da',
              color: '#495057',
              marginLeft: '8px'
            }}>
              {orderData.status}
            </span>
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={labelStyle}>Order Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          >
            {orderStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Tracking Number</label>
          <input
            type="text"
            name="trackingNumber"
            value={formData.trackingNumber}
            onChange={handleInputChange}
            placeholder="Enter tracking number"
            style={errors.trackingNumber ? errorInputStyle : inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
            onBlur={(e) => e.target.style.borderColor = errors.trackingNumber ? '#ff4444' : '#e1e5e9'}
          />
          {errors.trackingNumber && <div style={errorStyle}>{errors.trackingNumber}</div>}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>
          <input
            type="checkbox"
            name="sendDesignFiles"
            checked={formData.sendDesignFiles}
            onChange={handleInputChange}
            style={{ marginRight: '8px' }}
          />
          Send design files to customer email
        </label>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          Check this box to automatically email the design files to the customer
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={labelStyle}>Admin Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Add any notes about this order..."
          rows="4"
          style={{
            ...inputStyle,
            resize: 'vertical'
          }}
          onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
          onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
        />
      </div>

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={secondaryButtonStyle}
          onMouseEnter={(e) => e.target.style.background = '#e0e0e0'}
          onMouseLeave={(e) => e.target.style.background = '#f5f5f5'}
        >
          <X size={16} />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            ...primaryButtonStyle,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(216, 180, 106, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          <Save size={16} />
          {isLoading ? 'Updating...' : 'Update Order'}
        </button>
      </div>
    </form>
  );
};

export default OrderManagementForm;
