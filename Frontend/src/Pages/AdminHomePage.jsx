import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Modal from '../Components/Modal';
import AddDesignForm from '../Components/AddDesignForm.jsx';
import { isAuthenticated, getAuthToken, getUserRole } from '../utils/auth.js';
import assets from '../assets/assets.js';


const url = import.meta.env.VITE_API_BASE_URL;

const AdminHomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalDesigns: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingOrders: 0
  });
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '',
    title: '',
    data: null
  });

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

  const handleAddDesign = async (designData) => {
    try {
      console.log('Adding new design:', designData);
      
      const token = getAuthToken();
      const response = await fetch(`${url}/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(designData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        alert('Design added successfully!');
        setStats(prev => ({
          ...prev,
          totalDesigns: prev.totalDesigns + 1
        }));
      } else {
        throw new Error(result.message || 'Failed to add design');
      }
    } catch (error) {
      console.error('Error adding design:', error);
      alert('Failed to add design: ' + error.message);
      throw error;
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    const userRole = getUserRole();
    
    if (userRole !== 'admin') {
      window.location.href = '/';
      return;
    }

    const token = getAuthToken();
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        username: payload.username || payload.user || 'Admin',
        email: payload.email || '',
        role: payload.role || 'admin'
      });
    } catch (error) {
      console.error('Error decoding token:', error);
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = getAuthToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [productsRes, ordersRes, usersRes, pendingRes] = await Promise.all([
        fetch(`${url}/orders/products`, { headers }),
        fetch(`${url}/orders/orders`, { headers }),
        fetch(`${url}/orders/users`, { headers }),
        fetch(`${url}/orders/pending-count`, { headers })
      ]);

      const [productsData, ordersData, usersData, pendingData] = await Promise.all([
        productsRes.json(),
        ordersRes.json(),
        usersRes.json(),
        pendingRes.json()
      ]);

      if (productsData.success && ordersData.success && usersData.success) {
        setStats({
          totalDesigns: productsData.count,
          totalOrders: ordersData.count,
          totalCustomers: usersData.count,
          pendingOrders: pendingData.success ? pendingData.count : 0
        });
      } else {
        console.error('Failed to fetch stats');
        setStats({
          totalDesigns: 0,
          totalOrders: 0,
          totalCustomers: 0,
          pendingOrders: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalDesigns: 0,
        totalOrders: 0,
        totalCustomers: 0,
        pendingOrders: 0
      });
    }
  };

  const mainContainerStyle = {
    minHeight: '100vh',
    paddingTop: '100px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  };

  const heroSectionStyle = {
    backgroundImage: `linear-gradient(rgba(2, 29, 59, 0.8), rgba(2, 29, 59, 0.8)), url(${assets.bg_logo})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '60vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    color: 'white',
  };

  const contentStyle = {
    textAlign: 'center',
    padding: '0 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const welcomeTextStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
  };

  const subtitleStyle = {
    fontSize: '1.2rem',
    marginBottom: '40px',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
    maxWidth: '800px',
    margin: '0 auto 40px auto',
  };

  const statsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    margin: '40px auto',
    maxWidth: '1000px',
    padding: '0 20px',
  };

  const statCardStyle = {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '25px',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  const dashboardSectionStyle = {
    padding: '60px 20px',
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const sectionTitleStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '50px',
    color: '#021d3b',
  };

  const adminCardsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px',
    marginBottom: '40px',
  };

  const adminCardStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: '1px solid #e1e5e9',
  };

  const iconStyle = {
    fontSize: '3rem',
    marginBottom: '20px',
  };

  const quickActionsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '40px',
  };

  const actionButtonStyle = {
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: 'white',
    border: 'none',
    borderRadius: '15px',
    padding: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(216, 180, 106, 0.3)',
  };

  return (
    <div style={mainContainerStyle}>
      <Header />
      
      <div style={heroSectionStyle}>
        <div style={contentStyle}>
          <h1 style={welcomeTextStyle}>
            Admin Dashboard
          </h1>
          <p style={subtitleStyle}>
            Welcome back, {user?.username}! Manage your embroidery design store, track orders, and grow your business.
          </p>

          <div style={statsContainerStyle}>
            <div 
              style={statCardStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#D8B46A' }}>
                {stats.totalDesigns}
              </div>
              <div style={{ fontSize: '1rem', marginTop: '5px' }}>Total Designs</div>
            </div>

            <div 
              style={statCardStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#D8B46A' }}>
                {stats.totalOrders}
              </div>
              <div style={{ fontSize: '1rem', marginTop: '5px' }}>Total Orders</div>
            </div>

            <div 
              style={statCardStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#D8B46A' }}>
                {stats.totalCustomers}
              </div>
              <div style={{ fontSize: '1rem', marginTop: '5px' }}>Total Customers</div>
            </div>

            <div 
              style={statCardStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff6b6b' }}>
                {stats.pendingOrders}
              </div>
              <div style={{ fontSize: '1rem', marginTop: '5px' }}>Pending Orders</div>
            </div>
          </div>
        </div>
      </div>

      <div style={dashboardSectionStyle}>
        <h2 style={sectionTitleStyle}>Management Center</h2>
        
        <div style={adminCardsContainerStyle}>
          <div 
            style={adminCardStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-10px)';
              e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ ...iconStyle, color: '#4CAF50' }}>🎨</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#021d3b' }}>
              Design Management
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '25px' }}>
              Upload, edit, and organize your embroidery design collection
            </p>
            <div style={quickActionsStyle}>
              <button 
                style={actionButtonStyle}
                onClick={() => openModal('addDesign', 'Add New Design')}
              >
                Add New Design
              </button>
              <button 
                style={actionButtonStyle}
                onClick={() => navigate('/admin/categories')}
              >
                Manage Categories
              </button>
            </div>
          </div>

          <div 
            style={adminCardStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-10px)';
              e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ ...iconStyle, color: '#2196F3' }}>📦</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#021d3b' }}>
              Order Management
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '25px' }}>
              Process orders, manage shipping, and track customer purchases
            </p>
            <div style={quickActionsStyle}>
              <button 
                style={actionButtonStyle}
                onClick={() => navigate('/admin/orders')}
              >
                View All Orders
              </button>
              <button 
                style={actionButtonStyle}
                onClick={() => navigate('/admin/pending-orders')}
              >
                Pending Orders
              </button>
            </div>
          </div>

          <div 
            style={adminCardStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-10px)';
              e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ ...iconStyle, color: '#FF9800' }}>👥</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#021d3b' }}>
              Customer Management
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '25px' }}>
              View customer profiles, manage accounts, and provide support
            </p>
            <div style={quickActionsStyle}>
              <button 
                style={actionButtonStyle}
                onClick={() => navigate('/admin/customers')}
              >
                View Customers
              </button>
              <button 
                style={actionButtonStyle}
                onClick={() => navigate('/admin/pending-orders')}
              >
                Pending Support
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        width={modalState.type === 'addDesign' ? '1000px' : '600px'}
      >
        {modalState.type === 'addDesign' && (
          <AddDesignForm
            onClose={closeModal}
            onSubmit={handleAddDesign}
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminHomePage
