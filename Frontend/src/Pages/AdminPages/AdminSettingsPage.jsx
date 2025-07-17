import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../../Components/AdminHeader.jsx';
import { isAuthenticated, getAuthToken, getUserRole, logout } from '../../utils/auth.js';
import { ArrowLeft, Save, Settings, User, Lock, Bell, Globe, Key, Mail, Shield } from 'lucide-react';

const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [user, setUser] = useState(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'SL Designers',
      siteDescription: 'Premium Embroidery Designs',
      contactEmail: '', // Will be fetched from backend
      supportEmail: 'ganeshembroidery0.com'
    },
    notifications: {
      emailNotifications: true,
      orderNotifications: true,
      lowStockAlerts: true,
      customerSignups: true
    },
    security: {
      sessionTimeout: 30,
      requireStrongPasswords: true,
      enableTwoFactor: false,
      loginAttempts: 5
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [otpData, setOtpData] = useState({
    email: '',
    otp: '',
    isOtpSent: false,
    isVerifying: false
  });
  const [saving, setSaving] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || getUserRole() !== 'admin') {
      navigate('/login');
      return;
    }

    const token = getAuthToken();
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
      setIsGoogleUser(!!payload.googleId);
      
      fetchUserSettings();
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }, [navigate]);

  const fetchUserSettings = async () => {
    try {
      const url = import.meta.env.VITE_API_BASE_URL;
      const token = getAuthToken();
      
      const response = await fetch(`${url}/user/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setSettings(prev => ({
            ...prev,
            general: {
              ...prev.general,
              contactEmail: data.data.contactEmail || 'ganeshembroidery0@gmail.com'
            },
            security: {
              ...prev.security,
              enableTwoFactor: data.data.enableTwoFactor || false
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = import.meta.env.VITE_API_BASE_URL;
      const token = getAuthToken();
      
      const response = await fetch(`${url}/user/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    setSaving(true);
    try {
      const url = import.meta.env.VITE_API_BASE_URL;
      const token = getAuthToken();
      
      const response = await fetch(`${url}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowChangePassword(false);
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEnable2FA = async () => {
    setShow2FASetup(true);
    setOtpData({ ...otpData, email: user.email });
  };

  const handleDisable2FA = async () => {
    try {
      const url = import.meta.env.VITE_API_BASE_URL;
      const token = getAuthToken();
      
      const response = await fetch(`${url}/user/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          security: {
            enableTwoFactor: false
          }
        })
      });

      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          security: {
            ...prev.security,
            enableTwoFactor: false
          }
        }));
        alert('Two-Factor Authentication has been disabled.');
      } else {
        throw new Error('Failed to disable 2FA');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      alert('Error disabling 2FA. Please try again.');
      setSettings(prev => ({
        ...prev,
        security: {
          ...prev.security,
          enableTwoFactor: true
        }
      }));
    }
  };

  const sendOTP = async () => {
    setSaving(true);
    try {
      const url = import.meta.env.VITE_API_BASE_URL;
      const token = getAuthToken();
      
      const response = await fetch(`${url}/auth/send-2fa-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: otpData.email })
      });

      const data = await response.json();

      if (response.ok) {
        setOtpData({ ...otpData, isOtpSent: true });
        alert('OTP sent to your email!');
      } else {
        alert(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Error sending OTP. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const verify2FA = async () => {
    setOtpData({ ...otpData, isVerifying: true });
    try {
      const url = import.meta.env.VITE_API_BASE_URL;
      const token = getAuthToken();
      
      const response = await fetch(`${url}/auth/verify-2fa-setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: otpData.email, 
          otp: otpData.otp 
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('2FA enabled successfully! You will be logged out and need to login with OTP next time.');
        await logout();
        navigate('/login');
      } else {
        alert(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      alert('Error verifying OTP. Please try again.');
    } finally {
      setOtpData({ ...otpData, isVerifying: false });
    }
  };

  const handleInputChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const pageStyle = {
    paddingTop: '120px',
    padding: '120px 20px 40px',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  };

  const containerStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    overflow: 'hidden'
  };

  const headerStyle = {
    padding: '30px',
    background: 'linear-gradient(135deg, #021D3B 0%, #0f2a4a 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  };

  const tabContainerStyle = {
    display: 'flex',
    borderBottom: '1px solid #e1e5e9'
  };

  const tabStyle = (isActive) => ({
    padding: '15px 25px',
    cursor: 'pointer',
    borderBottom: isActive ? '3px solid #D8B46A' : '3px solid transparent',
    backgroundColor: isActive ? '#f8f9fa' : 'transparent',
    color: isActive ? '#021D3B' : '#666',
    fontWeight: isActive ? '600' : '400',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  const contentStyle = {
    padding: '30px'
  };

  const sectionStyle = {
    marginBottom: '30px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.3s ease'
  };

  const checkboxStyle = {
    marginRight: '10px'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
    color: '#021D3B',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  };

  const secondaryButtonStyle = {
    background: 'transparent',
    color: '#021D3B',
    border: '2px solid #D8B46A',
    padding: '10px 25px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    marginRight: '10px'
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  };

  const modalHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e1e5e9'
  };

  const renderGeneralSettings = () => (
    <div>
      <div style={sectionStyle}>
        <label style={labelStyle}>Site Name</label>
        <input
          type="text"
          style={inputStyle}
          value={settings.general.siteName}
          onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
        />
      </div>
      <div style={sectionStyle}>
        <label style={labelStyle}>Site Description</label>
        <textarea
          style={{...inputStyle, height: '80px', resize: 'vertical'}}
          value={settings.general.siteDescription}
          onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
        />
      </div>
      <div style={sectionStyle}>
        <label style={labelStyle}>Contact Email (Read-only)</label>
        <input
          type="email"
          style={{...inputStyle, backgroundColor: '#f5f5f5', cursor: 'not-allowed'}}
          value={settings.general.contactEmail}
          readOnly
          disabled
        />
        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          This is the primary business contact email configured in the system.
        </p>
      </div>
      <div style={sectionStyle}>
        <label style={labelStyle}>Support Email</label>
        <input
          type="email"
          style={inputStyle}
          value={settings.general.supportEmail}
          onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
          placeholder="Enter support email address"
        />
        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          This email will be displayed for customer support inquiries.
        </p>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div>
      <div style={sectionStyle}>
        <label style={{...labelStyle, display: 'flex', alignItems: 'center'}}>
          <input
            type="checkbox"
            style={checkboxStyle}
            checked={settings.notifications.emailNotifications}
            onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
          />
          Email Notifications
        </label>
      </div>
      <div style={sectionStyle}>
        <label style={{...labelStyle, display: 'flex', alignItems: 'center'}}>
          <input
            type="checkbox"
            style={checkboxStyle}
            checked={settings.notifications.orderNotifications}
            onChange={(e) => handleInputChange('notifications', 'orderNotifications', e.target.checked)}
          />
          Order Notifications
        </label>
      </div>
      <div style={sectionStyle}>
        <label style={{...labelStyle, display: 'flex', alignItems: 'center'}}>
          <input
            type="checkbox"
            style={checkboxStyle}
            checked={settings.notifications.lowStockAlerts}
            onChange={(e) => handleInputChange('notifications', 'lowStockAlerts', e.target.checked)}
          />
          Low Stock Alerts
        </label>
      </div>
      <div style={sectionStyle}>
        <label style={{...labelStyle, display: 'flex', alignItems: 'center'}}>
          <input
            type="checkbox"
            style={checkboxStyle}
            checked={settings.notifications.customerSignups}
            onChange={(e) => handleInputChange('notifications', 'customerSignups', e.target.checked)}
          />
          Customer Signup Notifications
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div>
      {/* Change Password Section - Only for non-Google users */}
      {!isGoogleUser && (
        <div style={sectionStyle}>
          <h3 style={{ marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Key size={20} />
            Password Management
          </h3>
          <button
            style={secondaryButtonStyle}
            onClick={() => setShowChangePassword(true)}
          >
            <Lock size={16} />
            Change Password
          </button>
        </div>
      )}

      <div style={sectionStyle}>
        <h3 style={{ marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={20} />
          Two-Factor Authentication
        </h3>
        <label style={{...labelStyle, display: 'flex', alignItems: 'center'}}>
          <input
            type="checkbox"
            style={checkboxStyle}
            checked={settings.security.enableTwoFactor}
            onChange={(e) => {
              if (e.target.checked) {
                // When enabling 2FA, temporarily set the checkbox and show setup modal
                handleInputChange('security', 'enableTwoFactor', true);
                handleEnable2FA();
              } else {
                // When disabling 2FA, handle it properly
                handleDisable2FA();
              }
            }}
          />
          Enable Two-Factor Authentication via Email
        </label>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          When enabled, you'll receive an OTP via email during login for added security.
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>Session Management</h3>
        <label style={labelStyle}>Session Timeout (minutes)</label>
        <input
          type="number"
          style={inputStyle}
          value={settings.security.sessionTimeout}
          onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
        />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>Login Security</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>Maximum Login Attempts</label>
          <input
            type="number"
            style={inputStyle}
            value={settings.security.loginAttempts}
            onChange={(e) => handleInputChange('security', 'loginAttempts', parseInt(e.target.value))}
          />
        </div>
        <label style={{...labelStyle, display: 'flex', alignItems: 'center'}}>
          <input
            type="checkbox"
            style={checkboxStyle}
            checked={settings.security.requireStrongPasswords}
            onChange={(e) => handleInputChange('security', 'requireStrongPasswords', e.target.checked)}
          />
          Require Strong Passwords
        </label>
      </div>
    </div>
  );

  return (
    <>
      <AdminHeader />
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={headerStyle}>
            <button
              onClick={() => navigate('/admin')}
              style={{
                background: 'rgba(216, 180, 106, 0.2)',
                border: '1px solid #D8B46A',
                borderRadius: '8px',
                color: '#D8B46A',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <Settings size={24} />
            <h1 style={{ margin: 0, fontSize: '24px' }}>Admin Settings</h1>
          </div>

          <div style={tabContainerStyle}>
            <div
              style={tabStyle(activeTab === 'general')}
              onClick={() => setActiveTab('general')}
            >
              <Globe size={16} />
              General
            </div>
            <div
              style={tabStyle(activeTab === 'notifications')}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={16} />
              Notifications
            </div>
            <div
              style={tabStyle(activeTab === 'security')}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={16} />
              Security
            </div>
          </div>

          <div style={contentStyle}>
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'security' && renderSecuritySettings()}

            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e1e5e9' }}>
              <button
                style={buttonStyle}
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showChangePassword && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <Key size={24} color="#D8B46A" />
              <h2 style={{ margin: 0 }}>Change Password</h2>
            </div>
            
            <div style={sectionStyle}>
              <label style={labelStyle}>Current Password</label>
              <input
                type="password"
                style={inputStyle}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                placeholder="Enter current password"
              />
            </div>

            <div style={sectionStyle}>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                style={inputStyle}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>

            <div style={sectionStyle}>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                style={inputStyle}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                placeholder="Confirm new password"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                style={secondaryButtonStyle}
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                Cancel
              </button>
              <button
                style={buttonStyle}
                onClick={handleChangePassword}
                disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {show2FASetup && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <Shield size={24} color="#D8B46A" />
              <h2 style={{ margin: 0 }}>Setup Two-Factor Authentication</h2>
            </div>
            
            <div style={sectionStyle}>
              <p>We'll send a verification code to your email address to complete the 2FA setup.</p>
              
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                style={inputStyle}
                value={otpData.email}
                onChange={(e) => setOtpData({...otpData, email: e.target.value})}
                placeholder="Enter your email"
                disabled={otpData.isOtpSent}
              />
            </div>

            {otpData.isOtpSent && (
              <div style={sectionStyle}>
                <label style={labelStyle}>Verification Code</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={otpData.otp}
                  onChange={(e) => setOtpData({...otpData, otp: e.target.value})}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Check your email for the verification code.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                style={secondaryButtonStyle}
                onClick={() => {
                  setShow2FASetup(false);
                  setOtpData({ email: '', otp: '', isOtpSent: false, isVerifying: false });
                  setSettings(prev => ({
                    ...prev,
                    security: {
                      ...prev.security,
                      enableTwoFactor: false
                    }
                  }));
                }}
              >
                Cancel
              </button>
              
              {!otpData.isOtpSent ? (
                <button
                  style={buttonStyle}
                  onClick={sendOTP}
                  disabled={saving || !otpData.email}
                >
                  <Mail size={16} />
                  {saving ? 'Sending...' : 'Send Code'}
                </button>
              ) : (
                <button
                  style={buttonStyle}
                  onClick={verify2FA}
                  disabled={otpData.isVerifying || !otpData.otp || otpData.otp.length !== 6}
                >
                  <Shield size={16} />
                  {otpData.isVerifying ? 'Verifying...' : 'Enable 2FA'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSettingsPage;
