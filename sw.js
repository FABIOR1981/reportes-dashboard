// ============================================================
//  SERVICE WORKER — reportes-dashboard
// ============================================================
// Guarda una copia local de todo lo necesario para que el
// dashboard y los 3 generadores abran y funcionen sin conexión
// (siempre que ya se hayan abierto al menos una vez con internet).
//
// IMPORTANTE: la lista de archivos a precachear se genera sola
// (ver build-precache.js / precache-manifest.json más abajo) — no
// hay que tocar nada acá cuando agregás/renombrás/movés un archivo
// del proyecto. Lo único que sigue siendo manual es subir el número
// de CACHE_VERSION cuando el cambio sea grande (ver por qué más abajo).
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

const CACHE_VERSION = 'v3.0.4';
const CACHE_NAME = 'reportes-dashboard-' + CACHE_VERSION;

// La lista de archivos a precachear YA NO vive acá a mano — la genera
// build-precache.js escaneando el proyecto (mismo mecanismo que
// build-index.js con index.json) y la escribe en precache-manifest.json.
// Si agregás/renombrás/borrás un archivo, no hay que tocar nada acá: el
// próximo "npm run build" lo detecta solo. Lo único que SIGUE siendo
// manual es CACHE_VERSION de arriba (ver la explicación grande al
// principio de este archivo sobre por qué eso no se puede automatizar).

self.addEventListener('install', function(event) {
  event.waitUntil(
    fetch('./precache-manifest.json')
      .then(function(res) { return res.json(); })
      .then(function(urls) {
        return caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(urls); });
      })
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
        if (!res) return cached;

        // Si la URL terminó resuelta a través de un redirect (ej. Netlify
        // normalizando "pretty URLs", o el fallback SPA de netlify.toml
        // mientras el deploy todavía no tenía este archivo), el Response
        // que entrega fetch() queda marcado internamente como
        // "redirected". Chrome NO permite usar ese objeto tal cual en
        // respondWith() para una petición de navegación (que es lo que es
        // cargar un informe dentro del iframe): tira "a redirected
        // response was used for a request whose redirect mode is not
        // follow". Se reconstruye como una respuesta "limpia" ANTES de
        // cachearla, para que ni la copia en caché ni la que se devuelve
        // ahora arrastren esa marca.
        const resLimpia = res.redirected
          ? new Response(res.body, {
              status: res.status,
              statusText: res.statusText,
              headers: res.headers
            })
          : res;

        if (resLimpia.ok) {
          // IMPORTANTE: clonar ACÁ, de forma síncrona, antes de cualquier
          // await/async gap. caches.open() es asíncrono (usa IndexedDB
          // por debajo) — si se clona recién adentro de su .then(), el
          // navegador ya empezó a leer el body de "res" para entregarlo
          // a la página (por el "return res" de más abajo), y clonar una
          // respuesta cuyo body ya se está leyendo tira
          // "Response body is already used".
          const resParaCache = resLimpia.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(req, resParaCache); });
        }
        return resLimpia;
      }).catch(function() { return cached; });

      return cached || networkFetch;
    })
  );
});
