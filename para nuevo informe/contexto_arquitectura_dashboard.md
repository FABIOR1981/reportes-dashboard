# 📋 REPORTES-DASHBOARD: CONTEXTO DE ARQUITECTURA
**Última actualización:** 22-08-2026

> 💡 **Para qué sirve este documento:** pegalo al principio de una conversación
> nueva con Claude para que tenga contexto completo del proyecto sin necesitar
> clonar el repo ni releer todos los archivos desde cero. Ahorra tiempo y
> tokens en consultas futuras. Mantenelo actualizado vos mismo (o pedile a
> Claude que lo actualice) cada vez que se agregue algo importante.

---

## 🎯 PROPÓSITO DEL PROYECTO

Dashboard dinámico para **generación de informes profesionales HTML**
(psicológicos / psicolaborales / psicotécnicos). Cada informe es una
aplicación independiente y autocontenida con:
- Formulario dinámico
- Vista previa en tiempo real (A4 simulada)
- Exportación a PDF y Word
- Guardado/carga de datos en JSON
- Revisión ortográfica con diccionario técnico pre-cargado + personalizado
- Funciona instalado como app (PWA) y sin conexión a internet

**Hosting:** Netlify (sitio estático, sin backend). **Build command:**
`npm run build` = `node build-index.js`.

---

## 📁 ESTRUCTURA REAL DEL PROYECTO

```
reportes-dashboard/
├── index.html                  # Dashboard principal (sidebar + iframe)
├── manifest.json                # Manifest de la PWA (instalable)
├── sw.js                        # Service Worker (cache offline)
├── icons/                       # Íconos de la PWA (192px, 512px)
├── index.json                   # NO se versiona (ver sección Build/Deploy)
├── build-index.js               # Genera index.json escaneando html_externos/
├── package.json                 # { "scripts": { "build": "node build-index.js" } }
├── netlify.toml                 # build command + SPA fallback
├── .gitignore                   # excluye index.json, node_modules
├── css/style.css                # Estilos del dashboard (+ responsive + banner update)
├── js/main.js                   # Lógica del dashboard + registro del SW
│
└── html_externos/
    ├── _shared/
    │   ├── botonera.js          # ⭐ Lógica compartida (ver sección dedicada)
    │   ├── botonera.css         # Estilos compartidos de la botonera + modal
    │   ├── diccionario-base.js  # Diccionario técnico pre-cargado (181 términos)
    │   └── vendor/               # Copias LOCALES de contingencia (offline):
    │       ├── html2canvas.min.js
    │       ├── jspdf.umd.min.js
    │       └── docx.umd.min.js
    │
    ├── generico/                 # Informe genérico (reutilizable)
    │   ├── informe_generico.html
    │   ├── js/script.js          # Secciones on/off, aspectos dinámicos, PDF multi-página
    │   └── css/style.css
    │
    ├── sm_consultores/            # Informe Psicotécnico (renombrado, sin espacio)
    │   ├── generador_informe_psicotecnico.html
    │   ├── js/script_psicotecnico.js  # Competencias dinámicas, 3 páginas
    │   └── css/style_psicotecnico.css
    │
    └── ude/                       # Informe Psicolaboral
        ├── generador_informe_psicolaboral.html
        ├── js/script_psicolaboral.js  # 1 página, datos fijos
        └── css/style_psicolaboral.css
```

**Ojo con nombres:** la carpeta de SM Consultores se renombró de `sm consultores`
(con espacio) a `sm_consultores`. Si ves referencias viejas con espacio en
algún doc o commit antiguo, ya no reflejan el estado real.

---

## 🛠️ STACK TECNOLÓGICO

| Aspecto | Tecnología |
|---|---|
| Frontend | HTML5 + CSS3 + JS Vanilla (sin bundler, sin ES6 modules, `<script>` planos) |
| PDF | html2canvas 1.4.1 + jsPDF 2.5.1 |
| Word | docx 8.5.0 (UMD) |
| Corrector ortográfico | LanguageTool API (`api.languagetool.org/v2/check`) |
| Build | Node.js nativo, cero dependencias |
| Hosting | Netlify |
| Almacenamiento | localStorage (diccionario personalizado, preferencia de sidebar) |
| Offline | Service Worker + manifest (PWA instalable) |

