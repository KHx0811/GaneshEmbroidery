import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Header';
import { isAuthenticated, getAuthToken } from '../../utils/auth.js';
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, Package, DollarSign, CreditCard, Heart } from 'lucide-react';

const url = import.meta.env.VITE_API_BASE_URL;

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchCartItems();
  }, [navigate]);

  const fetchCartItems = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/user/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCartItems(data.cartItems || []);
          setSelectedItems(new Set(data.cartItems?.map(item => item._id) || []));
        }
      } else {
        console.error('Failed to fetch cart items');
        setCartItems([]);
        setSelectedItems(new Set());
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]);
      setSelectedItems(new Set());
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/user/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        setCartItems(prevItems =>
          prevItems.map(item =>
            item._id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      } else {
        console.error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!confirm('Remove this item from cart?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/user/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        // Show success message briefly
        alert('Item removed from cart successfully!');
      } else {
        const data = await response.json();
        console.error('Failed to remove item from cart:', data.error);
        alert(data.error || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item from cart');
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item._id)));
    }
  };

  const getSelectedTotal = () => {
    return cartItems
      .filter(item => selectedItems.has(item._id))
      .reduce((total, item) => total + (item.totalPrice || (item.price * item.quantity)), 0);
  };

  const getSelectedCount = () => {
    return cartItems
      .filter(item => selectedItems.has(item._id))
      .reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (selectedItems.size === 0) {
      alert('Please select items to checkout');
      return;
    }

    setIsCheckingOut(true);
    
    try {
      const selectedCartItems = cartItems.filter(item => selectedItems.has(item._id));
      const token = getAuthToken();
      
      const response = await fetch(`${url}/user/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: selectedCartItems })
      });

      if (response.ok) {
        const data = await response.json();
        // Remove checked out items from cart
        setCartItems(prevItems => prevItems.filter(item => !selectedItems.has(item._id)));
        setSelectedItems(new Set());
        // Redirect to payment page with order details
        navigate('/payment', { 
          state: {
            orderId: data.order.orderId,
            totalAmount: data.order.totalAmount,
            products: data.order.products,
            status: data.order.status
          }
        });
      } else {
        console.error('Failed to place order');
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsCheckingOut(false);
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

  const cartGridStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
    alignItems: 'start'
  };

  const cartItemsStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
  };

  const summaryStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: '120px'
  };

  const cartItemStyle = {
    display: 'flex',
    gap: '20px',
    padding: '20px',
    borderBottom: '1px solid #eee',
    transition: 'all 0.3s ease'
  };

  const itemImageStyle = {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '10px'
  };

  const quantityControlStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '10px 0'
  };

  const quantityButtonStyle = {
    width: '30px',
    height: '30px',
    border: '1px solid #ddd',
    borderRadius: '50%',
    background: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  };

  const checkoutButtonStyle = {
    width: '100%',
    padding: '15px',
    background: selectedItems.size > 0 
      ? 'linear-gradient(135deg, #4caf50, #45a049)' 
      : '#ddd',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: selectedItems.size > 0 ? 'pointer' : 'not-allowed',
    transition: 'all 0.3s ease',
    marginTop: '20px'
  };

  if (loading) {
    return (
      <div style={mainContainerStyle}>
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading your cart...</div>
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
            Continue Shopping
          </button>
          <button
            style={{
              ...backButtonStyle,
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => navigate('/favorites')}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Heart size={20} />
            View Wishlist
          </button>
          <h1 style={{ margin: 0, color: '#021d3b', fontSize: '2.5rem' }}>
            <ShoppingCart size={35} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            Shopping Cart
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#666', fontSize: '18px' }}>
            {cartItems.length} items in cart
          </span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}>
          <ShoppingCart size={64} style={{ color: '#ddd', marginBottom: '20px' }} />
          <div style={{ fontSize: '24px', color: '#666', marginBottom: '10px' }}>
            Your cart is empty
          </div>
          <div style={{ fontSize: '16px', color: '#999', marginBottom: '30px' }}>
            Add some beautiful embroidery designs to get started
          </div>
          <button
            style={{
              ...backButtonStyle,
              background: 'linear-gradient(135deg, #2196f3, #1976d2)'
            }}
            onClick={() => navigate('/categories')}
          >
            Browse Designs
          </button>
        </div>
      ) : (
        <div style={cartGridStyle}>
          {/* Cart Items */}
          <div style={cartItemsStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #f0f0f0' }}>
              <h2 style={{ margin: 0, color: '#021d3b' }}>Cart Items</h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                  onChange={selectAllItems}
                  style={{ transform: 'scale(1.2)' }}
                />
                Select All
              </label>
            </div>

            {cartItems.map((item) => (
              <div key={item._id} style={cartItemStyle}>
                <input
                  type="checkbox"
                  checked={selectedItems.has(item._id)}
                  onChange={() => toggleItemSelection(item._id)}
                  style={{ transform: 'scale(1.2)', marginRight: '10px' }}
                />
                
                <img
                  src={item.image}
                  alt={item.productName}
                  style={itemImageStyle}
                />
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#021d3b', fontSize: '1.1rem' }}>
                    {item.productName}
                  </h3>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                    Categories: {Array.isArray(item.categories) ? item.categories.join(', ') : item.category || 'No categories'}
                  </p>
                  <div style={{ margin: '0 0 10px 0' }}>
                    <span style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>Machine Types: </span>
                    <div style={{ marginTop: '5px' }}>
                      {item.machineTypes.map((machineType, index) => (
                        <span 
                          key={index}
                          style={{ 
                            display: 'inline-block',
                            background: '#f0f8ff',
                            color: '#0066cc',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            margin: '2px',
                            border: '1px solid #cce7ff'
                          }}
                        >
                          {machineType.type.replace(/_/g, ' ')} (₹{machineType.price})
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div style={quantityControlStyle}>
                    <span style={{ fontSize: '14px', color: '#666' }}>Quantity:</span>
                    <button
                      style={quantityButtonStyle}
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      style={quantityButtonStyle}
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4caf50', marginBottom: '5px' }}>
                      ₹{item.totalPrice || (item.price * item.quantity)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#999' }}>
                      ₹{item.price} each
                    </div>
                  </div>
                  
                  <button
                    style={{
                      background: 'none',
                      border: '1px solid #f44336',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      color: '#f44336',
                      marginTop: '10px'
                    }}
                    onClick={() => removeFromCart(item._id)}
                    title="Remove from cart"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={summaryStyle}>
            <h2 style={{ margin: '0 0 20px 0', color: '#021d3b' }}>Order Summary</h2>
            
            <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Selected Items:</span>
                <span>{selectedItems.size}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Total Quantity:</span>
                <span>{getSelectedCount()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Subtotal:</span>
                <span>₹{getSelectedTotal()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                <span>Tax & Shipping:</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>
              <span>Total:</span>
              <span style={{ color: '#4caf50' }}>₹{getSelectedTotal()}</span>
            </div>
            
            <button
              style={checkoutButtonStyle}
              onClick={handleCheckout}
              disabled={selectedItems.size === 0 || isCheckingOut}
              onMouseEnter={(e) => {
                if (selectedItems.size > 0) {
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <CreditCard size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              {isCheckingOut ? 'Processing...' : `Proceed to Payment (${selectedItems.size} items)`}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#666' }}>
              🔒 Secure checkout with SSL encryption
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
