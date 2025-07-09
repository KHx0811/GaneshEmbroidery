import React from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

const TermsAndConditions = () => {
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
              Terms & Conditions
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
              Please read these terms carefully before using our services. By accessing our website, you agree to these terms.
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
                1. Acceptance of Terms
              </h2>
              
              <p style={{ marginBottom: '15px', color: '#555' }}>
                By accessing and using the Ganesh Embroidery website ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              
              <p style={{ color: '#555' }}>
                These terms apply to all visitors, users, and others who access or use the service. We reserve the right to update these terms at any time without prior notice.
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
                2. Description of Service
              </h2>
              
              <p style={{ marginBottom: '15px', color: '#555' }}>
                Ganesh Embroidery provides digital embroidery design files for purchase and download. Our service includes:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px', color: '#555' }}>Access to a catalog of digital embroidery designs</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Secure purchase and download system</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>User account management</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Customer support services</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Order history and re-download capabilities</li>
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
                3. User Accounts
              </h2>
              
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px' }}>
                Account Creation
              </h3>
              <p style={{ marginBottom: '15px', color: '#555' }}>
                To access certain features of our service, you must create an account. You agree to:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px', color: '#555' }}>Provide accurate and complete information</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Keep your account information updated</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Maintain the security of your password</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px' }}>
                Account Termination
              </h3>
              <p style={{ color: '#555' }}>
                We reserve the right to terminate or suspend accounts that violate these terms or engage in fraudulent activities. You may close your account at any time by contacting our support team.
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
                4. Purchases and Payments
              </h2>
              
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px' }}>
                Pricing and Payment
              </h3>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  All prices are listed in Indian Rupees (INR) and include applicable taxes
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  Payment is due immediately upon placing an order
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  We accept major credit/debit cards, UPI, and net banking
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  Prices may change without notice, but existing orders are honored at original price
                </li>
              </ul>

              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px' }}>
                Digital Delivery
              </h3>
              <p style={{ color: '#555' }}>
                Upon successful payment, you will receive immediate access to download links. All sales are final for digital products once downloaded. Downloads are available immediately and remain accessible through your account.
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
                5. Intellectual Property Rights
              </h2>
              
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px' }}>
                Our Rights
              </h3>
              <p style={{ marginBottom: '15px', color: '#555' }}>
                All content on this website, including designs, text, graphics, logos, and software, is owned by Ganesh Embroidery and protected by copyright and other intellectual property laws.
              </p>

              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px' }}>
                Your License
              </h3>
              <p style={{ marginBottom: '15px', color: '#555' }}>
                When you purchase a design, you receive a limited license to:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px', color: '#555' }}>Use the design for personal or commercial embroidery projects</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Create and sell physical items using the design</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Modify the design for your specific needs</li>
              </ul>

              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px' }}>
                Restrictions
              </h3>
              <p style={{ marginBottom: '15px', color: '#555' }}>
                You may NOT:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px', color: '#555' }}>Resell, redistribute, or share the digital files</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Claim ownership of the designs</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Include the designs in digitizing software or clip art collections</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Use the designs to create competing embroidery design businesses</li>
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
                6. Refund and Return Policy
              </h2>
              
              <p style={{ marginBottom: '15px', color: '#555' }}>
                Due to the digital nature of our products, all sales are final. However, we offer refunds in the following circumstances:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Technical Issues:</strong> If you cannot download or access your purchase due to technical problems on our end
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Duplicate Purchase:</strong> If you accidentally purchase the same design twice
                </li>
                <li style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Quality Issues:</strong> If the design file is corrupted or significantly different from the description
                </li>
              </ul>
              <p style={{ color: '#555' }}>
                Refund requests must be made within 7 days of purchase. Contact our support team with your order details and reason for the refund request.
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
                7. Prohibited Uses
              </h2>
              
              <p style={{ marginBottom: '15px', color: '#555' }}>
                You agree not to use our service for any of the following prohibited activities:
              </p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px', color: '#555' }}>Violating any applicable laws or regulations</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Infringing on intellectual property rights</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Uploading viruses or malicious code</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Attempting to gain unauthorized access to our systems</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Creating fake accounts or impersonating others</li>
                <li style={{ marginBottom: '8px', color: '#555' }}>Engaging in fraudulent activities</li>
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
                8. Disclaimers and Limitation of Liability
              </h2>
              
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px' }}>
                Service Availability
              </h3>
              <p style={{ marginBottom: '15px', color: '#555' }}>
                We strive to provide uninterrupted service but cannot guarantee 100% uptime. The service is provided "as is" without warranties of any kind.
              </p>

              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px' }}>
                Design Compatibility
              </h3>
              <p style={{ marginBottom: '15px', color: '#555' }}>
                While we test our designs on multiple machines, we cannot guarantee compatibility with all embroidery machines or software. We provide technical support to help resolve compatibility issues.
              </p>

              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50', marginBottom: '15px' }}>
                Limitation of Liability
              </h3>
              <p style={{ color: '#555' }}>
                Our liability is limited to the amount paid for the specific design in question. We are not liable for indirect, incidental, or consequential damages.
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
                9. Privacy Policy
              </h2>
              
              <p style={{ color: '#555' }}>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices regarding the collection and use of your information.
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
                10. Modifications to Terms
              </h2>
              
              <p style={{ color: '#555' }}>
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on this page. Your continued use of the service after any changes constitutes acceptance of the new terms.
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
                11. Governing Law
              </h2>
              
              <p style={{ color: '#555' }}>
                These terms are governed by and construed in accordance with the laws of India. Any disputes arising from these terms or your use of the service will be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
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
                12. Contact Information
              </h2>
              
              <p style={{ marginBottom: '15px', color: '#555' }}>
                If you have any questions about these Terms & Conditions, please contact us:
              </p>
              <div style={{ 
                background: 'rgba(216, 180, 106, 0.1)', 
                padding: '20px', 
                borderRadius: '10px',
                borderLeft: '4px solid #D8B46A'
              }}>
                <p style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                  <strong>Email:</strong> ganeshembroidery99@gmail.com
                </p>
                <p style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                  <strong>Phone:</strong> +91 9948792999
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

export default TermsAndConditions;
