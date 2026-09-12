// ============================================================
//  build-precache.js
//  Genera precache-manifest.json escaneando el proyecto, para que
//  sw.js ya no tenga que mantener PRECACHE_URLS a mano.
//
//  Uso: node build-precache.js  (o vía "npm run build", que lo
//  encadena después de build-index.js)
//
//  QUÉ HACE:
//  1. Escanea html_externos/ recursivamente, sumando todo archivo
//     "servible" (html, css, js, imágenes) que el navegador vaya a
//     pedir en tiempo de ejecución.
//  2. Excluye lo que NO corresponde precachear:
//       - nombre.txt          → metadata de build-index.js, el navegador
//                                nunca lo pide en runtime.
//       - cualquier carpeta "old/" → código legado sin usar, dejado como
//                                     referencia histórica (ver
//                                     CONTEXTO_ARQUITECTURA_DASHBOARD.md).
//  3. Suma a mano los archivos del "shell" (fuera de html_externos/):
//     index.html, manifest.json, css/style.css, js/main.js, los íconos,
//     e index.json (generado por build-index.js, pero SÍ se pide en
//     runtime — el dashboard lo hace fetch() para armar el sidebar).
//  4. Escribe precache-manifest.json en la raíz del proyecto.
//
//  IMPORTANTE: este archivo (igual que index.json) NO se versiona —
//  está en .gitignore, se regenera en cada build. NUNCA editarlo a mano.
//
//  Lo que este script deliberadamente NO hace: no toca CACHE_VERSION
//  ni ninguna otra línea de sw.js. Esa sigue siendo una decisión manual
//  tuya — ver la nota grande al principio de sw.js sobre por qué tiene
//  que quedar así (el navegador detecta actualizaciones comparando los
//  bytes de sw.js, así que ese número tiene que vivir ahí físicamente).
// ============================================================

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const HTML_EXTERNOS = path.join(ROOT, 'html_externos');
const OUTPUT = path.join(ROOT, 'precache-manifest.json');

// Extensiones que el navegador puede llegar a pedir en runtime dentro de
// un informe (HTML/CSS/JS de cada informe, imágenes fijas como cabezal.png).
const EXTENSIONES_VALIDAS = new Set([
  '.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.ico'
]);

// Archivos y carpetas que NO deben precachearse aunque existan dentro de
// html_externos/.
function debeExcluirse(rutaRelativa) {
  const partes = rutaRelativa.split(path.sep);
  if (partes.includes('old')) return true;                 // código legado sin usar
  if (path.basename(rutaRelativa) === 'nombre.txt') return true; // metadata de build, no runtime
  return false;
}

function escanearDirectorio(dirActual, relativoBase = '') {
  const items = fs.readdirSync(dirActual, { withFileTypes: true });
  let resultado = [];

  for (const item of items) {
    const rutaRelativa = relativoBase ? `${relativoBase}/${item.name}` : item.name;
    const rutaCompleta = path.join(dirActual, item.name);

    if (item.isDirectory()) {
      resultado = resultado.concat(escanearDirectorio(rutaCompleta, rutaRelativa));
    } else if (item.isFile()) {
      if (debeExcluirse(rutaRelativa)) continue;
      const ext = path.extname(item.name).toLowerCase();
      if (!EXTENSIONES_VALIDAS.has(ext)) continue;
      resultado.push(`./html_externos/${rutaRelativa}`);
    }
  }

  return resultado;
}

// ---------- Archivos del "shell" (fuera de html_externos/) ----------
// Estos se mantienen a mano acá porque son pocos, fijos, y casi nunca
// cambian de nombre — a diferencia de los informes, que crecen seguido.
const ARCHIVOS_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/main.js',
  './index.json',                 // generado por build-index.js, pero SÍ se
                                   // pide en runtime (el dashboard arma el
                                   // sidebar con esto) — hay que precachearlo.
  './icons/icon-192.png',
  './icons/icon-512.png'
];

function main() {
  if (!fs.existsSync(HTML_EXTERNOS)) {
    console.error('❌ No existe la carpeta html_externos/ — abortando.');
    process.exit(1);
  }

  const archivosInformes = escanearDirectorio(HTML_EXTERNOS);
  const listaFinal = ARCHIVOS_SHELL.concat(archivosInformes);

  fs.writeFileSync(OUTPUT, JSON.stringify(listaFinal, null, 2) + '\n');

  console.log(`✅ precache-manifest.json generado con ${listaFinal.length} archivos.`);
}

main();
