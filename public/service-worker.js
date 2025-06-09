/* ---------- constants ---------- */
const CACHE_NAME = "react-pwa-cache-v2";
const LOCATION_QUEUE = "location-queue";
const AUTH_CACHE = "auth-cache";
const OFFLINE_FALLBACK = "/offline.html";

const LOCATION_API_URL = self.location.hostname === "localhost"
  ? "http://localhost:8000/api/app/add-staff-location"
  : "/api/app/add-staff-location";

/* ---------- install ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/favicon.ico',
        '/logo192.png',
        '/logo512.png',
        OFFLINE_FALLBACK,
      ]))
  );
  self.skipWaiting();
});

/* ---------- activate ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if ([CACHE_NAME, LOCATION_QUEUE, AUTH_CACHE].includes(cacheName)) {
            return null;
          }
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

/* ---------- message handler ---------- */
self.addEventListener('message', (event) => {
  if (event.data.type === 'ENQUEUE_LOCATION') {
    event.waitUntil(handleLocationMessage(event.data.data));
  }
});

async function handleLocationMessage(data) {
  try {
    // Try to send immediately
    const response = await fetch(LOCATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`
      },
      body: JSON.stringify({
        uuid: data.uuid,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude
      }),
      keepalive: true
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response;
  } catch (error) {
    // If fails, add to queue
    console.log('Adding location to queue', error);
    return addToLocationQueue(data);
  }
}

/* ---------- queue management ---------- */
async function addToLocationQueue(data) {
  const cache = await caches.open(LOCATION_QUEUE);
  const id = Date.now();
  await cache.put(
    new Request(`location-${id}`),
    new Response(JSON.stringify(data))
  );

  // Register for sync if available
  if ('sync' in self.registration) {
    try {
      await self.registration.sync.register('location-sync');
    } catch (err) {
      console.warn('Sync registration failed:', err);
    }
  }

  return new Response(JSON.stringify({ queued: true }));
}

async function processLocationQueue() {
  const cache = await caches.open(LOCATION_QUEUE);
  const requests = await cache.keys();

  for (const request of requests) {
    try {
      const response = await cache.match(request);
      if (!response) continue;

      const data = await response.json();

      const res = await fetch(LOCATION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        },
        body: JSON.stringify({
          uuid: data.uuid,
          name: data.name,
          latitude: data.latitude,
          longitude: data.longitude
        }),
        keepalive: true
      });

      if (res.ok) {
        await cache.delete(request);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (error) {
      console.error('Failed to process location:', error);
      throw error;
    }
  }
}

/* ---------- event listeners ---------- */
self.addEventListener('sync', (event) => {
  if (event.tag === 'location-sync') {
    event.waitUntil(processLocationQueue());
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-location-sync') {
    event.waitUntil(processLocationQueue());
  }
});

self.addEventListener('online', () => {
  if ('sync' in self.registration) {
    self.registration.sync.register('location-sync')
      .catch(err => console.warn('Online sync registration failed:', err));
  }
});

/* ---------- fetch handler ---------- */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Handle location POSTs
  if (request.url.includes('/add-staff-location') && request.method === 'POST') {
    event.respondWith(handleLocationFetch(request));
    return;
  }

  // Cache-first strategy for other requests
  event.respondWith(
    caches.match(request)
      .then(cached => cached || fetch(request))
      .catch(() => caches.match(OFFLINE_FALLBACK))
  );
});

async function handleLocationFetch(request) {
  try {
    const response = await fetch(request.clone());
    return response;
  } catch (error) {
    const data = await request.json();
    const token = await getAuthToken();
    return addToLocationQueue({ ...data, token });
  }
}

/* ---------- helper functions ---------- */
async function getAuthToken() {
  const cache = await caches.open(AUTH_CACHE);
  const response = await cache.match('/auth-token');
  if (!response) return null;
  const { token } = await response.json();
  return token;
}