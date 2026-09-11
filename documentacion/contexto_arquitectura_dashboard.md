# 📋 REPORTES-DASHBOARD: CONTEXTO DE ARQUITECTURA
**Última actualización:** 11-09-2026

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
    │   ├── informe_generico_Grafico.html
    │   ├── js/                    # Dividido en 10 archivos — ver sección
    │   │   │                       # "🧩 CONVENCIÓN DE DIVISIÓN DE JS POR INFORME"
    │   │   ├── utils.js
    │   │   ├── vistaPrevia_Sin_Grafico.js  /  vistaPrevia_Grafico.js
    │   │   ├── grafico_Grafico.js
    │   │   ├── exportPdf_Sin_Grafico.js    /  exportPdf_Grafico.js
    │   │   ├── exportWord_Sin_Grafico.js   /  exportWord_Grafico.js
    │   │   └── script_Sin_Grafico.js       /  script_Grafico.js
    │   └── css/style.css / style_Grafico.css
    │
    ├── sm_consultores/            # Informe Psicotécnico (renombrado, sin espacio)
    │   ├── generador_informe_psicotecnico.html
    │   ├── generador_informe_psicotecnico_Grafico.html
    │   ├── js/                    # Mismo patrón de 10 archivos que generico
    │   │   ├── utils.js
    │   │   ├── vistaPrevia_Sin_Grafico.js  /  vistaPrevia_Grafico.js
    │   │   ├── grafico_Grafico.js
    │   │   ├── exportPdf_Sin_Grafico.js    /  exportPdf_Grafico.js
    │   │   ├── exportWord_Sin_Grafico.js   /  exportWord_Grafico.js
    │   │   ├── script_Sin_Grafico.js       /  script_Grafico.js
    │   │   └── old/                # script_psicotecnico.js y _Grafico.js viejos,
    │   │                            # sin usar — candidatos a borrar del repo
    │   │                            # una vez confirmado el funcionamiento en
    │   │                            # navegador real
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

## 🎨 DISEÑO VISUAL DEL DASHBOARD (SHELL)

> Esto es solo el "marco" (`index.html` + `css/style.css`): sidebar, top-bar,
> panel de bienvenida. **No afecta el CSS de cada informe individual** —
> cada `html_externos/[carpeta]/css/style.css` es independiente y mantiene
> su propio diseño (ej. SM Consultores y UDE siguen con su paleta
> teal/corporativa propia). Si algo se ve raro dentro de la vista previa de
> un informe, el archivo a revisar es el `css/style.css` de ESE informe, no
> este.

**Concepto:** identidad "archivo de casos" — tinta oscura + papel, en vez
del look genérico de SaaS (indigo/lavanda) que tenía antes.

| Token | Valor | Uso |
|---|---|---|
| `--ink-900` | `#171c26` | Fondo de sidebar y top-bar |
| `--paper` | `#eef0ea` | Fondo del área de contenido (detrás del iframe) |
| `--accent` (verde ficha) | `#3f6b52` | Estados activos, focus |
| `--brass` (bronce) | `#b6863f` | Detalles puntuales: logo, borde del panel de bienvenida |
| `--status-ok/bad/unknown` | verde/rojo/gris | Semánticos — no tocar sin razón (ver corrector ortográfico) |

**Tipografía (cargada por CDN de Google Fonts en el `<head>` de `index.html`):**
- `Space Grotesk` — títulos (sidebar, top-bar)
- `Inter` — texto de interfaz
- `IBM Plex Mono` — metadatos/badges (nombre de carpetas, versión, chip del corrector)

Igual que con html2canvas/jsPDF/docx, esta fuente **no está precacheada por
el Service Worker** (es un CDN externo). Si no hay internet la primera vez
que se carga la app, cae automáticamente al fallback del sistema
(`system-ui`) — no rompe nada, solo se ve con la tipografía por defecto
del sistema operativo hasta que haya conexión.

**Detalle de firma:** cada ítem del menú lateral tiene una pequeña
"pestaña" (barra vertical) que asoma a la izquierda al pasar el mouse
(verde) o cuando está seleccionado (bronce) — ver `.file-item::before` en
`css/style.css`.

**Chip de estado del corrector ortográfico:** en el top-bar, el indicador
de conexión a LanguageTool dejó de ser un punto de color (`fa-circle`) y
ahora es un chip de texto ("abc") cuyo borde/texto/relleno cambia según el
estado (gris sin relleno = sin probar, verde con relleno = conectado, rojo
con relleno = sin conexión). El HTML es estático (`<span id="langtool-
status-icon">abc</span>`); `js/main.js` solo alterna las clases
`langtool-status-online/offline/unknown` — no hubo que tocar JS.

