import React from 'react';
import './SimplePWAButton.css';

const SimplePWAButton = () => {
  const handleClick = () => {
    alert('Botão PWA funcionando!');
  };

  return (
    <div className="simple-pwa-button">
      <button onClick={handleClick} className="pwa-test-btn">
        🚀 TESTE PWA - Instalar App
      </button>
    </div>
  );
};

export default SimplePWAButton;
