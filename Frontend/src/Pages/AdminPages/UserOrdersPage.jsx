import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AdminHeader from '../../Components/AdminHeader';
import { isAuthenticated, getAuthToken, getUserRole } from '../../utils/auth.js';
import { ArrowLeft, Package, Calendar, User, DollarSign, Eye, Mail, RefreshCw, ShoppingBag } from 'lucide-react';

const url = import.meta.env.VITE_API_BASE_URL;

const UserOrdersPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [retryingOrders, setRetryingOrders] = useState(new Set());

  useEffect(() => {
    if (!isAuthenticated() || getUserRole() !== 'admin') {
      navigate('/login');
      return;
    }
    
    // Get user info from location state if available
    if (location.state?.userInfo) {
      setUserInfo(location.state.userInfo);
    }
    
    fetchUserOrders();
  }, [navigate, userId, location.state]);

  const fetchUserOrders = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/orders/all?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders || []);
          // If we don't have user info from navigation, get it from the first order
          if (!userInfo && data.orders.length > 0) {
            setUserInfo({
              username: data.orders[0].userName,
              email: data.orders[0].userEmail
            });
          }
        }
      } else {
        console.error('Failed to fetch user orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const retryOrderEmail = async (orderId) => {
    setRetryingOrders(prev => new Set([...prev, orderId]));

    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/orders/${orderId}/retry-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.alreadySent) {
          alert('Email was already sent successfully for this order.');
        } else {
          alert('Email sent successfully!');
          fetchUserOrders();
        }
      } else {
        alert(`Failed to send email: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error retrying email:', error);
      alert('Network error occurred while retrying email');
    } finally {
      setRetryingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
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
        fetchUserOrders();
      } else {
        alert(`Order ${newStatus.toLowerCase()} successfully!`);
        fetchUserOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ff9800';
      case 'paid': return '#2196f3';
      case 'sending email': return '#9c27b0';
      case 'mail sent': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'email failed': return '#f44336';
      case 'payment failed': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Calendar size={14} />;
      case 'paid': return <DollarSign size={14} />;
      case 'sending email': return <Mail size={14} />;
      case 'mail sent': return <Package size={14} />;
      case 'cancelled': return <span>❌</span>;
      case 'email failed': return <span>❌</span>;
      case 'payment failed': return <span>❌</span>;
      default: return <Package size={14} />;
    }
  };

  const shouldShowRetryButton = (order) => {
    if (order.status === 'Cancelled') {
      return false;
    }
    
    if (order.emailStatus === 'sent' && order.emailSent === true) {
      return false;
    }
    
    return (
      order.emailStatus === 'failed' || 
      order.emailStatus === 'pending' || 
      order.emailStatus === 'retrying' ||
      order.status === 'Email Failed' ||
      order.status === 'Sending Email' ||
      (order.status === 'Pending' && !order.emailSent)
    );
  };

  const getEmailStatusColor = (order) => {
    if (order.emailStatus === 'sent' || order.emailSent) return '#4caf50';
    if (order.emailStatus === 'failed') return '#f44336';
    if (order.emailStatus === 'pending' || order.emailStatus === 'retrying') return '#ff9800';
    return '#757575';
  };

  const getEmailStatusText = (order) => {
    if (order.emailStatus === 'sent' || order.emailSent) return 'Email Sent';
    if (order.emailStatus === 'failed') return 'Email Failed';
    if (order.emailStatus === 'pending') return 'Email Pending';
    if (order.emailStatus === 'retrying') return 'Email Retrying';
    return 'Email Pending';
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
    background: 'linear-gradient(135deg, #2196f3, #1976d2)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)'
  };

  const userInfoStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    marginBottom: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  };

  const ordersGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px'
  };

  const orderCardStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid #e1e5e9'
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
        <AdminHeader />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading user orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={mainContainerStyle}>
      <AdminHeader />
      
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            style={backButtonStyle}
            onClick={() => navigate('/admin/customers')}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <ArrowLeft size={20} />
            Back to Customers
          </button>
          <h1 style={{ margin: 0, color: '#021d3b', fontSize: '2.5rem' }}>
            User Orders
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#666', fontSize: '18px' }}>
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      {userInfo && (
        <div style={userInfoStyle}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {userInfo.username ? userInfo.username[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: '#021d3b', fontSize: '1.5rem' }}>
              {userInfo.username || 'Unknown User'}
            </h3>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              <Mail size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              {userInfo.email || 'Unknown Email'}
            </p>
          </div>
        </div>
      )}

      <div style={ordersGridStyle}>
        {orders.map((order) => (
          <div
            key={order._id}
            style={orderCardStyle}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0', color: '#021d3b', fontSize: '1.3rem' }}>
                  Order #{order.orderId}
                </h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={statusBadgeStyle(order.status)}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                  <div style={{
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: getEmailStatusColor(order),
                    color: 'white'
                  }}>
                    {getEmailStatusText(order)}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4caf50' }}>
                  ₹{order.totalAmount}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {new Date(order.orderDate).toLocaleDateString()}
                </div>
                {order.retryCount > 0 && (
                  <div style={{ fontSize: '12px', color: '#ff9800', marginTop: '5px' }}>
                    Retries: {order.retryCount}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #eee' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  style={actionButtonStyle}
                  onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                >
                  <Eye size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  View Details
                </button>
                
                {shouldShowRetryButton(order) && (
                  <button
                    style={{
                      ...actionButtonStyle,
                      background: retryingOrders.has(order.orderId) ? '#ccc' : 'linear-gradient(135deg, #E91E63, #F06292)',
                      color: 'white',
                      border: 'none',
                      opacity: retryingOrders.has(order.orderId) ? 0.6 : 1,
                      cursor: retryingOrders.has(order.orderId) ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => retryOrderEmail(order.orderId)}
                    disabled={retryingOrders.has(order.orderId)}
                  >
                    {retryingOrders.has(order.orderId) ? (
                      <>
                        <RefreshCw size={16} style={{ verticalAlign: 'middle', marginRight: '5px', animation: 'spin 1s linear infinite' }} />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <Mail size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                        Retry Email
                      </>
                    )}
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {order.status === 'Pending' && (
                  <>
                    <button
                      style={{ ...actionButtonStyle, background: '#4caf50', color: 'white', border: 'none' }}
                      onClick={() => updateOrderStatus(order._id, 'Mail Sent')}
                    >
                      Mark as Sent
                    </button>
                    <button
                      style={{ ...actionButtonStyle, background: '#f44336', color: 'white', border: 'none' }}
                      onClick={() => updateOrderStatus(order._id, 'Cancelled')}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {order.status === 'Mail Sent' && (
                  <button
                    style={{ ...actionButtonStyle, background: '#ff9800', color: 'white', border: 'none' }}
                    onClick={() => updateOrderStatus(order._id, 'Pending')}
                  >
                    Mark as Pending
                  </button>
                )}
                {order.status === 'Cancelled' && (
                  <button
                    style={{ ...actionButtonStyle, background: '#2196f3', color: 'white', border: 'none' }}
                    onClick={() => updateOrderStatus(order._id, 'Pending')}
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>
            <ShoppingBag size={48} color="#666" />
          </div>
          <div style={{ fontSize: '24px', color: '#666', fontWeight: 'bold', marginBottom: '10px' }}>
            No Orders Found
          </div>
          <div style={{ fontSize: '18px', color: '#999' }}>
            This user hasn't placed any orders yet.
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UserOrdersPage;
