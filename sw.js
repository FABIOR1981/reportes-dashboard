// ============================================================
//  SERVICE WORKER — reportes-dashboard
// ============================================================
// Guarda una copia local de todo lo necesario para que el
// dashboard y los 3 generadores abran y funcionen sin conexión
// (siempre que ya se hayan abierto al menos una vez con internet).
//
// IMPORTANTE: si agregás/renombrás/movés algún archivo del
// proyecto, hay que sumarlo también a PRECACHE_URLS de acá abajo
// y subir el número de CACHE_VERSION, para que los usuarios que
// ya tenían la app instalada reciban la actualización.
//
// El número de acá abajo es la ÚNICA fuente de verdad de la
// versión: el badge que se ve en el sidebar (index.html) lo lee
// directamente de este archivo en tiempo real (ver js/main.js),
// así que no hace falta (ni conviene) duplicarlo en ningún otro
// lugar. Esto tiene que vivir en ESTE archivo puntual y no en uno
// aparte: el navegador detecta que "hay una versión nueva"
// comparando los bytes de este archivo específico — si el número
// viviera en un archivo separado, cambiarlo no dispararía ninguna
// actualización.
// ============================================================

const CACHE_VERSION = 'v2';
const CACHE_NAME = 'reportes-dashboard-' + CACHE_VERSION;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/main.js',
  './index.json',
  './icons/icon-192.png',
  './icons/icon-512.png',

  './html_externos/_shared/botonera.css',
  './html_externos/_shared/botonera.js',
  './html_externos/_shared/diccionario-base.js',
  './html_externos/_shared/vendor/html2canvas.min.js',
  './html_externos/_shared/vendor/jspdf.umd.min.js',
  './html_externos/_shared/vendor/docx.umd.min.js',

  './html_externos/generico/informe_generico.html',
  './html_externos/generico/css/style.css',
  './html_externos/generico/js/script.js',

  './html_externos/sm_consultores/generador_informe_psicotecnico.html',
  './html_externos/sm_consultores/css/style_psicotecnico.css',
  './html_externos/sm_consultores/js/script_psicotecnico.js',

  './html_externos/ude/generador_informe_psicolaboral.html',
  './html_externos/ude/css/style_psicolaboral.css',
  './html_externos/ude/js/script_psicolaboral.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) { return cache.addAll(PRECACHE_URLS); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(names) {
        return Promise.all(
          names.filter(function(n) { return n !== CACHE_NAME; })
               .map(function(n) { return caches.delete(n); })
        );
      })
      .then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  const req = event.request;

  // Solo interceptamos GET; el resto (POST, etc.) pasa de largo.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // El corrector ortográfico (LanguageTool) NUNCA se cachea ni se
  // intercepta: tiene que intentar red real siempre, para que el
  // aviso de "sin conexión" del propio dashboard siga funcionando
  // exactamente igual que sin Service Worker.
  if (url.hostname.indexOf('languagetool.org') !== -1) {
    return;
  }

  // Todo lo demás (archivos propios + CDN de íconos, etc.):
  // "stale-while-revalidate" — si hay copia guardada, la servimos
  // al instante, y de paso intentamos traer una versión más nueva
  // en segundo plano para la próxima vez.
  event.respondWith(
    caches.match(req).then(function(cached) {
      const networkFetch = fetch(req).then(function(res) {
        if (res && res.ok) {
          caches.open(CACHE_NAME).then(function(cache) { cache.put(req, res.clone()); });
        }
        return res;
      }).catch(function() { return cached; });

      return cached || networkFetch;
    })
  );
});
