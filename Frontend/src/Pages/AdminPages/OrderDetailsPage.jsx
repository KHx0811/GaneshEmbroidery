import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminHeader from '../../Components/AdminHeader';
import { isAuthenticated, getAuthToken, getUserRole } from '../../utils/auth.js';
import { ArrowLeft, Package, Calendar, User, DollarSign, Mail, Phone, MapPin, FileText, Download, Home } from 'lucide-react';

const url = import.meta.env.VITE_API_BASE_URL;

const OrderDetailsPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || getUserRole() !== 'admin') {
      navigate('/login');
      return;
    }
    fetchOrderDetails();
  }, [navigate, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Order data received:', data.order); // Debug log
          setOrder(data.order);
        } else {
          alert('Order not found');
          navigate('/admin/orders');
        }
      } else {
        alert('Failed to fetch order details');
        navigate('/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Error loading order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ff9800';
      case 'mail sent': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'email failed': return '#f44336';
      case 'sending email': return '#2196f3';
      default: return '#666';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const mainContainerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    paddingTop: '100px',
    paddingBottom: '40px',
    padding: '100px 20px 40px 20px'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '30px',
    background: 'white',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    maxWidth: '1200px',
    margin: '0 auto 30px auto'
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
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const contentStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  };

  const sectionTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#021d3b',
    marginBottom: '20px',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '10px'
  };

  const infoRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid #f0f0f0'
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: '#555',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const valueStyle = {
    color: '#333',
    textAlign: 'right'
  };

  const statusBadgeStyle = (status) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'white',
    background: getStatusColor(status)
  });

  const productCardStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '15px',
    backgroundColor: '#f9f9f9'
  };

  if (loading) {
    return (
      <div style={mainContainerStyle}>
        <AdminHeader />
        <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
          <div style={{ fontSize: '18px' }}>Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={mainContainerStyle}>
        <AdminHeader />
        <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
          <div style={{ fontSize: '18px' }}>Order not found</div>
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
            onClick={() => navigate('/admin/orders')}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ margin: 0, color: '#021d3b', fontSize: '2.5rem' }}>
            Order Details
          </h1>
        </div>
      </div>

      <div style={contentStyle}>
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <Package size={24} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            Order Overview
          </h2>
          
          <div style={infoRowStyle}>
            <span style={labelStyle}>
              <FileText size={16} />
              Order ID
            </span>
            <span style={valueStyle}>{order.orderId}</span>
          </div>

          <div style={infoRowStyle}>
            <span style={labelStyle}>
              <Calendar size={16} />
              Order Date
            </span>
            <span style={valueStyle}>{formatDate(order.createdAt)}</span>
          </div>

          <div style={infoRowStyle}>
            <span style={labelStyle}>
              Status
            </span>
            <span style={statusBadgeStyle(order.status)}>
              {order.status}
            </span>
          </div>

          <div style={infoRowStyle}>
            <span style={labelStyle}>
              <DollarSign size={16} />
              Total Amount
            </span>
            <span style={{ ...valueStyle, fontSize: '1.2rem', fontWeight: 'bold', color: '#2e7d32' }}>
              ₹{order.totalAmount}
            </span>
          </div>

          <div style={infoRowStyle}>
            <span style={labelStyle}>
              <Mail size={16} />
              Email Status
            </span>
            <span style={{
              ...valueStyle,
              color: order.emailSent || order.emailStatus === 'sent' ? '#4caf50' : '#f44336',
              fontWeight: 'bold'
            }}>
              {order.emailSent || order.emailStatus === 'sent' ? 'Sent Successfully' : 
               order.emailStatus === 'failed' ? 'Failed' :
               order.emailStatus === 'pending' ? 'Pending' :
               order.emailStatus === 'retrying' ? 'Retrying' :
               'Not Sent'}
            </span>
          </div>

          {order.orderDate && (
            <div style={infoRowStyle}>
              <span style={labelStyle}>
                <Calendar size={16} />
                Order Date (Original)
              </span>
              <span style={valueStyle}>{formatDate(order.orderDate)}</span>
            </div>
          )}

          {order.updatedAt && (
            <div style={infoRowStyle}>
              <span style={labelStyle}>
                Last Updated
              </span>
              <span style={valueStyle}>{formatDate(order.updatedAt)}</span>
            </div>
          )}
        </div>

        {/* Customer Information */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <User size={24} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            Customer Information
          </h2>
          
          <div style={infoRowStyle}>
            <span style={labelStyle}>
              <User size={16} />
              Name
            </span>
            <span style={valueStyle}>{order.userName}</span>
          </div>

          <div style={infoRowStyle}>
            <span style={labelStyle}>
              <Mail size={16} />
              Email
            </span>
            <span style={valueStyle}>{order.userEmail}</span>
          </div>

          {order.userPhone && (
            <div style={infoRowStyle}>
              <span style={labelStyle}>
                <Phone size={16} />
                Phone
              </span>
              <span style={valueStyle}>{order.userPhone}</span>
            </div>
          )}

          {order.userAddress && (
            <div style={infoRowStyle}>
              <span style={labelStyle}>
                <MapPin size={16} />
                Address
              </span>
              <span style={valueStyle}>{order.userAddress}</span>
            </div>
          )}
        </div>

        {/* Products Ordered */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            <Package size={24} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            Products Ordered ({order.products.length} items)
          </h2>
          
          {order.products.map((product, index) => (
            <div key={index} style={productCardStyle}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.productName || product.name}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                  />
                )}
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#021d3b', fontSize: '1.2rem' }}>
                    {product.productName || product.name || 'Product Name Not Available'}
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
                    <div style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                      <strong style={{ color: '#495057' }}>Machine Type:</strong> 
                      <span style={{ color: '#007bff', fontWeight: '500', marginLeft: '8px' }}>
                        {product.machine_type || product.machineType || 'Not specified'}
                      </span>
                    </div>
                    <div style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                      <strong style={{ color: '#495057' }}>Quantity:</strong> 
                      <span style={{ color: '#28a745', fontWeight: '500', marginLeft: '8px' }}>
                        {product.quantity || 1}
                      </span>
                    </div>
                    <div style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                      <strong style={{ color: '#495057' }}>Unit Price:</strong> 
                      <span style={{ color: '#dc3545', fontWeight: '500', marginLeft: '8px' }}>
                        ₹{product.price || 0}
                      </span>
                    </div>
                    <div style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                      <strong style={{ color: '#495057' }}>Subtotal:</strong> 
                      <span style={{ color: '#28a745', fontWeight: 'bold', marginLeft: '8px' }}>
                        ₹{(product.price || 0) * (product.quantity || 1)}
                      </span>
                    </div>
                  </div>

                  {/* Product ID for reference */}
                  {product.productId && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#6c757d' }}>
                      <strong>Product ID:</strong> {product.productId}
                    </div>
                  )}

                  {product.designFiles && Object.keys(product.designFiles).length > 0 && (
                    <div style={{ marginTop: '15px' }}>
                      <strong style={{ fontSize: '14px', color: '#495057' }}>Design Files:</strong>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {Object.entries(product.designFiles).map(([fileType, fileUrl]) => (
                          fileUrl && (
                            <div key={fileType} style={{
                              padding: '4px 8px',
                              backgroundColor: '#e7f3ff',
                              border: '1px solid #b3d9ff',
                              borderRadius: '4px',
                              fontSize: '12px',
                              color: '#0056b3'
                            }}>
                              <strong>{fileType.toUpperCase()}</strong>: Available
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', lineHeight: '1.4' }}>
                      <strong>Order Item Details:</strong>
                      <br />
                      • Selected machine format: <span style={{ color: '#007bff' }}>{product.machine_type || product.machineType || 'Not specified'}</span>
                      <br />
                      • Files will be delivered via email after order processing
                      <br />
                      • Contact support if you need additional formats
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {order.paymentInfo && (
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>
              <DollarSign size={24} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
              Payment Information
            </h2>
            
            <div style={infoRowStyle}>
              <span style={labelStyle}>Payment Method</span>
              <span style={valueStyle}>{order.paymentInfo.method || 'Not specified'}</span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>Payment Status</span>
              <span style={{
                ...valueStyle,
                color: order.paymentInfo.status === 'completed' ? '#4caf50' : '#f44336',
                fontWeight: 'bold'
              }}>
                {order.paymentInfo.status || 'Pending'}
              </span>
            </div>

            {order.paymentInfo.transactionId && (
              <div style={infoRowStyle}>
                <span style={labelStyle}>Transaction ID</span>
                <span style={valueStyle}>{order.paymentInfo.transactionId}</span>
              </div>
            )}
          </div>
        )}

        {order.notes && (
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>
              <FileText size={24} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
              Order Notes
            </h2>
            <p style={{ margin: 0, color: '#666', lineHeight: 1.6 }}>{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;
