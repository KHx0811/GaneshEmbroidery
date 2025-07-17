import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import { isAuthenticated, getAuthToken, logout } from '../../utils/auth.js';
import { apiRequest } from '../../utils/api.js';
import { User, Mail, Lock, Shield, Eye, EyeOff, Check, X } from 'lucide-react';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showAccountVerification, setShowAccountVerification] = useState(false);
  const [accountVerificationOtp, setAccountVerificationOtp] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailData, setEmailData] = useState({
    newEmail: '',
    otp: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadUserProfile();
  }, [navigate]);

  const loadUserProfile = async () => {
    try {
      const token = getAuthToken();
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const response = await apiRequest('/auth/profile');
      if (response.status === 'success') {
        const userData = response.data.user;
        setUser(userData);
        
        console.log('User data loaded:', userData);
        console.log('isVerified:', userData.isVerified);
        console.log('authProvider:', userData.authProvider);
        
        // Check if user is OAuth user from API response or token
        const isOAuth = userData.authProvider === 'google' || 
                       payload.oauth || 
                       payload.provider === 'google' || 
                       payload.authProvider === 'google';
        setIsOAuthUser(isOAuth);
        console.log('isOAuthUser:', isOAuth);
      } else {
        // Fallback to token data
        const isOAuth = payload.oauth || payload.provider === 'google' || payload.authProvider === 'google';
        setIsOAuthUser(isOAuth);
        
        setUser({
          username: payload.username || payload.user || 'User',
          email: payload.email || '',
          role: payload.role || 'user',
          isVerified: payload.isVerified || false,
          authProvider: payload.authProvider || 'local'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      const token = getAuthToken();
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isOAuth = payload.oauth || payload.provider === 'google' || payload.authProvider === 'google';
        setIsOAuthUser(isOAuth);
        
        setUser({
          username: payload.username || payload.user || 'User',
          email: payload.email || '',
          role: payload.role || 'user',
          isVerified: payload.isVerified || false,
          authProvider: payload.authProvider || 'local'
        });
      } catch (tokenError) {
        console.error('Error decoding token:', tokenError);
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.status === 'success') {
        setMessage({ type: 'success', text: 'Password changed successfully' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowChangePassword(false);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error changing password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmailOTP = async () => {
    if (!emailData.newEmail) {
      setMessage({ type: 'error', text: 'Please enter a new email address' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest('/auth/send-email-verification', {
        method: 'POST',
        body: JSON.stringify({ newEmail: emailData.newEmail })
      });

      if (response.status === 'success') {
        setOtpSent(true);
        setMessage({ type: 'success', text: 'OTP sent to your new email address' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to send OTP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error sending OTP' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!emailData.otp) {
      setMessage({ type: 'error', text: 'Please enter the OTP' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest('/auth/verify-email-change', {
        method: 'POST',
        body: JSON.stringify({
          newEmail: emailData.newEmail,
          otp: emailData.otp
        })
      });

      if (response.status === 'success') {
        setMessage({ type: 'success', text: 'Email updated successfully' });
        setEmailData({ newEmail: '', otp: '' });
        setOtpSent(false);
        setShowEmailVerification(false);
        loadUserProfile(); // Reload profile to get updated email
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to verify email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error verifying email' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAccountVerification = async () => {
    console.log('handleSendAccountVerification called');
    console.log('Current user:', user);
    console.log('Current isOAuthUser:', isOAuthUser);
    console.log('Current showAccountVerification:', showAccountVerification);
    
    setIsSubmitting(true);
    try {
      const response = await apiRequest('/auth/send-account-verification', {
        method: 'POST'
      });

      if (response.status === 'success') {
        console.log('Setting showAccountVerification to true');
        setShowAccountVerification(true);
        setMessage({ type: 'success', text: 'Verification OTP sent to your email' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to send verification OTP' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error sending verification OTP' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAccount = async (e) => {
    e.preventDefault();
    if (!accountVerificationOtp) {
      setMessage({ type: 'error', text: 'Please enter the OTP' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest('/auth/verify-account', {
        method: 'POST',
        body: JSON.stringify({ otp: accountVerificationOtp })
      });

      if (response.status === 'success') {
        setMessage({ type: 'success', text: 'Account verified successfully' });
        setAccountVerificationOtp('');
        setShowAccountVerification(false);
        loadUserProfile(); // Reload profile to update verification status
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to verify account' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error verifying account' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '100px' }}>
        <Header />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading profile...
        </div>
        <Footer />
      </div>
    );
  }

  const containerStyle = {
    minHeight: '100vh',
    paddingTop: '120px',
    paddingBottom: '40px',
    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
  };

  const profileCardStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  };

  const headerSectionStyle = {
    background: 'linear-gradient(135deg, #2c3e50, #34495e)',
    padding: '40px 30px',
    textAlign: 'center',
    color: 'white'
  };

  const avatarStyle = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: '48px',
    fontWeight: 'bold',
    color: 'white',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
  };

  const sectionStyle = {
    padding: '30px',
    borderBottom: '1px solid #eee'
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const infoItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid #f5f5f5'
  };

  const buttonStyle = {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(216, 180, 106, 0.3)'
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
  };

  const formStyle = {
    background: '#f8f9fa',
    padding: '25px',
    borderRadius: '15px',
    marginTop: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e1e5e9',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '15px',
    transition: 'all 0.3s ease'
  };

  const passwordInputContainerStyle = {
    position: 'relative',
    marginBottom: '15px'
  };

  const eyeIconStyle = {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#666'
  };

  const messageStyle = {
    padding: '12px 20px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '500'
  };

  const successMessageStyle = {
    ...messageStyle,
    background: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  };

  const errorMessageStyle = {
    ...messageStyle,
    background: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  };

  return (
    <div style={containerStyle}>
      <Header />
      
      <div style={{ padding: '0 20px' }}>
        <div style={profileCardStyle}>
          {/* Profile Header */}
          <div style={headerSectionStyle}>
            <div style={avatarStyle}>
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h1 style={{ fontSize: '28px', margin: '0 0 10px 0' }}>
              {user?.username || 'User'}
            </h1>
            <p style={{ opacity: 0.8, margin: 0 }}>
              {user?.role === 'admin' ? 'Administrator' : 'Customer'}
            </p>
            {isOAuthUser && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 16px',
                borderRadius: '20px',
                marginTop: '15px',
                fontSize: '14px'
              }}>
                <Shield size={16} style={{ marginRight: '8px' }} />
                Google Account
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <User size={20} />
              Profile Information
            </h2>
            
            <div style={infoItemStyle}>
              <div>
                <strong>Username:</strong>
                <div style={{ color: '#666', fontSize: '14px' }}>{user?.username}</div>
              </div>
            </div>
            
            <div style={infoItemStyle}>
              <div>
                <strong>Email:</strong>
                <div style={{ color: '#666', fontSize: '14px' }}>{user?.email}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {user?.isVerified ? (
                  <span style={{ color: '#28a745', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Check size={16} />
                    Verified
                  </span>
                ) : (
                  <span style={{ color: '#ffc107', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <X size={16} />
                    Not Verified
                  </span>
                )}
                {!isOAuthUser && !user?.isVerified && (
                  <button 
                    style={{...buttonStyle, background: '#28a745'}}
                    onClick={handleSendAccountVerification}
                    disabled={isSubmitting}
                  >
                    Verify Account
                  </button>
                )}
                {!isOAuthUser && (
                  <button 
                    style={buttonStyle}
                    onClick={() => setShowEmailVerification(!showEmailVerification)}
                  >
                    Change Email
                  </button>
                )}
              </div>
            </div>
            
            <div style={infoItemStyle}>
              <div>
                <strong>Account Type:</strong>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  {user?.authProvider === 'google' ? 'Google OAuth Account' : 'Regular Account'}
                  {user?.authProvider === 'google' && (
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                      Password and email managed by Google
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          {!isOAuthUser && (
            <div style={sectionStyle}>
              <h2 style={sectionTitleStyle}>
                <Lock size={20} />
                Security Settings
              </h2>
              
              <div style={infoItemStyle}>
                <div>
                  <strong>Password:</strong>
                  <div style={{ color: '#666', fontSize: '14px' }}>Last changed recently</div>
                </div>
                <button 
                  style={buttonStyle}
                  onClick={() => setShowChangePassword(!showChangePassword)}
                >
                  Change Password
                </button>
              </div>
            </div>
          )}

          {/* Change Password Form */}
          {showChangePassword && !isOAuthUser && (
            <div style={sectionStyle}>
              <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Change Password</h3>
              
              {message.text && (
                <div style={message.type === 'success' ? successMessageStyle : errorMessageStyle}>
                  {message.text}
                </div>
              )}
              
              <form onSubmit={handleChangePassword} style={formStyle}>
                <div style={passwordInputContainerStyle}>
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    placeholder="Current Password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    style={inputStyle}
                    required
                  />
                  <div style={eyeIconStyle} onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}>
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
                
                <div style={passwordInputContainerStyle}>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    placeholder="New Password (min 6 characters)"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    style={inputStyle}
                    required
                  />
                  <div style={eyeIconStyle} onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}>
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
                
                <div style={passwordInputContainerStyle}>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    style={inputStyle}
                    required
                  />
                  <div style={eyeIconStyle} onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}>
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowChangePassword(false)}
                    style={{
                      ...buttonStyle,
                      background: '#6c757d',
                      boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{
                      ...buttonStyle,
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Email Verification Form */}
          {showEmailVerification && !isOAuthUser && (
            <div style={sectionStyle}>
              <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Change Email Address</h3>
              
              {message.text && (
                <div style={message.type === 'success' ? successMessageStyle : errorMessageStyle}>
                  {message.text}
                </div>
              )}
              
              <div style={formStyle}>
                {!otpSent ? (
                  <>
                    <input
                      type="email"
                      placeholder="New Email Address"
                      value={emailData.newEmail}
                      onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})}
                      style={inputStyle}
                      required
                    />
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                      <button 
                        type="button" 
                        onClick={() => setShowEmailVerification(false)}
                        style={{
                          ...buttonStyle,
                          background: '#6c757d',
                          boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)'
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        onClick={handleSendEmailOTP}
                        disabled={isSubmitting}
                        style={{
                          ...buttonStyle,
                          opacity: isSubmitting ? 0.7 : 1
                        }}
                      >
                        {isSubmitting ? 'Sending...' : 'Send OTP'}
                      </button>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleVerifyEmail}>
                    <p style={{ marginBottom: '15px', color: '#666' }}>
                      Enter the OTP sent to <strong>{emailData.newEmail}</strong>
                    </p>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={emailData.otp}
                      onChange={(e) => setEmailData({...emailData, otp: e.target.value})}
                      style={inputStyle}
                      required
                    />
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                      <button 
                        type="button" 
                        onClick={() => {
                          setOtpSent(false);
                          setEmailData({ newEmail: '', otp: '' });
                        }}
                        style={{
                          ...buttonStyle,
                          background: '#6c757d',
                          boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)'
                        }}
                      >
                        Back
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        style={{
                          ...buttonStyle,
                          opacity: isSubmitting ? 0.7 : 1
                        }}
                      >
                        {isSubmitting ? 'Verifying...' : 'Verify Email'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Account Verification Form */}
          {showAccountVerification && !isOAuthUser && (
            <div style={sectionStyle}>
              <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Verify Your Account</h3>
              
              {message.text && (
                <div style={message.type === 'success' ? successMessageStyle : errorMessageStyle}>
                  {message.text}
                </div>
              )}
              
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                We've sent a 6-digit verification code to your email address. Please enter it below to verify your account.
              </p>
              
              <form onSubmit={handleVerifyAccount} style={formStyle}>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={accountVerificationOtp}
                  onChange={(e) => setAccountVerificationOtp(e.target.value)}
                  style={inputStyle}
                  maxLength="6"
                  required
                />
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAccountVerification(false);
                      setAccountVerificationOtp('');
                    }}
                    style={{
                      ...buttonStyle,
                      background: '#6c757d',
                      boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{
                      ...buttonStyle,
                      background: '#28a745',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify Account'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Account Actions */}
          <div style={{ ...sectionStyle, borderBottom: 'none' }}>
            <h2 style={sectionTitleStyle}>
              <Shield size={20} />
              Account Actions
            </h2>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button 
                style={dangerButtonStyle}
                onClick={handleLogout}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(231, 76, 60, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.3)';
                }}
              >
                Logout from Account
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default UserProfilePage;
