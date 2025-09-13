import React from 'react';
import { usePWA } from '../hooks/usePWA';
import './OfflineIndicator.css';

const OfflineIndicator = () => {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="offline-indicator">
      <div className="offline-content">
        <div className="offline-icon">📡</div>
        <div className="offline-text">
          <strong>Modo Offline</strong>
          <span>Algumas funcionalidades podem estar limitadas</span>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
