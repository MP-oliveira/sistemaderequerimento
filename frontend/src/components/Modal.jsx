import React from 'react';
import './Modal.css';

export default function Modal({ open, title, children, onClose, actions }) {
  if (!open) return null;
  
  // Detectar se é mobile
  const isMobile = window.innerWidth <= 768;
  
  return (
    <div className={`modal-overlay ${isMobile ? 'modal-overlay-mobile' : ''}`} onClick={onClose}>
      <div className={`modal ${isMobile ? 'modal-mobile' : ''}`} onClick={e => e.stopPropagation()}>
        <div className={`modal-header ${isMobile ? 'modal-header-mobile' : ''}`}>
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className={`modal-content ${isMobile ? 'modal-content-mobile' : ''}`}>{children}</div>
        {actions && <div className={`modal-actions ${isMobile ? 'modal-actions-mobile' : ''}`}>{actions}</div>}
      </div>
    </div>
  );
} 