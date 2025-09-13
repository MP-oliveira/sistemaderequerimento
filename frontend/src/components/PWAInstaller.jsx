import React, { useState, useEffect } from 'react';
import './PWAInstaller.css';

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkInstallation = () => {
      // Verificar se está rodando em modo standalone
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

    // Verificar se o app foi instalado
    const handleAppInstalled = () => {
      console.log('🎉 PWA: App instalado com sucesso!');
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    // Capturar o prompt de instalação (Chrome/Edge)
    const handleBeforeInstallPrompt = (e) => {
      console.log('📱 PWA: Prompt de instalação disponível (Chrome/Edge)');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    // Verificar se o prompt foi rejeitado
    const handleAppInstalledRejected = () => {
      console.log('❌ PWA: Instalação rejeitada');
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    // Verificar instalação inicial
    checkInstallation();

    // Para Safari iOS, mostrar botão após um delay
    if (isSafariIOS()) {
      console.log('🍎 PWA: Safari iOS detectado - mostrando botão manual');
      setTimeout(() => {
        setShowInstallButton(true);
      }, 2000); // 2 segundos de delay
    } else {
      // Para Chrome/Edge, usar o evento beforeinstallprompt
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    // Event listeners
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // Detectar Safari no iOS
    const isSafariIOS = () => {
      const ua = navigator.userAgent;
      return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua);
    };

    if (isSafariIOS()) {
      // Para Safari iOS, mostrar instruções
      alert('Para instalar o app no Safari:\n\n1. Toque no botão de compartilhar (📤)\n2. Selecione "Adicionar à Tela de Início"\n3. Digite "Requerimentos IBVA"\n4. Toque em "Adicionar"');
      return;
    }

    if (!deferredPrompt) return;

    try {
      // Mostrar o prompt de instalação (Chrome/Edge)
      deferredPrompt.prompt();
      
      // Aguardar a resposta do usuário
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ PWA: Usuário aceitou a instalação');
        setIsInstalled(true);
      } else {
        console.log('❌ PWA: Usuário rejeitou a instalação');
      }
      
      // Limpar o prompt
      setDeferredPrompt(null);
      setShowInstallButton(false);
    } catch (error) {
      console.error('❌ PWA: Erro ao instalar:', error);
    }
  };

  const handleShareClick = async () => {
    // Detectar Safari no iOS
    const isSafariIOS = () => {
      const ua = navigator.userAgent;
      return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua);
    };

    if (isSafariIOS()) {
      // Para Safari iOS, mostrar instruções específicas
      alert('Para instalar o app:\n\n1. Toque no botão de compartilhar (📤) na barra do Safari\n2. Role para baixo e selecione "Adicionar à Tela de Início"\n3. Digite "Requerimentos IBVA" como nome\n4. Toque em "Adicionar" no canto superior direito');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'IBVA - Sistema de Requerimentos',
          text: 'Acesse o sistema de requerimentos da IBVA',
          url: window.location.origin
        });
      } catch (error) {
        console.log('Compartilhamento cancelado ou erro:', error);
      }
    } else {
      // Fallback: copiar URL para clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin);
        alert('Link copiado para a área de transferência!');
      } catch (error) {
        console.error('Erro ao copiar link:', error);
      }
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
    deferredPrompt: !!deferredPrompt,
    userAgent: navigator.userAgent
  });

  return (
    <div className="pwa-installer">
      {showInstallButton && (
        <div className="pwa-install-banner">
          <div className="pwa-install-content">
            <div className="pwa-install-icon">
              <img src="/ibva-logo.png" alt="IBVA" />
            </div>
            <div className="pwa-install-text">
              <h3>Instalar App de Requerimentos IBVA</h3>
              <p>Acesse rapidamente o sistema de requerimentos</p>
            </div>
            <div className="pwa-install-actions">
              <button 
                className="pwa-install-btn"
                onClick={handleInstallClick}
              >
                Instalar
              </button>
              <button 
                className="pwa-share-btn"
                onClick={handleShareClick}
                title="Compartilhar"
              >
                📤
              </button>
              <button 
                className="pwa-close-btn"
                onClick={() => setShowInstallButton(false)}
                title="Fechar"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAInstaller;
