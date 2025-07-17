import React, { useState, useEffect } from 'react';
import { Upload, Save, X } from 'lucide-react';

const url = import.meta.env.VITE_API_BASE_URL;

const AddDesignForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    categories: [],
    price: '',
    image: '',
    description: '',
    selected_format: '',
    design_files: []
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const availableFormats = [
    'DST-BERNINA-14x8',
    'DST-BROTHER-V3SE-12x8',
    'DST-FULL',
    'JEF-USHA-450-11x8',
    'JEF-USHA-550-14x8',
    'PES-BROTHER-BP3600-14x9.5'
  ];

  useEffect(() => {
    fetchValidCategories();
  }, []);

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

  const handleDesignFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!formData.selected_format) {
      alert('Please select a machine format first!');
      return;
    }

    const validExtensions = ['.dst', '.jef', '.pes', '.bigdst', '.exp', '.pcs', '.vp3', '.xxx'];
    const processedFiles = [];
    const existingFileNames = selectedFiles.map(f => f.name.toLowerCase());

    for (let file of files) {
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        alert(`Invalid file type for ${file.name}. Please upload valid embroidery files: ${validExtensions.join(', ')}`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Please upload files smaller than 10MB.`);
        continue;
      }

      if (existingFileNames.includes(file.name.toLowerCase())) {
        const replace = confirm(`File "${file.name}" is already selected. Do you want to replace it?`);
        if (replace) {
          const updatedFiles = selectedFiles.filter(f => f.name.toLowerCase() !== file.name.toLowerCase());
          setSelectedFiles(updatedFiles);
          processedFiles.push(file);
        }
        continue;
      }

      processedFiles.push(file);
    }

    if (processedFiles.length > 0) {
      const combinedFiles = [...selectedFiles, ...processedFiles];
      setSelectedFiles(combinedFiles);

      const filePromises = combinedFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              data: reader.result,
              fileName: file.name,
              mimeType: file.type,
              extension: file.name.split('.').pop(),
              size: file.size
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises).then(fileData => {
        setFormData(prev => ({
          ...prev,
          design_files: fileData
        }));
      });
    }
  };

  const removeSelectedFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);

    const filePromises = newFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            data: reader.result,
            fileName: file.name,
            mimeType: file.type,
            extension: file.name.split('.').pop(),
            size: file.size
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(fileData => {
      setFormData(prev => ({
        ...prev,
        design_files: fileData
      }));
    });
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setFormData(prev => ({
      ...prev,
      design_files: []
    }));
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


    if (!formData.selected_format) {
      newErrors.selected_format = 'Please select a machine format';
    }

    if (formData.design_files.length === 0) {
      newErrors.design_files = 'Please upload at least one design file';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setUploadProgress('Preparing files...');

    try {
      let totalSize = 0;
      if (formData.image) {
        totalSize += Math.round(formData.image.length * 0.75);
      }

      formData.design_files.forEach(file => {
        if (file.size) {
          totalSize += file.size;
        }
      });

      if (totalSize > 80 * 1024 * 1024) {
        alert('Total file size too large. Please reduce file sizes or upload fewer files.');
        return;
      }

      setUploadProgress('Uploading files to cloud storage...');

      const submitData = {
        ...formData,
        design_type: formData.selected_format
      };

      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          await onSubmit(submitData);
          setUploadProgress('Upload completed successfully!');
          setTimeout(() => {
            onClose();
          }, 1000);
          return;
        } catch (error) {
          retryCount++;
          console.error(`Upload attempt ${retryCount} failed:`, error);

          if (retryCount < maxRetries) {
            setUploadProgress(`Upload failed, retrying... (${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Error adding design:', error);
      let errorMessage = 'Failed to add design. Please try again.';

      if (error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Upload timeout. Please try uploading smaller files or check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert('Upload failed: ' + errorMessage);
      setUploadProgress('Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '80%',
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
    <>
      <style>
        {`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
      <div style={{ width: '100%', maxWidth: '100%' }}>
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
                style={errors.product_name ? errorInputStyle : inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
                onBlur={(e) => e.target.style.borderColor = errors.product_name ? '#ff4444' : '#e1e5e9'}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
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

          <div style={{ marginBottom: '30px' }}>
            <label style={labelStyle}>Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows="4"
              style={{
                ...inputStyle,
                ...(errors.description ? { borderColor: '#ff4444' } : {}),
                resize: 'vertical'
              }}
              onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
              onBlur={(e) => e.target.style.borderColor = errors.description ? '#ff4444' : '#e1e5e9'}
            />
            {errors.description && <div style={errorStyle}>{errors.description}</div>}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ ...labelStyle, fontSize: '16px', color: '#D8B46A', marginBottom: '15px', display: 'block' }}>Machine Format & Design Files Upload</label>
            <div style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <p style={{
                fontSize: '13px',
                color: '#856404',
                margin: '0 0 8px 0',
                fontWeight: '500'
              }}>
                📁 Select machine format and upload embroidery design files
              </p>
              <p style={{
                fontSize: '12px',
                color: '#6c6c6c',
                margin: 0
              }}>
                Supported formats: .dst, .jef, .pes, .bigdst, .exp, .pcs, .vp3, .xxx (Max 10MB per file)
                <br />
                💡 <strong>Tip:</strong> Select machine format first, then upload multiple files for that format
                <br />
                📂 <strong>Organization:</strong> Files will be organized as ProductName → Format → Files in Google Drive
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Machine Format *</label>
                <select
                  name="selected_format"
                  value={formData.selected_format}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  style={{
                    ...(errors.selected_format ? errorInputStyle : inputStyle),
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                  onFocus={(e) => !isLoading && (e.target.style.borderColor = '#D8B46A')}
                  onBlur={(e) => !isLoading && (e.target.style.borderColor = errors.selected_format ? '#ff4444' : '#e1e5e9')}
                >
                  <option value="">Select machine format</option>
                  {availableFormats.map(format => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
                {errors.selected_format && <div style={errorStyle}>{errors.selected_format}</div>}
              </div>

              <div style={{ display: 'flex', alignItems: 'end' }}>
                <div style={{
                  padding: '12px 15px',
                  backgroundColor: formData.selected_format ? '#e8f5e8' : '#f0f0f0',
                  border: `2px solid ${formData.selected_format ? '#4caf50' : '#ddd'}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: formData.selected_format ? '#2e7d32' : '#666',
                  width: '100%',
                  textAlign: 'center'
                }}>
                  {formData.selected_format ?
                    `✅ Format: ${formData.selected_format}` :
                    '⚠️ Please select format first'
                  }
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Design Files *</label>
              <div style={{
                border: errors.design_files ? '2px dashed #ff4444' : '2px dashed #D8B46A',
                borderRadius: '8px',
                padding: '30px',
                textAlign: 'center',
                cursor: formData.selected_format ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                background: formData.selected_format ? '#f9f9f9' : '#f0f0f0',
                opacity: formData.selected_format ? 1 : 0.6
              }}>
                <input
                  type="file"
                  accept=".dst,.jef,.pes,.bigdst,.exp,.pcs,.vp3,.xxx"
                  onChange={handleDesignFileChange}
                  multiple
                  disabled={!formData.selected_format || isLoading}
                  style={{ display: 'none' }}
                  id="design-files-upload"
                />
                <label htmlFor="design-files-upload" style={{ cursor: (formData.selected_format && !isLoading) ? 'pointer' : 'not-allowed' }}>
                  <Upload size={40} style={{ color: (formData.selected_format && !isLoading) ? '#D8B46A' : '#ccc', marginBottom: '10px' }} />
                  <p style={{ margin: 0, color: (formData.selected_format && !isLoading) ? '#666' : '#ccc' }}>
                    {isLoading ? 'Uploading files...' :
                      formData.selected_format ?
                        `Click to upload ${formData.selected_format} files` :
                        'Select machine format first'
                    }
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
                    Multiple files supported • Max 10MB per file
                  </p>
                </label>
              </div>
              {errors.design_files && <div style={errorStyle}>{errors.design_files}</div>}
            </div>

            {selectedFiles.length > 0 && (
              <div style={{
                marginTop: '15px',
                padding: '15px',
                backgroundColor: '#e8f5e8',
                borderRadius: '8px',
                border: '1px solid #4caf50'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2e7d32' }}>
                    ✅ Selected Files ({selectedFiles.length}) - Format: {formData.selected_format}
                    {isLoading && <span style={{ color: '#ff9800', marginLeft: '10px' }}>🔄 Processing...</span>}
                  </div>
                  <button
                    type="button"
                    onClick={clearAllFiles}
                    disabled={isLoading}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: isLoading ? '#ccc' : '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <X size={12} />
                    Clear All
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' }}>
                  {selectedFiles.map((file, index) => (
                    <div key={index} style={{
                      fontSize: '12px',
                      color: '#2e7d32',
                      backgroundColor: '#f1f8e9',
                      padding: '8px',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>
                        <strong>📄 {file.name}</strong>
                        <br />
                        <span style={{ color: '#666', fontSize: '10px' }}>
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                          {isLoading && index === selectedFiles.length - 1 && <span style={{ color: '#ff9800' }}> - Uploading...</span>}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        disabled={isLoading}
                        style={{
                          padding: '2px 6px',
                          backgroundColor: isLoading ? '#ccc' : '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '10px',
                          cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isLoading && uploadProgress && (
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#e3f2fd',
              border: '1px solid #2196f3',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#1976d2',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                {uploadProgress}
              </div>
              <div style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#e0e0e0',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #2196f3, #21cbf3)',
                  animation: 'loading 2s infinite linear'
                }}></div>
              </div>
            </div>
          )}

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
              disabled={isLoading || selectedFiles.length === 0}
              style={{
                ...primaryButtonStyle,
                opacity: (isLoading || selectedFiles.length === 0) ? 0.7 : 1,
                cursor: (isLoading || selectedFiles.length === 0) ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && selectedFiles.length > 0) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(216, 180, 106, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && selectedFiles.length > 0) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              <Save size={16} />
              {isLoading ? 'Uploading...' : selectedFiles.length === 0 ? 'Select Files First' : 'Upload Design & Files'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddDesignForm;
