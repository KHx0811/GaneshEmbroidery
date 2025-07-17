import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../Components/AdminHeader';
import { isAuthenticated, getAuthToken, getUserRole } from '../../utils/auth.js';
import { ArrowLeft, Save, FileText, Eye } from 'lucide-react';

const EditHowToBuyPage = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || getUserRole() !== 'admin') {
      navigate('/login');
      return;
    }
    
    setContent(`# How to Buy - Step by Step Guide

## Welcome to Our Embroidery Design Store

Follow these simple steps to purchase and download your favorite embroidery designs:

### Step 1: Browse Categories
- Visit our Categories page to explore different design types
- Use the search feature to find specific designs
- Click on any design to view details and available formats

### Step 2: Select Format & Add to Cart
- Choose your embroidery machine format (DST, JEF, PES)
- Click "Add to Cart" for your desired format
- Continue shopping or proceed to checkout

### Step 3: Login and Checkout
- Create an account or login to proceed with purchase
- Review your cart items and total amount
- Click "Checkout" to place your order

### Step 4: Make Payment
- Choose your preferred payment method
- Complete the secure payment process
- You'll receive a confirmation email

### Step 5: Download Your Designs
- Check your email for download links
- Download your embroidery files
- Transfer to your embroidery machine and start creating!

## Need Help?
Contact our support team if you have any questions about the purchasing process.`);
    
    setLoading(false);
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('How to Buy content updated successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setSaving(false);
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
    background: 'linear-gradient(135deg, #2196f3, #1976d2)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)'
  };

  const actionButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginLeft: '10px'
  };

  const saveButtonStyle = {
    ...actionButtonStyle,
    background: saving ? '#ccc' : 'linear-gradient(135deg, #4caf50, #45a049)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
  };

  const previewButtonStyle = {
    ...actionButtonStyle,
    background: isPreview ? 'linear-gradient(135deg, #ff9800, #f57c00)' : 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
    color: 'white',
    boxShadow: isPreview ? '0 4px 15px rgba(255, 152, 0, 0.3)' : '0 4px 15px rgba(156, 39, 176, 0.3)'
  };

  const editorStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  };

  const textareaStyle = {
    width: '100%',
    minHeight: '500px',
    border: '2px solid #e1e5e9',
    borderRadius: '10px',
    padding: '20px',
    fontSize: '14px',
    fontFamily: 'monospace',
    lineHeight: '1.6',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.3s ease'
  };

  const previewStyle = {
    width: '100%',
    minHeight: '500px',
    border: '2px solid #e1e5e9',
    borderRadius: '10px',
    padding: '20px',
    fontSize: '14px',
    lineHeight: '1.6',
    backgroundColor: '#f8f9fa',
    whiteSpace: 'pre-wrap'
  };

  if (loading) {
    return (
      <div style={mainContainerStyle}>
        <AdminHeader />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading content...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={mainContainerStyle}>
      <AdminHeader />
      
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            style={backButtonStyle}
            onClick={() => navigate('/admin')}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 style={{ margin: 0, color: '#021d3b', fontSize: '2.5rem' }}>
            <FileText size={35} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            Edit How to Buy Page
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            style={previewButtonStyle}
            onClick={() => setIsPreview(!isPreview)}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Eye size={16} />
            {isPreview ? 'Edit Mode' : 'Preview'}
          </button>
          
          <button
            style={saveButtonStyle}
            onClick={handleSave}
            disabled={saving}
            onMouseEnter={(e) => !saving && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !saving && (e.target.style.transform = 'translateY(0)')}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={editorStyle}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#021d3b', marginBottom: '10px' }}>
            Content Editor
          </h3>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Edit the How to Buy page content below. You can use Markdown formatting for better presentation.
          </p>
        </div>

        {isPreview ? (
          <div style={previewStyle}>
            {content}
          </div>
        ) : (
          <textarea
            style={textareaStyle}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your How to Buy content here..."
            onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
        )}
      </div>

      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '20px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e3f2fd'
      }}>
        <h4 style={{ color: '#1976d2', margin: '0 0 10px 0' }}>
          💡 Content Guidelines
        </h4>
        <ul style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
          <li>Use clear, step-by-step instructions</li>
          <li>Include helpful tips for new customers</li>
          <li>Mention supported file formats and machine types</li>
          <li>Provide contact information for support</li>
          <li>Keep language simple and friendly</li>
        </ul>
      </div>
    </div>
  );
};

export default EditHowToBuyPage;
