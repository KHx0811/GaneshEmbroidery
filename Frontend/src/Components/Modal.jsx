import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, width = '600px' }) => {
  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '15px',
    width: '100%',
    maxWidth: width,
    maxHeight: '95vh',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle = {
    padding: '25px 30px 20px',
    borderBottom: '1px solid #e1e5e9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#021d3b',
    margin: 0
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    transition: 'all 0.3s ease'
  };

  const contentStyle = {
    padding: '30px',
    overflowY: 'auto',
    flex: 1
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <button
            style={closeButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f5f5f5';
              e.target.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#666';
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
