import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

const CustomerManagementForm = ({ onClose, onSubmit, customerData = null }) => {
  const [formData, setFormData] = useState({
    username: customerData?.username || '',
    email: customerData?.email || '',
    status: customerData?.status || 'active',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer. Please try again.');
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={labelStyle}>Username *</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter username"
            style={errors.username ? errorInputStyle : inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
            onBlur={(e) => e.target.style.borderColor = errors.username ? '#ff4444' : '#e1e5e9'}
          />
          {errors.username && <div style={errorStyle}>{errors.username}</div>}
        </div>

        <div>
          <label style={labelStyle}>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            style={errors.email ? errorInputStyle : inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
            onBlur={(e) => e.target.style.borderColor = errors.email ? '#ff4444' : '#e1e5e9'}
          />
          {errors.email && <div style={errorStyle}>{errors.email}</div>}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
          onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={labelStyle}>Admin Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Add any notes about this customer..."
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
          {isLoading ? 'Updating...' : 'Update Customer'}
        </button>
      </div>
    </form>
  );
};

export default CustomerManagementForm;
