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
        <div className={`modal-header ${isMobile ? 'modal-header-mobile' : ''}`} style={{ display: 'flex', visibility: 'visible', opacity: 1, position: 'sticky', top: 0, zIndex: 9999, padding: '16px', background: 'white', borderBottom: '1px solid #e5e7eb', flexShrink: 0, alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '100vw', boxSizing: 'border-box', minHeight: '60px' }}>
          <h3 style={{ display: 'block', visibility: 'visible', opacity: 1, fontSize: '1.1rem', fontWeight: 600, color: '#1f2937', margin: 0, padding: 0, flex: 1, maxWidth: 'calc(100vw - 80px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minHeight: '24px' }}>{title}</h3>
          <button className="modal-close" onClick={onClose} style={{ display: 'flex', visibility: 'visible', opacity: 1, position: 'relative', zIndex: 10000, minWidth: '32px', minHeight: '32px', marginRight: '20px', background: 'none', border: 'none', fontSize: '24px', color: '#6b7280', cursor: 'pointer', padding: '0 8px', lineHeight: 1, width: '32px', height: '32px', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
        </div>
        <div className={`modal-content ${isMobile ? 'modal-content-mobile' : ''}`}>{children}</div>
        {actions && <div className={`modal-actions ${isMobile ? 'modal-actions-mobile' : ''}`}>{actions}</div>}
      </div>
    </div>
  );
} 