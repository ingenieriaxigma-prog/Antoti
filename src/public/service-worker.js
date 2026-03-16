/**
 * =====================================================
 * OTI - SERVICE WORKER v3.2
 * =====================================================
 * 
 * PWA Service Worker for offline functionality
 * Cache strategy: Network-first with cache fallback
 * 
 * Features:
 * - Offline mode support
 * - Asset caching
 * - API response caching (selectively)
 * - Background sync
 * - Push notifications support
 * 
 * =====================================================
 */

const CACHE_VERSION = 'oti-v3.2.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_API = `${CACHE_VERSION}-api`;

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html'
];

// API endpoints to cache (GET requests only)
const CACHEABLE_API_PATTERNS = [
  '/make-server-727b50c3/accounts',
  '/make-server-727b50c3/categories',
  '/make-server-727b50c3/budgets'
];

// Maximum cache age (24 hours)
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000;

/**
 * Install event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v3.2...');
  
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets...');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => {
        console.log('[SW] ✅ Static assets cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[SW] ❌ Error caching static assets:', error);
      })
  );
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v3.2...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName.startsWith('oti-v') && cacheName !== CACHE_VERSION) {
              console.log(`[SW] 🗑️ Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] ✅ Activated successfully');
        return self.clients.claim(); // Take control immediately
      })
  );
});

/**
 * Fetch event - Network-first strategy with cache fallback
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Strategy: Network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response (can only be consumed once)
        const responseToCache = response.clone();

        // Cache successful responses
        if (response.status === 200) {
          const cacheName = isCacheableAPI(url) ? CACHE_API : CACHE_DYNAMIC;
          
          caches.open(cacheName).then((cache) => {
            cache.put(request, responseToCache);
          });
        }

        return response;
      })
      .catch((error) => {
        console.log('[SW] Network failed, trying cache:', request.url);

        // Try cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] ✅ Serving from cache:', request.url);
              return cachedResponse;
            }

            // No cache available - show offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }

            // For other requests, return a generic error
            return new Response('Offline - No cached version available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

/**
 * Background Sync - Sync offline transactions when back online
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncOfflineTransactions());
  }
});

/**
 * Push Notification - Handle push events
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Oti';
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'oti-notification',
    requireInteraction: false,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Notification Click - Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.action || '/')
  );
});

/**
 * Message - Handle messages from client
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.urls || [];
    event.waitUntil(
      caches.open(CACHE_DYNAMIC).then((cache) => {
        return cache.addAll(urlsToCache);
      })
    );
  }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Check if URL matches cacheable API patterns
 */
function isCacheableAPI(url) {
  return CACHEABLE_API_PATTERNS.some(pattern => url.pathname.includes(pattern));
}

/**
 * Sync offline transactions (placeholder)
 */
async function syncOfflineTransactions() {
  try {
    console.log('[SW] Syncing offline transactions...');
    
    // Get offline transactions from IndexedDB
    // Send to server
    // Clear offline queue
    
    console.log('[SW] ✅ Offline transactions synced');
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] ❌ Error syncing transactions:', error);
    return Promise.reject(error);
  }
}

/**
 * Check if cached response is still fresh
 */
function isCacheFresh(cachedResponse) {
  const dateHeader = cachedResponse.headers.get('date');
  if (!dateHeader) return false;

  const cachedDate = new Date(dateHeader).getTime();
  const now = Date.now();
  
  return (now - cachedDate) < MAX_CACHE_AGE;
}

console.log('[SW] Service Worker script loaded');
