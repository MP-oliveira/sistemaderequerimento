import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import OfflineIndicator from './components/OfflineIndicator';

export default function App() {
  return (
    <AuthProvider>
      <OfflineIndicator />
      <AppRoutes />
    </AuthProvider>
  );
}
