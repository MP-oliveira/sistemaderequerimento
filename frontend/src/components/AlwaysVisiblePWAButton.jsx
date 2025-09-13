import React from 'react';
import './AlwaysVisiblePWAButton.css';

const AlwaysVisiblePWAButton = () => {
  const handleInstall = () => {
    // Detectar Safari iOS
    const ua = navigator.userAgent;
    const isSafariIOS = /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua);
    
    if (isSafariIOS) {
      alert('Para instalar o app no Safari:\n\n1. Toque no botão de compartilhar (📤) na barra do Safari\n2. Role para baixo e selecione "Adicionar à Tela de Início"\n3. Digite "Requerimentos IBVA" como nome\n4. Toque em "Adicionar" no canto superior direito');
    } else {
      // Para Chrome/Edge, tentar prompt nativo
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('✅ PWA: Usuário aceitou a instalação');
          }
          window.deferredPrompt = null;
        });
      } else {
        alert('Para instalar o app:\n\n1. Toque no menu do navegador (⋮)\n2. Selecione "Instalar app" ou "Adicionar à tela inicial"\n3. Confirme a instalação');
      }
    }
  };

  return (
    <div className="pwa-button">
      <img 
        src="/ibva-logo.png" 
        alt="IBVA" 
      />
      <h4>
        Instalar App de Requerimentos IBVA
      </h4>
      <button onClick={handleInstall}>
        Instalar
      </button>
      <p>
        Acesse rapidamente o sistema
      </p>
    </div>
  );
};

export default AlwaysVisiblePWAButton;
