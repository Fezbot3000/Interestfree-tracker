// Service Worker for Interest-Free Tracker PWA

const CACHE_NAME = 'interest-free-tracker-v1';

// Determine the scope path dynamically
const getScopePath = () => {
  return self.registration.scope;
};

// Function to create a relative path list based on the scope
const getUrlsToCache = () => {
  const scope = getScopePath();
  
  // Basic files to cache
  return [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './offline.js',
    './manifest.json',
    // Add icons
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png'
  ];
};

// Install event - cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(getUrlsToCache());
      })
      .catch(error => {
        console.error('Error during service worker install:', error);
      })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Helper function to determine if a request is a navigation
const isNavigationRequest = (request) => {
  return request.mode === 'navigate';
};

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from the cached version
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();
        
        // Not in cache - return the result from the live server
        // and add it to the cache for future offline access
        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(error => {
            // If fetch fails (e.g., offline), show fallback response
            console.error('Fetch failed:', error);
            
            // For HTML requests (navigation), return index.html
            if (isNavigationRequest(event.request)) {
              return caches.match('./index.html');
            }
            
            // Could return specific fallbacks for images, etc.
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});