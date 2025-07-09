import React, { useState } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

const FAQ = () => {
  const [openQuestions, setOpenQuestions] = useState({});

  const toggleQuestion = (index) => {
    setOpenQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqData = [
    {
      category: "General Questions",
      questions: [
        {
          question: "What is Ganesh Embroidery?",
          answer: "Ganesh Embroidery is a premium digital embroidery design store offering high-quality, professionally crafted embroidery files for various machines and projects. We specialize in traditional, modern, and custom embroidery designs."
        },
        {
          question: "What file formats do you provide?",
          answer: "We provide embroidery files in multiple formats including DST, PES, JEF, HUS, VP3, EXP, and more. All designs are compatible with most commercial and home embroidery machines."
        },
        {
          question: "Are your designs suitable for beginners?",
          answer: "Yes! We offer designs for all skill levels. Each design includes difficulty ratings and detailed instructions. We also provide tutorials and support for beginners."
        }
      ]
    },
    {
      category: "Purchasing & Downloads",
      questions: [
        {
          question: "How do I purchase a design?",
          answer: "Simply browse our catalog, select your desired design, add it to cart, and proceed to checkout. After payment, you'll receive immediate download links via email."
        },
        {
          question: "Can I download my purchases again?",
          answer: "Yes! All your purchases are saved in your account under 'My Orders'. You can re-download any design at any time from your account dashboard."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, debit cards, UPI, net banking, and digital wallets. All transactions are secured with SSL encryption."
        },
        {
          question: "How long do download links remain active?",
          answer: "Your download links never expire! You can access your purchases anytime through your account, and we also send backup links via email."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "My embroidery machine can't read the file. What should I do?",
          answer: "First, ensure you've downloaded the correct format for your machine. If issues persist, contact our support team with your machine model, and we'll provide the appropriate format or troubleshooting assistance."
        },
        {
          question: "Can you convert designs to other formats?",
          answer: "Yes! If you need a specific format not available in your purchase, contact our support team. We provide free format conversions for all purchased designs."
        },
        {
          question: "The design doesn't fit my hoop size. Can you help?",
          answer: "Absolutely! We can resize designs to fit your hoop. Contact support with your hoop dimensions, and we'll provide a resized version. Note that very small or large resizing may affect stitch quality."
        },
        {
          question: "Do you provide stitching instructions?",
          answer: "Yes! Each design comes with detailed instructions including thread colors, stitch counts, and step-by-step guidance for optimal results."
        }
      ]
    },
    {
      category: "Account & Orders",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click 'Login' in the header and select 'Create Account'. Fill in your details, verify your email, and you're ready to start shopping! Account creation is free and gives you access to order history and faster checkout."
        },
        {
          question: "I forgot my password. How can I reset it?",
          answer: "Click 'Login' and then 'Forgot Password'. Enter your email address, and we'll send you a secure reset link. Follow the instructions in the email to create a new password."
        },
        {
          question: "How can I track my order status?",
          answer: "Log into your account and visit 'My Orders' to see all your purchases, download status, and order history. You'll also receive email confirmations for all transactions."
        },
        {
          question: "Can I change my account information?",
          answer: "Yes! Log into your account and go to 'Profile Settings' to update your personal information, email address, and password anytime."
        }
      ]
    },
    {
      category: "Design Quality & Usage",
      questions: [
        {
          question: "What is the quality of your designs?",
          answer: "All our designs are professionally digitized and tested on multiple machines. We ensure clean stitching, proper density, and optimal thread paths for the best embroidery results."
        },
        {
          question: "Can I use these designs for commercial purposes?",
          answer: "Yes! All our designs come with commercial usage rights. You can use them to create products for sale, but you cannot resell or redistribute the digital files themselves."
        },
        {
          question: "Do you offer custom design services?",
          answer: "Yes! We provide custom digitizing services. Contact our design team with your requirements, and we'll create a personalized embroidery design just for you."
        },
        {
          question: "What if I'm not satisfied with a design?",
          answer: "We offer a 30-day satisfaction guarantee. If you're not happy with a design, contact our support team, and we'll work to resolve the issue or provide a refund."
        }
      ]
    },
    {
      category: "Shipping & Delivery",
      questions: [
        {
          question: "Do you ship physical products?",
          answer: "No, we only sell digital embroidery files. All purchases are delivered instantly via email download links. No physical shipping is required."
        },
        {
          question: "How quickly will I receive my designs?",
          answer: "Immediately! After successful payment, you'll receive download links within minutes via email. You can also access downloads instantly from your account."
        },
        {
          question: "What if I don't receive my download email?",
          answer: "Check your spam folder first. If you still don't see it, log into your account to access downloads directly, or contact our support team for assistance."
        }
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{
        flex: 1,
        paddingTop: '80px',
        background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '40px 20px'
        }}>
          {/* Header Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '60px'
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '700',
              color: '#2c3e50',
              marginBottom: '20px',
              fontFamily: "'Playfair Display', serif"
            }}>
              Frequently Asked Questions
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Find answers to common questions about our embroidery designs, purchasing process, and technical support.
            </p>
          </div>

          {/* FAQ Categories */}
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} style={{
              marginBottom: '50px',
              background: 'white',
              borderRadius: '15px',
              padding: '30px',
              boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(216, 180, 106, 0.1)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#D8B46A',
                marginBottom: '25px',
                fontFamily: "'Playfair Display', serif",
                borderBottom: '2px solid rgba(216, 180, 106, 0.2)',
                paddingBottom: '10px'
              }}>
                {category.category}
              </h2>

              {category.questions.map((faq, questionIndex) => {
                const globalIndex = `${categoryIndex}-${questionIndex}`;
                const isOpen = openQuestions[globalIndex];

                return (
                  <div key={questionIndex} style={{
                    marginBottom: '15px',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={() => toggleQuestion(globalIndex)}
                      style={{
                        width: '100%',
                        padding: '20px',
                        background: isOpen ? 'rgba(216, 180, 106, 0.1)' : 'rgba(248, 249, 250, 0.5)',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#2c3e50',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isOpen) {
                          e.target.style.background = 'rgba(216, 180, 106, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isOpen) {
                          e.target.style.background = 'rgba(248, 249, 250, 0.5)';
                        }
                      }}
                    >
                      <span>{faq.question}</span>
                      <span style={{
                        fontSize: '1.2rem',
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        color: '#D8B46A'
                      }}>
                        +
                      </span>
                    </button>
                    
                    {isOpen && (
                      <div style={{
                        padding: '20px',
                        background: 'white',
                        borderTop: '1px solid rgba(216, 180, 106, 0.1)',
                        animation: 'fadeIn 0.3s ease'
                      }}>
                        <p style={{
                          margin: 0,
                          fontSize: '0.95rem',
                          lineHeight: '1.6',
                          color: '#555'
                        }}>
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Contact Support Section */}
          <div style={{
            background: 'linear-gradient(135deg, #2c3e50, #34495e)',
            borderRadius: '15px',
            padding: '40px',
            textAlign: 'center',
            color: 'white'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '15px',
              color: '#D8B46A'
            }}>
              Still Need Help?
            </h3>
            <p style={{
              fontSize: '1rem',
              marginBottom: '25px',
              opacity: 0.9
            }}>
              Can't find the answer you're looking for? Our support team is here to help!
            </p>
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <a
                href="mailto:support@ganeshembroidery.com"
                style={{
                  background: 'rgba(216, 180, 106, 0.9)',
                  color: 'white',
                  padding: '12px 25px',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#D8B46A';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(216, 180, 106, 0.9)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                📧 Email Support
              </a>
              <a
                href="tel:+919876543210"
                style={{
                  background: 'transparent',
                  color: '#D8B46A',
                  padding: '12px 25px',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  border: '2px solid #D8B46A',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#D8B46A';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#D8B46A';
                }}
              >
                📱 Call Us
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FAQ;