**Las 3 librerías de exportación se cargan con CDN + respaldo local automático:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script>window.html2canvas || document.write('<script src="../_shared/vendor/html2canvas.min.js"><\/script>')</script>
```
Mismo patrón para jsPDF y docx. Si el CDN falla (sin internet, firewall,
CDN caído), carga automáticamente la copia guardada en `_shared/vendor/`,
sin que el usuario note nada. **Importante:** si en el futuro se cambia la
versión del CDN en el `<script src>`, hay que actualizar también el archivo
correspondiente en `vendor/` para que coincida.

---

## 📴 PWA Y MODO OFFLINE

- `manifest.json` + `sw.js` en la raíz permiten instalar la app y que
  funcione **sin conexión completa** (probado en modo avión real: cargar
  dashboard + abrir informe + generar PDF, todo sin internet).
- **Estrategia de `sw.js`:** precachea todos los archivos estáticos al
  primer uso; para requests posteriores usa *stale-while-revalidate*
  (sirve la copia guardada al instante, y de paso actualiza en segundo
  plano para la próxima vez).
- **Excepción a propósito:** las requests a `api.languagetool.org`
  (el corrector) NUNCA se cachean ni se interceptan — deben intentar red
  real siempre, para que el aviso de "sin conexión" siga funcionando.
- **Mantenimiento:** si agregás/renombrás/borrás un archivo del proyecto,
  hay que sumarlo (o quitarlo) de la lista `PRECACHE_URLS` en `sw.js`. Si
  hacés un cambio grande y querés forzar que todos los usuarios reciban
  la versión nueva de una, subí el número `CACHE_VERSION` (hoy: `'v1'`).
- **Aviso de actualización:** cuando se publica una versión nueva mientras
  alguien tiene la app abierta, aparece un banner ("Hay una versión nueva
  de la app lista para usar. Actualizar ahora") — no se fuerza el refresh
  solo, para no interrumpir a alguien completando un informe sin guardar.
  Lógica en `js/main.js` (evento `controllerchange` del Service Worker).

---

## ⭐ BOTONERA COMPARTIDA (`_shared/botonera.js`)

### Arquitectura centralizada (importante — cambió respecto a versiones viejas de este doc)
Antes, el HTML de los 6 botones (PDF/Word/Guardar/Cargar/Ortografía/Limpiar)
estaba **duplicado carácter por carácter en los 3 informes**. Ya no: ahora
`botonera.js` tiene una función `renderToolbar()` que genera ese HTML una
sola vez y lo inyecta en el contenedor. Cada informe solo necesita:
```html
<div class="btn-toolbar" id="actions"></div>
```
Si hay que cambiar un ícono, texto o agregar un botón: **se edita una sola
vez en `botonera.js`**, no en 3 archivos.

### Íconos actuales (todos SVG inline, sin dependencia de fuentes externas)
- **PDF:** documento + texto "PDF" incrustado
- **Word:** documento + "W" incrustado
- **Guardar:** disquete (ícono universal de guardar)
- **Cargar:** carpeta abierta
- **Ortografía:** "ABC" + tilde de verificación
- **Limpiar:** papelera (sin cambios, ya era claro)

### Uso desde cada informe
```javascript
Botonera.init({
  camposGuardables: [...],
  camposNoLimpiar: [...],
  camposOrtografia: [{id: 'campo', label: 'Etiqueta'}, ...],
  nombreArchivoBase: 'informe',
  onResetExtra: function() { /* ... */ },
  onLoadExtra: function(data) { /* recibe el JSON completo cargado */ },
  onSaveExtra: function(data) { /* podés agregar claves extra al JSON antes de guardarlo */ }
});
```

`onSaveExtra`/`onLoadExtra` se usan para persistir **bloques dinámicos**
(aspectos en genérico, competencias en SM Consultores) que no son campos
simples — antes esto no se guardaba y se perdía al recargar un JSON viejo;
ahora sí, con retrocompatibilidad (si el JSON no trae esa clave, no rompe).

### Diccionario ortográfico — dos capas
1. **Diccionario base** (`_shared/diccionario-base.js`): 181 términos del
   rubro psicolaboral/RRHH, pre-cargado de fábrica, **común a los 3
   informes** (comparten la misma clave de `localStorage`). Para agregar
   más términos: sumar líneas al array de ese archivo, no hace falta
   tocar nada más.
2. **Diccionario personalizado**: lo arma el usuario con el botón "no es
   un error, ignorar siempre", persiste en `localStorage` bajo la clave
   `correctorDiccionario`.

### Aviso de corrector sin conexión
Si falla la conexión real a LanguageTool, aparece un modal (una vez por
sesión, vía `sessionStorage`) avisando que el corrector no está disponible.
Además, en el dashboard (junto a "Recargar"/"Pantalla completa") hay un
ícono de estado (gris = sin probar, verde = conectado, rojo = sin
conexión) que se actualiza vía `postMessage` desde el iframe del informe
hacia el dashboard.

---

## 🐛 BUGS ENCONTRADOS Y CORREGIDOS (histórico, para no repetirlos)

| Bug | Causa | Arreglo |
|---|---|---|
| "JSON no válido" al cargar un archivo bien generado | `cargarDatos()` armaba un selector CSS con el valor del campo; si el texto tenía comillas dobles, rompía el selector y el error se confundía con "JSON inválido" | Separar el `try/catch` del `JSON.parse` del de aplicar los datos; matchear radios por `name` + comparar `value` en JS, no en el selector |
| "Ignorar siempre" guardaba la palabra mal si tenía comillas | `escapeHTML()` no escapa comillas dobles, y se usaba para construir un atributo HTML (`data-w="..."`) | Mismo principio: no construir atributos HTML con datos de usuario sin sanitizar correctamente |
| Texto entre `< >` desaparecía silenciosamente del PDF (UDE) | Se inyectaba texto de usuario directo con `innerHTML` sin escapar | Pendiente aplicar mismo patrón que otros fixes si vuelve a aparecer |
| Aspectos/competencias no se guardaban en el JSON | `gatherFormData()` solo lee campos simples + radios, no bloques dinámicos | Hook `onSaveExtra`/`onLoadExtra` (ver sección Botonera) |
| Crash si no hay radio marcado al cargar un JSON viejo | `document.querySelector(...):checked).value` sin verificar null | Guardar el elemento en variable, usar `? valor : ''` |
| `index.json` con rutas rotas / carpetas faltantes | Se había editado a mano en vez de regenerar con `build-index.js` | Nunca editar `index.json` a mano; siempre `node build-index.js` |
| PDF de "Informe Genérico" se cortaba a la mitad (ej. "Conclusión" desaparecía) | El contenedor de captura (`#pdfPreview` / `.page-a4`) tiene, en pantallas angostas (≤1024px), un `max-height` + `overflow-y:auto` para poder scrollear el formulario. Si el PDF se generaba con la ventana angosta, ese mismo recorte visual afectaba la captura de `html2canvas` | En `downloadPDF()`, neutralizar `max-height`/`overflow` del contenedor justo antes de capturar, y restaurarlo después. De paso se corrigió una página en blanco sobrante por redondeo de milímetros en la paginación |
| Bug reportado que resultó no ser reproducible tras un fix | Se sospechó que el Service Worker sirvió una copia vieja de `script.js` en caché (stale) antes de que el usuario hiciera hard-refresh / unregister del SW tras un fix reciente | Recordar: si un fix "no se nota", primero descartar caché del Service Worker (Application → Service Workers → Update / Unregister) antes de asumir que el fix no funciona |

