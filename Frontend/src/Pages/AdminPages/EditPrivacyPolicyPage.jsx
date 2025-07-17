import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../Components/AdminHeader';
import { isAuthenticated, getAuthToken, getUserRole } from '../../utils/auth.js';
import { ArrowLeft, Save, Shield, Eye } from 'lucide-react';

const EditPrivacyPolicyPage = () => {
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
    
    setContent(`# Privacy Policy

## Information We Collect

We collect information you provide directly to us, such as when you:
- Create an account
- Make a purchase
- Contact us for support
- Subscribe to our newsletter

### Personal Information
- Name and email address
- Billing and shipping address
- Payment information (securely processed)
- Communication preferences

### Usage Information
- IP address and device information
- Browsing behavior on our website
- Purchase history and preferences

## How We Use Your Information

We use the information we collect to:
- Process and fulfill your orders
- Send you design files and order confirmations
- Provide customer support
- Improve our website and services
- Send marketing communications (with your consent)

## Information Sharing

We do not sell, trade, or rent your personal information to third parties. We may share information only in these situations:
- With service providers who help us operate our business
- To comply with legal obligations
- To protect our rights and property

## Data Security

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate information
- Delete your account and data
- Opt out of marketing communications

## Cookies

We use cookies to enhance your experience on our website. You can control cookie settings through your browser.

## Contact Us

If you have questions about this Privacy Policy, please contact us at privacy@ganeshembroidery.com

## Updates

This Privacy Policy may be updated from time to time. We will notify you of any significant changes.

Last updated: [DATE]`);
    
    setLoading(false);
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Privacy Policy updated successfully!');
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
    minHeight: '600px',
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
    minHeight: '600px',
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
            <Shield size={35} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            Edit Privacy Policy
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
            Privacy Policy Editor
          </h3>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Edit your privacy policy to ensure compliance with data protection regulations.
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
            placeholder="Enter your Privacy Policy content here..."
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
        border: '1px solid #fff3e0'
      }}>
        <h4 style={{ color: '#f57c00', margin: '0 0 10px 0' }}>
          ⚖️ Legal Compliance Guidelines
        </h4>
        <ul style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
          <li>Include all types of data you collect</li>
          <li>Explain how you use customer information</li>
          <li>Detail your data security measures</li>
          <li>Provide clear contact information</li>
          <li>Keep the language clear and accessible</li>
          <li>Update the "Last updated" date when making changes</li>
        </ul>
      </div>
    </div>
  );
};

export default EditPrivacyPolicyPage;
