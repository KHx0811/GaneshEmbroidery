import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import { isAuthenticated, getAuthToken, getUserRole } from '../utils/auth.js';
import { ArrowLeft, Package, Calendar, User, DollarSign, Eye, Edit, Filter } from 'lucide-react';

const url = import.meta.env.VITE_API_BASE_URL;

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, mail_sent, cancelled
  const [searchTerm, setSearchTerm] = useState('');

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
      filtered = filtered.filter(order => 
        order.status.toLowerCase().replace(' ', '_') === filter
      );
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
      case 'pending': return '⏳';
      case 'mail sent': return '✅';
      case 'cancelled': return '❌';
      default: return '📦';
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
    gap: '15px',
    marginBottom: '20px',
    background: 'white',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    flexWrap: 'wrap'
  };

  const filterButtonStyle = {
    padding: '10px 15px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    background: 'white',
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

  const searchInputStyle = {
    flex: 1,
    minWidth: '200px',
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
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading orders...</div>
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
            onClick={() => navigate('/admin')}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 style={{ margin: 0, color: '#021d3b', fontSize: '2.5rem' }}>
            Orders Management
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
        <Filter size={20} style={{ color: '#666' }} />
        <span style={{ color: '#666', fontWeight: 'bold' }}>Filters:</span>
        
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
          Mail Sent
        </button>
        <button
          style={filter === 'cancelled' ? activeFilterStyle : filterButtonStyle}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled
        </button>

        <input
          type="text"
          placeholder="Search by Order ID, Customer Name, or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInputStyle}
        />
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
                  📧 {order.userEmail}
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
                  onClick={() => alert(`View order details for ${order.orderId}`)}
                >
                  <Eye size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  View Details
                </button>
                <button
                  style={actionButtonStyle}
                  onClick={() => alert(`Edit order ${order.orderId}`)}
                >
                  <Edit size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  Edit
                </button>
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
    </div>
  );
};

export default OrdersPage;
