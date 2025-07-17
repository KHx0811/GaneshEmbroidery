import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../Components/AdminHeader';
import { isAuthenticated, getAuthToken, getUserRole } from '../../utils/auth.js';
import { ArrowLeft, Package, Calendar, User, DollarSign, Eye, Filter, RefreshCw, Mail, ChevronDown, Home } from 'lucide-react';

const url = import.meta.env.VITE_API_BASE_URL;

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, mail_sent, cancelled
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [debugModal, setDebugModal] = useState({
    isOpen: false,
    logs: [],
    title: ''
  });
  const [retryingOrders, setRetryingOrders] = useState(new Set());

  useEffect(() => {
    if (!isAuthenticated() || getUserRole() !== 'admin') {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    filterOrders();
  }, [orders, filter, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  const fetchOrders = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/orders/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      } else {
        console.error('Failed to fetch orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (filter !== 'all') {
      if (filter === 'email_failed') {
        filtered = filtered.filter(order => 
          order.status.toLowerCase() === 'email failed' || 
          order.emailStatus === 'failed'
        );
      } else {
        filtered = filtered.filter(order => 
          order.status.toLowerCase().replace(' ', '_') === filter
        );
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
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
        alert('Order status updated successfully!');
        fetchOrders();
      } else {
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        alert('Order status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const retryOrderEmail = async (orderId) => {
    if (retryingOrders.has(orderId)) {
      alert('Email retry already in progress for this order.');
      return;
    }

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
        setDebugModal({
          isOpen: true,
          logs: result.debugLog || [],
          title: `Email Retry Success - Order ${orderId}`
        });

        if (result.alreadySent) {
          alert('Email was already sent successfully for this order.');
        } else {
          alert('Email sent successfully!');
          fetchOrders();
        }
      } else {
        setDebugModal({
          isOpen: true,
          logs: result.debugLog || [`Error: ${result.message || 'Unknown error'}`],
          title: `Email Retry Failed - Order ${orderId}`
        });
        alert(`Failed to send email: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error retrying email:', error);
      setDebugModal({
        isOpen: true,
        logs: [`Network Error: ${error.message}`],
        title: `Email Retry Error - Order ${orderId}`
      });
      alert('Network error occurred while retrying email');
    } finally {
      setRetryingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const shouldShowRetryButton = (order) => {
    
    if (order.status === 'Cancelled') {
      return false;
    }
    
    if (order.emailStatus === 'sent' && order.emailSent === true) {
      return false;
    }
    
    const shouldShow = (
      order.emailStatus === 'failed' || 
      order.emailStatus === 'pending' || 
      order.emailStatus === 'retrying' ||
      order.status === 'Email Failed' ||
      order.status === 'Sending Email' ||
      (order.status === 'Pending' && !order.emailSent)
    );
    
    return shouldShow;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ff9800';
      case 'mail sent': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'email failed': return '#f44336';
      case 'sending email': return '#2196f3';
      default: return '#2196f3';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '⏳';
      case 'mail sent': return '✅';
      case 'cancelled': return '❌';
      case 'email failed': return '❌';
      case 'sending email': return '📧';
      default: return '📦';
    }
  };

  const getEmailStatusColor = (order) => {
    if (order.emailSent && order.emailStatus === 'sent') return '#4caf50'; // Green - Success
    if (order.emailStatus === 'failed') return '#f44336'; // Red - Failed
    if (order.emailStatus === 'retrying') return '#ff9800'; // Orange - Retrying
    if (order.emailStatus === 'pending' || !order.emailSent) return '#9e9e9e'; // Gray - Pending
    return '#2196f3'; // Blue - Unknown
  };

  const getEmailStatusText = (order) => {
    if (order.emailSent && order.emailStatus === 'sent') return '📧 Sent';
    if (order.emailStatus === 'failed') return '❌ Failed';
    if (order.emailStatus === 'retrying') return '🔄 Retrying';
    if (order.emailStatus === 'pending') return '⏳ Pending';
    if (order.status === 'Email Failed') return '❌ Failed';
    if (order.status === 'Sending Email') return '📧 Sending';
    if (!order.emailSent) return '⏳ Not Sent';
    return '❓ Unknown';
  };

  const getFilterDisplayName = (filterValue) => {
    switch (filterValue) {
      case 'all': return 'All Orders';
      case 'pending': return 'Pending';
      case 'mail_sent': return 'Mail Sent';
      case 'cancelled': return 'Cancelled';
      case 'email_failed': return 'Email Failed';
      default: return 'All Orders';
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'mail_sent', label: 'Mail Sent' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'email_failed', label: 'Email Failed' }
  ];

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

  const iconBackButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '45px',
    height: '45px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginRight: '15px'
  };

  const backButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #6c7ae0, #8b94f0)',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    background: 'white',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    gap: '20px'
  };

  const leftFiltersStyle = {
    flex: 1,
    maxWidth: '500px'
  };

  const rightFiltersStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    position: 'relative'
  };

  const dropdownStyle = {
    position: 'relative',
    display: 'inline-block'
  };

  const dropdownButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 15px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '140px',
    justifyContent: 'space-between'
  };

  const dropdownContentStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: 'white',
    minWidth: '180px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    zIndex: 1000,
    border: '1px solid #ddd',
    marginTop: '5px'
  };

  const dropdownItemStyle = {
    padding: '10px 15px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '14px',
    borderBottom: '1px solid #f0f0f0'
  };

  const searchInputStyle = {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
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
        <AdminHeader />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading orders...</div>
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
            style={iconBackButtonStyle}
            onClick={() => navigate('/admin')}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ margin: 0, color: '#021d3b', fontSize: '2.5rem' }}>
            Orders Management
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#666', fontSize: '18px' }}>
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      <div style={filtersStyle}>
        <div style={leftFiltersStyle}>
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        <div style={rightFiltersStyle}>
          <Filter size={20} style={{ color: '#666' }} />
          <div style={dropdownStyle} className="filter-dropdown">
            <button
              style={dropdownButtonStyle}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <span>{getFilterDisplayName(filter)}</span>
              <ChevronDown size={16} style={{ 
                transform: showFilterDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} />
            </button>
            
            {showFilterDropdown && (
              <div style={dropdownContentStyle}>
                {filterOptions.map((option) => (
                  <div
                    key={option.value}
                    style={{
                      ...dropdownItemStyle,
                      backgroundColor: filter === option.value ? '#f5f5f5' : 'transparent',
                      fontWeight: filter === option.value ? 'bold' : 'normal'
                    }}
                    onClick={() => {
                      setFilter(option.value);
                      setShowFilterDropdown(false);
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 
                      filter === option.value ? '#f5f5f5' : 'transparent'}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={ordersGridStyle}>
        {filteredOrders.map((order) => (
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

      {filteredOrders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>
            {orders.length === 0 ? 'No orders found' : 'No orders match your current filters'}
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

export default OrdersPage;
