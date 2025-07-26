import React from 'react';
import Header from './Header';
import NotificationSystem from './NotificationSystem';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <NotificationSystem />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
} 