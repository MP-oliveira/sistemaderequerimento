import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Inventory from '../pages/Inventory';
import Requests from '../pages/Requests';
import RequestsAdmin from '../pages/RequestsAdmin';
import DashboardAdmin from '../pages/DashboardAdmin';
import AudiovisualDashboard from '../pages/AudiovisualDashboard';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function PrivateRoute({ children }) {
  try {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
  } catch (error) {
    console.error('Erro no PrivateRoute:', error);
    return <Navigate to="/login" />;
  }
}

function AdminRoute({ children }) {
  try {
    const { user } = useAuth();
    return user && (user.role === 'ADM' || user.role === 'PASTOR') ? children : <Navigate to="/" />;
  } catch (error) {
    return <Navigate to="/" />;
  }
}

// Componente que redireciona automaticamente baseado no papel do usuário
function SmartDashboardRoute() {
  const { user } = useAuth();
  
  console.log('🔍 SmartDashboardRoute - User:', user);
  console.log('🔍 SmartDashboardRoute - User role:', user?.role);
  
  if (!user) {
    console.log('🔍 SmartDashboardRoute - Redirecionando para login');
    return <Navigate to="/login" />;
  }
  
  // Se for admin ou pastor, vai para o dashboard admin
  if (user.role === 'ADM' || user.role === 'PASTOR') {
    console.log('🔍 SmartDashboardRoute - Redirecionando admin/pastor para dashboard admin');
    return <Navigate to="/admin/dashboard" />;
  }
  
  // Se for audiovisual, vai para o dashboard audiovisual
  if (user.role === 'AUDIOVISUAL') {
    console.log('🔍 SmartDashboardRoute - Redirecionando audiovisual para dashboard audiovisual');
    return <Navigate to="/audiovisual/dashboard" />;
  }
  
  // Se for secretário, líder ou usuário normal, vai para o dashboard normal
  console.log('🔍 SmartDashboardRoute - Redirecionando usuário normal para dashboard normal');
  return <Navigate to="/dashboard" />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rota raiz - redireciona automaticamente baseado no papel */}
        <Route path="/" element={<SmartDashboardRoute />} />
        
        {/* Dashboard normal para usuários não-admin */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <Layout>
                <Users />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario"
          element={
            <PrivateRoute>
              <Layout>
                <Inventory />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/requisicoes"
          element={
            <PrivateRoute>
              <Layout>
                <Requests />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <Layout>
                <DashboardAdmin />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/requisicoes"
          element={
            <AdminRoute>
              <Layout>
                <RequestsAdmin />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/audiovisual/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <AudiovisualDashboard />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
} 