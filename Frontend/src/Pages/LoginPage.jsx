import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { API_BASE_URL, setAuthToken, isAuthenticated, getUserRole, getUserInfo } from '../utils/auth';
import TwoFactorLogin from '../Components/TwoFactorLogin.jsx';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState({ 
    email: '', 
    userId: '', 
    sessionId: '', 
    isGoogleAuth: false 
  });
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      const userRole = getUserRole();
      if (userRole === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const error = urlParams.get('error');
    const requires2FA = urlParams.get('requires2FA');
    const sessionId = urlParams.get('sessionId');
    const type = urlParams.get('type');
    
    console.log('URL Parameters:', { tokenFromUrl, error, requires2FA, sessionId, type });
    
    if (tokenFromUrl) {
      setAuthToken(tokenFromUrl);
      // Remove token from URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        const userRole = getUserRole();
        if (userRole === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      }, 1000);
    } else if (requires2FA === 'true' && sessionId && type === 'google') {
      console.log('Google 2FA required, sessionId:', sessionId);
      console.log('Setting twoFactorData and show2FA to true');
      setTwoFactorData({
        email: 'Google Account',
        userId: '',
        sessionId: sessionId,
        isGoogleAuth: true
      });
      setShow2FA(true);
      console.log('State updated for 2FA');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      let errorMessage = 'Google Sign-In failed.';
      if (error === 'server_error') {
        errorMessage = 'Server error occurred during authentication.';
      } else if (error === 'auth_failed') {
        errorMessage = 'Authentication failed. Please try again.';
      }
      alert(errorMessage);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!isLogin && !formData.username) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const requestBody = isLogin 
        ? { 
            username: formData.email,
            password: formData.password 
          }
        : {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            retypedPassword: formData.confirmPassword
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        if (isLogin) {
          if (data.data?.requires2FA) {
            setTwoFactorData({
              email: data.data.email,
              userId: data.data.userId
            });
            setShow2FA(true);
            return;
          }
          
          if (data.data?.token) {
            setAuthToken(data.data.token);
            alert(`Login successful! Welcome ${data.data.user.username}`);
            setTimeout(() => {
              const userRole = getUserRole();
              if (userRole === 'admin') {
                window.location.href = '/admin';
              } else {
                window.location.href = '/';
              }
            }, 1000);
          }
        } else if (!isLogin) {
          // Success message for registration without showing token
          alert('Registration successful! Please log in with your credentials.');
          setIsLogin(true);
          setFormData({
            email: formData.email,
            username: '',
            password: '',
            confirmPassword: ''
          });
        }
      } else {
        alert(data.message || 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      window.location.href = `${API_BASE_URL}/auth/google`;
    } catch (error) {
      console.error('Google Sign-In error:', error);
      alert('Google Sign-In failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const handleBack2FA = () => {
    setShow2FA(false);
    setTwoFactorData({ 
      email: '', 
      userId: '', 
      sessionId: '', 
      isGoogleAuth: false 
    });
    setFormData(prev => ({ ...prev, password: '' }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #021D3B 0%, #0B2F4A 50%, #1A4B73 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Lato, sans-serif'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D8B46A' fill-opacity='0.05'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.1
      }} />

      {show2FA ? (
        <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {console.log('Rendering TwoFactorLogin with:', twoFactorData)}
          <TwoFactorLogin 
            email={twoFactorData.email}
            userId={twoFactorData.userId}
            sessionId={twoFactorData.sessionId}
            isGoogleAuth={twoFactorData.isGoogleAuth}
            onBack={handleBack2FA}
          />
        </div>
      ) : (
        <>
          <button
            onClick={handleBackToHome}
            style={{
              position: 'absolute',
              top: '30px',
              left: '30px',
              background: 'rgba(216, 180, 106, 0.1)',
              border: '2px solid #D8B46A',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D8B46A',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#D8B46A';
              e.target.style.color = '#021D3B';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(216, 180, 106, 0.1)';
              e.target.style.color = '#D8B46A';
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '40px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                GE
              </div>
              <h1 style={{
                color: '#021D3B',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p style={{
                color: '#666',
                margin: '5px 0 0 0'
              }}>
                {isLogin ? 'Sign in to your account' : 'Join Ganesh Embroidery today'}
              </p>
            </div>

            <div style={{
              display: 'flex',
              background: '#f5f5f5',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '30px'
            }}>
              <button
                onClick={() => setIsLogin(true)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: isLogin ? '#021D3B' : 'transparent',
                  color: isLogin ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: !isLogin ? '#021D3B' : 'transparent',
                  color: !isLogin ? 'white' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Sign Up
              </button>
            </div>

            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Mail size={20} style={{
                    position: 'absolute',
                    left: '15px',
                    color: '#D8B46A',
                    zIndex: 1
                  }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email address"
                    style={{
                      width: '100%',
                      padding: '15px 15px 15px 50px',
                      border: errors.email ? '2px solid #ff4444' : '2px solid #e0e0e0',
                      borderRadius: '10px',
                      fontSize: '16px',
                      background: 'white',
                      transition: 'border-color 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
                    onBlur={(e) => e.target.style.borderColor = errors.email ? '#ff4444' : '#e0e0e0'}
                  />
                </div>
                {errors.email && <p style={{ color: '#ff4444', fontSize: '14px', margin: '5px 0 0 0' }}>{errors.email}</p>}
              </div>

              {!isLogin && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <User size={20} style={{
                      position: 'absolute',
                      left: '15px',
                      color: '#D8B46A',
                      zIndex: 1
                    }} />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Username"
                      style={{
                        width: '100%',
                        padding: '15px 15px 15px 50px',
                        border: errors.username ? '2px solid #ff4444' : '2px solid #e0e0e0',
                        borderRadius: '10px',
                        fontSize: '16px',
                        background: 'white',
                        transition: 'border-color 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
                      onBlur={(e) => e.target.style.borderColor = errors.username ? '#ff4444' : '#e0e0e0'}
                    />
                  </div>
                  {errors.username && <p style={{ color: '#ff4444', fontSize: '14px', margin: '5px 0 0 0' }}>{errors.username}</p>}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Lock size={20} style={{
                    position: 'absolute',
                    left: '15px',
                    color: '#D8B46A',
                    zIndex: 1
                  }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    style={{
                      width: '100%',
                      padding: '15px 50px 15px 50px',
                      border: errors.password ? '2px solid #ff4444' : '2px solid #e0e0e0',
                      borderRadius: '10px',
                      fontSize: '16px',
                      background: 'white',
                      transition: 'border-color 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
                    onBlur={(e) => e.target.style.borderColor = errors.password ? '#ff4444' : '#e0e0e0'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '15px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#D8B46A'
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p style={{ color: '#ff4444', fontSize: '14px', margin: '5px 0 0 0' }}>{errors.password}</p>}
              </div>

              {!isLogin && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Lock size={20} style={{
                      position: 'absolute',
                      left: '15px',
                      color: '#D8B46A',
                      zIndex: 1
                    }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm Password"
                      style={{
                        width: '100%',
                        padding: '15px 50px 15px 50px',
                        border: errors.confirmPassword ? '2px solid #ff4444' : '2px solid #e0e0e0',
                        borderRadius: '10px',
                        fontSize: '16px',
                        background: 'white',
                        transition: 'border-color 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#D8B46A'}
                      onBlur={(e) => e.target.style.borderColor = errors.confirmPassword ? '#ff4444' : '#e0e0e0'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#D8B46A'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p style={{ color: '#ff4444', fontSize: '14px', margin: '5px 0 0 0' }}>{errors.confirmPassword}</p>}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: isLoading ? '#ccc' : 'linear-gradient(135deg, #021D3B, #1A4B73)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  marginBottom: '20px'
                }}
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '20px 0',
              color: '#666'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
              <span style={{ padding: '0 15px', fontSize: '14px' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '15px',
                background: 'white',
                color: '#333',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.borderColor = '#D8B46A';
                  e.target.style.boxShadow = '0 4px 12px rgba(216, 180, 106, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-2.7.75c-2.09 0-3.86-1.4-4.49-3.29H1.83v2.07A8 8 0 0 0 8.98 17Z"/>
                <path fill="#FBBC05" d="M4.49 10.48A4.8 4.8 0 0 1 4.25 9a4.8 4.8 0 0 1 .24-1.48V5.45H1.83A8 8 0 0 0 .98 9c0 1.3.31 2.52.85 3.55l2.66-2.07Z"/>
                <path fill="#EA4335" d="M8.98 4.23c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 8.98 1 8 8 0 0 0 1.83 5.45L4.5 7.52C5.12 5.63 6.89 4.23 8.98 4.23Z"/>
              </svg>
              Continue with Google
            </button>

            <p style={{
              textAlign: 'center',
              color: '#666',
              fontSize: '14px',
              marginTop: '20px'
            }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#D8B46A',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '14px'
                }}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginPage;