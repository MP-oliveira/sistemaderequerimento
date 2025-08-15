import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './NotificationSystem.css';

export default function NotificationSystem() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Verificar se o usuário deve receber notificações
  const shouldShowNotifications = user && (user.role === 'SEC' || user.role === 'AUDIOVISUAL');

  useEffect(() => {
    if (!shouldShowNotifications) return;

    // Buscar notificações do localStorage
    const storedNotifications = JSON.parse(localStorage.getItem('requestNotifications') || '[]');
    setNotifications(storedNotifications);

    // Limpar notificações antigas (mais de 7 dias)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const filteredNotifications = storedNotifications.filter(notification => 
      new Date(notification.timestamp) > oneWeekAgo
    );
    
    if (filteredNotifications.length !== storedNotifications.length) {
      localStorage.setItem('requestNotifications', JSON.stringify(filteredNotifications));
      setNotifications(filteredNotifications);
    }
  }, [shouldShowNotifications]);

  const removeNotification = (id) => {
    const updatedNotifications = notifications.filter(n => n.id !== id);
    setNotifications(updatedNotifications);
    localStorage.setItem('requestNotifications', JSON.stringify(updatedNotifications));
  };

  if (!shouldShowNotifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-system">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`notification-item ${notification.type}`}
        >
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === 'approved' && '✅'}
              {notification.type === 'rejected' && '❌'}
              {notification.type === 'executed' && '🎯'}
            </div>
            <div className="notification-text">
              <div className="notification-title">{notification.title}</div>
              <div className="notification-message">{notification.message}</div>
              <div className="notification-time">
                {new Date(notification.timestamp).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
          <button 
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
} 