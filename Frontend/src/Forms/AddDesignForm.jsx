import React, { useState } from 'react';
import { Upload, Save, X } from 'lucide-react';

const AddDesignForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    price: '',
    design_type: '',
    selected_format: '',
    image: '',
    description: '',
    design_files: []
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [designFiles, setDesignFiles] = useState([]);

  const categories = ['kids', 'simple', 'Boat Neck', 'Bride Desings'];
  const machineTypes = [
    { value: 'DST-BERNINA-14x8', label: 'DST - BERNINA 14x8', format: 'dst' },
    { value: 'DST-BROTHER-V3SE-12x8', label: 'DST - BROTHER V3SE 12x8', format: 'dst' },
    { value: 'DST-FULL', label: 'DST - FULL', format: 'dst' },
    { value: 'JEF-USHA-450-11x8', label: 'JEF - USHA 450 11x8', format: 'jef' },
    { value: 'JEF-USHA-550-14x8', label: 'JEF - USHA 550 14x8', format: 'jef' },
    { value: 'PES-BROTHER-BP3600-14x9.5', label: 'PES - BROTHER BP3600 14x9.5', format: 'pes' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // When machine type changes, automatically set design_type and selected_format
    if (name === 'design_type') {
      setFormData(prev => ({
        ...prev,
        design_type: value,
        selected_format: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDesignFileChange = (e) => {
    const files = Array.from(e.target.files);
    setDesignFiles(files);
    setFormData(prev => ({
      ...prev,
      design_files: files
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.design_type) {
      newErrors.design_type = 'Machine type is required';
    }
    
    if (!formData.image) {
      newErrors.image = 'Product image is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Prepare the data with selected_format set to design_type
      const submitData = {
        ...formData,
        selected_format: formData.design_type
      };
      
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error adding design:', error);
      alert('Failed to add design. Please try again.');
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

  const errorInputStyle = {
    ...inputStyle,
    borderColor: '#ff4444'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#021d3b',
    fontSize: '14px'
  };

  const errorStyle = {
    color: '#ff4444',
    fontSize: '12px',
    marginTop: '5px'
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: '#f5f5f5',
    color: '#666'
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* First Row - Product Name and Category */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px', 
        marginBottom: '20px' 
      }}>
        <div>
          <label style={labelStyle}>Product Name *</label>
          <input
            type="text"
            name="product_name"
            value={formData.product_name}
            onChange={handleInputChange}
            placeholder="Enter product name"
            style={errors.product_name ? errorInputStyle : inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
            onBlur={(e) => e.target.style.borderColor = errors.product_name ? '#ff4444' : '#e1e5e9'}
          />
          {errors.product_name && <div style={errorStyle}>{errors.product_name}</div>}
        </div>

        <div>
          <label style={labelStyle}>Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            style={errors.category ? errorInputStyle : inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
            onBlur={(e) => e.target.style.borderColor = errors.category ? '#ff4444' : '#e1e5e9'}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <div style={errorStyle}>{errors.category}</div>}
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px', 
        marginBottom: '20px' 
      }}>
        <div>
          <label style={labelStyle}>Price (₹) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Enter price"
            min="0"
            step="0.01"
            style={errors.price ? errorInputStyle : inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
            onBlur={(e) => e.target.style.borderColor = errors.price ? '#ff4444' : '#e1e5e9'}
          />
          {errors.price && <div style={errorStyle}>{errors.price}</div>}
        </div>

        <div>
          <label style={labelStyle}>Machine Type *</label>
          <select
            name="design_type"
            value={formData.design_type}
            onChange={handleInputChange}
            style={errors.design_type ? errorInputStyle : inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
            onBlur={(e) => e.target.style.borderColor = errors.design_type ? '#ff4444' : '#e1e5e9'}
          >
            <option value="">Select machine type</option>
            {machineTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          {errors.design_type && <div style={errorStyle}>{errors.design_type}</div>}
        </div>
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
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
                Supports PNG, JPG, JPEG
              </p>
            </label>
          )}
        </div>
        {errors.image && <div style={errorStyle}>{errors.image}</div>}
      </div>

      {formData.design_type && (
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Design Files for {formData.design_type}</label>
          <div style={{
            border: '2px dashed #D8B46A',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            background: '#f9f9f9'
          }}>
            <input
              type="file"
              multiple
              accept=".dst,.pes,.jef,.exp,.pcs,.vip,.xxx,.vp3"
              onChange={handleDesignFileChange}
              style={{ display: 'none' }}
              id="design-files-upload"
            />
            <label htmlFor="design-files-upload" style={{ cursor: 'pointer' }}>
              <Upload size={30} style={{ color: '#D8B46A', marginBottom: '10px' }} />
              <p style={{ margin: 0, color: '#666' }}>Upload design files</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
                Supports .dst, .pes, .jef, .exp, .pcs, .vip, .xxx, .vp3
              </p>
            </label>
            {designFiles.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#021d3b' }}>
                  Selected files ({designFiles.length}):
                </p>
                {designFiles.map((file, index) => (
                  <div key={index} style={{ fontSize: '12px', color: '#666', margin: '2px 0' }}>
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <label style={labelStyle}>Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter product description"
          rows="4"
          style={{
            ...inputStyle,
            ...(errors.description ? { borderColor: '#ff4444' } : {}),
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
          onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
          onBlur={(e) => e.target.style.borderColor = errors.description ? '#ff4444' : '#e1e5e9'}
        />
        {errors.description && <div style={errorStyle}>{errors.description}</div>}
      </div>

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={secondaryButtonStyle}
          onMouseEnter={(e) => e.target.style.background = '#e0e0e0'}
          onMouseLeave={(e) => e.target.style.background = '#f5f5f5'}
        >
          <X size={16} />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            ...primaryButtonStyle,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(216, 180, 106, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          <Save size={16} />
          {isLoading ? 'Adding...' : 'Add Design'}
        </button>
      </div>
    </form>
  );
};

export default AddDesignForm;
