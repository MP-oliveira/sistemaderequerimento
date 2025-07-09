import React from 'react';
import './Button.css';

export default function Button({ children, variant = 'primary', size = 'md', loading = false, disabled = false, ...props }) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
} 