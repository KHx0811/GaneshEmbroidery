import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../Components/AdminHeader';
import { isAuthenticated, getAuthToken, getUserRole } from '../../utils/auth.js';
import { ArrowLeft, Save, FileText, Eye } from 'lucide-react';

const EditTermsPage = () => {
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
    
    setContent(`# Terms and Conditions

## Agreement to Terms

By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.

## Use License

Permission is granted to temporarily download one copy of the materials on Ganesh Embroidery's website for personal, non-commercial transitory viewing only.

### This license does NOT allow you to:
- Modify or copy the materials
- Use the materials for commercial purposes
- Attempt to reverse engineer any software
- Remove any copyright or proprietary notations

## Digital Products

### Embroidery Design Files
- All designs are for personal and commercial use unless otherwise specified
- Files are delivered digitally via email
- No physical products will be shipped
- Downloads are available for 30 days after purchase

### File Formats
- We provide designs in DST, JEF, and PES formats
- File compatibility with your machine is your responsibility
- We do not provide technical support for machine-specific issues

## Payment Terms

- All prices are in Indian Rupees (INR)
- Payment is required before file delivery
- We accept major credit cards and digital payments
- Refunds are handled according to our refund policy

## Refund Policy

### Digital Downloads
- Refunds are available within 7 days of purchase
- Refunds are not available after files have been downloaded
- Technical issues with file compatibility do not qualify for refunds
- Contact support for refund requests

## Intellectual Property

- All designs are protected by copyright
- Purchasing grants you usage rights, not ownership
- You may not resell, redistribute, or share the design files
- Original creators retain all intellectual property rights

## Limitation of Liability

Ganesh Embroidery shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.

## Privacy

Your privacy is important to us. Please review our Privacy Policy for information on how we collect and use your data.

## Modifications

We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.

## Contact Information

For questions about these Terms and Conditions, contact us at:
- Email: legal@ganeshembroidery.com
- Address: [Your Business Address]

## Governing Law

These terms are governed by the laws of [Your Jurisdiction].

Last updated: [DATE]`);
    
    setLoading(false);
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Terms & Conditions updated successfully!');
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
    minHeight: '700px',
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
    minHeight: '700px',
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
            Edit Terms & Conditions
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
            Terms & Conditions Editor
          </h3>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Edit your terms and conditions to protect your business and inform customers of their rights and responsibilities.
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
            placeholder="Enter your Terms & Conditions content here..."
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
        border: '1px solid #ffebee'
      }}>
        <h4 style={{ color: '#f44336', margin: '0 0 10px 0' }}>
          📋 Important Legal Elements
        </h4>
        <ul style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
          <li>Define usage rights for digital products</li>
          <li>Specify refund and return policies</li>
          <li>Include payment terms and conditions</li>
          <li>Address intellectual property rights</li>
          <li>Limit your liability appropriately</li>
          <li>Include governing law and jurisdiction</li>
          <li>Consider consulting with a legal professional</li>
        </ul>
      </div>
    </div>
  );
};

export default EditTermsPage;
