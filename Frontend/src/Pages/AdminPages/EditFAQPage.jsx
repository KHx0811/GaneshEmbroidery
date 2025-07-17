import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../Components/AdminHeader';
import { isAuthenticated, getAuthToken, getUserRole } from '../../utils/auth.js';
import { ArrowLeft, Save, HelpCircle, Eye, Plus, Trash2 } from 'lucide-react';

const EditFAQPage = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || getUserRole() !== 'admin') {
      navigate('/login');
      return;
    }
    
    setFaqs([
      {
        id: 1,
        question: "What file formats do you provide?",
        answer: "We provide embroidery designs in DST, JEF, and PES formats. These formats are compatible with most embroidery machines."
      },
      {
        id: 2,
        question: "How do I download my purchased designs?",
        answer: "After completing your purchase, you'll receive an email with download links. The download links are valid for 30 days."
      },
      {
        id: 3,
        question: "Can I use the designs for commercial purposes?",
        answer: "Yes, most of our designs come with commercial usage rights. Please check the specific design details for any restrictions."
      },
      {
        id: 4,
        question: "What if the design doesn't work with my machine?",
        answer: "Please ensure you download the correct format for your machine. If you experience issues, contact our support team within 7 days of purchase."
      },
      {
        id: 5,
        question: "Do you offer refunds?",
        answer: "We offer refunds within 7 days of purchase, provided the files haven't been downloaded. Please contact support for refund requests."
      }
    ]);
    
    setLoading(false);
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('FAQ updated successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addFAQ = () => {
    const newFAQ = {
      id: Date.now(),
      question: "",
      answer: ""
    };
    setFaqs([...faqs, newFAQ]);
  };

  const deleteFAQ = (id) => {
    setFaqs(faqs.filter(faq => faq.id !== id));
  };

  const updateFAQ = (id, field, value) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, [field]: value } : faq
    ));
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

  const addButtonStyle = {
    ...actionButtonStyle,
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: '#021D3B',
    boxShadow: '0 4px 15px rgba(216, 180, 106, 0.3)'
  };

  const editorStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  };

  const faqItemStyle = {
    border: '2px solid #e1e5e9',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    position: 'relative'
  };

  const inputStyle = {
    width: '100%',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    marginBottom: '15px',
    outline: 'none',
    transition: 'border-color 0.3s ease'
  };

  const textareaStyle = {
    width: '100%',
    minHeight: '100px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.3s ease'
  };

  const deleteButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  };

  const previewFAQStyle = {
    border: '1px solid #e1e5e9',
    borderRadius: '10px',
    marginBottom: '15px',
    overflow: 'hidden'
  };

  const previewQuestionStyle = {
    background: '#f8f9fa',
    padding: '15px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#021d3b',
    border: 'none',
    cursor: 'pointer'
  };

  const previewAnswerStyle = {
    padding: '15px 20px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#666',
    background: 'white'
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
            <HelpCircle size={35} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
            Edit FAQ
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            style={addButtonStyle}
            onClick={addFAQ}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Plus size={16} />
            Add FAQ
          </button>
          
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
            FAQ Management
          </h3>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Manage frequently asked questions to help your customers find answers quickly.
          </p>
        </div>

        {isPreview ? (
          <div>
            <h3 style={{ color: '#021d3b', marginBottom: '20px' }}>Preview</h3>
            {faqs.map((faq, index) => (
              faq.question && faq.answer && (
                <div key={faq.id} style={previewFAQStyle}>
                  <div style={previewQuestionStyle}>
                    Q{index + 1}: {faq.question}
                  </div>
                  <div style={previewAnswerStyle}>
                    {faq.answer}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div>
            {faqs.map((faq, index) => (
              <div key={faq.id} style={faqItemStyle}>
                {faqs.length > 1 && (
                  <button
                    style={deleteButtonStyle}
                    onClick={() => deleteFAQ(faq.id)}
                    onMouseEnter={(e) => e.target.style.background = '#d32f2f'}
                    onMouseLeave={(e) => e.target.style.background = '#f44336'}
                    title="Delete FAQ"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#021d3b' }}>
                  Question {index + 1}:
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  value={faq.question}
                  onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                  placeholder="Enter your question here..."
                  onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
                
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#021d3b' }}>
                  Answer:
                </label>
                <textarea
                  style={textareaStyle}
                  value={faq.answer}
                  onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                  placeholder="Enter the answer here..."
                  onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '20px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e8f5e8'
      }}>
        <h4 style={{ color: '#4caf50', margin: '0 0 10px 0' }}>
          💡 FAQ Best Practices
        </h4>
        <ul style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
          <li>Keep questions clear and specific</li>
          <li>Provide complete and helpful answers</li>
          <li>Cover common customer concerns (payment, delivery, formats)</li>
          <li>Update regularly based on customer feedback</li>
          <li>Use simple language that's easy to understand</li>
          <li>Organize from most to least common questions</li>
        </ul>
      </div>
    </div>
  );
};

export default EditFAQPage;
