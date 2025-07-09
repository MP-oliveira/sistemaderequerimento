import React from 'react';
import './Input.css';

export default function Input({ label, error, ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input className={`input-field${error ? ' input-error' : ''}`} {...props} />
      {error && <div className="input-error-message">{error}</div>}
    </div>
  );
} 