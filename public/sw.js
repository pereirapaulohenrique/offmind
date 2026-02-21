const CACHE_NAME = 'offmind-v1';

const STATIC_ASSETS = [
  '/',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/manifest.json',
];

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: strategy depends on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith('http')) return;

  // Network-first for API calls and Supabase requests
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase')
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Network-first for navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Cache-first for static assets (CSS, JS, fonts, images)
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: network-first
  event.respondWith(networkFirst(request));
});

function isStaticAsset(url) {
  const staticExtensions = [
    '.css',
    '.js',
    '.woff',
    '.woff2',
    '.ttf',
    '.otf',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.ico',
    '.webp',
  ];
  return staticExtensions.some((ext) => url.pathname.endsWith(ext));
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Offline fallback page
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OffMind — Offline</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1a1614;
      color: #e8e0d8;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 2rem;
    }
    .container { max-width: 400px; }
    h1 { font-size: 1.5rem; margin-bottom: 0.75rem; color: #c2410c; }
    p { font-size: 1rem; line-height: 1.6; opacity: 0.8; margin-bottom: 1.5rem; }
    button {
      background: #c2410c;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 1rem;
      font-size: 0.95rem;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    button:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>You're offline</h1>
    <p>OffMind needs an internet connection to sync your thoughts. Check your connection and try again.</p>
    <button onclick="window.location.reload()">Try again</button>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }
}
