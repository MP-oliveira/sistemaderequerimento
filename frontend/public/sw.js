// Service Worker simplificado para PWA do Sistema de Requerimentos IBVA
const CACHE_NAME = 'ibva-requerimentos-v1.0.3';

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Ativando...');
  event.waitUntil(self.clients.claim());
});

// Interceptar requisições - estratégia network-first
self.addEventListener('fetch', (event) => {
  // Para todas as requisições, usar network-first
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Se falhar, tentar do cache
        return caches.match(event.request);
      })
  );
});

// Gerenciar mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Gerenciar badges PWA
  if (event.data && event.data.type === 'UPDATE_BADGE') {
    const count = event.data.count || 0;
    if (count > 0) {
      navigator.setAppBadge(count);
      console.log(`🔴 Service Worker: Badge atualizado para ${count}`);
    } else {
      navigator.clearAppBadge();
      console.log('✅ Service Worker: Badge limpo');
    }
  }
});

// Atualizar badge quando a aplicação ganha foco
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'APP_FOCUS') {
    // Notificar o cliente para atualizar o badge
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'UPDATE_BADGE_REQUEST' });
      });
    });
  }
});

console.log('🎯 Service Worker: Carregado e pronto com suporte a badges!');