import React from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

const AboutUs = () => {
  const containerStyle = {
    minHeight: '100vh',
    paddingTop: '100px',
    paddingBottom: '40px',
    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
  };

  const contentStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    padding: '0 20px'
  };

  const headerSectionStyle = {
    background: 'linear-gradient(135deg, #2c3e50, #34495e)',
    padding: '40px 30px',
    textAlign: 'center',
    color: 'white',
    margin: '0 -20px 40px -20px'
  };

  const sectionStyle = {
    padding: '0 20px 30px 20px'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '20px',
    fontFamily: "'Playfair Display', serif"
  };

  const textStyle = {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#555',
    marginBottom: '20px'
  };

  return (
    <div style={containerStyle}>
      <Header />
      
      <div style={{ padding: '0 20px' }}>
        <div style={contentStyle}>
          {/* Header Section */}
          <div style={headerSectionStyle}>
            <h1 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>
              About Ganesh Embroidery
            </h1>
            <p style={{ opacity: 0.8, margin: 0, fontSize: '18px' }}>
              Crafting Digital Embroidery Excellence Since Years
            </p>
          </div>

          {/* Content Section */}
          <div style={sectionStyle}>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={titleStyle}>Our Story</h2>
              <p style={textStyle}>
                Welcome to Ganesh Embroidery, where traditional craftsmanship meets modern digital innovation. 
                We specialize in creating premium digital embroidery designs that bring your creative visions to life 
                with precision and artistry.
              </p>
              <p style={textStyle}>
                Our journey began with a passion for embroidery and a vision to make high-quality designs accessible 
                to creators, businesses, and embroidery enthusiasts worldwide. Every design in our collection is 
                carefully crafted to ensure exceptional quality and stunning results.
              </p>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h2 style={titleStyle}>What We Offer</h2>
              <p style={textStyle}>
                Our extensive collection features a diverse range of embroidery designs including:
              </p>
              <ul style={{ ...textStyle, paddingLeft: '20px' }}>
                <li>Kids' designs - Fun and playful patterns for children's clothing</li>
                <li>Simple designs - Clean and elegant patterns for various applications</li>
                <li>Boat Neck designs - Sophisticated neckline embellishments</li>
                <li>Bride designs - Exquisite patterns for special occasions</li>
                <li>Custom designs - Tailored creations for unique requirements</li>
              </ul>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h2 style={titleStyle}>Our Commitment</h2>
              <p style={textStyle}>
                At Ganesh Embroidery, we are committed to:
              </p>
              <ul style={{ ...textStyle, paddingLeft: '20px' }}>
                <li><strong>Quality:</strong> Every design undergoes rigorous testing to ensure perfect stitching</li>
                <li><strong>Innovation:</strong> Continuously expanding our collection with fresh, modern designs</li>
                <li><strong>Customer Service:</strong> Providing exceptional support and guidance to our customers</li>
                <li><strong>Accessibility:</strong> Making professional embroidery designs available to everyone</li>
              </ul>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h2 style={titleStyle}>Why Choose Us</h2>
              <p style={textStyle}>
                With years of experience in the embroidery industry, we understand the importance of precision, 
                quality, and customer satisfaction. Our designs are compatible with popular embroidery machines 
                and come with detailed instructions to ensure successful implementation.
              </p>
              <p style={textStyle}>
                Whether you're a professional embroiderer, a small business owner, or someone who loves crafting, 
                our designs will help you create beautiful, professional-looking embroidered items that stand out.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #D8B46A, #E6C77A)',
              padding: '30px',
              borderRadius: '15px',
              textAlign: 'center',
              color: 'white',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '24px' }}>Get In Touch</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '16px' }}>
                Have questions about our designs or need custom work? We'd love to hear from you!
              </p>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a 
                  href="mailto:ganeshembroidery99@gmail.com"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    padding: '10px 20px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '25px',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Email Us
                </a>
                <a 
                  href="tel:+919948792999"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    padding: '10px 20px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '25px',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
