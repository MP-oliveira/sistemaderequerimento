import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import PWAInstaller from './components/PWAInstaller';
import OfflineIndicator from './components/OfflineIndicator';
import PWADebug from './components/PWADebug';

export default function App() {
  return (
    <AuthProvider>
      <OfflineIndicator />
      <AppRoutes />
      <PWAInstaller />
      <PWADebug />
    </AuthProvider>
  );
}
