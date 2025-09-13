import React, { useState, useEffect } from 'react';
import './LoginPWAInstaller.css';

const LoginPWAInstaller = () => {
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

  // Não mostrar nada se já estiver instalado ou em modo standalone
  if (isInstalled || isStandalone) {
    return null;
  }

  // TESTE: Forçar exibição do botão para debug
  console.log('🔍 PWA Debug:', {
    showInstallButton,
    isInstalled,
    isStandalone,
    userAgent: navigator.userAgent
  });

  return (
    <div className="login-pwa-installer">
      {showInstallButton && (
        <div className="login-pwa-banner">
          <div className="login-pwa-content">
            <div className="login-pwa-icon">
              <img src="/ibva-logo.png" alt="IBVA" />
            </div>
            <div className="login-pwa-text">
              <h4>Instalar App de Requerimentos IBVA</h4>
              <p>Acesse rapidamente o sistema</p>
            </div>
            <button 
              className="login-pwa-btn"
              onClick={handleInstallClick}
            >
              Instalar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPWAInstaller;