---

## 📊 DIFERENCIAS ENTRE INFORMES

| Aspecto | UDE (psicolaboral) | SM Consultores (psicotécnico) | Genérico |
|---|---|---|---|
| Páginas | 1 | 3 (con saltos) | 1-N (dinámico, checkboxes on/off por sección) |
| Bloques dinámicos | No | Competencias (agregar/eliminar) | Aspectos evaluados (agregar/eliminar) |
| Método de captura PDF | Multi-`.page` div, cada uno capturado por separado | Igual que UDE | Un solo contenedor alto, cortado en páginas por jsPDF (arquitectura distinta, ver bug de arriba) |
| CSS | ~6KB simple | ~150KB+ complejo (imágenes base64, diseño gráfico) | Simple + responsive |

---

## 🔐 CONTRATO POR INFORME

Cada `script.js` de informe debe:
1. Definir `window.downloadPDF()` (async)
2. Definir `window.downloadWord()` (async)
3. Llamar `Botonera.init({...})` con su configuración
4. Tener en su HTML: `<div class="btn-toolbar" id="actions"></div>` vacío
   (el contenido lo genera `botonera.js`)

**Regla de oro (no romper nunca):** dentro de `downloadPDF`/`downloadWord`,
nunca asignar `btn.textContent`/`btn.innerHTML` sobre los botones de la
botonera para mostrar "Generando...". Eso destruye el `<span
class="tooltip">` interno de forma permanente. Usar `btn.disabled` +
`#status` para mensajes de progreso.

---

## 🚀 BUILD Y DEPLOY

```bash
node build-index.js   # Regenera index.json escaneando html_externos/
```

- **`index.json` NO se versiona** (está en `.gitignore`). Netlify lo
  regenera automáticamente en cada deploy (`netlify.toml` → build command
  `npm run build`). Si corrés el proyecto localmente sin pasar por ese
  build, corré `node build-index.js` vos mismo antes de abrir `index.html`.
- **Nunca editar `index.json` a mano** — ya causó bugs reales (rutas
  rotas, carpetas faltantes) por quedar desincronizado del estado real.
- Si agregás/movés/renombrás un archivo del proyecto, actualizar también
  la lista `PRECACHE_URLS` en `sw.js` (ver sección PWA).

---

## 📝 NOTAS PARA DESARROLLO FUTURO

- Si se agrega un cuarto informe, seguir el mismo contrato (sección de
  arriba) + sumarlo a `PRECACHE_URLS` en `sw.js`.
- Las rutas `../_shared/` funcionan porque todos los informes están a un
  nivel de profundidad dentro de `html_externos/`.
- Evitar código duplicado: si se reescribe un hook (`downloadWord`, etc.),
  borrar la versión vieja en vez de dejar dos definiciones en el mismo
  archivo — la última sobrescribe a la primera silenciosamente.
- Cualquier texto que se inyecte con `innerHTML` usando datos que el
  usuario escribió (no datos fijos del código) es un punto de riesgo —
  ver la tabla de bugs de arriba antes de agregar algo así.
