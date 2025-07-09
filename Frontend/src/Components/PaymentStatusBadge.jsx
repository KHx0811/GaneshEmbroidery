import React from 'react';
import { CreditCard, Clock, CheckCircle, X, AlertTriangle, Package } from 'lucide-react';

const PaymentStatusBadge = ({ status, size = 'medium' }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          color: '#ff9800',
          icon: <Clock size={size === 'small' ? 14 : 16} />,
          text: 'Pending Payment',
          bgColor: '#fff3e0'
        };
      case 'paid':
        return {
          color: '#2196f3',
          icon: <CreditCard size={size === 'small' ? 14 : 16} />,
          text: 'Paid',
          bgColor: '#e3f2fd'
        };
      case 'payment failed':
        return {
          color: '#f44336',
          icon: <AlertTriangle size={size === 'small' ? 14 : 16} />,
          text: 'Payment Failed',
          bgColor: '#ffebee'
        };
      case 'mail sent':
        return {
          color: '#4caf50',
          icon: <CheckCircle size={size === 'small' ? 14 : 16} />,
          text: 'Completed',
          bgColor: '#e8f5e8'
        };
      case 'cancelled':
        return {
          color: '#f44336',
          icon: <X size={size === 'small' ? 14 : 16} />,
          text: 'Cancelled',
          bgColor: '#ffebee'
        };
      default:
        return {
          color: '#9e9e9e',
          icon: <Package size={size === 'small' ? 14 : 16} />,
          text: status || 'Unknown',
          bgColor: '#f5f5f5'
        };
    }
  };

  const config = getStatusConfig(status);
  
  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: size === 'small' ? '3px 8px' : '5px 12px',
    borderRadius: '20px',
    fontSize: size === 'small' ? '11px' : '12px',
    fontWeight: 'bold',
    color: config.color,
    background: config.bgColor,
    border: `1px solid ${config.color}20`,
    whiteSpace: 'nowrap'
  };

  return (
    <span style={badgeStyle}>
      {config.icon}
      {config.text}
    </span>
  );
};

export default PaymentStatusBadge;
