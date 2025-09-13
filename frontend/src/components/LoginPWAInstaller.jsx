import React, { useState, useEffect } from 'react';
import './LoginPWAInstaller.css';

const LoginPWAInstaller = () => {
  console.log('🚀 LoginPWAInstaller: Componente carregado!');
  
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkInstallation = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              window.navigator.standalone ||
                              document.referrer.includes('android-app://');
      
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    // Detectar Safari no iOS
    const isSafariIOS = () => {
      const ua = navigator.userAgent;
      return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua);
    };

    // Verificar instalação inicial
    checkInstallation();

    // Para Safari iOS, mostrar botão após um delay
    if (isSafariIOS()) {
      console.log('🍎 PWA: Safari iOS detectado - mostrando botão manual');
      setTimeout(() => {
        setShowInstallButton(true);
      }, 2000);
    } else {
      // Para Chrome/Edge, usar o evento beforeinstallprompt
      const handleBeforeInstallPrompt = (e) => {
        console.log('📱 PWA: Prompt de instalação disponível (Chrome/Edge)');
        e.preventDefault();
        setShowInstallButton(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    // Detectar Safari no iOS
    const isSafariIOS = () => {
      const ua = navigator.userAgent;
      return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua);
    };

    if (isSafariIOS()) {
      // Para Safari iOS, mostrar instruções
      alert('Para instalar o app no Safari:\n\n1. Toque no botão de compartilhar (📤) na barra do Safari\n2. Role para baixo e selecione "Adicionar à Tela de Início"\n3. Digite "Requerimentos IBVA" como nome\n4. Toque em "Adicionar" no canto superior direito');
      return;
    }

    // Para Chrome/Edge, tentar usar o prompt nativo
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('✅ PWA: Usuário aceitou a instalação');
        setIsInstalled(true);
      }
      window.deferredPrompt = null;
    }
  };

  // TESTE: Forçar exibição do botão para debug
  console.log('🔍 PWA Debug:', {
    showInstallButton,
    isInstalled,
    isStandalone,
    userAgent: navigator.userAgent
  });

  // Verificar se é mobile
  const isMobile = () => {
    // Verificar largura da tela
    const isSmallScreen = window.innerWidth <= 768;
    
    // Verificar User Agent
    const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Verificar se é touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return isSmallScreen && (isMobileUA || isTouchDevice);
  };
  
  // Não mostrar em desktop
  if (!isMobile()) {
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
      color: 'white', 
      padding: '12px 16px', 
      margin: '16px 0',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
          src="/ibva-logo.png" 
          alt="IBVA" 
          style={{ width: '32px', height: '32px', borderRadius: '6px' }}
        />
        <div style={{ flex: 1, textAlign: 'left' }}>
          <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: '600' }}>
            Instalar App de Requerimentos IBVA
          </h4>
          <p style={{ margin: '0', fontSize: '12px', opacity: '0.9' }}>
            Acesse rapidamente o sistema
          </p>
        </div>
        <button 
          onClick={handleInstallClick}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '12px',
            transition: 'all 0.2s ease'
          }}
        >
          Instalar
        </button>
      </div>
    </div>
  );
};

export default LoginPWAInstaller;
