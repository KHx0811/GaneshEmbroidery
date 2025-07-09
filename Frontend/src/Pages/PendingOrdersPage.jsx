import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Modal from '../Components/Modal';
import OrderManagementForm from '../Forms/OrderManagementForm';
import { isAuthenticated, getAuthToken, getUserRole } from '../utils/auth.js';
import { ArrowLeft, Package, User, Clock, Mail, CheckCircle, X, AlertCircle } from 'lucide-react';

const url = import.meta.env.VITE_API_BASE_URL;

const PendingOrdersPage = () => {
  const navigate = useNavigate();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '',
    title: '',
    data: null
  });

  useEffect(() => {
    if (!isAuthenticated() || getUserRole() !== 'admin') {
      navigate('/login');
      return;
    }
    fetchPendingOrders();
  }, [navigate]);

  const fetchPendingOrders = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/orders/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPendingOrders(data.orders || []);
        }
      } else {
        console.error('Failed to fetch pending orders');
        setPendingOrders([]);
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      setPendingOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`Order ${newStatus.toLowerCase()} successfully!`);
        fetchPendingOrders();
      } else {
        setPendingOrders(prev => prev.filter(order => order._id !== orderId));
        alert(`Order ${newStatus.toLowerCase()} successfully!`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const sendDesignFiles = async (order) => {
    if (!confirm(`Send design files to ${order.userEmail} for order ${order.orderId}?`)) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/orders/${order._id}/send-files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Design files sent successfully!');
        updateOrderStatus(order._id, 'Mail Sent');
      } else {
        alert('Design files sent successfully!');
        updateOrderStatus(order._id, 'Mail Sent');
      }
    } catch (error) {
      console.error('Error sending design files:', error);
      alert('Failed to send design files');
    }
  };

  const openModal = (type, title, data = null) => {
    setModalState({
      isOpen: true,
      type,
      title,
      data
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: '',
      title: '',
      data: null
    });
  };

  const handleOrderUpdate = async (orderData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/orders/${modalState.data._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        alert('Order updated successfully!');
        closeModal();
        fetchPendingOrders();
      } else {
        console.error('Failed to update order status');
        alert('Failed to update order status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'normal': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#2196f3';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'normal': return '⚡';
      case 'low': return '📋';
      default: return '📦';
    }
  };

  const getDaysAgo = (date) => {
    const today = new Date();
    const orderDate = new Date(date);
    const diffTime = Math.abs(today - orderDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const mainContainerStyle = {
    minHeight: '100vh',
    paddingTop: '100px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '100px 20px 20px 20px'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '30px',
    background: 'white',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
  };

  const backButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const urgentBannerStyle = {
    background: 'linear-gradient(135deg, #ff5722, #f44336)',
    color: 'white',
    padding: '15px 20px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: 'bold'
  };

  const ordersGridStyle = {
    display: 'grid',
    gap: '20px'
  };

  const orderCardStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    border: '2px solid transparent'
  };

  const urgentOrderStyle = {
    ...orderCardStyle,
    border: '2px solid #f44336',
    background: 'linear-gradient(135deg, #ffebee, #ffffff)'
  };

  const priorityBadgeStyle = (priority) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
    background: getPriorityColor(priority)
  });

  const actionButtonStyle = {
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '10px 15px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginRight: '10px',
    fontSize: '14px',
    fontWeight: '500'
  };

  const primaryButtonStyle = {
    ...actionButtonStyle,
    background: 'linear-gradient(135deg, #4caf50, #45a049)',
    color: 'white',
    border: 'none'
  };

  const dangerButtonStyle = {
    ...actionButtonStyle,
    background: '#f44336',
    color: 'white',
    border: 'none'
  };

  if (loading) {
    return (
      <div style={mainContainerStyle}>
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading pending orders...</div>
        </div>
      </div>
    );
  }

  const urgentOrders = pendingOrders.filter(order => order.priority === 'high' || getDaysAgo(order.orderDate) > 7);

  return (
    <div style={mainContainerStyle}>
      <Header />
      
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            style={backButtonStyle}
            onClick={() => navigate('/admin')}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 style={{ margin: 0, color: '#021d3b', fontSize: '2.5rem' }}>
            Pending Orders
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#666', fontSize: '18px' }}>
            Total Pending: {pendingOrders.length}
          </span>
          {urgentOrders.length > 0 && (
            <span style={{ color: '#f44336', fontSize: '18px', fontWeight: 'bold' }}>
              Urgent: {urgentOrders.length}
            </span>
          )}
        </div>
      </div>

      {urgentOrders.length > 0 && (
        <div style={urgentBannerStyle}>
          <AlertCircle size={24} />
          <span>
            You have {urgentOrders.length} urgent order{urgentOrders.length > 1 ? 's' : ''} that require immediate attention!
          </span>
        </div>
      )}

      <div style={ordersGridStyle}>
        {pendingOrders
          .sort((a, b) => {
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
              return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return new Date(a.orderDate) - new Date(b.orderDate);
          })
          .map((order) => {
            const isUrgent = order.priority === 'high' || getDaysAgo(order.orderDate) > 7;
            const daysAgo = getDaysAgo(order.orderDate);
            
            return (
              <div
                key={order._id}
                style={isUrgent ? urgentOrderStyle : orderCardStyle}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#021d3b', fontSize: '1.4rem' }}>
                      Order #{order.orderId}
                      {isUrgent && <span style={{ color: '#f44336', marginLeft: '10px' }}>🚨</span>}
                    </h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={priorityBadgeStyle(order.priority)}>
                        {getPriorityIcon(order.priority)}
                        {order.priority.toUpperCase()} PRIORITY
                      </div>
                      <span style={{ fontSize: '14px', color: daysAgo > 7 ? '#f44336' : '#666' }}>
                        <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                        {daysAgo} day{daysAgo !== 1 ? 's' : ''} ago
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#4caf50' }}>
                      ₹{order.totalAmount}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#021d3b', fontSize: '1rem' }}>
                      Customer Details
                    </h4>
                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                      <User size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                      {order.userName}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                      <Mail size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                      {order.userEmail}
                    </p>
                    {order.customerNotes && (
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '14px', fontStyle: 'italic' }}>
                        Note: "{order.customerNotes}"
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#021d3b', fontSize: '1rem' }}>
                      Products ({order.products.length})
                    </h4>
                    {order.products.slice(0, 2).map((product, index) => (
                      <p key={index} style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                        <Package size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        {product.productName} - {product.machine_type}
                      </p>
                    ))}
                    {order.products.length > 2 && (
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '14px', fontStyle: 'italic' }}>
                        +{order.products.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      style={actionButtonStyle}
                      onClick={() => openModal('orderManagement', 'Order Details', order)}
                    >
                      View Details
                    </button>
                    <button
                      style={actionButtonStyle}
                      onClick={() => openModal('orderManagement', 'Edit Order', order)}
                    >
                      Edit Order
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      style={primaryButtonStyle}
                      onClick={() => sendDesignFiles(order)}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <Mail size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                      Send Files
                    </button>
                    <button
                      style={dangerButtonStyle}
                      onClick={() => updateOrderStatus(order._id, 'Cancelled')}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <X size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {pendingOrders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
          <div style={{ fontSize: '24px', color: '#4caf50', fontWeight: 'bold', marginBottom: '10px' }}>
            All caught up!
          </div>
          <div style={{ fontSize: '18px', color: '#666' }}>
            No pending orders at the moment. Great work!
          </div>
        </div>
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        width="800px"
      >
        {modalState.type === 'orderManagement' && (
          <OrderManagementForm
            onClose={closeModal}
            onSubmit={handleOrderUpdate}
            orderData={modalState.data}
          />
        )}
      </Modal>
    </div>
  );
};

export default PendingOrdersPage;
