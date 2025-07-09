import React, { useEffect } from 'react';
import { setAuthToken } from '../utils/auth';

const AuthSuccess = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      setAuthToken(token);
      
      alert('Google Sign-In successful!');
      
      window.location.href = '/';
    } else {
      alert('Authentication failed. Please try again.');
      window.location.href = '/login';
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #021D3B 0%, #0B2F4A 50%, #1A4B73 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Lato, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          GE
        </div>
        <h2 style={{ color: '#021D3B', marginBottom: '10px' }}>
          Processing Authentication...
        </h2>
        <p style={{ color: '#666' }}>
          Please wait while we complete your sign-in.
        </p>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #D8B46A',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '20px auto'
        }} />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default AuthSuccess;