---

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
  la versión nueva de una, subí el número `CACHE_VERSION` (hoy: `'v2.1.0'`,
  se subió al rediseñar el shell del dashboard el 25-08-2026).
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
chip de estado ("abc"; gris sin relleno = sin probar, verde con relleno =
conectado, rojo con relleno = sin conexión — ver sección de Diseño Visual
más arriba) que se actualiza vía `postMessage` desde el iframe del informe
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
| **No es un bug:** en "Informe Genérico", el recuadro de "Clasificación" en la vista previa tiene fondo celeste/gris claro (no blanco) | Es a propósito (`.classification-box`/`.classification-obs` en `html_externos/generico/css/style.css`), para destacar visualmente el resultado — no afecta al Word ni al PDF exportado, que se ven normales | N/A — mencionado acá porque generó una consulta el 25-08-2026 |
| Al dividir `sm_consultores` en varios archivos JS, el código de arranque (competencias por defecto, listeners) hubiera roto con `ReferenceError` apenas carga la página | El `script_psicotecnico.js` original corría ese código "suelto" a nivel superior, confiando en el hoisting de funciones declaradas más abajo **en el mismo archivo** — al separar en archivos, ese hoisting no cruza entre `<script>` distintos | Se envolvió el código de arranque en `function init(){...}` + `DOMContentLoaded`, igual patrón que ya usaba `generico` — ver sección "🧩 CONVENCIÓN DE DIVISIÓN DE JS POR INFORME" |

---

## 📊 DIFERENCIAS ENTRE INFORMES

| Aspecto | UDE (psicolaboral) | SM Consultores (psicotécnico) | Genérico |
|---|---|---|---|
| Páginas | 1 | 3 (con saltos) | 1-N (dinámico, checkboxes on/off por sección) |
| Bloques dinámicos | No | Competencias (agregar/eliminar) | Aspectos evaluados (agregar/eliminar) |
| Método de captura PDF | Multi-`.page` div, cada uno capturado por separado | Igual que UDE | Un solo contenedor alto, cortado en páginas por jsPDF (arquitectura distinta, ver bug de arriba) |
| CSS | ~6KB simple | ~150KB+ complejo (imágenes base64, diseño gráfico) | Simple + responsive |

---

## 🧩 CONVENCIÓN DE DIVISIÓN DE JS POR INFORME

> Agregado el 11-09-2026, tras dividir `generico` y `sm_consultores`.
> `ude` todavía no se dividió (no tocar UDE salvo pedido explícito).

Cada informe con variante `_Grafico` nace ahora con **10 archivos JS**
(5 por variante) en vez de un `script.js` monolítico. `generico` y
`sm_consultores` ya siguen este patrón; es el estándar para cualquier
informe nuevo.

### Los 5 archivos por variante

| Archivo | Responsabilidad | ¿Se comparte entre variantes? |
|---|---|---|
| `utils.js` | Utilidades sin estado (formateo de fechas, lectura de campos, escape de HTML) | **Sí, un solo archivo**, sin sufijo — se carga desde las dos variantes |
| `vistaPrevia_Sin_Grafico.js` / `_Grafico.js` | Bloques dinámicos (competencias/aspectos) + render de la vista previa en vivo | No — casi siempre hay una diferencia real de comportamiento (la versión con gráfico arma datos extra y llama al módulo de gráfico) |
| `grafico_Grafico.js` | Dibuja el SVG del gráfico + lo rasteriza a PNG para el Word | Solo existe en la variante con gráfico, no tiene par |
| `exportPdf_Sin_Grafico.js` / `_Grafico.js` | Define `window.downloadPDF` | No, aunque casi siempre el código es idéntico salvo comentarios — se mantiene separado por consistencia de nombres con el resto |
| `exportWord_Sin_Grafico.js` / `_Grafico.js` | Define `window.downloadWord` | No — la variante con gráfico inserta la imagen del gráfico en un punto puntual |
| `script_Sin_Grafico.js` / `_Grafico.js` | Orquestador: `init()`, listeners del formulario, `Botonera.init({...})` | No (ver regla de nomenclatura de valores más abajo) |

### Regla de nomenclatura

- **Sufijo `_Sin_Grafico`** para la variante sin gráfico, **`_Grafico`**
  para la variante con gráfico — en los 10 archivos, sin excepción
  (incluido el orquestador `script*.js`, aunque el proyecto históricamente
  usaba "sin sufijo = sin gráfico" para HTML/CSS; en JS se prefirió
  explicitar los dos lados para que la carpeta `js/` sea autoexplicativa
  de un vistazo).
- **Único archivo sin sufijo:** `utils.js`, y solo si su contenido es
  **100% idéntico** entre las dos variantes. Si tiene aunque sea una
  línea de lógica distinta, se separa en dos archivos con sufijo — no se
  fuerza una unificación con `if`/parámetros para ahorrarse un archivo.

### Regla para decidir si un archivo se unifica o se separa

> **Si la diferencia entre variantes es un VALOR → se tolera la
> duplicación de esa línea entre los dos archivos separados.**
> **Si la diferencia es un COMPORTAMIENTO (una función que se llama o
> no, un cálculo extra) → los archivos van separados, sin excepción.**

