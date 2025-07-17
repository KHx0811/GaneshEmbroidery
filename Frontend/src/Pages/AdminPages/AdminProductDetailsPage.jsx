import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../../Components/AdminHeader';
import Modal from '../../Components/Modal';
import EditDesignForm from '../../Components/EditDesignForm';
import { getAuthToken } from '../../utils/auth';
import { ArrowLeft, Edit, Trash2, Download, Eye, FileText, Image, Calendar, Tag, DollarSign } from 'lucide-react';

const url = import.meta.env.VITE_API_BASE_URL;

const AdminProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '',
    title: '',
    data: null
  });

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${url}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setProduct(data.data.product);
      } else {
        throw new Error(data.message || 'Failed to fetch product details');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      alert('Failed to load product details: ' + error.message);
      navigate('/admin/categories');
    } finally {
      setLoading(false);
    }
  };

  const deleteMachineType = async (machineType) => {
    if (!confirm(`Are you sure you want to delete the ${machineType} files? This action cannot be undone.`)) {
      return;
    }

    const deleteKey = `${product._id}-${machineType}`;
    setDeleteLoading(prev => ({ ...prev, [deleteKey]: true }));

    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/products/${product._id}/machine-type/${machineType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        alert(`${machineType} files deleted successfully!`);
        fetchProductDetails(); // Refresh product details
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

  const deleteProduct = async () => {
    if (!confirm('Are you sure you want to delete this entire product? This will remove all machine types and files. This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(prev => ({ ...prev, [product._id]: true }));

    try {
      const token = getAuthToken();
      const response = await fetch(`${url}/products/${product._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        alert('Product deleted successfully!');
        navigate('/admin/categories');
      } else {
        throw new Error(data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product: ' + error.message);
    } finally {
      setDeleteLoading(prev => ({ ...prev, [product._id]: false }));
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

  const editDesign = async (designData) => {
    try {
      const token = getAuthToken();
      
      const response = await fetch(`${url}/products/${product._id}`, {
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
        alert('Design updated successfully!');
        closeModal();
        fetchProductDetails(); // Refresh product details
      } else {
        throw new Error(result.message || 'Failed to update design');
      }
    } catch (error) {
      console.error('Error updating design:', error);
      alert('Failed to update design: ' + error.message);
      throw error;
    }
  };

  const getAvailableMachineTypes = () => {
    if (!product?.design_files) return [];
    
    const machineTypes = [];
    const machineTypeMap = {
      'DST_BERNINA_14x8': 'DST-BERNINA-14x8',
      'DST_BROTHER_V3SE_12x8': 'DST-BROTHER-V3SE-12x8',
      'DST_FULL': 'DST-FULL',
      'JEF_USHA_450_11x8': 'JEF-USHA-450-11x8',
      'JEF_USHA_550_14x8': 'JEF-USHA-550-14x8',
      'PES_BROTHER_BP3600_14x9_5': 'PES-BROTHER-BP3600-14x9.5'
    };
    
    Object.entries(machineTypeMap).forEach(([key, displayName]) => {
      const fileData = product.design_files[key];
      const hasFiles = !!(fileData && (fileData.file_url || fileData.google_drive_id));
      
      machineTypes.push({
        key: key,
        display: displayName,
        hasFiles: hasFiles,
        fileData: fileData || { file_url: null, file_name: null, google_drive_id: null }
      });
    });
    
    return machineTypes;
  };

  const downloadFile = (fileUrl, fileName) => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'design_file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadAllFilesForMachineType = async (machineType) => {
    try {
      const filesToDownload = [];
      
      const { file_url, file_name } = machineType.fileData;
      
      if (file_url && file_name) {
        if (Array.isArray(file_url) && Array.isArray(file_name)) {
          file_url.forEach((url, index) => {
            if (url && file_name[index]) {
              filesToDownload.push({
                url: url,
                name: file_name[index]
              });
            }
          });
        } else if (typeof file_url === 'string' && typeof file_name === 'string') {
          
          let fileNames = [];
          let fileUrls = [];
          
          if (file_name.includes(',') || file_name.includes(';') || file_name.includes('|')) {
            fileNames = file_name.split(/[,;|]/).map(name => name.trim()).filter(name => name);
          } else if (file_name.includes('.jef') && file_name.split('.jef').length > 2) {
            fileNames = file_name.split(/(?=\w+\.jef)/g).map(name => name.trim()).filter(name => name);
          } else {
            fileNames = [file_name];
          }
          
          if (file_url.includes(',') || file_url.includes(';') || file_url.includes('|')) {
            fileUrls = file_url.split(/[,;|]/).map(url => url.trim()).filter(url => url);
          } else if (file_url.includes('http') && file_url.split('http').length > 2) {
            fileUrls = file_url.split(/(?=https?:\/\/)/g).map(url => url.trim()).filter(url => url);
          } else {
            fileUrls = [file_url];
          }
          
          if (fileUrls.length === fileNames.length) {
            fileUrls.forEach((url, index) => {
              if (url && fileNames[index]) {
                filesToDownload.push({
                  url: url,
                  name: fileNames[index]
                });
              }
            });
          } else if (fileUrls.length === 1 && fileNames.length > 1) {
            filesToDownload.push({
              url: fileUrls[0],
              name: fileNames[0]
            });
          } else if (fileUrls.length > 1 && fileNames.length === 1) {
            fileUrls.forEach((url, index) => {
              if (url) {
                filesToDownload.push({
                  url: url,
                  name: `${index + 1}_${fileNames[0]}`
                });
              }
            });
          } else {
            filesToDownload.push({
              url: file_url,
              name: file_name
            });
          }
        } else if (Array.isArray(file_url) && typeof file_name === 'string') {
          file_url.forEach((url, index) => {
            if (url) {
              filesToDownload.push({
                url: url,
                name: `${index + 1}_${file_name}`
              });
            }
          });
        } else if (typeof file_url === 'string' && Array.isArray(file_name)) {
          filesToDownload.push({
            url: file_url,
            name: file_name[0] || 'design_file'
          });
        }
      }
      
      console.log('Files to download:', filesToDownload);
      
      if (filesToDownload.length === 0) {
        alert('No files available for download');
        return;
      }
      
      if (filesToDownload.length === 1) {
        downloadFile(filesToDownload[0].url, filesToDownload[0].name);
      } else {
        try {
          alert(`Preparing to download ${filesToDownload.length} files as a zip. This may take a moment...`);
          
          const JSZip = (await import('https://cdn.skypack.dev/jszip')).default;
          const zip = new JSZip();
          
          for (const file of filesToDownload) {
            try {
              const response = await fetch(file.url);
              if (!response.ok) {
                throw new Error(`Failed to fetch ${file.name}: ${response.statusText}`);
              }
              const blob = await response.blob();
              zip.file(file.name, blob);
            } catch (error) {
              console.error(`Failed to fetch file ${file.name}:`, error);
            }
          }
          
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(zipBlob);
          link.download = `${product.product_name}_${machineType.display}_files.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
          
          alert(`Downloaded ${filesToDownload.length} files successfully!`);
        } catch (error) {
          console.error('Error creating zip file:', error);
          alert('Failed to create zip file. Downloading files individually...');
          filesToDownload.forEach((file, index) => {
            setTimeout(() => downloadFile(file.url, file.name), index * 1000);
          });
        }
      }
    } catch (error) {
      console.error('Error downloading files:', error);
      alert('Failed to download files: ' + error.message);
    }
  };

  const downloadAllProductFiles = async () => {
    try {
      const allFiles = [];
      
      availableMachineTypes.forEach(machineType => {
        const { file_url, file_name } = machineType.fileData;
        
        if (file_url && file_name) {
          if (Array.isArray(file_url) && Array.isArray(file_name)) {
            file_url.forEach((url, index) => {
              if (url && file_name[index]) {
                allFiles.push({
                  url: url,
                  name: `${machineType.display}_${file_name[index]}`,
                  machineType: machineType.display
                });
              }
            });
          } else if (typeof file_url === 'string' && typeof file_name === 'string') {
            allFiles.push({
              url: file_url,
              name: `${machineType.display}_${file_name}`,
              machineType: machineType.display
            });
          } else if (Array.isArray(file_url) && typeof file_name === 'string') {
            file_url.forEach((url, index) => {
              if (url) {
                allFiles.push({
                  url: url,
                  name: `${machineType.display}_${index + 1}_${file_name}`,
                  machineType: machineType.display
                });
              }
            });
          } else if (typeof file_url === 'string' && Array.isArray(file_name)) {
            allFiles.push({
              url: file_url,
              name: `${machineType.display}_${file_name[0] || 'design_file'}`,
              machineType: machineType.display
            });
          }
        }
      });
      
      if (allFiles.length === 0) {
        alert('No files available for download');
        return;
      }
      
      if (allFiles.length === 1) {
        downloadFile(allFiles[0].url, allFiles[0].name);
      } else {
        try {
          const JSZip = (await import('https://cdn.skypack.dev/jszip')).default;
          const zip = new JSZip();
          
          for (const file of allFiles) {
            try {
              const response = await fetch(file.url);
              const blob = await response.blob();
              zip.file(`${file.machineType}/${file.name}`, blob);
            } catch (error) {
              console.error(`Failed to fetch file ${file.name}:`, error);
            }
          }
          
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(zipBlob);
          link.download = `${product.product_name}_all_files.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        } catch (error) {
          console.error('Error creating zip file:', error);
          alert('Failed to create zip file. Downloading files individually...');
          allFiles.forEach((file, index) => {
            setTimeout(() => downloadFile(file.url, file.name), index * 1000);
          });
        }
      }
    } catch (error) {
      console.error('Error downloading all files:', error);
      alert('Failed to download files: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const mainContainerStyle = {
    minHeight: '100vh',
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

  const contentStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '30px',
    marginBottom: '30px'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
  };

  const actionButtonStyle = {
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginRight: '10px'
  };

  const deleteButtonStyle = {
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const machineTypeCardStyle = {
    background: '#f8f9fa',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '15px',
    border: '1px solid #e9ecef'
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

  if (loading) {
    return (
      <div style={mainContainerStyle}>
        <AdminHeader />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading product details...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={mainContainerStyle}>
        <AdminHeader />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Product not found</div>
        </div>
      </div>
    );
  }

  const availableMachineTypes = getAvailableMachineTypes();

  return (
    <div style={mainContainerStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <AdminHeader />
      
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            style={backButtonStyle}
            onClick={() => navigate(-1)}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            title='Go back'
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ margin: 0, color: '#021d3b', fontSize: '2.5rem' }}>
            Product Details
          </h1>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={actionButtonStyle}
            onClick={() => openModal('editDesign', 'Edit Product', product)}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Edit size={20} />
            Edit Product
          </button>
          <button
            style={{
              ...deleteButtonStyle,
              opacity: deleteLoading[product._id] ? 0.6 : 1,
              cursor: deleteLoading[product._id] ? 'not-allowed' : 'pointer'
            }}
            onClick={deleteProduct}
            disabled={deleteLoading[product._id]}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {deleteLoading[product._id] ? 
              <div style={loadingSpinnerStyle}></div> : 
              <Trash2 size={20} />
            }
            Delete Product
          </button>
        </div>
      </div>

      <div style={contentStyle}>
        <div style={cardStyle}>
          <h2 style={{ color: '#021d3b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={24} />
            Product Information
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            <img
              src={product.image}
              alt={product.product_name}
              style={{
                width: '100%',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '10px',
                marginBottom: '15px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#495057' }}>Product Name:</strong>
            <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: 'bold', color: '#021d3b' }}>
              {product.product_name}
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#495057', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Tag size={16} />
              Categories:
            </strong>
            <div style={{ margin: '5px 0', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {product.categories.map((category, index) => (
                <span
                  key={index}
                  style={{
                    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#495057', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <DollarSign size={16} />
              Price:
            </strong>
            <p style={{ margin: '5px 0', fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
              ₹{product.price}
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#495057' }}>Design Type:</strong>
            <p style={{ margin: '5px 0', color: '#666' }}>{product.design_type}</p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#495057' }}>Description:</strong>
            <p style={{ margin: '5px 0', color: '#666' }}>
              {product.description || 'No description provided'}
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#495057', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={16} />
              Created:
            </strong>
            <p style={{ margin: '5px 0', color: '#666' }}>{formatDate(product.created_at)}</p>
          </div>

          {product.updated_at && product.updated_at !== product.created_at && (
            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#495057' }}>Last Updated:</strong>
              <p style={{ margin: '5px 0', color: '#666' }}>{formatDate(product.updated_at)}</p>
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#021d3b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={24} />
              Design Files ({availableMachineTypes.filter(mt => mt.hasFiles).length}/{availableMachineTypes.length} types available)
            </h2>
            {availableMachineTypes.filter(mt => mt.hasFiles).length > 1 && (
              <button
                style={{
                  background: 'linear-gradient(135deg, #4caf50, #45a049)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
                onClick={downloadAllProductFiles}
                title="Download all files from all machine types as a zip"
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <Download size={16} />
                Download All Files
              </button>
            )}
          </div>

          {availableMachineTypes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
              <p>No design files available for this product.</p>
            </div>
          ) : (
            availableMachineTypes.map((machineType) => (
              <div key={machineType.key} style={{
                ...machineTypeCardStyle,
                border: machineType.hasFiles ? '1px solid #e9ecef' : '2px dashed #dc3545',
                background: machineType.hasFiles ? '#f8f9fa' : '#fff5f5'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, color: '#021d3b', fontSize: '18px' }}>
                      {machineType.display}
                    </h3>
                    {!machineType.hasFiles && (
                      <span style={{
                        background: '#dc3545',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold'
                      }}>
                        MISSING
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {machineType.hasFiles && machineType.fileData.file_url && (
                      <button
                        style={{
                          background: 'linear-gradient(135deg, #4caf50, #45a049)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        onClick={() => downloadAllFilesForMachineType(machineType)}
                        title="Download all files for this machine type"
                      >
                        <Download size={12} />
                        Download Files
                      </button>
                    )}
                    {machineType.hasFiles && availableMachineTypes.filter(mt => mt.hasFiles).length > 1 && (
                      <button
                        style={{
                          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          opacity: deleteLoading[`${product._id}-${machineType.display}`] ? 0.6 : 1
                        }}
                        onClick={() => deleteMachineType(machineType.display)}
                        disabled={deleteLoading[`${product._id}-${machineType.display}`]}
                        title="Delete machine type"
                      >
                        {deleteLoading[`${product._id}-${machineType.display}`] ? 
                          <div style={loadingSpinnerStyle}></div> : 
                          <Trash2 size={12} />
                        }
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '14px', color: '#666' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>File Name:</strong> 
                    <div style={{ marginTop: '4px', fontSize: '12px' }}>
                      {(() => {
                        const { file_name } = machineType.fileData;
                        
                        if (!machineType.hasFiles) {
                          return (
                            <div style={{ 
                              color: '#dc3545', 
                              fontStyle: 'italic',
                              background: '#f8d7da',
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid #f5c6cb'
                            }}>
                              No files uploaded for this machine type yet. Admin needs to upload {machineType.display} format files.
                            </div>
                          );
                        }
                        
                        if (!file_name) return 'No filename';
                        
                        let fileNames = [];
                        if (typeof file_name === 'string') {
                          if (file_name.includes(',') || file_name.includes(';') || file_name.includes('|')) {
                            fileNames = file_name.split(/[,;|]/).map(name => name.trim()).filter(name => name);
                          } else if (file_name.includes('.jef') && file_name.split('.jef').length > 2) {
                            fileNames = file_name.split(/(?=\w+\.jef)/g).map(name => name.trim()).filter(name => name);
                          } else {
                            fileNames = [file_name];
                          }
                        } else if (Array.isArray(file_name)) {
                          fileNames = file_name;
                        } else {
                          fileNames = [String(file_name)];
                        }
                        
                        if (fileNames.length > 1) {
                          return (
                            <div>
                              <div style={{ color: '#007bff', fontWeight: 'bold', marginBottom: '8px' }}>
                                {fileNames.length} files available:
                              </div>
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '8px',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                padding: '8px',
                                background: '#f8f9fa',
                                borderRadius: '6px',
                                border: '1px solid #e9ecef'
                              }}>
                                {fileNames.map((name, index) => (
                                  <div 
                                    key={index} 
                                    style={{ 
                                      background: 'white',
                                      padding: '6px 10px',
                                      borderRadius: '4px',
                                      border: '1px solid #dee2e6',
                                      fontSize: '11px',
                                      color: '#495057',
                                      wordBreak: 'break-word',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <span style={{ 
                                      width: '6px', 
                                      height: '6px', 
                                      borderRadius: '50%', 
                                      background: '#28a745',
                                      flexShrink: 0
                                    }}></span>
                                    {name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        } else {
                          return <span>{fileNames[0] || 'No filename'}</span>;
                        }
                      })()}
                    </div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Status:</strong>{' '}
                    <span style={{ 
                      color: machineType.hasFiles ? '#4caf50' : '#f44336',
                      fontWeight: 'bold'
                    }}>
                      {machineType.hasFiles ? 'Available' : 'Missing - Needs Upload'}
                    </span>
                  </div>
                  {machineType.fileData.note && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Note:</strong> {machineType.fileData.note}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        width="1000px"
      >
        {modalState.type === 'editDesign' && (
          <EditDesignForm
            onClose={closeModal}
            onSubmit={editDesign}
            productData={modalState.data}
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminProductDetailsPage;
