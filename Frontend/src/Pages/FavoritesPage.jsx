import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import { isAuthenticated, getAuthToken } from '../utils/auth.js';
import { ArrowLeft, ShoppingCart, Trash2, Eye, Heart } from 'lucide-react';

const url = import.meta.env.VITE_API_BASE_URL;

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [navigate]);

  const fetchWishlist = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/user/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWishlistItems(data.wishlistItems || []);
        }
      } else {
        console.error('Failed to fetch wishlist');
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    if (!confirm('Remove this item from your favorites?')) return;
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/user/wishlist/${wishlistItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Removed from favorites!');
        fetchWishlist(); // Refresh the list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to remove from favorites. Please try again.');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove from favorites. Please try again.');
    }
  };

  const addToCart = async (product, machineType) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/user/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product.productId,
          machineType: machineType,
          quantity: 1
        })
      });

      if (response.ok) {
        alert('Added to cart successfully!');
      } else {
        alert('Failed to add to cart. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const getMachineTypeDisplayName = (key) => {
    const machineTypeMap = {
      'DST_BERNINA_14x8': 'DST-BERNINA-14x8',
      'DST_BROTHER_V3SE_12x8': 'DST-BROTHER-V3SE-12x8',
      'DST_FULL': 'DST-FULL',
      'JEF_USHA_450_11x8': 'JEF-USHA-450-11x8',
      'JEF_USHA_550_14x8': 'JEF-USHA-550-14x8',
      'PES_BROTHER_BP3600_14x9_5': 'PES-BROTHER-BP3600-14x9.5'
    };
    return machineTypeMap[key] || key;
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

  const wishlistGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  };

  const wishlistItemStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease'
  };

  const productImageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '15px'
  };

  if (loading) {
    return (
      <div style={mainContainerStyle}>
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading your favorites...</div>
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
            <Heart size={30} style={{ marginRight: '10px', color: '#e74c3c' }} />
            My Favorites
          </h1>
        </div>
        <div style={{ color: '#666', fontSize: '18px' }}>
          {wishlistItems.length} favorite{wishlistItems.length !== 1 ? 's' : ''}
        </div>
      </div>

      {wishlistItems.length > 0 ? (
        <div style={wishlistGridStyle}>
          {wishlistItems.map((item) => (
            <div
              key={item._id}
              style={wishlistItemStyle}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <img
                src={item.image}
                alt={item.productName}
                style={productImageStyle}
              />
              <h3 style={{ margin: '0 0 10px 0', color: '#021d3b', fontSize: '1.2rem' }}>
                {item.productName}
              </h3>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                <strong>Category:</strong> {item.category}
              </p>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                <strong>Price:</strong> ₹{item.price}
              </p>
              <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                <strong>Added:</strong> {new Date(item.addedAt).toLocaleDateString()}
              </p>

              {/* Available Machine Types */}
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', fontWeight: 'bold' }}>
                  Available Formats:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {item.availableMachineTypes.map((machineType) => (
                    <div 
                      key={machineType}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        fontSize: '12px',
                        border: '1px solid #e9ecef',
                        marginBottom: '5px',
                        minWidth: '120px'
                      }}
                    >
                      <span style={{ color: '#495057', fontWeight: '500' }}>
                        {getMachineTypeDisplayName(machineType)}
                      </span>
                      <button
                        style={{
                          background: 'linear-gradient(135deg, #4caf50, #45a049)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => addToCart(item, getMachineTypeDisplayName(machineType))}
                        title={`Add ${getMachineTypeDisplayName(machineType)} to cart`}
                      >
                        <ShoppingCart size={10} />
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <button
                  style={{
                    background: 'none',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: '#666',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  onClick={() => {
                    window.open(`${url}/products/${item.productId}`, '_blank');
                  }}
                  title="View Product Details"
                >
                  <Eye size={16} />
                  View Details
                </button>
                <button
                  style={{
                    background: 'none',
                    border: '1px solid #e74c3c',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: '#e74c3c',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  onClick={() => removeFromWishlist(item._id)}
                  title="Remove from Favorites"
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e74c3c';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none';
                    e.target.style.color = '#e74c3c';
                  }}
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Heart size={80} style={{ color: '#ddd', marginBottom: '20px' }} />
          <div style={{ fontSize: '24px', color: '#666', marginBottom: '10px' }}>
            No favorites yet
          </div>
          <div style={{ fontSize: '16px', color: '#999', marginBottom: '30px' }}>
            Start browsing and add designs to your favorites by clicking the heart icon (❤️)
          </div>
          <button
            style={{
              background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => navigate('/categories')}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Browse Designs
          </button>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
