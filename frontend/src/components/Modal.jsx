import React from 'react';
import './Modal.css';

export default function Modal({ open, title, children, onClose, actions, style, className }) {
  if (!open) return null;
  
  // Detectar se é mobile
  const isMobile = window.innerWidth <= 430;
  
  console.log('Modal renderizando:', { open, title, isMobile, className, windowWidth: window.innerWidth });
  console.log('Modal header classes:', `modal-header ${isMobile ? 'modal-header-mobile' : ''}`);
  console.log('Modal close classes:', 'modal-close');
  
  return (
    <div className={`modal-overlay ${isMobile ? 'modal-overlay-mobile' : ''}`} onClick={onClose}>
      <div 
        className={`modal ${isMobile ? 'modal-mobile' : ''} ${className || ''}`} 
        onClick={e => e.stopPropagation()}
        style={style}
      >
        <div className={`modal-header ${isMobile ? 'modal-header-mobile' : ''}`}>
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className={`modal-content ${isMobile ? 'modal-content-mobile' : ''}`}>{children}</div>
        {actions && !isMobile && <div className={`modal-actions ${isMobile ? 'modal-actions-mobile' : ''}`}>{actions}</div>}
        
        {/* Botão Fechar fixo no footer para mobile */}
        {isMobile && (
          <div className="modal-footer-mobile">
            <button 
              className="modal-close-mobile" 
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 