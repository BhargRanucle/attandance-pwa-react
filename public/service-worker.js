/* ---------- constants ---------- */
const CACHE_NAME = "react-pwa-cache-v2";
const LOCATION_QUEUE = "location-queue";
const AUTH_CACHE = "auth-cache";
const OFFLINE_FALLBACK = "/offline.html";
const LOCATION_API_URL = self.location.hostname === "localhost"
  ? "http://localhost:8000/api/app/add-staff-location"
  : "/api/app/add-staff-location";

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
          if (![CACHE_NAME, LOCATION_QUEUE, AUTH_CACHE].includes(cacheName)) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    }).then(() => self.clients.claim())
  );
});

/* ---------- message handler ---------- */
self.addEventListener('message', (event) => {
  if (event.data.type === 'SAVE_AUTH_TOKEN') {
    event.waitUntil(saveAuthTokenInCache(event.data.token));
  } else if (event.data.type === 'RETRY_LOCATION_QUEUE') {
    event.waitUntil(processLocationQueue());
  }
});

async function handleLocationMessage(data) {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.warn("No auth token available in service worker. Enqueuing location.");
      return addToLocationQueue(data);
    }
    const response = await fetch(LOCATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    console.log('Location sent successfully:', await response.json());
    return response;
  } catch (error) {
    console.error('Failed to send location immediately, adding to queue:', error);
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
  console.log(`Location data for ID ${id} added to queue.`);
  if ('sync' in self.registration) {
    try {
      await self.registration.sync.register('location-sync');
      console.log('One-off sync registered for location updates.');
    } catch (err) {
      console.warn('Sync registration failed:', err);
    }
  }
  return new Response(JSON.stringify({ queued: true, id: id }));
}

async function processLocationQueue() {
  console.log('Processing location queue...');
  const cache = await caches.open(LOCATION_QUEUE);
  const requests = await cache.keys();
  if (requests.length === 0) {
    console.log('Location queue is empty.');
    return;
  }
  const token = await getAuthToken();
  if (!token) {
    console.warn('No auth token available, cannot process location queue. Will retry later.');
    throw new Error('Auth token not found during queue processing.');
  }
  for (const request of requests) {
    try {
      const response = await cache.match(request);
      if (!response) {
        console.warn(`No response found for cached request: ${request.url}`);
        await cache.delete(request);
        continue;
      }
      const data = await response.json();
      console.log('Attempting to send queued location:', data);
      const res = await fetch(LOCATION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        console.log(`Successfully sent queued location for ${request.url}`);
        await cache.delete(request);
      } else {
        throw new Error(`HTTP ${res.status} when processing queue`);
      }
    } catch (error) {
      console.error(`Failed to process location for ${request.url}:`, error);
      throw error;
    }
  }
  console.log('Finished processing location queue.');
}

/* ---------- event listeners ---------- */
self.addEventListener('sync', (event) => {
  if (event.tag === 'location-sync') {
    console.log('Sync event received for location-sync.');
    event.waitUntil(processLocationQueue());
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-location-sync') {
    console.log('Periodic Sync event received for periodic-location-sync.');
    event.waitUntil(processLocationQueue());
  }
});

self.addEventListener('online', () => {
  console.log('Browser is back online.');
  if ('sync' in self.registration) {
    self.registration.sync.register('location-sync')
      .catch(err => console.warn('Online sync registration failed:', err));
  }
});

/* ---------- fetch handler ---------- */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.url.includes('/add-staff-location') && request.method === 'POST') {
    event.respondWith(handleLocationFetch(request));
    return;
  }
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
    console.error('Fetch failed for location API, trying to enqueue:', error);
    const requestData = await request.clone().json();
    const token = await getAuthToken(); 
    return addToLocationQueue({ ...requestData, token });
  }
}

/* ---------- helper functions ---------- */
async function getAuthToken() {
  const cache = await caches.open(AUTH_CACHE);
  const response = await cache.match('/auth-token');
  if (!response) {
    console.warn('Auth token not found in cache.');
    return null;
  }
  try {
    const { token } = await response.json();
    return token;
  } catch (e) {
    console.error('Failed to parse auth token from cache:', e);
    return null;
  }
}

async function saveAuthTokenInCache(token) {
  const cache = await caches.open(AUTH_CACHE);
  await cache.put(new Request('/auth-token'), new Response(JSON.stringify({ token })));
  console.log('Auth token saved in service worker cache.');
}