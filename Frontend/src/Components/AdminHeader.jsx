import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getAuthToken, getUserRole } from '../utils/auth.js';
import { Settings, FileText, Users, Package, Mail, BarChart3, Edit, Home } from 'lucide-react';

const AdminHeader = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManageDropdown, setShowManageDropdown] = useState(false);
  const [showContentDropdown, setShowContentDropdown] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
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
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('[data-dropdown-container]')) {
        setShowDropdown(false);
      }
      if (showManageDropdown && !event.target.closest('[data-manage-container]')) {
        setShowManageDropdown(false);
      }
      if (showContentDropdown && !event.target.closest('[data-content-container]')) {
        setShowContentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, showManageDropdown, showContentDropdown]);

  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    height: '100px',
    backdropFilter: 'blur(6px)',
    background: 'linear-gradient(135deg, #021D3B 0%, #0f2a4a 100%)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottom: '2px solid #D8B46A',
  };

  const logoStyle = {
    cursor: 'pointer',
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: isHovered ? '#ffffff' : '#D8B46A',
    transition: 'color 0.4s ease, text-shadow 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const adminBadgeStyle = {
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: '#021D3B',
    padding: '4px 12px',
    borderRadius: '15px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    boxShadow: '0 2px 8px rgba(216, 180, 106, 0.3)',
  };

  const profileContainerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const profileButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    background: 'rgba(216, 180, 106, 0.15)',
    border: '2px solid #D8B46A',
    borderRadius: '25px',
    color: '#D8B46A',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.2)',
    padding: '12px 0',
    minWidth: '220px',
    zIndex: 1001,
    border: '1px solid #e1e5e9',
    opacity: 1,
    transform: 'translateY(0px) scaleY(1)',
    transformOrigin: 'top center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'dropdownSlideDown 0.3s ease-out forwards',
  };

  const profileDropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.2)',
    padding: '12px 0',
    minWidth: '220px',
    zIndex: 1001,
    border: '1px solid #e1e5e9',
    opacity: 1,
    transform: 'translateY(0px) scaleY(1)',
    transformOrigin: 'top center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'dropdownSlideDown 0.3s ease-out forwards',
  };

  const navItemStyle = {
    color: '#D8B46A',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const dropdownItemStyle = {
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderRadius: '8px',
    margin: '2px 8px',
  };

  const desktopNavStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  };

  const handleLogoClick = () => {
    navigate('/admin');
  };

  const handleAuthClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  const handleManageDropdown = () => {
    setShowManageDropdown(!showManageDropdown);
  };

  const handleContentDropdown = () => {
    setShowContentDropdown(!showContentDropdown);
  };

  const navHoverEffect = (e, enter = true) => {
    if (enter) {
      e.target.style.background = 'rgba(216, 180, 106, 0.2)';
      e.target.style.color = '#ffffff';
      e.target.style.transform = 'translateY(-1px)';
    } else {
      e.target.style.background = 'transparent';
      e.target.style.color = '#D8B46A';
      e.target.style.transform = 'translateY(0)';
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes dropdownSlideDown {
            0% {
              opacity: 0;
              transform: translateY(-10px) scaleY(0.8);
            }
            100% {
              opacity: 1;
              transform: translateY(0px) scaleY(1);
            }
          }
        `}
      </style>
      <div style={navbarStyle}>
        <div
          style={logoStyle}
          onClick={handleLogoClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Settings size={24} />
          <span>Admin Panel</span>
          <span style={adminBadgeStyle}>Administrator</span>
        </div>

        <div style={desktopNavStyle}>

          <div 
            style={{ position: 'relative' }} 
            data-manage-container
            onMouseEnter={() => setShowManageDropdown(true)}
            onMouseLeave={() => setShowManageDropdown(false)}
          >
            <span
              style={navItemStyle}
              onClick={handleManageDropdown}
              onMouseEnter={(e) => navHoverEffect(e, true)}
              onMouseLeave={(e) => navHoverEffect(e, false)}
            >
              <Package size={16} />
              Manage
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ marginLeft: '5px' }}>
                <path d="M6 8L2 4h8L6 8z"/>
              </svg>
            </span>
            
            {showManageDropdown && (
              <div style={dropdownStyle} data-manage-container>
                <div
                  style={dropdownItemStyle}
                  onClick={() => {
                    setShowManageDropdown(false);
                    navigate('/admin/categories');
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa', e.target.style.transform = 'translateX(4px)')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.transform = 'translateX(0px)')}
                >
                  <Package size={16} />
                  Products & Categories
                </div>
                <div
                  style={dropdownItemStyle}
                  onClick={() => {
                    setShowManageDropdown(false);
                    navigate('/admin/orders');
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa', e.target.style.transform = 'translateX(4px)')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.transform = 'translateX(0px)')}
                >
                  <FileText size={16} />
                  All Orders
                </div>
                <div
                  style={dropdownItemStyle}
                  onClick={() => {
                    setShowManageDropdown(false);
                    navigate('/admin/pending-orders');
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa', e.target.style.transform = 'translateX(4px)')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.transform = 'translateX(0px)')}
                >
                  <Mail size={16} />
                  Pending Orders
                </div>
                <div
                  style={dropdownItemStyle}
                  onClick={() => {
                    setShowManageDropdown(false);
                    navigate('/admin/customers');
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa', e.target.style.transform = 'translateX(4px)')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.transform = 'translateX(0px)')}
                >
                  <Users size={16} />
                  Customers
                </div>
              </div>
            )}
          </div>

          <div 
            style={{ position: 'relative' }} 
            data-content-container
            onMouseEnter={() => setShowContentDropdown(true)}
            onMouseLeave={() => setShowContentDropdown(false)}
          >
            <span
              style={navItemStyle}
              onClick={handleContentDropdown}
              onMouseEnter={(e) => navHoverEffect(e, true)}
              onMouseLeave={(e) => navHoverEffect(e, false)}
            >
              <Edit size={16} />
              Site Content
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ marginLeft: '5px' }}>
                <path d="M6 8L2 4h8L6 8z"/>
              </svg>
            </span>
            
            {showContentDropdown && (
              <div style={dropdownStyle} data-content-container>
                <div
                  style={dropdownItemStyle}
                  onClick={() => {
                    setShowContentDropdown(false);
                    navigate('/admin/edit-how-to-buy');
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa', e.target.style.transform = 'translateX(4px)')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.transform = 'translateX(0px)')}
                >
                  <FileText size={16} />
                  Edit How to Buy
                </div>
                <div
                  style={dropdownItemStyle}
                  onClick={() => {
                    setShowContentDropdown(false);
                    navigate('/admin/edit-privacy-policy');
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa', e.target.style.transform = 'translateX(4px)')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.transform = 'translateX(0px)')}
                >
                  <FileText size={16} />
                  Edit Privacy Policy
                </div>
                <div
                  style={dropdownItemStyle}
                  onClick={() => {
                    setShowContentDropdown(false);
                    navigate('/admin/edit-terms');
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa', e.target.style.transform = 'translateX(4px)')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.transform = 'translateX(0px)')}
                >
                  <FileText size={16} />
                  Edit Terms & Conditions
                </div>
                <div
                  style={dropdownItemStyle}
                  onClick={() => {
                    setShowContentDropdown(false);
                    navigate('/admin/edit-faq');
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa', e.target.style.transform = 'translateX(4px)')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.transform = 'translateX(0px)')}
                >
                  <FileText size={16} />
                  Edit FAQ
                </div>
              </div>
            )}
          </div>

          <span
            style={navItemStyle}
            onClick={() => navigate('/')}
            onMouseEnter={(e) => navHoverEffect(e, true)}
            onMouseLeave={(e) => navHoverEffect(e, false)}
          >
            <Home size={16} />
            View Site
          </span>

          {user && (
            <div 
              style={profileContainerStyle} 
              data-dropdown-container
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <button
                style={profileButtonStyle}
                onClick={handleAuthClick}
                onMouseEnter={() => setIsBtnHovered(true)}
                onMouseLeave={() => setIsBtnHovered(false)}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#021D3B',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span>{user.username}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8L2 4h8L6 8z"/>
                </svg>
              </button>
              
              {showDropdown && (
                <div style={profileDropdownStyle} data-dropdown-container>
                  <div style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    color: '#D8B46A',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #eee',
                    textTransform: 'uppercase'
                  }}>
                    Admin Account
                  </div>
                  <div
                    style={dropdownItemStyle}
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/admin');
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa', e.target.style.transform = 'translateX(4px)')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.transform = 'translateX(0px)')}
                  >
                    <Settings size={16} />
                    Admin Dashboard
                  </div>
                  <div
                    style={dropdownItemStyle}
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/admin/settings');
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa', e.target.style.transform = 'translateX(4px)')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent', e.target.style.transform = 'translateX(0px)')}
                  >
                    <Settings size={16} />
                    Settings
                  </div>
                  <div style={{
                    height: '1px',
                    background: '#eee',
                    margin: '8px 0'
                  }} />
                  <div
                    style={dropdownItemStyle}
                    onClick={handleLogout}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#ffebee')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#f44336">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                    <span style={{ color: '#f44336' }}>Logout</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminHeader;
