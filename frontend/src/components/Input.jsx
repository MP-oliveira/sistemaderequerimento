import React from 'react';
import './Input.css';

export default function Input({ label, error, type, options, ...props }) {
  if (type === 'select') {
    return (
      <div className="input-group">
        {label && <label className="input-label">{label}</label>}
        <select className={`input-field${error ? ' input-error' : ''}`} {...props}>
          {options && options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <div className="input-error-message">{error}</div>}
      </div>
    );
  }

  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input type={type} className={`input-field${error ? ' input-error' : ''}`} {...props} />
      {error && <div className="input-error-message">{error}</div>}
    </div>
  );
} 