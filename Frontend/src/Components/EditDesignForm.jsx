import React, { useState, useEffect } from 'react';
import { Upload, Save, X } from 'lucide-react';
import { getAuthToken } from '../utils/auth.js';

const url = import.meta.env.VITE_API_BASE_URL;

const EditDesignForm = ({ onClose, onSubmit, productData }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    categories: [],
    price: '',
    image: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    fetchValidCategories();
  }, []);

  useEffect(() => {
    if (productData) {
      setFormData({
        product_name: productData.product_name || '',
        categories: productData.categories || [],
        price: productData.price || '',
        image: productData.image || '',
        description: productData.description || ''
      });
      setImagePreview(productData.image || '');
    }
  }, [productData]);

  const fetchValidCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch(`${url}/products/valid-categories`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setAvailableCategories(data.data.categories || []);
      } else {
        console.error('Failed to fetch categories:', data.message);
        setAvailableCategories(['Kids', 'Bride', 'Boat Necks', 'One side', 'Lines', 'Mirrors', 'Birds', 'Animals', 'Manual Idles', 'Gods', 'Flowers']);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setAvailableCategories(['Kids', 'Bride', 'Boat Necks', 'One side', 'Lines', 'Mirrors', 'Birds', 'Animals', 'Manual Idles', 'Gods', 'Flowers']);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => {
      const updatedCategories = prev.categories.includes(category)
        ? prev.categories.filter(cat => cat !== category)
        : [...prev.categories, category];
      
      return {
        ...prev,
        categories: updatedCategories
      };
    });

    if (errors.categories) {
      setErrors(prev => ({
        ...prev,
        categories: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Invalid image type. Please upload JPG, PNG, or WebP images only.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size too large. Please upload images smaller than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    }

    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = 'At least one category is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.image) {
      newErrors.image = 'Product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setUploadProgress('Updating design...');

    try {
      const submitData = {
        product_name: formData.product_name,
        category: formData.category,
        price: formData.price,
        image: formData.image,
        description: formData.description
      };

      await onSubmit(submitData);
      setUploadProgress('Update completed successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error updating design:', error);
      alert('Failed to update design: ' + (error.message || 'Unknown error'));
      setUploadProgress('Update failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.3s ease',
    outline: 'none'
  };

  const errorStyle = {
    color: '#ff4444',
    fontSize: '12px',
    marginTop: '5px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#333'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #D8B46A, #E6C878)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  return (
    <div style={{ maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Product Name *</label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              style={{
                ...inputStyle,
                ...(errors.product_name ? { borderColor: '#ff4444' } : {})
              }}
            />
            {errors.product_name && <div style={errorStyle}>{errors.product_name}</div>}
          </div>

          <div>
            <label style={labelStyle}>Categories *</label>
            <div style={{ 
              padding: '12px', 
              border: `2px solid ${errors.categories ? '#ff4444' : '#e1e5e9'}`, 
              borderRadius: '8px',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {categoriesLoading ? (
                <div style={{ textAlign: 'center', color: '#666' }}>Loading categories...</div>
              ) : (
                availableCategories.map(category => (
                  <label key={category} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '8px', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'normal'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      style={{ marginRight: '8px' }}
                    />
                    {category}
                  </label>
                ))
              )}
            </div>
            {formData.categories.length > 0 && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Selected: {formData.categories.join(', ')}
              </div>
            )}
            {errors.categories && <div style={errorStyle}>{errors.categories}</div>}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Price (₹) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Enter price"
            min="1"
            style={{
              ...inputStyle,
              ...(errors.price ? { borderColor: '#ff4444' } : {})
            }}
          />
          {errors.price && <div style={errorStyle}>{errors.price}</div>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Product Image *</label>
          <div style={{
            border: errors.image ? '2px dashed #ff4444' : '2px dashed #D8B46A',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: imagePreview ? 'transparent' : '#f9f9f9'
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              id="image-upload"
            />
            {imagePreview ? (
              <div>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}
                />
                <br />
                <label htmlFor="image-upload" style={{ color: '#D8B46A', cursor: 'pointer' }}>
                  Change Image
                </label>
              </div>
            ) : (
              <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                <Upload size={40} style={{ color: '#D8B46A', marginBottom: '10px' }} />
                <p style={{ margin: 0, color: '#666' }}>Click to upload product image</p>
              </label>
            )}
          </div>
          {errors.image && <div style={errorStyle}>{errors.image}</div>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Description (Optional)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter product description"
            rows="4"
            style={{
              ...inputStyle,
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            <strong>Note:</strong> This form allows you to edit basic product information (name, category, price, image, and description). 
            To manage design files (add/remove machine types and files), please use the main product management interface or contact technical support.
          </p>
        </div>

        {/* Submit Buttons */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              ...buttonStyle,
              background: '#6c757d'
            }}
          >
            <X size={16} />
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...buttonStyle,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            <Save size={16} />
            {isLoading ? 'Updating...' : 'Update Design'}
          </button>
        </div>

        {uploadProgress && (
          <div style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '6px',
            color: '#155724',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {uploadProgress}
          </div>
        )}
      </form>
    </div>
  );
};

export default EditDesignForm;
