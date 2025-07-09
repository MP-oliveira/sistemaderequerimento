import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p>Bem-vindo ao sistema de requisições, inventário e eventos!</p>
      <nav>
        <Link to="/usuarios">Usuários</Link>
        <Link to="/inventario">Inventário</Link>
        <Link to="/requisicoes">Requisições</Link>
        <Link to="/eventos">Eventos</Link>
      </nav>
    </div>
  );
} 