import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/usuarios', label: 'Usuários' },
  { to: '/inventario', label: 'Inventário' },
  { to: '/requisicoes', label: 'Requisições' },
  { to: '/eventos', label: 'Eventos' },
];

export default function Sidebar() {
  return (
    <aside className="main-sidebar">
      <nav>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
            end={link.to === '/'}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
} 