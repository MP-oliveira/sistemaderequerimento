import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import OfflineIndicator from './components/OfflineIndicator';
import PWABadgeManager from './components/PWABadgeManager';

export default function App() {
  return (
    <AuthProvider>
      <OfflineIndicator />
      <PWABadgeManager />
      <AppRoutes />
    </AuthProvider>
  );
}
