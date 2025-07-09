import React from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

const PrivacyPolicy = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{
        flex: 1,
        paddingTop: '80px',
        background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '40px 20px'
        }}>
          {/* Header Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '50px'
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '700',
              color: '#2c3e50',
              marginBottom: '20px',
              fontFamily: "'Playfair Display', serif"
            }}>
              Privacy Policy
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#666',
              marginBottom: '10px'
            }}>
              Last updated: July 4, 2025
            </p>
            <p style={{
              fontSize: '1.1rem',
              color: '#555',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
          </div>

          {/* Content */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '40px',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
            lineHeight: '1.7'
          }}>
            
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#D8B46A',
                marginBottom: '20px',
                fontFamily: "'Playfair Display', serif"
              }}>
                1. Information We Collect
              </h2>
              
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px' }}>
                Personal Information
              </h3>
              <p style={{ marginBottom: '15px', color: '#555' }}>
                When you create an account or make a purchase, we collect:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px', color: '#555' }}>Name and email address</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Billing information and payment details</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Phone number (optional)</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Account preferences and settings</li>
              </ul>

              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px' }}>
                Usage Information
              </h3>
              <p style={{ marginBottom: '15px', color: '#555' }}>
                We automatically collect information about how you use our website:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px', color: '#555' }}>Pages visited and time spent on site</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Search queries and browse history</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Device information and IP address</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Browser type and operating system</li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#D8B46A',
                marginBottom: '20px',
                fontFamily: "'Playfair Display', serif"
              }}>
                2. How We Use Your Information
              </h2>
              
              <p style={{ marginBottom: '15px', color: '#555' }}>
                We use the collected information for the following purposes:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Service Delivery:</strong> Processing orders, providing downloads, and customer support
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Account Management:</strong> Creating and maintaining your user account
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Communication:</strong> Sending order confirmations, updates, and promotional materials
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Improvement:</strong> Analyzing usage to improve our website and services
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Security:</strong> Protecting against fraud and unauthorized access
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#D8B46A',
                marginBottom: '20px',
                fontFamily: "'Playfair Display', serif"
              }}>
                3. Information Sharing
              </h2>
              
              <p style={{ marginBottom: '15px', color: '#555' }}>
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in these circumstances:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Payment Processing:</strong> With secure payment processors to handle transactions
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Service Providers:</strong> With trusted partners who help operate our website (under strict confidentiality)
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Business Transfer:</strong> In case of merger, acquisition, or sale of our business
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#D8B46A',
                marginBottom: '20px',
                fontFamily: "'Playfair Display', serif"
              }}>
                4. Data Security
              </h2>
              
              <p style={{ marginBottom: '15px', color: '#555' }}>
                We implement robust security measures to protect your information:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px', color: '#555' }}>SSL encryption for all data transmission</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Secure servers with regular security updates</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Limited access to personal data by authorized personnel only</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Regular security audits and monitoring</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Secure payment processing through trusted providers</li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#D8B46A',
                marginBottom: '20px',
                fontFamily: "'Playfair Display', serif"
              }}>
                5. Cookies and Tracking
              </h2>
              
              <p style={{ marginBottom: '15px', color: '#555' }}>
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px', color: '#555' }}>
                  <strong>Essential Cookies:</strong> Required for basic website functionality
                </li>
                <li style={{ marginBottom: '8px', color: '#555' }}>
                  <strong>Performance Cookies:</strong> Help us understand how visitors use our site
                </li>
                <li style={{ marginBottom: '8px', color: '#555' }}>
                  <strong>Preference Cookies:</strong> Remember your settings and choices
                </li>
              </ul>
              <p style={{ color: '#555' }}>
                You can control cookie settings through your browser preferences. Note that disabling certain cookies may affect website functionality.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#D8B46A',
                marginBottom: '20px',
                fontFamily: "'Playfair Display', serif"
              }}>
                6. Your Rights
              </h2>
              
              <p style={{ marginBottom: '15px', color: '#555' }}>
                You have the following rights regarding your personal information:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Access:</strong> Request a copy of your personal data we hold
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Correction:</strong> Update or correct inaccurate information
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Portability:</strong> Request your data in a portable format
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Opt-out:</strong> Unsubscribe from marketing communications anytime
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#D8B46A',
                marginBottom: '20px',
                fontFamily: "'Playfair Display', serif"
              }}>
                7. Data Retention
              </h2>
              
              <p style={{ marginBottom: '15px', color: '#555' }}>
                We retain your information for as long as necessary to:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px', color: '#555' }}>Provide ongoing services and support</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Comply with legal obligations</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Resolve disputes and enforce agreements</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Maintain business records as required by law</li>
              </ul>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#D8B46A',
                marginBottom: '20px',
                fontFamily: "'Playfair Display', serif"
              }}>
                8. Children's Privacy
              </h2>
              
              <p style={{ color: '#555' }}>
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately so we can take appropriate action.
              </p>
            </section>

            <section style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#D8B46A',
                marginBottom: '20px',
                fontFamily: "'Playfair Display', serif"
              }}>
                9. Changes to This Policy
              </h2>
              
              <p style={{ color: '#555' }}>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#D8B46A',
                marginBottom: '20px',
                fontFamily: "'Playfair Display', serif"
              }}>
                10. Contact Us
              </h2>
              
              <p style={{ marginBottom: '15px', color: '#555' }}>
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div style={{ 
                background: 'rgba(216, 180, 106, 0.1)', 
                padding: '20px', 
                borderRadius: '10px',
                borderLeft: '4px solid #D8B46A'
              }}>
                <p style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                  <strong>Email:</strong> privacy@ganeshembroidery.com
                </p>
                <p style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                  <strong>Phone:</strong> +91 98765 43210
                </p>
                <p style={{ margin: '0', color: '#2c3e50' }}>
                  <strong>Address:</strong> 123 Design Street, Embroidery District, Mumbai, Maharashtra 400001
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
