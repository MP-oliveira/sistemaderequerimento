import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import PWAInstaller from './components/PWAInstaller';
import PWAInstallInstructions from './components/PWAInstallInstructions';
import OfflineIndicator from './components/OfflineIndicator';

export default function App() {
  return (
    <AuthProvider>
      <OfflineIndicator />
      <AppRoutes />
      <PWAInstaller />
      <PWAInstallInstructions />
    </AuthProvider>
  );
}
