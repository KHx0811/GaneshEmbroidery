import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import Header from '../Components/Header';
import AdminHeader from '../Components/AdminHeader';
import Modal from '../Components/Modal';
import AddDesignForm from '../Components/AddDesignForm.jsx';
import EditDesignForm from '../Components/EditDesignForm.jsx';
import { isAuthenticated, getAuthToken, getUserRole } from '../utils/auth.js';
import { Plus, Edit, Trash2, ArrowLeft, ShoppingCart, Heart } from 'lucide-react';

const url = import.meta.env.VITE_API_BASE_URL;

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { categoryName } = useParams();
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState({}); // Track loading state for each delete operation
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '',
    title: '',
    data: null
  });

  useEffect(() => {
    const userRole = getUserRole();
    setIsAdmin(userRole === 'admin');
    
    // Check for category from URL params first, then search params
    if (categoryName) {
      setSelectedCategory(decodeURIComponent(categoryName));
    } else {
      const categoryParam = searchParams.get('category');
      if (categoryParam) {
        setSelectedCategory(categoryParam);
      } else {
        // If no category in URL, clear selected category
        setSelectedCategory(null);
      }
    }
    
    fetchCategories();
  }, [navigate, searchParams, categoryName]);

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      // Always fetch all valid categories instead of just categories with products
      const validCategoriesResponse = await fetch(`${url}/products/valid-categories`);
      const validCategoriesData = await validCategoriesResponse.json();
      
      if (validCategoriesData.status === 'success') {
        const allCategories = validCategoriesData.data.categories || [];
        setCategories(allCategories);
        
        // Fetch product counts for each category
        await fetchCategoryCounts(allCategories);
      } else {
        // Fallback to hardcoded categories
        const fallbackCategories = ['Kids', 'Bride', 'Boat Necks', 'One side', 'Lines', 'Mirrors', 'Birds', 'Animals', 'Manual Idles', 'Gods', 'Flowers'];
        setCategories(fallbackCategories);
        await fetchCategoryCounts(fallbackCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to hardcoded categories
      const fallbackCategories = ['Kids', 'Bride', 'Boat Necks', 'One side', 'Lines', 'Mirrors', 'Birds', 'Animals', 'Manual Idles', 'Gods', 'Flowers'];
      setCategories(fallbackCategories);
      await fetchCategoryCounts(fallbackCategories);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryCounts = async (categoryList) => {
    try {
      const counts = {};
      
      // Fetch count for each category
      for (const category of categoryList) {
        try {
          const response = await fetch(`${url}/products?category=${encodeURIComponent(category)}&limit=1`);
          const data = await response.json();
          
          if (data.status === 'success' && data.data.pagination) {
            counts[category] = data.data.pagination.total_products || 0;
          } else {
            counts[category] = 0;
          }
        } catch (error) {
          console.error(`Error fetching count for category ${category}:`, error);
          counts[category] = 0;
        }
      }
      
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

  const fetchProductsByCategory = async (category) => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/products?category=${encodeURIComponent(category)}`);
      
      const data = await response.json();
      if (data.status === 'success') {
        setProducts(data.data.products || []);
        setSelectedCategory(category);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this entire design? This will remove all machine types and files. This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(prev => ({ ...prev, [productId]: true }));

    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        alert('Design deleted successfully!');
        if (selectedCategory) {
          fetchProductsByCategory(selectedCategory);
        }
        // Refresh category counts
        await fetchCategoryCounts(categories);
      } else {
        throw new Error(data.message || 'Failed to delete design');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete design: ' + error.message);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const deleteMachineType = async (productId, machineType) => {
    if (!confirm(`Are you sure you want to delete the ${machineType} files? This action cannot be undone.`)) {
      return;
    }

    const deleteKey = `${productId}-${machineType}`;
    setDeleteLoading(prev => ({ ...prev, [deleteKey]: true }));

    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/products/${productId}/machine-type/${machineType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        alert(`${machineType} files deleted successfully!`);
        if (selectedCategory) {
          fetchProductsByCategory(selectedCategory);
        }
      } else {
        throw new Error(data.message || 'Failed to delete machine type');
      }
    } catch (error) {
      console.error('Error deleting machine type:', error);
      alert('Failed to delete machine type: ' + error.message);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [deleteKey]: false }));
    }
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

  const handleAddDesign = async (designData) => {
    try {
      const token = getAuthToken();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 300000);

      const response = await fetch(`${url}/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(designData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error('File size too large. Please reduce file sizes and try again.');
        } else if (response.status === 504 || response.status === 502) {
          throw new Error('Server timeout. Please try again with smaller files.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
      }
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        let successMessage = 'Design added successfully!';
        if (result.data.action === 'format_added') {
          successMessage = `Format "${designData.selected_format}" added to existing product successfully!`;
        } else if (result.data.action === 'new_product') {
          successMessage = 'New design product created successfully!';
        }
        
        alert(successMessage);
        closeModal();
        if (selectedCategory) {
          fetchProductsByCategory(selectedCategory);
        }
        // Refresh category counts
        await fetchCategoryCounts(categories);
      } else {
        throw new Error(result.message || 'Failed to add design');
      }
    } catch (error) {
      console.error('Error adding design:', error);
      
      let errorMessage = 'Failed to add design. Please try again.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Upload timeout. Please try with smaller files or check your connection.';
      } else if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('Upload failed: ' + errorMessage);
      throw error;
    }
  };

  const editDesign = async (designData) => {
    try {
      console.log('Updating design:', designData);
      
      const token = getAuthToken();
      
      const response = await fetch(`${url}/products/${modalState.data._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(designData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update design');
      }
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        console.log('Design updated successfully:', result);
        alert('Design updated successfully!');
        closeModal();
        if (selectedCategory) {
          fetchProductsByCategory(selectedCategory);
        }
        // Refresh category counts
        await fetchCategoryCounts(categories);
      } else {
        throw new Error(result.message || 'Failed to update design');
      }
    } catch (error) {
      console.error('Error updating design:', error);
      alert('Failed to update design: ' + error.message);
      throw error;
    }
  };

  const addToCart = async (product, machineType) => {
    if (!isAuthenticated()) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

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
          machineType: machineType,
          quantity: 1
        })
      });

      if (response.ok) {
        alert('Added to cart successfully!');
      } else {
        console.error('Failed to add to cart');
        alert('Failed to add to cart. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const addToWishlist = async (product) => {
    if (!isAuthenticated()) {
      alert('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/user/wishlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product._id
        })
      });

      if (response.ok) {
        alert('Added to wishlist successfully!');
      } else {
        console.error('Failed to add to wishlist');
        alert('Failed to add to wishlist. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add to wishlist. Please try again.');
    }
  };

  const getAvailableMachineTypes = (product) => {
    if (!product.design_files) return [];
    
    const machineTypes = [];
    const machineTypeMap = {
      'DST_BERNINA_14x8': 'DST-BERNINA-14x8',
      'DST_BROTHER_V3SE_12x8': 'DST-BROTHER-V3SE-12x8',
      'DST_FULL': 'DST-FULL',
      'JEF_USHA_450_11x8': 'JEF-USHA-450-11x8',
      'JEF_USHA_550_14x8': 'JEF-USHA-550-14x8',
      'PES_BROTHER_BP3600_14x9_5': 'PES-BROTHER-BP3600-14x9.5'
    };
    
    Object.entries(product.design_files).forEach(([key, value]) => {
      if (value && (value.file_url || value.google_drive_id)) {
        const displayName = machineTypeMap[key] || key;
        machineTypes.push({
          key: key,
          display: displayName,
          hasFiles: !!(value.file_url || value.google_drive_id)
        });
      }
    });
    
    return machineTypes;
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
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '45px',
    height: '45px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginRight: '15px'
  };

  const categoriesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  };

  const categoryCardStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid transparent'
  };

  const selectedCategoryStyle = {
    ...categoryCardStyle,
    border: '2px solid #D8B46A',
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: 'white'
  };

  const productsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  };

  const productCardStyle = {
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

  const actionButtonStyle = {
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginRight: '8px'
  };

  const deleteButtonStyle = {
    ...actionButtonStyle,
    borderColor: '#ff4444',
    color: '#ff4444'
  };

  const addButtonStyle = {
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    padding: '15px 25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const loadingSpinnerStyle = {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #ff4444',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const spinnerCSS = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  if (loading) {
    return (
      <div style={mainContainerStyle}>
        {isAdmin ? <AdminHeader /> : <Header />}
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={mainContainerStyle}>
      <style>{spinnerCSS}</style>
      {isAdmin ? <AdminHeader /> : <Header />}
      
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            style={backButtonStyle}
            onClick={() => {
              if (selectedCategory) {
                // If we're viewing a category, go back to categories list
                if (isAdmin) {
                  navigate('/admin/categories');
                } else {
                  navigate('/categories');
                }
              } else {
                // If we're on categories list, go back to dashboard/home
                if (isAdmin) {
                  navigate('/admin');
                } else {
                  navigate('/');
                }
              }
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            title='Back'
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ margin: 0, color: '#021d3b', fontSize: '2.5rem' }}>
            {isAdmin ? 'Categories Management' : 'Browse Categories'}
          </h1>
        </div>
        
        {isAdmin && selectedCategory && (
          <button
            style={addButtonStyle}
            onClick={() => openModal('addDesign', 'Add New Design')}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Plus size={20} />
            Add Design
          </button>
        )}
      </div>

      {!selectedCategory ? (
        <div>
          <h2 style={{ color: '#021d3b', marginBottom: '20px', fontSize: '1.8rem' }}>
            {isAdmin ? 'Select a Category to Manage' : 'Browse Design Categories'}
          </h2>
          <div style={categoriesGridStyle}>
            {categories.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '50px',
                color: '#666',
                fontSize: '18px'
              }}>
                Loading categories...
              </div>
            ) : (
              categories.map((category, index) => {
                const productCount = categoryCounts[category] || 0;
                
                return (
                  <div
                    key={index}
                    style={categoryCardStyle}
                    onClick={() => {
                      if (isAdmin) {
                        navigate(`/admin/category/${encodeURIComponent(category)}`);
                      } else {
                        navigate(`/category/${encodeURIComponent(category)}`);
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-5px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <h3 style={{ margin: 0, color: '#021d3b', fontSize: '1.4rem' }}>
                        {category}
                      </h3>
                      <span style={{
                        background: productCount > 0 ? '#4caf50' : '#f44336',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {productCount} design{productCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                      {isAdmin ? 
                        (productCount > 0 ? 
                          'Click to view and manage designs in this category' : 
                          'No designs yet. Click to add the first design.') :
                        (productCount > 0 ? 
                          'Click to browse beautiful embroidery designs' : 
                          'No designs available in this category yet.')
                      }
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: '#021d3b', fontSize: '1.8rem' }}>
              {selectedCategory} Designs ({products.length})
            </h2>
          </div>

          <div style={productsGridStyle}>
            {products.map((product) => {
              const availableMachineTypes = getAvailableMachineTypes(product);
              const hasMultipleMachineTypes = availableMachineTypes.length > 1;
              
              return (
                <div
                  key={product._id}
                  style={{
                    ...productCardStyle,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if (isAdmin) {
                      navigate(`/admin/product/${product._id}`);
                    } else {
                      navigate(`/product/${product._id}`);
                    }
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <img
                    src={product.image}
                    alt={product.product_name}
                    style={productImageStyle}
                  />
                  <h3 style={{ margin: '0 0 10px 0', color: '#021d3b', fontSize: '1.2rem' }}>
                    {product.product_name}
                  </h3>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                    <strong>Price:</strong> ₹{product.price}
                  </p>
                  <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                    <strong>Available Types:</strong> {availableMachineTypes.length} 
                    {availableMachineTypes.length === 1 ? ' type' : ' types'}
                  </p>

                  <div style={{ marginBottom: '15px' }}>
                    {availableMachineTypes.map((machineType) => (
                      <div 
                        key={machineType.key}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          margin: '5px 0',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      >
                        <span style={{ color: '#495057', fontWeight: '500' }}>
                          {machineType.display}
                        </span>
                        {isAdmin && hasMultipleMachineTypes && (
                          <button
                            style={{
                              ...deleteButtonStyle,
                              padding: '4px 8px',
                              fontSize: '10px',
                              opacity: deleteLoading[`${product._id}-${machineType.display}`] ? 0.6 : 1,
                              cursor: deleteLoading[`${product._id}-${machineType.display}`] ? 'not-allowed' : 'pointer'
                            }}
                            onClick={() => deleteMachineType(product._id, machineType.display)}
                            disabled={deleteLoading[`${product._id}-${machineType.display}`]}
                            title={`Delete ${machineType.display} files`}
                          >
                            {deleteLoading[`${product._id}-${machineType.display}`] ? 
                              <div style={loadingSpinnerStyle}></div> : 
                              <Trash2 size={12} />
                            }
                          </button>
                        )}
                        {!isAdmin && (
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
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              addToCart(product, machineType.display);
                            }}
                            title={`Add ${machineType.display} to cart`}
                          >
                            <ShoppingCart size={10} />
                            Add
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    {isAdmin ? (
                      <>
                        <button
                          style={actionButtonStyle}
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('editDesign', 'Edit Design', product);
                          }}
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          style={{
                            ...deleteButtonStyle,
                            opacity: deleteLoading[product._id] ? 0.6 : 1,
                            cursor: deleteLoading[product._id] ? 'not-allowed' : 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProduct(product._id);
                          }}
                          disabled={deleteLoading[product._id]}
                          title={hasMultipleMachineTypes ? "Delete Entire Product" : "Delete Product"}
                        >
                          {deleteLoading[product._id] ? 
                            <div style={loadingSpinnerStyle}></div> : 
                            <Trash2 size={16} />
                          }
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          style={{
                            background: 'none',
                            border: '1px solid #f44336',
                            borderRadius: '8px',
                            padding: '8px',
                            cursor: 'pointer',
                            color: '#f44336',
                            transition: 'all 0.3s ease'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToWishlist(product);
                          }}
                          title="Add to Wishlist"
                          onMouseEnter={(e) => {
                            e.target.style.background = '#f44336';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'none';
                            e.target.style.color = '#f44336';
                          }}
                        >
                          <Heart size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <div style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
                No designs found in this category
              </div>
              {isAdmin && (
                <button
                  style={addButtonStyle}
                  onClick={() => openModal('addDesign', 'Add New Design')}
                >
                  <Plus size={20} />
                  Add First Design
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <Modal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          title={modalState.title}
          width="1000px"
        >
          {modalState.type === 'addDesign' && (
            <AddDesignForm
              onClose={closeModal}
              onSubmit={handleAddDesign}
            />
          )}
          {modalState.type === 'editDesign' && (
            <EditDesignForm
              onClose={closeModal}
              onSubmit={editDesign}
              productData={modalState.data}
            />
          )}
        </Modal>
      )}

      <style>
        {spinnerCSS}
      </style>
    </div>
  );
};

export default CategoriesPage;
