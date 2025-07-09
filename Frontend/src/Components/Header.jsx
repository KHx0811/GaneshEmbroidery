import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getAuthToken, getUserRole } from '../utils/auth.js';


const Header = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (isAuthenticated()) {
      const token = getAuthToken();
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          username: payload.username || payload.user || 'User',
          email: payload.email || '',
          role: payload.role || 'user'
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const url = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${url}/products/categories`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setCategories(data.data.categories || []);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('[data-dropdown-container]')) {
        setShowDropdown(false);
      }
      if (showCategories && !event.target.closest('[data-categories-container]')) {
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, showCategories]);

  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    height: '100px',
    backdropFilter: 'blur(6px)',
    background: '#021D3B',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  };

  const logoStyle = {
    cursor: 'pointer',
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: isHovered ? '#ffffff' : '#D8B46A',
    transition: 'color 0.4s ease, text-shadow 0.3s ease',
  };

  const authButtonStyle = {
    padding: '10px 25px',
    background: isBtnHovered
      ? 'linear-gradient(135deg,rgb(0, 43, 92),rgb(0, 195, 255))'
      : 'white',
    color: isBtnHovered ? 'white' : '#1a1a1a',
    borderRadius: '30px',
    fontWeight: 'bold',
    fontSize: '18px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: isBtnHovered
      ? '0 0 15px rgba(0, 45, 66, 0.7)'
      : '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
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
    padding: '6px 6px',
    background: 'rgba(216, 180, 106, 0.1)',
    border: '2px solid #D8B46A',
    borderRadius: '25px',
    color: '#D8B46A',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    padding: '10px 0',
    minWidth: '200px',
    zIndex: 1001,
  };

  const categoriesDropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    padding: '10px 0',
    minWidth: '180px',
    zIndex: 1001,
  };

  const navItemStyle = {
    color: '#D8B46A',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: '500',
    padding: '4px 8px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
  };

  const dropdownItemStyle = {
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    fontSize: '14px',
    color: '#333',
  };

  const desktopNavStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  };

  const handleLogoClick = () => {
    if (isAuthenticated()) {
      const userRole = getUserRole();
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const handleAuthClick = () => {
    if (user) {
      setShowDropdown(!showDropdown);
    } else {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  const handleProfile = () => {
    setShowDropdown(false);
    const userRole = getUserRole();
    if (userRole === 'admin') {
      navigate('/admin');
    } else {
      console.log('Navigate to profile');
    }
  };

  const handleCategoriesClick = () => {
    setShowCategories(!showCategories);
  };

  const handleCategorySelect = (category) => {
    setShowCategories(false);
    navigate(`/categories?category=${encodeURIComponent(category)}`);
  };

  const handleMyOrdersClick = () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    navigate('/my-orders');
  };

  const handleCartClick = () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    navigate('/cart');
  };

  const handleHowToBuyClick = () => {
    navigate('/how-to-buy');
  };

  return (
    <>
      <div style={navbarStyle}>
        <h1
          style={logoStyle}
          onClick={handleLogoClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Ganesh Embroidery
        </h1>

        <div style={desktopNavStyle}>
          <span
            style={navItemStyle}
            onClick={handleHowToBuyClick}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(216, 180, 106, 0.1)';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#D8B46A';
            }}
          >
            How to Buy
          </span>

          <div style={{ position: 'relative' }} data-categories-container>
            <span
              style={navItemStyle}
              onClick={handleCategoriesClick}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(216, 180, 106, 0.1)';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#D8B46A';
              }}
            >
              Categories
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ marginLeft: '5px' }}>
                <path d="M6 8L2 4h8L6 8z"/>
              </svg>
            </span>
            
            {showCategories && (
              <div style={categoriesDropdownStyle} data-categories-container>
                {categories.map((category) => (
                  <div
                    key={category}
                    style={dropdownItemStyle}
                    onClick={() => handleCategorySelect(category)}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                  >
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>

          <span
            style={navItemStyle}
            onClick={handleMyOrdersClick}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(216, 180, 106, 0.1)';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#D8B46A';
            }}
          >
            My Orders
          </span>

          <span
            style={{...navItemStyle, display: 'flex', alignItems: 'center', gap: '4px'}}
            onClick={handleCartClick}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(216, 180, 106, 0.1)';
              e.target.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#D8B46A';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            Cart
          </span>

          {user ? (
            <div style={profileContainerStyle} data-dropdown-container>
              <button
                style={profileButtonStyle}
                onClick={handleAuthClick}
                onMouseEnter={() => setIsBtnHovered(true)}
                onMouseLeave={() => setIsBtnHovered(false)}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
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
                <div style={dropdownStyle} data-dropdown-container>
                  {user?.role === 'admin' && (
                    <div style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      color: '#D8B46A',
                      fontWeight: 'bold',
                      borderBottom: '1px solid #eee',
                      textTransform: 'uppercase'
                    }}>
                      Admin Panel
                    </div>
                  )}
                  <div
                    style={dropdownItemStyle}
                    onClick={handleProfile}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                  >
                    {user?.role === 'admin' ? 'Dashboard' : 'View Profile'}
                  </div>
                  <div
                    style={dropdownItemStyle}
                    onClick={handleLogout}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              style={authButtonStyle}
              onClick={handleAuthClick}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
