import React from 'react';
import { usePWABadge } from '../hooks/usePWABadge.js';

const PWABadgeManager = () => {
  const { badgeCount, isSupported, updateBadge, clearBadge } = usePWABadge();

  // Este componente não renderiza nada visualmente
  // Ele apenas gerencia os badges PWA em background
  return null;
};

export default PWABadgeManager;
