const CACHE_NAME = 'lech-lecha-cache-v1';

// Seznam všeho, co se má uložit pro fungování bez internetu
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './strava.png',
  './assets/plus.svg',
  './assets/run.svg',
  './assets/bike.svg',
  './assets/walk.svg',
  './assets/ski.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js',
  'https://unpkg.com/leaflet/dist/leaflet.css',
  'https://unpkg.com/leaflet/dist/leaflet.js',
  'https://unpkg.com/togeojson'
];

// Instalace Service Workeru a nahrání souborů do mezipaměti
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Soubory se úspěšně ukládají do mezipaměti');
        return cache.addAll(urlsToCache);
      })
  );
});

// Zajištění toho, že se appka načte i bez připojení k internetu
self.addEventListener('fetch', event => {
  // Ignorujeme požadavky na Firebase databázi (to řeší samotný Firebase SDK)
  if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('securetoken.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Pokud je soubor v cache (offline paměti), vrátí se z ní. Pokud ne, zkusí se stáhnout z netu.
        return response || fetch(event.request);
      })
  );
});

// Mazání staré cache, pokud vydáš novou verzi aplikace
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
    })
  );
});
