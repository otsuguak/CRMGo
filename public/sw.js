// 🔥 IMPORTANTE: OneSignal debe ser la primera línea
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// Bautizamos la nueva era
const CACHE_NAME = 'vecindaria-v1';

self.addEventListener('install', (event) => {
  console.log('[Vecindaria SW] Instalado con éxito');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Vecindaria SW] Activado y limpiando basura vieja...');
  
  // 🔥 LA ESCOBA MÁGICA: Esto busca memorias viejas y las ELIMINA
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Si el nombre del caché no es exactamente igual al nuevo, lo borra
          if (cacheName !== CACHE_NAME) {
            console.log('[Vecindaria SW] Borrando caché viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptor de peticiones seguro
self.addEventListener('fetch', (event) => {
  // Ignoramos peticiones POST o las que van a Supabase para no interferir con la base de datos
  if (event.request.method !== 'GET' || event.request.url.includes('supabase.co')) {
    return; 
  }

  event.respondWith(
    fetch(event.request).catch(async () => {
      const respuestaCache = await caches.match(event.request);
      // 🔥 EL SALVAVIDAS: Si no hay internet y no hay caché, devolvemos un Response real y evitamos el error fatal
      return respuestaCache || new Response('Página no disponible offline', { status: 503, statusText: 'Offline' });
    })
  );
});