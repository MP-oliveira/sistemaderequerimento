import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Inventory from '../pages/Inventory';
import Requests from '../pages/Requests';
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

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
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
      </Routes>
    </BrowserRouter>
  );
} 