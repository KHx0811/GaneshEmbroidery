import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, ArrowLeft } from 'lucide-react';

const TwoFactorLogin = ({ email, userId, sessionId, isGoogleAuth, onBack }) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    console.log('TwoFactorLogin mounted with props:', { email, userId, sessionId, isGoogleAuth });
    sendOTP();
  }, []);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const sendOTP = async () => {
    console.log('Sending OTP with isGoogleAuth:', isGoogleAuth, 'sessionId:', sessionId);
    setIsLoading(true);
    setError('');
    
    try {
      const url = import.meta.env.VITE_API_BASE_URL;
      console.log('API Base URL:', url);
      
      const endpoint = isGoogleAuth 
        ? '/auth/send-google-login-otp'
        : '/auth/send-login-otp';
      
      const requestBody = isGoogleAuth 
        ? { sessionId }
        : { email };

      console.log('Making request to:', `${url}${endpoint}`, 'with body:', requestBody);

      const response = await fetch(`${url}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('OTP Response:', data);

      if (response.ok) {
        setOtpSent(true);
        setTimer(300);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const url = import.meta.env.VITE_API_BASE_URL;
      
      const endpoint = isGoogleAuth 
        ? '/auth/verify-google-login-otp'
        : '/auth/verify-login-otp';
      
      const requestBody = isGoogleAuth 
        ? { sessionId, otp }
        : { userId, otp };

      const response = await fetch(`${url}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('userRole', data.data.user.role);
        
        if (data.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const containerStyle = {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '40px 30px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    textAlign: 'center',
    position: 'relative',
    zIndex: 100,
    pointerEvents: 'auto'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
    color: '#021D3B'
  };

  const inputStyle = {
    width: '100%',
    padding: '15px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '18px',
    textAlign: 'center',
    letterSpacing: '5px',
    margin: '20px 0',
    fontWeight: 'bold',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
    color: '#333',
    zIndex: 10,
    position: 'relative'
  };

  const buttonStyle = {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: '#021D3B',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
    transition: 'all 0.3s ease',
    zIndex: 10,
    position: 'relative',
    outline: 'none'
  };

  const secondaryButtonStyle = {
    background: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    margin: '10px 5px',
    transition: 'all 0.3s ease',
    zIndex: 10,
    position: 'relative',
    outline: 'none'
  };

  const errorStyle = {
    color: '#f44336',
    fontSize: '14px',
    marginTop: '10px'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <Shield size={32} color="#D8B46A" />
        <h2 style={{ margin: 0 }}>Two-Factor Authentication</h2>
      </div>

      <p style={{ color: '#666', marginBottom: '20px' }}>
        We've sent a 6-digit verification code to:
      </p>
      <p style={{ fontWeight: 'bold', color: '#021D3B', marginBottom: '20px' }}>
        {isGoogleAuth ? 'your Google account email' : email}
      </p>

      {otpSent && (
        <>
          <input
            type="text"
            style={inputStyle}
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                verifyOTP();
              }
            }}
            placeholder="000000"
            maxLength="6"
            autoComplete="off"
            autoFocus={true}
          />

          {timer > 0 && (
            <p style={{ fontSize: '14px', color: '#666' }}>
              Code expires in: <strong>{formatTime(timer)}</strong>
            </p>
          )}

          {error && <p style={errorStyle}>{error}</p>}

          <button
            style={buttonStyle}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              verifyOTP();
            }}
            disabled={isLoading || !otp || otp.length !== 6}
            type="button"
          >
            {isLoading ? 'Verifying...' : 'Verify & Login'}
          </button>

          <div style={{ marginTop: '20px' }}>
            {timer === 0 && (
              <button
                style={secondaryButtonStyle}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sendOTP();
                }}
                disabled={isLoading}
                type="button"
              >
                <Mail size={16} style={{ marginRight: '5px' }} />
                Resend Code
              </button>
            )}
            
            <button
              style={secondaryButtonStyle}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBack();
              }}
              type="button"
            >
              <ArrowLeft size={16} style={{ marginRight: '5px' }} />
              Back to Login
            </button>
          </div>
        </>
      )}

      {!otpSent && isLoading && (
        <div style={{ padding: '20px' }}>
          <p>Sending verification code...</p>
        </div>
      )}
    </div>
  );
};

export default TwoFactorLogin;
