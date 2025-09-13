import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';
import './PWAInstallInstructions.css';

const PWAInstallInstructions = () => {
  const { isInstalled, isStandalone, canInstall } = usePWA();
  const [showInstructions, setShowInstructions] = useState(false);
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    setUserAgent(navigator.userAgent);
  }, []);

  // Não mostrar se já estiver instalado
  if (isInstalled || isStandalone) {
    return null;
  }

  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
  };

  return (
    <div className="pwa-install-instructions">
      {!canInstall && (
        <div className="pwa-manual-install">
          <button 
            className="pwa-manual-install-btn"
            onClick={handleShowInstructions}
          >
            📱 Como Instalar o App
          </button>
        </div>
      )}

      {showInstructions && (
        <div className="pwa-instructions-modal">
          <div className="pwa-instructions-content">
            <div className="pwa-instructions-header">
              <h3>📱 Instalar Requerimentos IBVA</h3>
              <button 
                className="pwa-close-instructions"
                onClick={handleCloseInstructions}
              >
                ✕
              </button>
            </div>

            <div className="pwa-instructions-body">
              {isIOS && isSafari && (
                <div className="pwa-instruction-step">
                  <h4>🍎 Para iPhone/iPad (Safari):</h4>
                  <ol>
                    <li>Toque no botão <strong>Compartilhar</strong> <span className="icon">⎋</span> na parte inferior</li>
                    <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>
                    <li>Toque em <strong>"Adicionar"</strong> no canto superior direito</li>
                    <li>O app aparecerá na sua tela inicial!</li>
                  </ol>
                </div>
              )}

              {isAndroid && isChrome && (
                <div className="pwa-instruction-step">
                  <h4>🤖 Para Android (Chrome):</h4>
                  <ol>
                    <li>Toque nos <strong>três pontos</strong> ⋮ no canto superior direito</li>
                    <li>Selecione <strong>"Adicionar à tela inicial"</strong></li>
                    <li>Toque em <strong>"Adicionar"</strong></li>
                    <li>O app aparecerá na sua tela inicial!</li>
                  </ol>
                </div>
              )}

              {!isIOS && !isAndroid && (
                <div className="pwa-instruction-step">
                  <h4>💻 Para Desktop:</h4>
                  <ol>
                    <li><strong>Chrome/Edge:</strong> Clique no ícone de instalação na barra de endereço</li>
                    <li><strong>Firefox:</strong> Clique no ícone "+" na barra de endereço</li>
                    <li>Ou use o menu do navegador → "Instalar aplicativo"</li>
                  </ol>
                </div>
              )}

              <div className="pwa-instruction-step">
                <h4>📋 Instruções Gerais:</h4>
                <ul>
                  <li>✅ O app funcionará offline após a instalação</li>
                  <li>✅ Receberá notificações quando disponível</li>
                  <li>✅ Interface otimizada para mobile</li>
                  <li>✅ Acesso rápido pela tela inicial</li>
                </ul>
              </div>

              <div className="pwa-instruction-note">
                <p><strong>💡 Dica:</strong> Após instalar, o app aparecerá como um ícone nativo na sua tela inicial, funcionando como qualquer outro aplicativo!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAInstallInstructions;
