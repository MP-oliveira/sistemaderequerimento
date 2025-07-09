import React from 'react';
import './Button.css';

export default function Button({ children, variant = 'primary', size = 'md', loading = false, disabled = false, ...props }) {
  const variantClass = variant === 'yellow' ? 'btn-yellow' : `btn-${variant}`;
  return (
    <button
      className={`btn ${variantClass} btn-${size}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
} 