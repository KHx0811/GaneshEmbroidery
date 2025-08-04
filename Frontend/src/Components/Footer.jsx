import React from 'react';
import { Link } from 'react-router-dom';
import assets from '../assets/assets.js';
import { Mail, PhoneCall } from 'lucide-react';
import '../styles/HomePage.css';


const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="footer-responsive"
      style={{
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      color: 'white',
      padding: '60px 0 20px 0',
      marginTop: 'auto'
    }}>
      <div 
        className="footer-container"
        style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div 
          className="footer-grid"
          style={{
          marginBottom: '40px',
          alignItems: 'start'
        }}>
          <div 
            className="footer-logo-section"
            style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left'
          }}>
            <img 
              src={assets.bg_logo_circle} 
              alt="Ganesh Embroidery"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '15px',
                marginBottom: '10px',
                border: 'none',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h3 style={{
                margin: '0',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#D8B46A',
                fontFamily: "'Playfair Display', serif",
                marginBottom: '5px'
              }}>
                Ganesh Embroidery
              </h3>
              <p style={{
                margin: '0 0 10px 0',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '300'
              }}>
                Premium Digital Designs
              </p>
            </div>
            
            <p style={{
              fontSize: '0.8rem',
              lineHeight: '1.5',
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'left',
              margin: '0'
            }}>
              Exquisite embroidery designs crafted with precision and creativity.
            </p>
          </div>
          <div>
            <h4 
              className="footer-section-title"
              style={{
              margin: '0 0 20px 0',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#D8B46A',
              fontFamily: "'Playfair Display', serif"
            }}>
              Quick Links
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: '0',
              margin: '0'
            }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/categories', label: 'Browse Designs' },
                { to: '/how-to-buy', label: 'How to Buy' },
                { to: '/my-orders', label: 'My Orders' },
                { to: '/favorites', label: 'Favorites' }
              ].map((link, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>
                  <Link 
                    to={link.to}
                    className="footer-link"
                    style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      transition: 'all 0.3s ease',
                      display: 'block',
                      padding: '5px 0'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#D8B46A';
                      e.target.style.transform = 'translateX(3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.transform = 'translateX(0)';
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{
              margin: '0 0 20px 0',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#D8B46A',
              fontFamily: "'Playfair Display', serif"
            }}>
              About & Support
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: '0',
              margin: '0'
            }}>
              {[
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact Support' },
                { to: '/faq', label: 'FAQ' }
              ].map((link, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>
                  <Link 
                    to={link.to}
                    style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      transition: 'all 0.3s ease',
                      display: 'block',
                      padding: '2px 0'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#D8B46A';
                      e.target.style.transform = 'translateX(3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.transform = 'translateX(0)';
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{
              margin: '0 0 20px 0',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#D8B46A',
              fontFamily: "'Playfair Display', serif"
            }}>
              Contact Us
            </h4>
            <div style={{
              fontSize: '0.85rem',
              lineHeight: '1.5',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ marginRight: '8px', fontSize: '1rem' }} />
                <a 
                  href="mailto:ganeshembroidery99@gmail.com?subject=Inquiry%20about%20Embroidery%20Designs&body=Hello,%20I%20would%20like%20to%20know%20more%20about%20your%20embroidery%20designs."
                  style={{
                    color: '#D8B46A',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    fontSize: '0.8rem'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#E6C77A'}
                  onMouseLeave={(e) => e.target.style.color = '#D8B46A'}
                >
                  ganeshembroidery99@gmail.com
                </a>
              </div>
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <PhoneCall size={16} style={{ marginRight: '8px', fontSize: '1rem' }} />
                <a 
                  href="tel:+919948792999"
                  style={{
                    color: '#D8B46A',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    fontSize: '0.85rem'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#E6C77A'}
                  onMouseLeave={(e) => e.target.style.color = '#D8B46A'}
                >
                  +91 9948792999
                </a>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <a 
                  href="https://wa.me/919948792999?text=Hello,%20I%20am%20interested%20in%20your%20embroidery%20designs."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 15px',
                    background: '#25D366',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#128C7E';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 15px rgba(37, 211, 102, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#25D366';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(37, 211, 102, 0.3)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <div 
                  className="footer-social-icons"
                  style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  marginBottom: '12px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginRight: '5px',
                    width: '100%',
                    marginBottom: '8px'
                  }}>
                    Follow us:
                  </span>
                  {[
                    { 
                      icon: (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      ), 
                      href: 'https://facebook.com/ganeshembroidery', 
                      label: 'Facebook' 
                    },
                    { 
                      icon: (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.024-.105-.949-.199-2.403.041-3.439.219-.937 1.404-5.965 1.404-5.965s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.09.109.11.21.081.32-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.752-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                        </svg>
                      ), 
                      href: 'https://pinterest.com/ganeshembroidery', 
                      label: 'Pinterest' 
                    },
                    { 
                      icon: (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      ), 
                      href: 'https://www.instagram.com/ganesh_embroidery/', 
                      label: 'Instagram' 
                    },
                    { 
                      icon: (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      ), 
                      href: 'https://twitter.com/ganeshembroidery', 
                      label: 'Twitter' 
                    }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      title={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        width: '30px',
                        height: '30px',
                        background: 'rgba(216, 180, 106, 0.1)',
                        borderRadius: '50%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        border: '1px solid rgba(216, 180, 106, 0.3)',
                        transition: 'all 0.3s ease',
                        color: '#D8B46A'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(216, 180, 106, 0.2)';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 15px rgba(216, 180, 106, 0.3)';
                        e.target.style.color = '#E6C77A';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(216, 180, 106, 0.1)';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                        e.target.style.color = '#D8B46A';
                      }}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
                
                <p style={{ 
                  margin: '0', 
                  fontSize: '0.75rem', 
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontStyle: 'italic'
                }}>
                  Designed with ❤️ for Ganesh Embroidery
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '15px'
          }}>
            <p style={{ margin: '0 0 10px 0' }}>
              © {currentYear} Ganesh Embroidery. All rights reserved.
            </p>
            <div 
              className="footer-bottom-links"
              style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link 
                to="/privacy-policy"
                style={{
                  color: '#D8B46A',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  transition: 'color 0.3s ease',
                  fontWeight: '400'
                }}
                onMouseEnter={(e) => e.target.style.color = '#E6C77A'}
                onMouseLeave={(e) => e.target.style.color = '#D8B46A'}
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms"
                style={{
                  color: '#D8B46A',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  transition: 'color 0.3s ease',
                  fontWeight: '400'
                }}
                onMouseEnter={(e) => e.target.style.color = '#E6C77A'}
                onMouseLeave={(e) => e.target.style.color = '#D8B46A'}
              >
                Terms of Service
              </Link>
              <Link 
                to="/refund-policy"
                style={{
                  color: '#D8B46A',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  transition: 'color 0.3s ease',
                  fontWeight: '400'
                }}
                onMouseEnter={(e) => e.target.style.color = '#E6C77A'}
                onMouseLeave={(e) => e.target.style.color = '#D8B46A'}
              >
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
