import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getAuthToken, getUserRole } from '../utils/auth.js';
import { CircleUserRound, UserPen } from 'lucide-react';


const Header = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navContainerRef = useRef(null);

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
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('[data-dropdown-container]')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    height: '80px',
    backdropFilter: 'blur(6px)',
    background: '#021D3B',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
    borderRadius: '12px',
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.2)',
    padding: '12px 0',
    minWidth: '180px',
    zIndex: 1001,
    opacity: 1,
    transform: 'translateY(0px) scaleY(1)',
    transformOrigin: 'top center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'dropdownSlideDown 0.3s ease-out forwards',
  };

  const desktopNavStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    position: 'relative',
  };

  const navItemStyle = {
    color: '#D8B46A',
    textDecoration: 'none',
    fontSize: '18px',
    fontWeight: '500',
    padding: '18px 12px',
    transition: 'color 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 2,
  };

  const dropdownItemStyle = {
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    color: '#333',
    borderRadius: '8px',
    margin: '2px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const getItemPosition = (itemIndex) => {
    if (!navContainerRef.current || hoveredItem === null) return { width: 0, left: 0 };
    
    const navItems = navContainerRef.current.children;
    const targetItem = navItems[itemIndex + 1];
    
    if (!targetItem) return { width: 0, left: 0 };
    
    return {
      width: targetItem.offsetWidth,
      left: targetItem.offsetLeft,
    };
  };

  const currentPosition = getItemPosition(hoveredItem);

  const slidingBackgroundStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    height: '55px',
    background: 'linear-gradient(135deg, rgba(202, 210, 233, 0.2), rgba(230, 199, 122, 0.3))',
    borderRadius: '12px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1,
    opacity: hoveredItem !== null ? 1 : 0,
    boxShadow: hoveredItem !== null ? '0 4px 15px rgba(216, 180, 106, 0.3)' : 'none',
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
      navigate('/profile');
    }
  };

  const handleCategoriesClick = () => {
    navigate('/categories');
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
        <h1
          style={logoStyle}
          onClick={handleLogoClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Ganesh Embroidery
        </h1>

        <div style={desktopNavStyle} ref={navContainerRef}>
          <div 
            style={{
              ...slidingBackgroundStyle,
              width: currentPosition.width,
              left: currentPosition.left,
            }}
          />
          
          <span
            style={{
              ...navItemStyle,
              color: hoveredItem === 0 ? '#ffffff' : '#D8B46A',
            }}
            onClick={handleHowToBuyClick}
            onMouseEnter={() => setHoveredItem(0)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            How to Buy
          </span>

          <span
            style={{
              ...navItemStyle,
              color: hoveredItem === 1 ? '#ffffff' : '#D8B46A',
            }}
            onClick={handleCategoriesClick}
            onMouseEnter={() => setHoveredItem(1)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            Categories
          </span>

          <span
            style={{
              ...navItemStyle,
              color: hoveredItem === 2 ? '#ffffff' : '#D8B46A',
            }}
            onClick={handleMyOrdersClick}
            onMouseEnter={() => setHoveredItem(2)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            My Orders
          </span>

          <span
            style={{
              ...navItemStyle,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: hoveredItem === 3 ? '#ffffff' : '#D8B46A',
            }}
            onClick={handleCartClick}
            onMouseEnter={() => setHoveredItem(3)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            Cart
          </span>

          {user ? (
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
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#e3f2fd';
                      e.target.style.transform = 'translateX(4px)';
                      e.target.style.borderLeft = '4px solid #2196f3';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.transform = 'translateX(0px)';
                      e.target.style.borderLeft = 'none';
                    }}
                  >
                    <UserPen size={18} style={{color:'#2196f3'}} />
                    {user?.role === 'admin' ? 'Dashboard' : 'View Profile'}
                  </div>
                  <div
                    style={dropdownItemStyle}
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#ffebee';
                      e.target.style.transform = 'translateX(4px)';
                      e.target.style.borderLeft = '4px solid #f44336';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.transform = 'translateX(0px)';
                      e.target.style.borderLeft = 'none';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#f44336' }}>
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
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
