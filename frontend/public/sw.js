// Service Worker simplificado para PWA do Sistema de Requerimentos IBVA
const CACHE_NAME = 'ibva-requerimentos-v1.0.2';

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
});

console.log('🎯 Service Worker: Carregado e pronto!');