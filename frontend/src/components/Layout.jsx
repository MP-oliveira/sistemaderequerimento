import React from 'react';
import Header from './Header';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div>
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
} 