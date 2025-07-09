import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import { isAuthenticated, getAuthToken } from '../utils/auth.js';
import { ArrowLeft, Package, Calendar, DollarSign, Eye, Download, Clock, CheckCircle, X } from 'lucide-react';

const url = import.meta.env.VITE_API_BASE_URL;

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, mail_sent, cancelled

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchUserOrders();
  }, [navigate]);

  useEffect(() => {
    filterOrders();
  }, [orders, filter]);

  const fetchUserOrders = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/user/orders`, {
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
      filtered = filtered.filter(order => 
        order.status.toLowerCase().replace(' ', '_') === filter
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ff9800';
      case 'mail sent': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#2196f3';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock size={16} />;
      case 'mail sent': return <CheckCircle size={16} />;
      case 'cancelled': return <X size={16} />;
      default: return <Package size={16} />;
    }
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
          Pending
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
            style={orderCardStyle}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0', color: '#021d3b', fontSize: '1.3rem' }}>
                  Order #{order.orderId}
                </h3>
                <div style={statusBadgeStyle(order.status)}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
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
                {order.status === 'Mail Sent' && (
                  <button
                    style={{ ...actionButtonStyle, background: '#4caf50', color: 'white', border: 'none' }}
                    onClick={() => alert(`Download design files for ${order.orderId}`)}
                  >
                    <Download size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                    Download Files
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
