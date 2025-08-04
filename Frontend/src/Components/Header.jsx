import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getAuthToken, getUserRole } from '../utils/auth.js';
import { CircleUserRound, UserPen, Menu, X } from 'lucide-react';
import "../styles/Header.css"; // Assuming you have a CSS file for styles

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      if (isMobileMenuOpen && !event.target.closest('[data-mobile-menu]')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, isMobileMenuOpen]);

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

  const handleHowToBuyClick = () => {
    navigate('/how-to-buy');
    setIsMobileMenuOpen(false);
  };

  const handleCategoriesClick = () => {
    navigate('/categories');
    setIsMobileMenuOpen(false);
  };

  const handleMyOrdersClick = () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    navigate('/my-orders');
    setIsMobileMenuOpen(false);
  };

  const handleCartClick = () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    navigate('/cart');
    setIsMobileMenuOpen(false);
  };

  const handleMobileAuthClick = () => {
    if (user) {
      handleLogout();
    } else {
      navigate('/login');
    }
    setIsMobileMenuOpen(false);
  };

  const handleMobileProfileClick = () => {
    const userRole = getUserRole();
    if (userRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/profile');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="navbar">
      {/* Mobile Menu Button - Only visible on tablet and mobile */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        data-mobile-menu
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <h1
        className="logo"
        onClick={handleLogoClick}
      >
        Ganesh Embroidery
      </h1>

      {/* Desktop Navigation - Only visible on desktop */}
      <div className="desktop-nav" ref={navContainerRef}>
        <div 
          className="sliding-background"
          style={{
            width: currentPosition.width,
            left: currentPosition.left,
            opacity: hoveredItem !== null ? 1 : 0,
          }}
        />
        
        <span
          className={`nav-item ${hoveredItem === 0 ? 'active' : ''}`}
          onClick={handleHowToBuyClick}
          onMouseEnter={() => setHoveredItem(0)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          How to Buy
        </span>

        <span
          className={`nav-item ${hoveredItem === 1 ? 'active' : ''}`}
          onClick={handleCategoriesClick}
          onMouseEnter={() => setHoveredItem(1)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          Categories
        </span>

        <span
          className={`nav-item ${hoveredItem === 2 ? 'active' : ''}`}
          onClick={handleMyOrdersClick}
          onMouseEnter={() => setHoveredItem(2)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          My Orders
        </span>

        <span
          className={`nav-item cart ${hoveredItem === 3 ? 'active' : ''}`}
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
            className="profile-container" 
            data-dropdown-container
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button
              className="profile-button"
              onClick={handleAuthClick}
            >
              <div className="profile-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span>{user.username}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 8L2 4h8L6 8z"/>
              </svg>
            </button>
            
            {showDropdown && (
              <div className="dropdown" data-dropdown-container>
                {user?.role === 'admin' && (
                  <div className="dropdown-header">
                    Admin Panel
                  </div>
                )}
                <div className="dropdown-item" onClick={handleProfile}>
                  <UserPen size={18} style={{color:'#2196f3'}} />
                  {user?.role === 'admin' ? 'Dashboard' : 'View Profile'}
                </div>
                <div className="dropdown-item logout" onClick={handleLogout}>
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
            className="auth-button"
            onClick={handleAuthClick}
          >
            Login
          </button>
        )}
      </div>

      {/* Tablet Login Button - Only visible on tablet */}
      <div className="tablet-auth">
        {user ? (
          <button
            className="profile-button tablet-profile-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            data-dropdown-container
          >
            <div className="profile-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </button>
        ) : (
          <button
            className="auth-button tablet-auth-btn"
            onClick={handleAuthClick}
          >
            Login
          </button>
        )}
        
        {user && showDropdown && (
          <div className="dropdown tablet-dropdown" data-dropdown-container>
            {user?.role === 'admin' && (
              <div className="dropdown-header">
                Admin Panel
              </div>
            )}
            <div className="dropdown-item" onClick={handleProfile}>
              <UserPen size={18} style={{color:'#2196f3'}} />
              {user?.role === 'admin' ? 'Dashboard' : 'View Profile'}
            </div>
            <div className="dropdown-item logout" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#f44336' }}>
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Logout
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="mobile-menu" data-mobile-menu>
            <div className="mobile-menu-item" onClick={handleHowToBuyClick}>
              How to Buy
            </div>
            <div className="mobile-menu-item" onClick={handleCategoriesClick}>
              Categories
            </div>
            <div className="mobile-menu-item" onClick={handleMyOrdersClick}>
              My Orders
            </div>
            <div className="mobile-menu-item" onClick={handleCartClick}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              Cart
            </div>
            
            {/* Only show auth options on mobile (not on tablet where login button is visible) */}
            <div className="mobile-only-auth">
              <div className="mobile-menu-divider" />
              
              {user ? (
                <>
                  <div className="mobile-menu-item" onClick={handleMobileProfileClick}>
                    <UserPen size={16} style={{ marginRight: '8px' }} />
                    {user?.role === 'admin' ? 'Dashboard' : 'Profile'}
                  </div>
                  <div className="mobile-menu-item logout" onClick={handleMobileAuthClick}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                    Logout
                  </div>
                </>
              ) : (
                <div className="mobile-menu-item" onClick={handleMobileAuthClick}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V8.5C15 9.4 14.4 10 13.5 10H10.5C9.6 10 9 9.4 9 8.5V7.5L3 7V9L9 9.5V19H11V14H13V19H15V9.5L21 9Z"/>
                  </svg>
                  Login
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
