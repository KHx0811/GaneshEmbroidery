import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import { ArrowLeft, ShoppingCart, Heart, CreditCard, Mail, Download } from 'lucide-react';

const HowToBuyPage = () => {
  const navigate = useNavigate();

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
    background: 'white',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  };

  const stepStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    marginBottom: '30px',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '12px',
    border: '1px solid #e9ecef'
  };

  const stepNumberStyle = {
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: 'white',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    flexShrink: 0
  };

  const stepContentStyle = {
    flex: 1
  };

  const iconStyle = {
    marginRight: '8px',
    color: '#D8B46A'
  };

  return (
    <div style={mainContainerStyle}>
      <Header />
      
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            style={backButtonStyle}
            onClick={() => navigate('/')}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 style={{ margin: 0, color: '#021d3b', fontSize: '2.5rem' }}>
            How to Buy Embroidery Designs
          </h1>
        </div>
      </div>

      <div style={contentStyle}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#021d3b', fontSize: '1.8rem', marginBottom: '15px' }}>
            Simple Steps to Purchase Your Designs
          </h2>
          <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6' }}>
            Follow these easy steps to browse, select, and purchase professional embroidery designs for your projects.
          </p>
        </div>

        <div style={stepStyle}>
          <div style={stepNumberStyle}>1</div>
          <div style={stepContentStyle}>
            <h3 style={{ color: '#021d3b', fontSize: '1.3rem', marginBottom: '10px' }}>
              <ShoppingCart style={iconStyle} size={20} />
              Browse and Select Designs
            </h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '10px' }}>
              • Navigate through our categories (Kids, Simple, Boat Neck, Bride Designs)<br/>
              • Click on any design to view details and available machine formats<br/>
              • Each design shows compatible machine types (DST, JEF, PES formats)<br/>
              • Choose the machine format that matches your embroidery machine
            </p>
          </div>
        </div>

        <div style={stepStyle}>
          <div style={stepNumberStyle}>2</div>
          <div style={stepContentStyle}>
            <h3 style={{ color: '#021d3b', fontSize: '1.3rem', marginBottom: '10px' }}>
              <Heart style={iconStyle} size={20} />
              Add to Cart or Favorites
            </h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '10px' }}>
              • Click "Add to Cart" for the specific machine format you need<br/>
              • Use the heart icon (❤️) to save designs to your favorites for later<br/>
              • You can add multiple designs and formats to your cart<br/>
              • Review your selections in the cart before checkout
            </p>
          </div>
        </div>

        <div style={stepStyle}>
          <div style={stepNumberStyle}>3</div>
          <div style={stepContentStyle}>
            <h3 style={{ color: '#021d3b', fontSize: '1.3rem', marginBottom: '10px' }}>
              <CreditCard style={iconStyle} size={20} />
              Login and Checkout
            </h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '10px' }}>
              • Create an account or login to proceed with purchase<br/>
              • Review your cart items and total amount<br/>
              • Select the items you want to purchase (you can buy partially)<br/>
              • Click "Checkout" to place your order
            </p>
          </div>
        </div>

        <div style={stepStyle}>
          <div style={stepNumberStyle}>4</div>
          <div style={stepContentStyle}>
            <h3 style={{ color: '#021d3b', fontSize: '1.3rem', marginBottom: '10px' }}>
              <Mail style={iconStyle} size={20} />
              Order Processing
            </h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '10px' }}>
              • Your order will be processed and verified<br/>
              • You can track your order status in "My Orders" section<br/>
              • Orders are typically processed within 24-48 hours<br/>
              • You'll receive email updates about your order status
            </p>
          </div>
        </div>

        <div style={stepStyle}>
          <div style={stepNumberStyle}>5</div>
          <div style={stepContentStyle}>
            <h3 style={{ color: '#021d3b', fontSize: '1.3rem', marginBottom: '10px' }}>
              <Download style={iconStyle} size={20} />
              Receive Your Designs
            </h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '10px' }}>
              • Once processed, design files will be sent to your email<br/>
              • Files will be in the format you selected (DST, JEF, or PES)<br/>
              • Download and save the files to your computer<br/>
              • Transfer files to your embroidery machine and start creating!
            </p>
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #D8B46A, #E6C77A)', 
          color: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          marginTop: '30px'
        }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Important Notes:</h3>
          <ul style={{ fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
            <li>Make sure to select the correct machine format for your embroidery machine</li>
            <li>Keep your design files backed up in a safe location</li>
            <li>Contact our support team if you need help with formats or have questions</li>
            <li>All designs are for personal and commercial use unless specified otherwise</li>
          </ul>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            style={{
              background: 'linear-gradient(135deg, #4caf50, #45a049)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => navigate('/categories')}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Start Shopping Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowToBuyPage;
