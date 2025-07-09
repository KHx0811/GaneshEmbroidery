import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { isAuthenticated, getAuthToken, getUserRole } from '../utils/auth.js';
import { apiRequest } from '../utils/api.js';
import { defaultPlaceholder } from '../utils/placeholder.js';
import assets from '../assets/assets.js';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [user, setUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [newCollections, setNewCollections] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [categories] = useState(['kids', 'simple', 'Boat Neck', 'Bride Desings']);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  useEffect(() => {
    if (isAuthenticated()) {
      const userRole = getUserRole();
      
      if (userRole === 'admin') {
        window.location.href = '/admin';
        return;
      }
      
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
    
    loadNewCollections();
    loadRecentUploads();
    
    const collectionInterval = setInterval(() => {
      loadNewCollections();
    }, 10000);
    
    const recentInterval = setInterval(() => {
      loadRecentUploads();
    }, 15000);
    
    return () => {
      clearInterval(collectionInterval);
      clearInterval(recentInterval);
    };
  }, []);

  const loadNewCollections = async () => {
    try {
      const randomCategories = [...categories].sort(() => 0.5 - Math.random()).slice(0, 2);
      const collectionsData = [];
      
      for (const category of randomCategories) {
        const data = await apiRequest(`/products?category=${category}&limit=8`);
        
        console.log(`Category ${category} response:`, data); // Debug log
        
        if (data.status === 'success' && data.data && data.data.products) {
          collectionsData.push({
            category,
            products: data.data.products.slice(0, 8) // Get 8 products per category
          });
        }
      }
      
      setNewCollections(collectionsData);
    } catch (error) {
      console.error('Error loading new collections:', error);
    }
  };

  const loadRecentUploads = async () => {
    try {
      const data = await apiRequest('/products?limit=8&sort=created_at');
      
      console.log('Recent uploads response:', data); // Debug log
      
      if (data.status === 'success' && data.data && data.data.products) {
        setRecentUploads(data.data.products);
      }
    } catch (error) {
      console.error('Error loading recent uploads:', error);
    }
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const data = await apiRequest(`/products?search=${encodeURIComponent(query)}&limit=5`);
            
      if (data.status === 'success') {
        setSearchResults(data.data.products || []);
        setShowSearchResults(true);
      } else {
        console.error('Search API error:', data);
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const mainContainerStyle = {
    minHeight: '100vh',
    paddingTop: '50px',
  };

  const heroSectionStyle = {
    backgroundImage: `url(${assets.bg_logo})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    color: 'white',
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(2, 29, 59, 0.4), rgba(0, 0, 0, 0.3))',
    zIndex: 1,
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    padding: '0 20px',
    maxWidth: '1000px',
    marginTop: '-80px',
  };

  const sideHeadingStyle = {
    position: 'absolute',
    top: '20%',
    right: '20px',
    fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
    fontWeight: '300',
    color: 'rgba(216, 180, 106, 0.9)',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    zIndex: 3,
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    letterSpacing: '3px',
  };

  const welcomeTextStyle = {
    fontSize: 'clamp(2.8rem, 4vw, 4.5rem)',
    fontWeight: '600',
    marginBottom: '25px',
    textShadow: '2px 2px 8px rgba(0, 0, 0, 0.6)',
    color: '#ffffff',
    fontFamily: "'Playfair Display', serif",
  };

  const subtitleStyle = {
    fontSize: 'clamp(1.1rem, 1.6vw, 1.4rem)',
    marginBottom: '40px',
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.6)',
    maxWidth: '900px',
    margin: '0 auto 40px auto',
    lineHeight: '1.5',
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '300',
  };

  const searchContainerStyle = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '25px',
  };

  const searchBarStyle = {
    height: '60px',
    width: '100%',
    maxWidth: '550px',
    borderRadius: '30px',
    border: '2px solid rgba(216, 180, 106, 0.6)',
    padding: '0 25px',
    backdropFilter: 'blur(12px)',
    background: isSearchHovered ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.15)',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    color: isSearchHovered ? '#333' : '#fff',
    outline: 'none',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
  };

  const searchButtonStyle = {
    padding: '15px 30px',
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: '#333',
    border: 'none',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(216, 180, 106, 0.4)',
  };

  const searchResultsStyle = {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(15px)',
    borderRadius: '15px',
    marginTop: '5px',
    maxHeight: '400px',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    border: '1px solid rgba(216, 180, 106, 0.3)',
  };

  const searchResultItemStyle = {
    padding: '15px 20px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    color: '#333',
    transition: 'all 0.3s ease',
  };



  const handleSearch = () => {
    if (searchValue.trim()) {
      performSearch(searchValue);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (value.trim()) {
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        performSearch(value);
      }, 300);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  return (
    <div style={mainContainerStyle}>
      <Header />
      
      <div style={heroSectionStyle}>
        <div style={overlayStyle}></div>
        
        <div className="side-heading" style={sideHeadingStyle}>
          Premium Embroidery Designs
        </div>
        
        <div style={contentStyle}>
          {user ? (
            <>
              <h1 className="welcome-heading" style={welcomeTextStyle}>
                Welcome, {user.username}!
              </h1>
              <p className="welcome-subtitle" style={subtitleStyle}>
                Ready to explore our premium embroidery collection? Discover exquisite designs crafted with precision and creativity.
              </p>
            </>
          ) : (
            <>
              <h1 className="welcome-heading" style={welcomeTextStyle}>
                Welcome to Ganesh Embroidery
              </h1>
              <p className="welcome-subtitle" style={subtitleStyle}>
                Explore a stunning collection of digital embroidery designs crafted for creativity and precision. 
                Transform your vision into beautiful embroidered masterpieces.
              </p>
            </>
          )}

          <div className="search-container" style={searchContainerStyle}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '550px' }}>
              <input
                style={searchBarStyle}
                type="text"
                placeholder="Search for designs, patterns, or products..."
                value={searchValue}
                onChange={handleSearchInputChange}
                onKeyPress={handleKeyPress}
                onMouseEnter={() => setIsSearchHovered(true)}
                onMouseLeave={() => setIsSearchHovered(false)}
                onFocus={() => setIsSearchHovered(true)}
                onBlur={() => {
                  setIsSearchHovered(false);
                  setTimeout(() => setShowSearchResults(false), 200);
                }}
              />
              
              {showSearchResults && (
                <div style={searchResultsStyle}>
                  {isSearching ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      <div style={{ fontSize: '14px' }}>🔍 Searching...</div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((product, index) => (
                      <div
                        key={product._id}
                        className="search-result-item"
                        style={searchResultItemStyle}
                        onClick={() => {
                          navigate(`/product/${product._id}`);
                          setShowSearchResults(false);
                          setSearchValue('');
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <img 
                            src={product.image} 
                            alt={product.product_name}
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              backgroundColor: '#f0f0f0'
                            }}
                            onError={(e) => {
                              e.target.src = defaultPlaceholder;
                              e.target.style.backgroundColor = '#e0e0e0';
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: '600', 
                              marginBottom: '4px',
                              color: '#2c3e50',
                              fontSize: '14px'
                            }}>
                              {product.product_name}
                            </div>
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#666',
                              textTransform: 'capitalize'
                            }}>
                              {product.category} • ₹{product.price}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      <div style={{ fontSize: '14px', marginBottom: '5px' }}>No designs found with that number</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>Enter design number correctly</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button
              style={searchButtonStyle}
              onClick={handleSearch}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(216, 180, 106, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(216, 180, 106, 0.4)';
              }}
            >
              Search Design
            </button>
          </div>
        </div>
      </div>

      <section style={{
        background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
        padding: '60px 20px',
        minHeight: '50vh'
      }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '15px',
              fontFamily: "'Playfair Display', serif"
            }}>
              ✨ Our Collections
            </h2>
          </div>

          {newCollections.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '50px'
            }}>
              {newCollections.map((collection, index) => {
                const displayProducts = [...collection.products.slice(0, 4)];
                while (displayProducts.length < 4) {
                  displayProducts.push(null); // Add null for empty spots
                }
                
                return (
                  <div key={collection.category} style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '30px',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(216, 180, 106, 0.15)',
                    animation: `slideInFromLeft 0.8s ease-out ${index * 0.3}s both`
                  }}>
                    <h3 style={{
                      fontSize: '1.8rem',
                      fontWeight: '700',
                      color: '#D8B46A',
                      textTransform: 'capitalize',
                      lineHeight: '1.3',
                      margin: '0 0 25px 0',
                      textAlign: 'left',
                      fontFamily: "'Playfair Display', serif"
                    }}>
                      {collection.category} Designs
                    </h3>
                    
                    <div style={{
                      overflow: 'hidden',
                      width: '100%'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '10px',
                        maxWidth: '100%',
                        animation: `${index % 2 === 0 ? 'continuousSlide' : 'continuousSlideReverse'} 12s linear infinite`,
                        width: '200%'
                      }}>
                      {displayProducts.map((product, productIndex) => (
                        product ? (
                          <div
                            key={`${product._id}-1`}
                            className="product-card"
                            style={{
                              background: 'linear-gradient(135deg, #fff, #f8f9fa)',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: '1px solid rgba(0, 0, 0, 0.08)',
                              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s ease',
                              minHeight: '180px',
                              minWidth: '200px',
                              flex: '0 0 200px'
                            }}
                            onClick={() => navigate(`/product/${product._id}`)}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-5px)';
                              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                            }}
                          >
                            <div style={{ 
                              position: 'relative', 
                              width: '100%',
                              height: '100%',
                              overflow: 'hidden' 
                            }}>
                              <img
                                src={product.image}
                                alt={product.product_name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  backgroundColor: '#f0f0f0',
                                  transition: 'transform 0.3s ease'
                                }}
                                onError={(e) => {
                                  e.target.src = defaultPlaceholder;
                                  e.target.style.backgroundColor = '#e0e0e0';
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(216, 180, 106, 0.9)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                ₹{product.price}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            key={`empty-${productIndex}-1`}
                            style={{
                              background: 'rgba(216, 180, 106, 0.1)',
                              borderRadius: '12px',
                              border: '2px dashed rgba(216, 180, 106, 0.3)',
                              minHeight: '180px',
                              minWidth: '200px',
                              flex: '0 0 200px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'rgba(216, 180, 106, 0.5)',
                              fontSize: '12px',
                              fontStyle: 'italic'
                            }}
                          >
                            No design yet
                          </div>
                        )
                      ))}
                      {/* Duplicate set for seamless loop */}
                      {displayProducts.map((product, productIndex) => (
                        product ? (
                          <div
                            key={`${product._id}-2`}
                            className="product-card"
                            style={{
                              background: 'linear-gradient(135deg, #fff, #f8f9fa)',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: '1px solid rgba(0, 0, 0, 0.08)',
                              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s ease',
                              minHeight: '180px',
                              minWidth: '200px',
                              flex: '0 0 200px'
                            }}
                            onClick={() => navigate(`/product/${product._id}`)}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-5px)';
                              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                            }}
                          >
                            <div style={{ 
                              position: 'relative', 
                              width: '100%',
                              height: '100%',
                              overflow: 'hidden' 
                            }}>
                              <img
                                src={product.image}
                                alt={product.product_name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  backgroundColor: '#f0f0f0',
                                  transition: 'transform 0.3s ease'
                                }}
                                onError={(e) => {
                                  e.target.src = defaultPlaceholder;
                                  e.target.style.backgroundColor = '#e0e0e0';
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(216, 180, 106, 0.9)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                ₹{product.price}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            key={`empty-${productIndex}-2`}
                            style={{
                              background: 'rgba(216, 180, 106, 0.1)',
                              borderRadius: '12px',
                              border: '2px dashed rgba(216, 180, 106, 0.3)',
                              minHeight: '180px',
                              minWidth: '200px',
                              flex: '0 0 200px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'rgba(216, 180, 106, 0.5)',
                              fontSize: '12px',
                              fontStyle: 'italic'
                            }}
                          >
                            No design yet
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                  </div>
                );
              })}
            </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px'
              }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{
                    background: '#f0f0f0',
                    borderRadius: '10px',
                    height: '120px'
                  }} className="shimmer" />
                ))}
              </div>
            )}
          </div>
        </section>

        <section style={{
          background: 'linear-gradient(135deg, #2c3e50, #34495e)',
          padding: '60px 0',
          color: 'white'
        }}>
          <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: '600',
                marginBottom: '15px',
                color: '#D8B46A',
                fontFamily: "'Playfair Display', serif"
              }}>
                🔥 New Arrivals
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '30px',
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              {recentUploads.length > 0 ? recentUploads.slice(0, 6).map((product, index) => (
                <div
                  key={product._id}
                  className="product-card"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                    transition: 'all 0.3s ease',
                    minHeight: '200px'
                  }}
                  onClick={() => navigate(`/product/${product._id}`)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-10px)';
                    e.target.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ position: 'relative', paddingBottom: '75%', overflow: 'hidden' }}>
                    <img
                      src={product.image}
                      alt={product.product_name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        backgroundColor: '#444',
                        transition: 'transform 0.3s ease'
                      }}
                      onError={(e) => {
                        e.target.src = defaultPlaceholder;
                        e.target.style.backgroundColor = '#555';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(46, 204, 113, 0.9)',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: '600',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}>
                      NEW
                    </div>
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(216, 180, 106, 0.9)',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '15px',
                      fontSize: '13px',
                      fontWeight: '600',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}>
                      ₹{product.price}
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
                      padding: '20px 15px 15px',
                      color: 'white'
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: '600',
                        textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {product.product_name}
                      </h3>
                    </div>
                  </div>
                </div>
              )) : (
                [...Array(6)].map((_, i) => (
                  <div key={i} style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    minHeight: '300px'
                  }} className="shimmer" />
                ))
              )}
            </div>
          </div>
        </section>
      
      <Footer />
    </div>
  );
};

export default HomePage
