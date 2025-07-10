import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../Components/Header';
import { isAuthenticated, getAuthToken } from '../utils/auth.js';
import { ArrowLeft, Package, Calendar, DollarSign, Eye, Download, Clock, CheckCircle, X, CreditCard, AlertTriangle, Mail, MailCheck, MailX } from 'lucide-react';
import '../styles/animations.css';

const url = import.meta.env.VITE_API_BASE_URL;

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, mail_sent, cancelled
  const [processingOrderId, setProcessingOrderId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchUserOrders();
    
    if (location.state?.paymentSuccess && location.state?.orderId) {
      setProcessingOrderId(location.state.orderId);
      
      if (location.state.showProcessingMessage) {
        const timer = setTimeout(() => {
          alert(`Payment successful! We're sending your confirmation email with design files. Check your inbox shortly.`);
        }, 500);
        
        // Force refresh orders immediately and multiple times initially
        fetchUserOrders(true);
        setTimeout(() => fetchUserOrders(true), 1000);
        setTimeout(() => fetchUserOrders(true), 2000);
        
        // Start aggressive polling for order status updates
        const pollInterval = setInterval(() => {
          fetchUserOrders(true); // Force refresh on each poll
        }, 2000); // Poll every 2 seconds
        
        // Stop polling after 3 minutes
        const stopPolling = setTimeout(() => {
          clearInterval(pollInterval);
          setProcessingOrderId(null);
        }, 180000);
        
        navigate('/my-orders', { replace: true });
        
        return () => {
          clearTimeout(timer);
          clearInterval(pollInterval);
          clearTimeout(stopPolling);
        };
      }
    }
    
    // Handle payment timeout case
    if (location.state?.paymentTimeout && location.state?.orderId) {
      const timer = setTimeout(() => {
        alert(`Payment may have been processed. Please check your order status for Order #${location.state.orderId}. If payment was deducted but order status is not updated, please contact support.`);
      }, 500);
      
      navigate('/my-orders', { replace: true });
      
      return () => clearTimeout(timer);
    }
    
    // Handle payment cancelled case
    if (location.state?.paymentCancelled && location.state?.orderId) {
      const timer = setTimeout(() => {
        alert(`Payment was cancelled for Order #${location.state.orderId}. You can try again anytime.`);
      }, 500);
      
      navigate('/my-orders', { replace: true });
      
      return () => clearTimeout(timer);
    }
    
    // Handle payment failed case
    if (location.state?.paymentFailed && location.state?.orderId) {
      const timer = setTimeout(() => {
        alert(`Payment failed for Order #${location.state.orderId}: ${location.state.errorMessage || 'Please try again.'}. You can retry payment anytime.`);
      }, 500);
      
      navigate('/my-orders', { replace: true });
      
      return () => clearTimeout(timer);
    }
    
    // Handle payment verification failed case
    if (location.state?.paymentVerificationFailed && location.state?.orderId) {
      const timer = setTimeout(() => {
        alert(`${location.state.errorMessage || 'Payment verification failed.'} Please check your order status for Order #${location.state.orderId}.`);
      }, 500);
      
      navigate('/my-orders', { replace: true });
      
      return () => clearTimeout(timer);
    }
  }, [navigate, location.state]);

  useEffect(() => {
    filterOrders();
    
    // Check if processing order status has changed
    if (processingOrderId) {
      const processingOrder = orders.find(order => order.orderId === processingOrderId);
      if (processingOrder) {
        // Keep processing indicator if status is Pending, Sending Email, or if email is still pending
        if (processingOrder.status === 'Mail Sent' || 
            (processingOrder.status === 'Paid' && processingOrder.emailStatus === 'sent')) {
          setProcessingOrderId(null);
        }
      }
    }
  }, [orders, filter, processingOrderId]);

  const fetchUserOrders = async (forceRefresh = false) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/user/orders${forceRefresh ? '?t=' + Date.now() : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: forceRefresh ? 'no-cache' : 'default'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      } else {
        setOrders([]);
      }
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmationEmail = async (orderId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/payment/resend-confirmation/${orderId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Confirmation email sent successfully!');
        fetchUserOrders(); // Refresh orders to update email status
      } else {
        const data = await response.json();
        alert(`Failed to send email: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Failed to send email. Please try again.');
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (filter !== 'all') {
      filtered = filtered.filter(order => 
        order.status.toLowerCase().replace(' ', '_') === filter
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ff9800';
      case 'paid': return '#2196f3';
      case 'sending email': return '#9c27b0';
      case 'payment failed': return '#f44336';
      case 'mail sent': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock size={16} />;
      case 'paid': return <CreditCard size={16} />;
      case 'sending email': return <Mail size={16} className="processing-animation" />;
      case 'payment failed': return <AlertTriangle size={16} />;
      case 'mail sent': return <CheckCircle size={16} />;
      case 'cancelled': return <X size={16} />;
      default: return <Package size={16} />;
    }
  };

  const getStatusText = (status, orderId) => {
    if (status === 'Sending Email') {
      return 'Sending Email... Check your inbox!';
    }
    return status;
  };

  const getEmailStatusInfo = (order) => {
    if (order.status === 'Paid' || order.status === 'Mail Sent') {
      if (order.emailStatus === 'sent') {
        return {
          icon: <MailCheck size={14} />,
          text: 'Confirmation email sent',
          color: '#4caf50'
        };
      } else if (order.emailStatus === 'failed') {
        return {
          icon: <MailX size={14} />,
          text: 'Email sending failed',
          color: '#f44336'
        };
      } else if (order.emailStatus === 'pending') {
        return {
          icon: <Mail size={14} />,
          text: 'Sending confirmation email...',
          color: '#ff9800'
        };
      }
    }
    return null;
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

  const filtersStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '30px',
    background: 'white',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    flexWrap: 'wrap'
  };

  const filterButtonStyle = {
    padding: '8px 16px',
    border: '2px solid #ddd',
    borderRadius: '25px',
    background: 'white',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: '500'
  };

  const activeFilterStyle = {
    ...filterButtonStyle,
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: 'white',
    borderColor: '#D8B46A'
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
    transition: 'all 0.3s ease'
  };

  const statusBadgeStyle = (status) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
    background: getStatusColor(status)
  });

  const actionButtonStyle = {
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginRight: '8px',
    fontSize: '14px'
  };

  if (loading) {
    return (
      <div style={mainContainerStyle}>
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading your orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={mainContainerStyle}>
      <Header />
      
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            style={backButtonStyle}
            onClick={() => navigate('/')}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 style={{ margin: 0, color: '#021d3b', fontSize: '2.5rem' }}>
            My Orders
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            style={{
              background: 'linear-gradient(135deg, #2196f3, #1976d2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => {
              fetchUserOrders(true);
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔄 Refresh
          </button>
          {processingOrderId && (
            <div style={{
              background: 'rgba(156, 39, 176, 0.1)',
              color: '#9c27b0',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <div className="processing-spinner" style={{
                width: '12px',
                height: '12px',
                border: '2px solid #9c27b0',
                borderTop: '2px solid transparent',
                borderRadius: '50%'
              }}></div>
              Auto-refreshing...
            </div>
          )}
          <span style={{ color: '#666', fontSize: '18px' }}>
            Total Orders: {orders.length}
          </span>
          <span style={{ color: '#666', fontSize: '18px' }}>
            Filtered: {filteredOrders.length}
          </span>
        </div>
      </div>

      <div style={filtersStyle}>
        <span style={{ color: '#666', fontWeight: 'bold' }}>Filter by Status:</span>
        
        <button
          style={filter === 'all' ? activeFilterStyle : filterButtonStyle}
          onClick={() => setFilter('all')}
        >
          All Orders
        </button>
        <button
          style={filter === 'pending' ? activeFilterStyle : filterButtonStyle}
          onClick={() => setFilter('pending')}
        >
          Pending Payment
        </button>
        <button
          style={filter === 'paid' ? activeFilterStyle : filterButtonStyle}
          onClick={() => setFilter('paid')}
        >
          Paid
        </button>
        <button
          style={filter === 'sending_email' ? activeFilterStyle : filterButtonStyle}
          onClick={() => setFilter('sending_email')}
        >
          Sending Email
        </button>
        <button
          style={filter === 'payment_failed' ? activeFilterStyle : filterButtonStyle}
          onClick={() => setFilter('payment_failed')}
        >
          Payment Failed
        </button>
        <button
          style={filter === 'mail_sent' ? activeFilterStyle : filterButtonStyle}
          onClick={() => setFilter('mail_sent')}
        >
          Completed
        </button>
        <button
          style={filter === 'cancelled' ? activeFilterStyle : filterButtonStyle}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>

      <div style={ordersGridStyle}>
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className={order.status === 'Sending Email' ? 'mail-processing-card' : ''}
            style={{
              ...orderCardStyle,
              ...(order.status === 'Sending Email' ? {
                border: '2px solid #9c27b0',
                background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)',
                boxShadow: '0 4px 15px rgba(156, 39, 176, 0.2)'
              } : {})
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0', color: '#021d3b', fontSize: '1.3rem' }}>
                  {[...new Set(order.products.map(p => p.productName))].join(', ')}
                </h3>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>
                  Order #{order.orderId}
                </p>
                <div style={statusBadgeStyle(order.status)}>
                  {getStatusIcon(order.status)}
                  {getStatusText(order.status, order.orderId)}
                </div>
                {order.status === 'Sending Email' && (
                  <div className="mail-processing-indicator">
                    <div className="processing-spinner" style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #9c27b0',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%'
                    }}></div>
                    <span>Processing your design files...</span>
                  </div>
                )}
                {getEmailStatusInfo(order) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginTop: '8px',
                    fontSize: '12px',
                    color: getEmailStatusInfo(order).color
                  }}>
                    {getEmailStatusInfo(order).icon}
                    <span>{getEmailStatusInfo(order).text}</span>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4caf50' }}>
                  ₹{order.totalAmount}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  {new Date(order.orderDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#021d3b', fontSize: '1rem' }}>
                Products ({order.products.length})
              </h4>
              {order.products.map((product, index) => (
                <div key={index} style={{ 
                  padding: '10px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#021d3b' }}>
                      {product.productName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {product.machine_type}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#4caf50' }}>
                    ₹{product.price}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #eee' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  style={actionButtonStyle}
                  onClick={() => alert(`View order details for ${order.orderId}`)}
                >
                  <Eye size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  View Details
                </button>
                {order.status === 'Payment Failed' && (
                  <button
                    style={{ ...actionButtonStyle, background: '#ff9800', color: 'white', border: 'none' }}
                    onClick={() => {
                      navigate('/payment', { 
                        state: { 
                          orderId: order.orderId,
                          totalAmount: order.totalAmount,
                          products: order.products
                        }
                      });
                    }}
                  >
                    <CreditCard size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                    Retry Payment
                  </button>
                )}
                {order.status === 'Pending' && (
                  <button
                    style={{ ...actionButtonStyle, background: '#2196f3', color: 'white', border: 'none' }}
                    onClick={() => {
                      navigate('/payment', { 
                        state: { 
                          orderId: order.orderId,
                          totalAmount: order.totalAmount,
                          products: order.products
                        }
                      });
                    }}
                  >
                    <CreditCard size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                    Complete Payment
                  </button>
                )}
                {order.status === 'Mail Sent' && (
                  <button
                    style={{ ...actionButtonStyle, background: '#4caf50', color: 'white', border: 'none' }}
                    onClick={() => alert(`Download design files for ${order.orderId}`)}
                  >
                    <Download size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                    Download Files
                  </button>
                )}
                {(order.status === 'Paid' && order.emailStatus === 'failed') && (
                  <button
                    style={{ ...actionButtonStyle, background: '#ff5722', color: 'white', border: 'none' }}
                    onClick={() => resendConfirmationEmail(order.orderId)}
                  >
                    <MailX size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                    Resend Email
                  </button>
                )}
              </div>

              <div style={{ fontSize: '14px', color: '#666' }}>
                Order Date: {new Date(order.orderDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
            {orders.length === 0 ? 'No orders found' : 'No orders match your current filter'}
          </div>
          {orders.length === 0 && (
            <button
              style={{
                ...backButtonStyle,
                background: 'linear-gradient(135deg, #2196f3, #1976d2)'
              }}
              onClick={() => navigate('/categories')}
            >
              Start Shopping
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
