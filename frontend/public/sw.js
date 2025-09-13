// Service Worker para PWA do Sistema de Requerimentos IBVA
const CACHE_NAME = 'ibva-requerimentos-v1.0.0';
const STATIC_CACHE_NAME = 'ibva-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'ibva-dynamic-v1.0.0';

// Arquivos estáticos para cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/favicon-48x48.png',
  '/apple-touch-icon.png',
  '/pwa-icon-192x192.png',
  '/pwa-icon-512x512.png',
  '/ibva-logo.png'
];

// URLs da API que devem ser cacheadas
const API_CACHE_PATTERNS = [
  /\/api\/requests/,
  /\/api\/inventory/,
  /\/api\/users/,
  /\/api\/auth/
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cacheando arquivos estáticos...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalação concluída');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erro na instalação:', error);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Ativação concluída');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia para arquivos estáticos
  if (STATIC_FILES.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then((response) => {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
              return response;
            });
        })
    );
    return;
  }

  // Estratégia para APIs
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME)
        .then((cache) => {
          return cache.match(request)
            .then((response) => {
              if (response) {
                // Retornar do cache e atualizar em background
                fetch(request)
                  .then((fetchResponse) => {
                    if (fetchResponse.ok) {
                      cache.put(request, fetchResponse.clone());
                    }
                  })
                  .catch(() => {
                    // Ignorar erros de rede em background
                  });
                return response;
              }

              // Se não estiver no cache, buscar da rede
              return fetch(request)
                .then((fetchResponse) => {
                  if (fetchResponse.ok) {
                    cache.put(request, fetchResponse.clone());
                  }
                  return fetchResponse;
                })
                .catch(() => {
                  // Retornar página offline para APIs
                  if (request.method === 'GET') {
                    return new Response(
                      JSON.stringify({
                        success: false,
                        message: 'Modo offline - dados não disponíveis',
                        offline: true
                      }),
                      {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                      }
                    );
                  }
                  throw new Error('Network error');
                });
            });
        })
    );
    return;
  }

  // Estratégia para outras requisições (HTML, CSS, JS)
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(request)
          .then((fetchResponse) => {
            if (fetchResponse.ok) {
              const responseClone = fetchResponse.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return fetchResponse;
          })
          .catch(() => {
            // Retornar página offline para navegação
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            throw new Error('Network error');
          });
      })
  );
});

// Gerenciar notificações push (para futuras implementações)
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Push notification recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do sistema IBVA',
    icon: '/pwa-icon-192x192.png',
    badge: '/favicon-32x32.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/favicon-32x32.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/favicon-32x32.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('IBVA - Sistema de Requerimentos', options)
  );
});

// Gerenciar cliques em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Notificação clicada');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Apenas fechar a notificação
  } else {
    // Clique na notificação (não em uma ação)
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sincronização em background (para futuras implementações)
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Sincronização em background');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Implementar lógica de sincronização aqui
      Promise.resolve()
    );
  }
});

// Gerenciar mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('🎯 Service Worker: Carregado e pronto!');
