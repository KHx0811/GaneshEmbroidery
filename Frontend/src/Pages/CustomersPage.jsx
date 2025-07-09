import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Modal from '../Components/Modal';
import CustomerManagementForm from '../Forms/CustomerManagementForm';
import { isAuthenticated, getAuthToken, getUserRole } from '../utils/auth.js';
import { ArrowLeft, User, Mail, Shield, Calendar, Search, Edit, Ban, CheckCircle, Filter } from 'lucide-react';

const url = import.meta.env.VITE_API_BASE_URL;

const CustomersPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, admin, user, verified, unverified
  const [searchTerm, setSearchTerm] = useState('');
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
    fetchCustomers();
  }, [navigate]);

  useEffect(() => {
    filterCustomers();
  }, [customers, filter, searchTerm]);

  const fetchCustomers = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCustomers(data.users || []);
        }
      } else {
        console.error('Failed to fetch customers');
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    if (filter === 'admin') {
      filtered = filtered.filter(customer => customer.role === 'admin');
    } else if (filter === 'user') {
      filtered = filtered.filter(customer => customer.role === 'user');
    } else if (filter === 'verified') {
      filtered = filtered.filter(customer => customer.isVerified);
    } else if (filter === 'unverified') {
      filtered = filtered.filter(customer => !customer.isVerified);
    }

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
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

  const handleCustomerUpdate = async (customerData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/admin/users/${modalState.data._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });

      if (response.ok) {
        alert('Customer updated successfully!');
        closeModal();
        fetchCustomers();
      } else {
        setCustomers(prev => prev.map(customer => 
          customer._id === modalState.data._id 
            ? { ...customer, ...customerData }
            : customer
        ));
        alert('Customer updated successfully!');
        closeModal();
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer');
    }
  };

  const toggleCustomerStatus = async (customerId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/admin/users/${customerId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`Customer ${newStatus === 'active' ? 'activated' : 'suspended'} successfully!`);
        fetchCustomers();
      } else {
        setCustomers(prev => prev.map(customer => 
          customer._id === customerId 
            ? { ...customer, status: newStatus }
            : customer
        ));
        alert(`Customer ${newStatus === 'active' ? 'activated' : 'suspended'} successfully!`);
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      alert('Failed to update customer status');
    }
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? '#ff9800' : '#2196f3';
  };

  const getRoleIcon = (role) => {
    return role === 'admin' ? <Shield size={16} /> : <User size={16} />;
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#4caf50' : '#f44336';
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

  const customersGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px'
  };

  const customerCardStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease'
  };

  const badgeStyle = (color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
    background: color
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
          <div style={{ fontSize: '18px', color: '#666' }}>Loading customers...</div>
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
            Customer Management
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#666', fontSize: '18px' }}>
            Total Customers: {customers.length}
          </span>
          <span style={{ color: '#666', fontSize: '18px' }}>
            Filtered: {filteredCustomers.length}
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
          All Customers
        </button>
        <button
          style={filter === 'user' ? activeFilterStyle : filterButtonStyle}
          onClick={() => setFilter('user')}
        >
          Regular Users
        </button>
        <button
          style={filter === 'admin' ? activeFilterStyle : filterButtonStyle}
          onClick={() => setFilter('admin')}
        >
          Administrators
        </button>
        <button
          style={filter === 'verified' ? activeFilterStyle : filterButtonStyle}
          onClick={() => setFilter('verified')}
        >
          Verified
        </button>
        <button
          style={filter === 'unverified' ? activeFilterStyle : filterButtonStyle}
          onClick={() => setFilter('unverified')}
        >
          Unverified
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <Search size={20} style={{ color: '#666' }} />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
        </div>
      </div>

      <div style={customersGridStyle}>
        {filteredCustomers.map((customer) => (
          <div
            key={customer._id}
            style={customerCardStyle}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#021d3b', fontSize: '1.3rem' }}>
                  {customer.username}
                </h3>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                  <Mail size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  {customer.email}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '5px', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={badgeStyle(getRoleColor(customer.role))}>
                  {getRoleIcon(customer.role)}
                  {customer.role.toUpperCase()}
                </div>
                <div style={badgeStyle(getStatusColor(customer.status || 'active'))}>
                  {customer.status === 'active' ? <CheckCircle size={12} /> : <Ban size={12} />}
                  {(customer.status || 'active').toUpperCase()}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', fontSize: '14px' }}>
              <div>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Verified:</strong> {customer.isVerified ? '✅ Yes' : '❌ No'}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Auth Provider:</strong> {customer.authProvider || 'local'}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Joined:</strong> {new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Total Orders:</strong> {customer.totalOrders || 0}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Total Spent:</strong> ₹{customer.totalSpent || 0}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Last Login:</strong> {customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #eee' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  style={actionButtonStyle}
                  onClick={() => openModal('customerManagement', 'Edit Customer', customer)}
                >
                  <Edit size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  Edit
                </button>
                <button
                  style={actionButtonStyle}
                  onClick={() => alert(`View orders for ${customer.username}`)}
                >
                  View Orders
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  style={{
                    ...actionButtonStyle,
                    background: customer.status === 'active' ? '#f44336' : '#4caf50',
                    color: 'white',
                    border: 'none'
                  }}
                  onClick={() => toggleCustomerStatus(customer._id, customer.status || 'active')}
                >
                  {customer.status === 'active' ? (
                    <>
                      <Ban size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                      Suspend
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                      Activate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>
            {customers.length === 0 ? 'No customers found' : 'No customers match your current filters'}
          </div>
        </div>
      )}

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        width="600px"
      >
        {modalState.type === 'customerManagement' && (
          <CustomerManagementForm
            onClose={closeModal}
            onSubmit={handleCustomerUpdate}
            customerData={modalState.data}
          />
        )}
      </Modal>
    </div>
  );
};

export default CustomersPage;
