import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import { isAuthenticated, getAuthToken } from '../utils/auth.js';
import { ArrowLeft, ShoppingCart, Heart, Package, DollarSign, Info } from 'lucide-react';

const url = import.meta.env.VITE_API_BASE_URL;

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMachineTypes, setSelectedMachineTypes] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${url}/products/${productId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'success') {
          setProduct(data.data.product);
          // Clear selected machine types when product changes
          setSelectedMachineTypes([]);
        } else {
          console.error('API returned error status:', data);
        }
      } else {
        console.error('Failed to fetch product, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableMachineTypes = (designFiles) => {
    const availableTypes = [];
    const machineTypeMapping = {
      'DST_BERNINA_14x8': 'DST BERNINA 14x8',
      'DST_BROTHER_V3SE_12x8': 'DST BROTHER V3SE 12x8',
      'DST_FULL': 'DST FULL',
      'JEF_USHA_450_11x8': 'JEF USHA 450 11x8',
      'JEF_USHA_550_14x8': 'JEF USHA 550 14x8',
      'PES_BROTHER_BP3600_14x9_5': 'PES BROTHER BP3600 14x9.5'
    };

    for (const [key, displayName] of Object.entries(machineTypeMapping)) {
      if (designFiles[key] && (designFiles[key].file_url || designFiles[key].google_drive_id)) {
        // Use the individual price from design_files, fallback to product price if not set
        const price = designFiles[key].price && designFiles[key].price > 0 ? designFiles[key].price : (product?.price || 0);
        availableTypes.push({
          key: key,
          displayName: displayName,
          price: price
        });
      }
    }
    return availableTypes;
  };

  const handleMachineTypeChange = (machineType, isChecked) => {
    setSelectedMachineTypes(prev => {
      if (isChecked) {
        return [...prev, machineType];
      } else {
        return prev.filter(type => type.key !== machineType.key);
      }
    });
  };

  const getTotalPrice = () => {
    return selectedMachineTypes.reduce((total, type) => total + type.price, 0);
  };

  const addToCart = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (selectedMachineTypes.length === 0) {
      alert('Please select at least one machine type');
      return;
    }

    setIsAddingToCart(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/user/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product._id,
          machineTypes: selectedMachineTypes.map(type => ({
            type: type.key,
            price: type.price
          })),
          quantity: 1,
          totalPrice: getTotalPrice()
        })
      });

      if (response.ok) {
        alert('Added to cart successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const addToWishlist = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (selectedMachineTypes.length === 0) {
      alert('Please select at least one machine type');
      return;
    }

    setIsAddingToWishlist(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/user/wishlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product._id,
          machineTypes: selectedMachineTypes.map(type => ({
            type: type.key,
            price: type.price
          }))
        })
      });

      if (response.ok) {
        alert('Added to wishlist successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add to wishlist');
    } finally {
      setIsAddingToWishlist(false);
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

  const contentStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    background: 'white',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  };

  const imageStyle = {
    width: '100%',
    maxWidth: '500px',
    height: 'auto',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
  };

  const buttonStyle = {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #4caf50, #45a049)',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    color: 'white'
  };

  const selectStyle = {
    padding: '10px',
    borderRadius: '8px',
    border: '2px solid #ddd',
    fontSize: '16px',
    background: 'white',
    cursor: 'pointer'
  };

  if (loading) {
    return (
      <div style={mainContainerStyle}>
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading product details...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={mainContainerStyle}>
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '24px', color: '#666', marginBottom: '20px' }}>Product not found</div>
          <button style={backButtonStyle} onClick={() => navigate('/categories')}>
            <ArrowLeft size={20} />
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  const availableMachineTypes = getAvailableMachineTypes(product.design_files);

  return (
    <div style={mainContainerStyle}>
      <Header />
      
      <div style={headerStyle}>
        <button
          style={backButtonStyle}
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 style={{ margin: 0, color: '#021d3b', fontSize: '2.5rem' }}>
          Product Details
        </h1>
      </div>

      <div style={contentStyle}>
        {/* Product Image */}
        <div>
          <img
            src={product.image}
            alt={product.product_name}
            style={imageStyle}
          />
        </div>

        {/* Product Information */}
        <div>
          <h2 style={{ color: '#021d3b', marginBottom: '10px' }}>{product.product_name}</h2>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px', lineHeight: '1.6' }}>
            {product.description}
          </p>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Package size={20} style={{ color: '#666' }} />
              <span style={{ fontWeight: 'bold', color: '#333' }}>Category:</span>
              <span style={{ color: '#666' }}>{product.category}</span>
            </div>
            {selectedMachineTypes.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <DollarSign size={20} style={{ color: '#4caf50' }} />
                <span style={{ fontWeight: 'bold', color: '#333' }}>Total Price:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4caf50' }}>₹{getTotalPrice()}</span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#021d3b', marginBottom: '15px' }}>Select Machine Types:</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {availableMachineTypes.map((machineType) => (
                <label 
                  key={machineType.key} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedMachineTypes.some(t => t.key === machineType.key) ? '#f0f8ff' : 'white',
                    borderColor: selectedMachineTypes.some(t => t.key === machineType.key) ? '#4caf50' : '#ddd'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedMachineTypes.some(t => t.key === machineType.key)}
                    onChange={(e) => handleMachineTypeChange(machineType, e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <span style={{ flex: 1, fontWeight: '500' }}>{machineType.displayName}</span>
                  <span style={{ color: '#4caf50', fontWeight: 'bold' }}>₹{machineType.price}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button
              style={primaryButtonStyle}
              onClick={addToCart}
              disabled={isAddingToCart || selectedMachineTypes.length === 0}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <ShoppingCart size={20} />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              style={secondaryButtonStyle}
              onClick={addToWishlist}
              disabled={isAddingToWishlist || selectedMachineTypes.length === 0}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <Heart size={20} />
              {isAddingToWishlist ? 'Adding...' : 'Add to Wishlist'}
            </button>
          </div>

          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            background: '#f8f9fa', 
            borderRadius: '10px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Info size={20} style={{ color: '#007bff' }} />
              <span style={{ fontWeight: 'bold', color: '#007bff' }}>Important Note:</span>
            </div>
            <p style={{ color: '#666', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
              Design files will be available for download only after successful payment completion. 
              You can add items to your cart and complete the purchase to access the embroidery files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