Se descartó explícitamente la idea de "parametrizar" con una variable
global tipo `window.NOMBRE_ARCHIVO_BASE` seteada en el HTML antes de
cargar un `script.js` común — el ahorro de un archivo no compensa el
riesgo de un bug silencioso si alguien arma un HTML nuevo y se olvida
esa línea de configuración (no tira error, descarga con el nombre por
defecto equivocado). Mejor un archivo de más y duplicar una línea, que
un acoplamiento implícito entre HTML y JS que nadie ve.

### Orden de carga de los `<script>` (obligatorio, en este orden)

```html
<script src="js/utils.js"></script>
<script src="js/grafico_Grafico.js"></script>        <!-- solo si existe -->
<script src="js/vistaPrevia_Sin_Grafico.js"></script> <!-- o _Grafico.js -->
<script src="js/exportPdf_Sin_Grafico.js"></script>   <!-- o _Grafico.js -->
<script src="js/exportWord_Sin_Grafico.js"></script>  <!-- o _Grafico.js -->
<script src="js/script_Sin_Grafico.js"></script>      <!-- o _Grafico.js -->
```
El orden importa porque son `<script>` planos sin bundler ni ES6
modules: `grafico*.js` tiene que cargar antes que `vistaPrevia*.js`
(que lo llama), y `utils.js` antes que todo lo demás.

### ⚠️ Gotcha real encontrado al dividir `sm_consultores`

`generico` ya tenía todo el arranque envuelto en `function init(){...}`
disparado por `DOMContentLoaded` — separar sus archivos fue directo,
porque nada se ejecuta hasta que **todos** los `<script>` terminaron de
cargar.

`sm_consultores` (y probablemente `ude`, sin confirmar) **no tenía**
ese wrapper: el código de arranque (cargar competencias por defecto,
pintar la vista previa inicial, enganchar los listeners) corría
"suelto" al nivel superior del archivo, apoyado en que las funciones
declaradas más abajo en el **mismo archivo** quedan disponibles por
"hoisting". Al dividir en varios archivos, ese hoisting deja de
alcanzar entre archivos — si el código de arranque queda en un archivo
que carga antes de que la función que necesita esté definida en otro,
explota con un `ReferenceError` apenas carga la página.

**Solución aplicada:** todo el código de arranque se movió al archivo
que carga último (`script_Sin_Grafico.js`/`_Grafico.js`, el
orquestador) y se envolvió en el mismo patrón `init()` +
`DOMContentLoaded` que ya usaba `generico`:
```js
function init() {
  // todo el código de arranque que antes estaba "suelto"
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```
Esto **no cambia el comportamiento ni el resultado** (se verificó con
pruebas automatizadas que las competencias por defecto siguen
cargándose exactamente igual) — solo lo hace seguro de dividir en
archivos. **Si el informe que estás dividiendo ya tiene este wrapper,
no hace falta tocarlo. Si no lo tiene, agregalo al dividirlo.**

### Cómo probar la división antes de subirla al repo

1. `node --check` en cada archivo nuevo.
2. Comparar la lista de funciones/`const`/`window.*` de nivel superior
   entre los archivos nuevos (concatenados) y el archivo original — deben
   coincidir exactamente, salvo el `init()` nuevo si aplica el gotcha de
   arriba.
3. Armar un harness de prueba con `jsdom` (Node) que cargue el HTML real
   con los `<script>` ya apuntando a los archivos nuevos, y verifique:
   - Que todas las funciones/objetos del contrato existen en `window`
     (`downloadPDF`, `downloadWord`, `Botonera`, `docx`, etc.).
   - Que los datos por defecto se cargan solos al iniciar (si aplica).
   - Que `renderPreview`/`updatePreview` corre sin error y actualiza el DOM.
   - Que `downloadWord()` corre de punta a punta sin lanzar excepciones.
   **Limitación conocida de jsdom:** `docx.Packer.toBlob()` se cuelga
   (no soporta bien las APIs de compresión/Blob que usa esa librería), y
   `canvas`/`Image`/`fetch` de imágenes tampoco están soportados
   realmente. Para el harness hay que interceptar (mockear) esas
   llamadas puntuales — esto prueba que el *wiring* entre archivos es
   correcto, pero **no reemplaza la prueba manual en navegador real**
   (Descargar PDF, Descargar Word, Guardar, Cargar, Ortografía, Limpiar)
   antes de reemplazar los archivos en el repo.

## 🔐 CONTRATO POR INFORME

Cada informe debe cumplir (en `generico` y `sm_consultores` esto ya está
repartido entre los 5-6 archivos de la sección de división de JS; en
informes sin dividir sigue siendo un solo `script.js`):
1. Definir `window.downloadPDF()` (async) — en `exportPdf*.js` si está dividido
2. Definir `window.downloadWord()` (async) — en `exportWord*.js` si está dividido
3. Llamar `Botonera.init({...})` con su configuración — en `script*.js` (el orquestador)
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
