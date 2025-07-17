import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../Components/Header';
import { isAuthenticated, getAuthToken } from '../../utils/auth.js';
import { ArrowLeft, CreditCard, Package, DollarSign, CheckCircle, Clock, AlertCircle, Shield } from 'lucide-react';

const url = import.meta.env.VITE_API_BASE_URL;

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (location.state) {
      setOrderDetails(location.state);
      setLoading(false);
    } else {
      navigate('/categories');
    }

    loadRazorpayScript();

    return () => {
      if (window.currentRzp) {
        window.currentRzp.close();
        window.currentRzp = null;
      }
    };
  }, [location.state, navigate]);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      alert('Failed to load payment gateway. Please refresh and try again.');
    };
    document.body.appendChild(script);
  };

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      alert('Payment gateway is still loading. Please wait and try again.');
      return;
    }

    setPaymentLoading(true);

    try {
      const token = getAuthToken();
      
      const response = await fetch(`${url}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: orderDetails.orderId,
          amount: orderDetails.totalAmount,
          currency: 'INR'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      const options = {
        key: data.key,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: 'SL Designers',
        description: `Payment for Order #${orderDetails.orderId}`,
        order_id: data.razorpayOrder.id,
        image: '/logo.png',
        handler: async (response) => {
          navigate('/my-orders', { 
            state: { 
              paymentSuccess: true, 
              orderId: orderDetails.orderId,
              showProcessingMessage: true,
              verifying: true
            }
          });
          
          try {
            await verifyPayment(response, data.paymentId);
          } catch (error) {
            
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        notes: {
          order_id: orderDetails.orderId
        },
        theme: {
          color: '#D8B46A'
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            window.currentRzp = null;
            handlePaymentFailure(data.razorpayOrder.id, null, { 
              code: 'PAYMENT_CANCELLED', 
              description: 'Payment was cancelled by user' 
            });
            navigate('/my-orders', {
              state: {
                paymentCancelled: true,
                orderId: orderDetails.orderId
              }
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      window.currentRzp = rzp;
      
      rzp.on('payment.failed', (response) => {
        setPaymentLoading(false);
        window.currentRzp = null;
        handlePaymentFailure(
          data.razorpayOrder.id, 
          response.error.metadata?.payment_id || null,
          response.error
        );
        setTimeout(() => {
          navigate('/my-orders', {
            state: {
              paymentFailed: true,
              orderId: orderDetails.orderId,
              errorMessage: response.error.description || 'Payment failed'
            }
          });
        }, 1000);
      });

      rzp.open();

      const fallbackTimeout = setTimeout(() => {
        if (paymentLoading) {
          setPaymentLoading(false);
          navigate('/my-orders', {
            state: {
              paymentTimeout: true,
              orderId: orderDetails.orderId
            }
          });
        }
      }, 30000);

      return () => clearTimeout(fallbackTimeout);

    } catch (error) {
      alert('Failed to initiate payment. Please try again.');
      setPaymentLoading(false);
    }
  };

  const verifyPayment = async (response, paymentId) => {
    try {
      const token = getAuthToken();
      
      const verifyResponse = await fetch(`${url}/payment/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          paymentId: paymentId
        })
      });

      const data = await verifyResponse.json();

      if (!data.success) {
        navigate('/my-orders', {
          state: {
            paymentVerificationFailed: true,
            orderId: orderDetails.orderId,
            errorMessage: data.error || 'Payment verification failed. Please contact support if amount was deducted.'
          }
        });
      }
    } catch (error) {
      navigate('/my-orders', {
        state: {
          paymentVerificationFailed: true,
          orderId: orderDetails.orderId,
          errorMessage: error.message || 'Payment verification failed. Please contact support if amount was deducted.'
        }
      });
    }
  };

  const handlePaymentFailure = async (razorpayOrderId, razorpayPaymentId, error) => {
    try {
      const token = getAuthToken();
      
      await fetch(`${url}/payment/failure`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          error: error
        })
      });
    } catch (err) {
      
    }
  };

  const handleBackToProduct = () => {
    navigate(-1);
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
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '20px'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    height: 'fit-content'
  };

  const paymentButtonStyle = {
    width: '100%',
    background: 'linear-gradient(135deg, #4caf50, #45a049)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '15px 20px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px'
  };

  const productItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '10px'
  };

  if (loading) {
    return (
      <div style={mainContainerStyle}>
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading payment details...</div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div style={mainContainerStyle}>
        <Header />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '24px', color: '#666', marginBottom: '20px' }}>
            Order details not found
          </div>
          <button style={backButtonStyle} onClick={() => navigate('/categories')}>
            <ArrowLeft size={20} />
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={mainContainerStyle}>
      <Header />
      
      <div style={headerStyle}>
        <button
          style={backButtonStyle}
          onClick={handleBackToProduct}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 style={{ margin: 0, color: '#021d3b', fontSize: '2.5rem' }}>
          Complete Your Payment
        </h1>
      </div>

      <div style={contentStyle}>
        <div style={cardStyle}>
          <h2 style={{ color: '#021d3b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={24} />
            Order Summary
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#666' }}>Order ID:</span>
              <span style={{ color: '#021d3b', fontWeight: 'bold' }}>{orderDetails.orderId}</span>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#021d3b', marginBottom: '15px' }}>Products:</h3>
            {orderDetails.products.map((product, index) => (
              <div key={index} style={productItemStyle}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#021d3b', marginBottom: '5px' }}>
                    {product.productName}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Machine Type: {product.machine_type}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Quantity: {product.quantity}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#4caf50', fontSize: '16px' }}>
                  ₹{product.price}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '2px solid #eee', paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
              <span style={{ color: '#021d3b' }}>Total Amount:</span>
              <span style={{ color: '#4caf50' }}>₹{orderDetails.totalAmount}</span>
            </div>
            <div style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
              Inclusive of all taxes
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ color: '#021d3b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={24} />
            Payment Options
          </h2>

          <div style={{ marginBottom: '30px' }}>
            <div style={{ 
              background: '#e8f5e8', 
              padding: '20px', 
              borderRadius: '10px', 
              border: '1px solid #4caf50',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Shield size={20} style={{ color: '#4caf50' }} />
                <span style={{ fontWeight: 'bold', color: '#4caf50' }}>Secure Payment with Razorpay</span>
              </div>
              <p style={{ color: '#2e7d32', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                Pay securely using Credit/Debit Cards, Net Banking, UPI, or Digital Wallets. 
                Your payment information is encrypted and secure.
              </p>
            </div>

            <div style={{ 
              background: '#fff3e0', 
              padding: '15px', 
              borderRadius: '8px', 
              border: '1px solid #ff9800',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                <AlertCircle size={16} style={{ color: '#ff9800' }} />
                <span style={{ fontWeight: 'bold', color: '#ff9800', fontSize: '14px' }}>What happens after payment?</span>
              </div>
              <ul style={{ color: '#f57c00', margin: '5px 0 0 26px', fontSize: '14px', lineHeight: '1.4' }}>
                <li>Payment will be processed instantly</li>
                <li>Your order status will be updated to "Paid"</li>
                <li>Design files will be prepared and sent via email</li>
                <li>You can track progress in "My Orders" section</li>
              </ul>
            </div>

            <div style={{
              background: '#f3e5f5',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #9c27b0',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '14px', color: '#7b1fa2', fontWeight: '500' }}>
                Supported Payment Methods:
              </div>
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Visa', 'Mastercard', 'UPI', 'Net Banking', 'Paytm', 'PhonePe', 'Google Pay'].map((method) => (
                  <span key={method} style={{
                    background: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#7b1fa2',
                    border: '1px solid #e1bee7'
                  }}>
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            style={{
              ...paymentButtonStyle,
              opacity: paymentLoading || !razorpayLoaded ? 0.7 : 1,
              cursor: paymentLoading || !razorpayLoaded ? 'not-allowed' : 'pointer'
            }}
            onClick={handlePayment}
            disabled={paymentLoading || !razorpayLoaded}
            onMouseEnter={(e) => {
              if (!paymentLoading && razorpayLoaded) {
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!paymentLoading && razorpayLoaded) {
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            <CreditCard size={20} />
            {paymentLoading ? 'Processing...' : !razorpayLoaded ? 'Loading Payment Gateway...' : `Pay ₹${orderDetails.totalAmount}`}
          </button>

          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <button
              style={{
                background: paymentLoading ? 'linear-gradient(135deg, #4caf50, #45a049)' : 'none',
                border: paymentLoading ? 'none' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                color: paymentLoading ? 'white' : '#666',
                fontSize: '14px',
                fontWeight: paymentLoading ? 'bold' : 'normal',
                transition: 'all 0.3s ease'
              }}
              onClick={() => navigate('/my-orders')}
              onMouseEnter={(e) => {
                if (!paymentLoading) {
                  e.target.style.background = '#f5f5f5';
                  e.target.style.borderColor = '#999';
                }
              }}
              onMouseLeave={(e) => {
                if (!paymentLoading) {
                  e.target.style.background = 'none';
                  e.target.style.borderColor = '#ddd';
                }
              }}
            >
              {paymentLoading ? '✓ Payment Started - View My Orders' : 'View My Orders'}
            </button>
          </div>

          {paymentLoading && (
            <div style={{
              textAlign: 'center',
              marginTop: '10px',
              padding: '10px',
              background: 'rgba(76, 175, 80, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(76, 175, 80, 0.3)'
            }}>
              <div style={{ color: '#4caf50', fontSize: '14px', fontWeight: 'bold' }}>
                Payment in progress...
              </div>
              <div style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
                Click "View My Orders" above to track your order status
              </div>
            </div>
          )}

          <div style={{ 
            textAlign: 'center', 
            marginTop: '20px', 
            fontSize: '12px', 
            color: '#999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}>
            🔒 Secured by Razorpay • SSL Encrypted • PCI DSS Compliant
          </div>

          <div style={{
            marginTop: '15px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#ccc'
          }}>
            By proceeding, you agree to our Terms & Conditions and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
