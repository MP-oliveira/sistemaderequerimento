import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';

const PWADebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const { isOnline, isInstalled, isStandalone, canInstall } = usePWA();

  useEffect(() => {
    const checkPWAStatus = () => {
      const info = {
        // Service Worker
        serviceWorkerSupported: 'serviceWorker' in navigator,
        serviceWorkerRegistered: false,
        
        // Manifest
        manifestSupported: 'onbeforeinstallprompt' in window,
        manifestLoaded: false,
        
        // PWA Features
        isOnline,
        isInstalled,
        isStandalone,
        canInstall,
        
        // Browser Info
        userAgent: navigator.userAgent,
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        
        // Display Mode
        displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
        
        // URLs
        currentUrl: window.location.href,
        manifestUrl: '/manifest.json',
        swUrl: '/sw.js'
      };

      // Verificar se o service worker está registrado
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          info.serviceWorkerRegistered = !!registration;
          setDebugInfo({ ...info, serviceWorkerRegistered: !!registration });
        });
      }

      // Verificar se o manifest está carregado
      fetch('/manifest.json')
        .then(response => response.ok)
        .then(loaded => {
          info.manifestLoaded = loaded;
          setDebugInfo({ ...info, manifestLoaded: loaded });
        })
        .catch(() => {
          info.manifestLoaded = false;
          setDebugInfo({ ...info, manifestLoaded: false });
        });

      setDebugInfo(info);
    };

    checkPWAStatus();
  }, [isOnline, isInstalled, isStandalone, canInstall]);

  const handleForceInstall = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado:', registration);
        alert('Service Worker registrado com sucesso!');
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
        alert('Erro ao registrar Service Worker: ' + error.message);
      }
    }
  };

  const handleTestManifest = () => {
    fetch('/manifest.json')
      .then(response => response.json())
      .then(manifest => {
        console.log('Manifest carregado:', manifest);
        alert('Manifest carregado com sucesso! Verifique o console.');
      })
      .catch(error => {
        console.error('Erro ao carregar manifest:', error);
        alert('Erro ao carregar manifest: ' + error.message);
      });
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#4ade80' }}>🔧 PWA Debug</h4>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Service Worker:</strong> {debugInfo.serviceWorkerSupported ? '✅' : '❌'} 
        {debugInfo.serviceWorkerRegistered ? ' (Registrado)' : ' (Não registrado)'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Manifest:</strong> {debugInfo.manifestLoaded ? '✅' : '❌'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Mobile:</strong> {debugInfo.isMobile ? '✅' : '❌'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Display Mode:</strong> {debugInfo.displayMode}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Pode Instalar:</strong> {canInstall ? '✅' : '❌'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Já Instalado:</strong> {isInstalled ? '✅' : '❌'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Online:</strong> {isOnline ? '✅' : '❌'}
      </div>
      
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleForceInstall}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          Registrar SW
        </button>
        
        <button 
          onClick={handleTestManifest}
          style={{
            background: '#16a34a',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          Testar Manifest
        </button>
      </div>
      
      <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.7 }}>
        URL: {debugInfo.currentUrl}
      </div>
    </div>
  );
};

export default PWADebug;
