import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Inventory from '../pages/Inventory';
import Requests from '../pages/Requests';
import RequestsAdmin from '../pages/RequestsAdmin';
import RequestsAudiovisual from '../pages/RequestsAudiovisual';
import DashboardAdmin from '../pages/DashboardAdmin';
import AudiovisualDashboard from '../pages/AudiovisualDashboard';
import ServicoGeralDashboard from '../pages/ServicoGeralDashboard';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  try {
    return user ? children : <Navigate to="/login" />;
  } catch (error) {
    console.error('Erro no PrivateRoute:', error);
    return <Navigate to="/login" />;
  }
}

function AdminRoute({ children }) {
  console.log('🔍 AdminRoute - Executado - ANTES DO useAuth');
  alert('🔍 AdminRoute - Executado - ANTES DO useAuth');
  
  try {
    const { user } = useAuth();
    console.log('🔍 AdminRoute - Executado');
    console.log('🔍 AdminRoute - User:', user);
    console.log('🔍 AdminRoute - User role:', user?.role);
    alert('🔍 AdminRoute - Executado - User role: ' + user?.role);
    
    const isAdmin = user && (user.role === 'ADM' || user.role === 'PASTOR');
    console.log('🔍 AdminRoute - Is admin:', isAdmin);
    return isAdmin ? children : <Navigate to="/" />;
  } catch (error) {
    console.error('Erro no AdminRoute:', error);
    alert('🔍 AdminRoute - ERRO: ' + error.message);
    return <Navigate to="/" />;
  }
}

// Componente que redireciona automaticamente baseado no papel do usuário
function SmartDashboardRoute() {
  console.log('🔍 SmartDashboardRoute - Executado');
  const { user } = useAuth();
  
  console.log('🔍 SmartDashboardRoute - User:', user);
  console.log('🔍 SmartDashboardRoute - User role:', user?.role);
  console.log('🔍 SmartDashboardRoute - User role type:', typeof user?.role);
  console.log('🔍 SmartDashboardRoute - Current pathname:', window.location.pathname);
  
  if (!user) {
    console.log('🔍 SmartDashboardRoute - Redirecionando para login');
    return <Navigate to="/login" />;
  }
  
  // Se for admin ou pastor, vai para o dashboard admin
  if (user.role === 'ADM' || user.role === 'PASTOR') {
    console.log('🔍 SmartDashboardRoute - Redirecionando admin/pastor para dashboard admin');
    alert('🔍 SmartDashboardRoute - Redirecionando admin/pastor para dashboard admin');
    console.log('🔍 SmartDashboardRoute - URL de destino: /admin/dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // Se for audiovisual, vai para o dashboard audiovisual
  if (user.role === 'AUDIOVISUAL') {
    console.log('🔍 SmartDashboardRoute - Redirecionando audiovisual para dashboard audiovisual');
    return <Navigate to="/audiovisual/dashboard" />;
  }
  
  // Se for serviço geral, vai para o dashboard serviço geral
  if (user.role === 'SERVICO_GERAL') {
    console.log('🔍 SmartDashboardRoute - Redirecionando serviço geral para dashboard serviço geral');
    return <Navigate to="/servico-geral/dashboard" />;
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
            <>
              {console.log('🔍 ROTA /admin/dashboard - Executada')}
              {alert('🔍 ROTA /admin/dashboard - Executada - VERSÃO TESTE')}
              <h1>TESTE ROTA ADMIN DASHBOARD</h1>
              <p>URL: {window.location.pathname}</p>
              <AdminRoute>
                <Layout>
                  <div style={{ padding: '20px', background: 'red', color: 'white' }}>
                    <h1>TESTE DIRETO - DashboardAdmin Substituído</h1>
                    <p>Se você vê isso, o problema é no componente DashboardAdmin</p>
                    <button onClick={() => alert('BOTÃO FUNCIONANDO!')}>
                      Clique aqui para testar
                    </button>
                  </div>
                </Layout>
              </AdminRoute>
            </>
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
        <Route
          path="/audiovisual/requisicoes"
          element={
            <PrivateRoute>
              <Layout>
                <RequestsAudiovisual />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/servico-geral/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <ServicoGeralDashboard />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
} 