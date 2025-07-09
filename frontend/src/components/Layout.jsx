import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div>
      <Header />
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
} 