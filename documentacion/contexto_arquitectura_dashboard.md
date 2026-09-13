# 📋 REPORTES-DASHBOARD: CONTEXTO DE ARQUITECTURA
**Última actualización:** 13-09-2026

> 💡 **Para qué sirve este documento:** pegalo al principio de una conversación
> nueva con Claude (o cualquier IA) para que tenga contexto completo del
> proyecto sin necesitar clonar el repo ni releer todos los archivos desde
> cero. Ahorra tiempo y tokens en consultas futuras. Mantenelo actualizado
> vos mismo (o pedile a Claude que lo actualice) cada vez que se agregue
> algo importante — este documento es la fuente de verdad de la
> arquitectura, no el código.
>
> **Nota para la IA que lea esto:** este documento describe el estado REAL
> del repo a la fecha de arriba. Si algo acá no coincide con lo que ves en
> los archivos, avisale a Fabio en vez de asumir que el documento tiene
> razón — puede estar desactualizado.

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
├── index.json                   # NO se versiona (autogenerado)
├── precache-manifest.json       # NO se versiona (autogenerado)
├── build-index.js               # Genera index.json escaneando html_externos/
├── build-precache.js            # Genera precache-manifest.json (mismo escaneo)
├── package.json                 # { "scripts": { "build": "node build-index.js" } }
├── netlify.toml                 # build command + SPA fallback
├── .gitignore                   # excluye index.json, precache-manifest.json, node_modules
├── css/style.css                # Estilos del dashboard (+ responsive + banner update)
├── js/main.js                   # Lógica del dashboard + registro del SW
│
└── html_externos/
    ├── _shared/
    │   ├── botonera.js          # ⭐ Lógica compartida (ver sección dedicada)
    │   ├── botonera.css         # Estilos compartidos de la botonera + modal
    │   ├── diccionario-base.js  # Diccionario técnico pre-cargado (181 términos)
    │   └── vendor/               # Copias LOCALES de contingencia (offline):
    │       ├── html2canvas.min.js  # legado — ver nota en sección PDF
    │       ├── jspdf.umd.min.js    # legado — ver nota en sección PDF
    │       └── docx.umd.min.js
    │
    ├── generico/                 # Informe genérico (reutilizable)
    │   ├── informe_generico.html            # variante SIN gráfico
    │   ├── informe_generico_Grafico.html    # variante CON gráfico
    │   ├── nombre.txt                        # nombre lindo para el sidebar
    │   ├── css/
    │   │   ├── style.css               # variante sin gráfico
    │   │   └── style_Grafico.css       # variante con gráfico (incluye modal tipoGrafico)
    │   └── js/
    │       ├── utils.js                 # helpers compartidos (escapeHTML, etc.)
    │       ├── vistaPrevia_Sin_Grafico.js
    │       ├── vistaPrevia_Grafico.js
    │       ├── grafico_Grafico.js        # dibuja el gráfico de aspectos (ver receta más abajo)
    │       ├── tipoGrafico.js            # modal selector de estilo de gráfico
    │       ├── exportPdf_Sin_Grafico.js
    │       ├── exportPdf_Grafico.js
    │       ├── exportWord_Sin_Grafico.js
    │       ├── exportWord_Grafico.js
    │       ├── script_Sin_Grafico.js     # orquestador: init() + DOMContentLoaded
    │       └── script_Grafico.js         # orquestador: init() + DOMContentLoaded
    │
    ├── sm_consultores/            # Informe Psicotécnico
    │   ├── generador_informe_psicotecnico.html          # SIN gráfico
    │   ├── generador_informe_psicotecnico_Grafico.html  # CON gráfico
    │   ├── nombre.txt
    │   ├── img/ (cabezal.png, diana.png, tabla.png)
    │   ├── css/style_psicotecnico.css, style_psicotecnico_Grafico.css
    │   └── js/ (mismo split que generico: utils, vistaPrevia_*, grafico_Grafico,
    │            exportPdf_*, exportWord_*, script_*)
    │       ⚠️ NO tiene tipoGrafico.js todavía — grafico_Grafico.js solo dibuja
    │          el anillo de progreso (renderGraficoCompetencias), sin selector
    │          de estilo. Si se porta el modal de Genérico para acá, hay que
    │          crearlo desde cero siguiendo la receta de abajo.
    │
    ├── ude/                       # Informe Psicolaboral — ORIGINAL, NO TOCAR
    │   ├── generador_informe_psicolaboral.html
    │   ├── css/style_psicolaboral.css
    │   └── js/script_psicolaboral.js   # todavía monolítico, sin dividir
    │
    └── ude_nuevo/                 # Transición de UDE — EN PARALELO al original
        ├── generador_informe_psicolaboral.html
        ├── css/style_psicolaboral.css
        └── js/ (utils.js, vistaPrevia.js, exportPdf.js, exportWord.js, script.js)
            # Ya dividido siguiendo la convención nueva, pero SIN variante
            # de gráfico (UDE no tiene aspectos/competencias graficables).
            # Sigue en paralelo al `ude/` original hasta que se valide y
            # se haga la migración completa (regla: nunca tocar `ude/`
            # directamente mientras tanto).
```

**Ojo con nombres:** la carpeta de SM Consultores se renombró de
`sm consultores` (con espacio) a `sm_consultores`. Si ves referencias
viejas con espacio en algún doc o commit antiguo, ya no reflejan el estado
real.

---

## 🧩 CONVENCIÓN DE SEPARACIÓN DE ARCHIVOS JS (obligatoria en informes nuevos)

Los `script.js` monolíticos de la versión vieja del proyecto se
refactorizaron en archivos más chicos, con responsabilidad única cada uno:

| Archivo | Responsabilidad |
|---|---|
| `utils.js` | Helpers compartidos (`escapeHTML`, etc.), sin dependencias de otros archivos del informe |
| `vistaPrevia_*.js` | Lee el formulario y actualiza el `<div id="page1">` (y `page2`/`page3` si aplica) en tiempo real |
| `grafico_*.js` | Solo en informes con gráfico. Dibuja el SVG del gráfico de aspectos/competencias y expone la función que lo rasteriza a PNG para Word |
| `tipoGrafico.js` | Solo si el informe ofrece **más de un estilo de gráfico**. Modal selector — ver receta abajo |
| `exportPdf_*.js` | Define `window.downloadPDF()` |
| `exportWord_*.js` | Define `window.downloadWord()` |
| `script_*.js` | Orquestador: `init()` + `DOMContentLoaded`, llama a `Botonera.init({...})` |

**Sufijo `_Grafico` / `_Sin_Grafico`:** cuando un informe tiene dos
variantes (con gráfico de aspectos/competencias, y sin él), CADA archivo
de la lista de arriba se duplica con ese sufijo (`vistaPrevia_Grafico.js`
vs `vistaPrevia_Sin_Grafico.js`, etc.) — son dos aplicaciones paralelas
que comparten la misma carpeta pero no código entre sí (excepto
`utils.js`, que es común a ambas variantes). Esto es intencional: permite
tener una variante estable mientras se experimenta con la otra, y elegir
cuál is el HTML principal (`informe_x.html` vs `informe_x_Grafico.html`)
sin arriesgar la variante que ya funciona.

**Gotcha de hoisting/IIFE:** al partir un archivo monolítico en varios,
cualquier código "suelto" a nivel raíz que dependía de hoisting rompe al
quedar en archivos separados. Todo el código de arranque tiene que vivir
adentro de `init()` + `DOMContentLoaded`; las IIFEs deben disolverse
durante el split.

**Verificación mínima al tocar estos archivos:**
1. `node --check archivo.js` sobre cada archivo modificado.
2. Un harness jsdom que llame directamente a las funciones relevantes
   (`updatePreview`, `downloadWord`, `downloadPDF`, la función de dibujo)
   con datos de prueba y verifique el resultado (cantidad de elementos
   generados, valores calculados) — no alcanza con que no tire error de
   sintaxis.

---

## 📊 SISTEMA DE SELECCIÓN DE TIPO DE GRÁFICO (hoy solo en Genérico)

Genérico (`generico/js/tipoGrafico.js` + `grafico_Grafico.js`) tiene un
modal que deja al usuario elegir el estilo visual del gráfico de aspectos
evaluados, sin tocar el resto del código.

**Piezas:**
- `grafico_Grafico.js` define:
  - `let tipoGraficoActual` — string con el tipo elegido, valor por defecto `'barras'`.
  - `function renderGraficoAspectos(datos)` — dispatcher: según
    `tipoGraficoActual`, llama a la función `dibujarX(cont, datos)` que
    corresponda. Si no hay datos graficables, oculta el contenedor.
  - Una función `dibujarX(cont, datos)` por cada estilo (`dibujarBarras`,
    `dibujarAros`, `dibujarLollipop`, `dibujarRadar`, `dibujarWaffle`, …).
    Todas reciben `(contenedorDOM, arrayDeAspectos)` y escriben un
    `<svg>` en `cont.innerHTML`. Todas comparten la misma paleta de color
    por umbral: `pct >= 70` verde (`#3f6b52`), `pct >= 40` bronce
    (`#b6863f`), si no rojo (`#c1503f`).
- `tipoGrafico.js` define:
  - `const OPCIONES_TIPO_GRAFICO` — array de `{ valor, etiqueta, dibujar, minimoAspectos }`. Es la única fuente de verdad de qué opciones aparecen en el modal.
  - `abrirModalTipoGrafico()` — genera el modal, con una miniatura por
    opción renderizada llamando a la MISMA función `dibujarX` real sobre
    un `<div>` desconectado del DOM con datos de ejemplo fijos
    (`EJEMPLO_ASPECTOS_MODAL`). Esto garantiza que la miniatura del modal
    siempre coincide con el gráfico real — si se ajusta color/espaciado en
    `grafico_Grafico.js`, la miniatura se actualiza sola.
  - Si `cantidadReal < minimoAspectos` (ej. radar necesita 3+), la opción
    aparece deshabilitada en el modal con una nota explicativa.

**Forma de los datos** (`datos` en las funciones `dibujarX`): array de
`{ nombre: string, puntaje: number, maximo: number }`, uno por aspecto
cargado por el usuario con nombre y puntaje máximo > 0.

### 🍳 RECETA: cómo agregar un tipo de gráfico nuevo

1. En `grafico_Grafico.js`, escribir `function dibujarNombreTipo(cont, datos)`
   siguiendo el mismo patrón que las existentes: SVG puro (sin librerías
   externas), `viewBox` fijo, texto con `escapeHTML(d.nombre)`, color por
   umbral 70/40 igual que las demás. Terminar con
   `cont.innerHTML = '<svg>...</svg>'; cont.style.display = 'block';`.
2. Sumar el `case 'nombretipo': dibujarNombreTipo(cont, datos); break;`
   dentro del `switch` de `renderGraficoAspectos`.
3. En `tipoGrafico.js`, agregar una entrada al array
   `OPCIONES_TIPO_GRAFICO`:
   ```js
   { valor: 'nombretipo', etiqueta: 'Texto que ve el usuario', dibujar: dibujarNombreTipo, minimoAspectos: 1 }
   ```
   No hay que tocar nada más de `tipoGrafico.js` — la miniatura, el
   radio button y el resaltado se generan solos a partir de este array.
4. **No hace falta tocar** `exportPdf_Grafico.js` ni `exportWord_Grafico.js`
   — ambos son agnósticos al tipo de gráfico: el PDF imprime lo que esté
   en pantalla (`window.print()`) y el Word rasteriza a PNG cualquier
   `<svg>` que encuentre dentro de `#graficoAspectosContainer`
   (`generarImagenGraficoParaWord`).
5. Verificar con `node --check` sobre los dos archivos tocados.
6. Verificar con un harness jsdom: llamar `dibujarNombreTipo(cont, datosDePrueba)`
   directo y chequear la cantidad/valores de los elementos SVG generados
   (no alcanza con que no tire error). Idealmente también simular el click
   en el botón que abre el modal y confirmar que la nueva opción aparece,
   tiene miniatura, y que seleccionarla + confirmar actualiza
   `tipoGraficoActual`.
7. Bump de `CACHE_VERSION` en `sw.js` (cambiaron archivos cacheados).

Este mismo patrón (dispatcher + array de opciones + miniatura autogenerada)
es portable a SM Consultores el día que se le agregue selector de
gráfico — hoy ese informe solo tiene el anillo fijo, sin este sistema.

---

## 🎨 DISEÑO VISUAL DEL DASHBOARD (SHELL)

> Esto es solo el "marco" (`index.html` + `css/style.css`): sidebar, top-bar,
> panel de bienvenida. **No afecta el CSS de cada informe individual** —
> cada `html_externos/[carpeta]/css/*.css` es independiente y mantiene su
> propio diseño. Si algo se ve raro dentro de la vista previa de un
> informe, el archivo a revisar es el CSS de ESE informe, no este.

**Concepto:** identidad "archivo de casos" — tinta oscura + papel, en vez
del look genérico de SaaS (indigo/lavanda) que tenía antes.

| Token | Valor | Uso |
|---|---|---|
| `--ink-900` | `#171c26` | Fondo de sidebar y top-bar |
| `--paper` | `#eef0ea` | Fondo del área de contenido (detrás del iframe) |
| `--accent` (verde ficha) | `#3f6b52` | Estados activos, focus |
| `--brass` (bronce) | `#b6863f` | Detalles puntuales: logo, borde del panel de bienvenida |
| `--status-ok/bad/unknown` | verde/rojo/gris | Semánticos — no tocar sin razón |

**Tipografía (CDN de Google Fonts, `<head>` de `index.html`):**
- `Space Grotesk` — títulos (sidebar, top-bar)
- `Inter` — texto de interfaz
- `IBM Plex Mono` — metadatos/badges (nombre de carpetas, versión, chip del corrector)

No está precacheada por el Service Worker (CDN externo). Sin internet la
primera vez, cae al fallback del sistema (`system-ui`) — no rompe nada.

**Chip de estado del corrector ortográfico:** en el top-bar, chip de texto
("abc") cuyo borde/texto/relleno cambia según el estado (gris sin relleno
= sin probar, verde con relleno = conectado, rojo con relleno = sin
conexión). El HTML es estático; `js/main.js` solo alterna clases
`langtool-status-online/offline/unknown`.

---

| Aspecto | Tecnología |
|---|---|
| Frontend | HTML5 + CSS3 + JS Vanilla (sin bundler, sin ES6 modules, `<script>` planos) |
| PDF | `window.print()` + `@media print` (ver nota de migración abajo) |
| Word | docx 8.5.0 (UMD) |
| Corrector ortográfico | LanguageTool API (`api.languagetool.org/v2/check`) |
| Build | Node.js nativo, cero dependencias |
| Hosting | Netlify |
| Almacenamiento | localStorage (diccionario personalizado, preferencia de sidebar) |
| Offline | Service Worker + manifest (PWA instalable) |

### ⚠️ Migración de PDF: de html2canvas+jsPDF a `window.print()`

Los 4 informes (Genérico, SM Consultores, UDE, UDE_nuevo) migraron su
`downloadPDF()` de `html2canvas` + `jsPDF` (captura de imagen) a
`window.print()` nativo del navegador + reglas `@media print` en el CSS
de cada informe. Motivo: eliminaba artefactos de rasterización (letras
superpuestas, SVGs cortados) y cortes de página arbitrarios en mm.

**Detalle importante de esta técnica:** para ocultar del PDF elementos con
`position: fixed` (como `#panel`, la botonera), hay que usar
`display: none !important` en la regla `@media print` — `visibility:hidden`
NO alcanza, porque el elemento sigue reservando su lugar en el layout de
impresión.

**Pendiente de limpieza (no urgente):** las 3 librerías (`html2canvas`,
`jsPDF`, `docx`) se siguen cargando por CDN + fallback local en
`_shared/vendor/` en los `<script>` de cada HTML, pero `html2canvas` y
`jsPDF` ya no se usan para nada desde la migración — solo `docx` sigue
en uso real (para Word). Sacarlas del HTML y de `vendor/` ahorraría peso,
pero no se hizo todavía porque no rompe nada dejarlas.

---

## 📴 PWA Y MODO OFFLINE

- `manifest.json` + `sw.js` en la raíz permiten instalar la app y que
  funcione **sin conexión completa** (probado en modo avión real).
- **Estrategia de `sw.js`:** precachea todos los archivos estáticos al
  primer uso; para requests posteriores usa *stale-while-revalidate*.
- **Lista de precache autogenerada:** `sw.js` YA NO tiene un array
  `PRECACHE_URLS` a mano. En su lugar, hace
  `fetch('./precache-manifest.json')` al instalar, y ese archivo lo genera
  `build-precache.js` escaneando el proyecto (mismo mecanismo que
  `build-index.js` con `index.json`). Si agregás/renombrás/borrás un
  archivo del proyecto, **no hay que tocar `sw.js` a mano** — el próximo
  build lo detecta solo.
- **Lo único que sigue siendo manual:** el número `CACHE_VERSION` dentro
  de `sw.js` (hoy: revisar el valor real en el archivo — este documento no
  lo hardcodea para no desincronizarse). Subilo cuando quieras forzar que
  todos los usuarios reciban la versión nueva de una. Vive en `sw.js`
  puntualmente (no en un archivo separado) porque el navegador detecta
  "hay actualización" comparando los bytes de ESE archivo específico.
- **Excepción a propósito:** las requests a `api.languagetool.org` NUNCA
  se cachean ni se interceptan — deben intentar red real siempre.
- **Aviso de actualización:** banner ("Hay una versión nueva de la app
  lista para usar") cuando se publica una versión nueva mientras alguien
  tiene la app abierta — no fuerza el refresh solo. Lógica en `js/main.js`
  (evento `controllerchange` del Service Worker).

---

## ⭐ BOTONERA COMPARTIDA (`_shared/botonera.js`)

### Arquitectura centralizada
`botonera.js` tiene una función `renderToolbar()` que genera el HTML de
los 6 botones (PDF/Word/Guardar/Cargar/Ortografía/Limpiar) una sola vez y
lo inyecta en el contenedor. Cada informe solo necesita:
```html
<div class="btn-toolbar" id="actions"></div>
```
Si hay que cambiar un ícono, texto o agregar un botón: se edita una sola
vez en `botonera.js`, no en cada informe.

### Uso desde cada informe
```javascript
Botonera.init({
  camposGuardables: [...],
  camposNoLimpiar: [...],
  camposOrtografia: [{id: 'campo', label: 'Etiqueta'}, ...],
  nombreArchivoBase: 'informe',
  onResetExtra: function() { /* ... */ },
  onLoadExtra: function(data) { /* recibe el JSON completo cargado */ },
  onSaveExtra: function(data) { /* agregar claves extra al JSON antes de guardarlo */ }
});
```
`onSaveExtra`/`onLoadExtra` persisten **bloques dinámicos** (aspectos en
Genérico, competencias en SM Consultores) que no son campos simples, con
retrocompatibilidad si el JSON no trae esa clave.

### Diccionario ortográfico — dos capas
1. **Diccionario base** (`_shared/diccionario-base.js`): 181 términos
   del rubro psicolaboral/RRHH, común a los informes (comparten clave de
   `localStorage`).
2. **Diccionario personalizado**: lo arma el usuario, persiste en
   `localStorage` bajo la clave `correctorDiccionario`.

### Aviso de corrector sin conexión
Modal (una vez por sesión, vía `sessionStorage`) si falla LanguageTool.
Chip de estado en el dashboard, actualizado vía `postMessage` desde el
iframe del informe.

---

## 🔐 CONTRATO POR INFORME

Cada informe (o cada variante `_Grafico`/`_Sin_Grafico`) debe:
1. Seguir la convención de archivos de la sección "Separación de archivos JS" de arriba.
2. Definir `window.downloadPDF()` (async) usando `window.print()` + `@media print` en su CSS — NO `html2canvas`+`jsPDF`.
3. Definir `window.downloadWord()` (async) con `docx@8.5.0`.
4. Llamar `Botonera.init({...})` con su configuración, en el `init()` del orquestador `script_*.js`.
5. Tener en su HTML: `<link rel="stylesheet" href="../_shared/botonera.css">`, `<script src="../_shared/botonera.js"></script>` y `<div class="btn-toolbar" id="actions"></div>` vacío.
6. Vista previa en vivo reflejando el formulario en `<div id="page1">` (y `page2`/`page3` si aplica).

**Regla de oro (no romper nunca):** dentro de `downloadPDF`/`downloadWord`,
nunca asignar `btn.textContent`/`btn.innerHTML` sobre los botones de la
botonera para mostrar "Generando...". Eso destruye el
`<span class="tooltip">` interno de forma permanente. Usar `btn.disabled`
+ `#status` para mensajes de progreso.

---

## 🐛 BUGS ENCONTRADOS Y CORREGIDOS (histórico, para no repetirlos)

| Bug | Causa | Arreglo |
|---|---|---|
| "JSON no válido" al cargar un archivo bien generado | `cargarDatos()` armaba un selector CSS con el valor del campo; si el texto tenía comillas dobles, rompía el selector | Separar el `try/catch` del `JSON.parse` del de aplicar los datos; matchear radios por `name` + comparar `value` en JS |
| "Ignorar siempre" guardaba la palabra mal si tenía comillas | `escapeHTML()` no escapa comillas dobles, se usaba para armar un atributo HTML | No construir atributos HTML con datos de usuario sin sanitizar correctamente |
| Texto entre `< >` desaparecía silenciosamente del PDF (UDE) | Se inyectaba texto de usuario directo con `innerHTML` sin escapar | Aplicar mismo patrón que otros fixes si vuelve a aparecer |
| Aspectos/competencias no se guardaban en el JSON | `gatherFormData()` solo lee campos simples + radios, no bloques dinámicos | Hook `onSaveExtra`/`onLoadExtra` |
| Crash si no hay radio marcado al cargar un JSON viejo | `document.querySelector(...):checked).value` sin verificar null | Guardar el elemento en variable, usar `? valor : ''` |
| `index.json` con rutas rotas / carpetas faltantes | Se había editado a mano en vez de regenerar con `build-index.js` | Nunca editar `index.json` (ni `precache-manifest.json`) a mano; siempre correr los builds |
| PDF de "Informe Genérico" se cortaba a la mitad | El contenedor de captura tenía `max-height`+`overflow-y:auto` en pantallas angostas, afectaba la captura de `html2canvas` (arreglo histórico, previo a la migración a `window.print()`) | Ya no aplica del mismo modo tras la migración a impresión nativa, pero quedó documentado por si reaparece algo similar |
| Bug reportado que resultó no ser reproducible tras un fix | Service Worker sirviendo copia vieja en caché (stale) antes de hard-refresh | Si un fix "no se nota", primero descartar caché del SW (Application → Service Workers → Update/Unregister) antes de asumir que no funciona |
| **No es un bug:** recuadro "Clasificación" con fondo celeste/gris en Genérico | A propósito (`.classification-box`), no afecta PDF/Word | N/A |

---

## 📊 DIFERENCIAS ENTRE INFORMES

| Aspecto | UDE (original) | UDE_nuevo (transición) | SM Consultores | Genérico |
|---|---|---|---|---|
| Estado | Vivo, NO TOCAR sin permiso explícito | En paralelo, en validación | Vivo | Vivo |
| Archivos JS | Monolítico (`script_psicolaboral.js`) | Dividido (convención nueva), sin variante de gráfico | Dividido + variantes `_Grafico`/`_Sin_Grafico` | Dividido + variantes `_Grafico`/`_Sin_Grafico` |
| Páginas | 1 | 1 | 3 (con saltos) | 1-N (dinámico, checkboxes on/off por sección) |
| Bloques dinámicos | No | No | Competencias (agregar/eliminar), sin selector de estilo de gráfico | Aspectos evaluados (agregar/eliminar), CON selector de estilo (`tipoGrafico.js`) |
| Método PDF | `window.print()` | `window.print()` | `window.print()` | `window.print()` |
| CSS | ~6KB simple | ~6KB simple | ~150KB+ complejo (imágenes base64, diseño gráfico) | Simple + responsive |

---

## 🚀 BUILD Y DEPLOY

```bash
node build-index.js      # Regenera index.json escaneando html_externos/
node build-precache.js   # Regenera precache-manifest.json (mismo escaneo)
```

- **Ni `index.json` ni `precache-manifest.json` se versionan** (están en
  `.gitignore`). Netlify los regenera automáticamente en cada deploy
  (`netlify.toml` → build command). Si corrés el proyecto localmente sin
  pasar por ese build, corré ambos comandos vos mismo antes de abrir
  `index.html`.
- **Nunca editar ninguno de los dos a mano** — ya causó bugs reales por
  quedar desincronizados del estado real.
- El nombre "lindo" que ve el usuario en el sidebar para cada carpeta
  (ej. "UDE" en vez de "ude") vive en un archivo `nombre.txt` DENTRO de
  esa misma carpeta — no en un mapeo centralizado aparte.

---

## 📝 NOTAS PARA DESARROLLO FUTURO

- Si se agrega un informe nuevo, seguir el contrato completo de la
  sección "Contrato por informe" + la convención de archivos JS.
- Las rutas `../_shared/` funcionan porque todos los informes están a un
  nivel de profundidad dentro de `html_externos/`.
- Evitar código duplicado: si se reescribe un hook (`downloadWord`, etc.),
  borrar la versión vieja en vez de dejar dos definiciones en el mismo
  archivo — la última sobrescribe a la primera silenciosamente.
- Cualquier texto que se inyecte con `innerHTML` usando datos que el
  usuario escribió es un punto de riesgo — ver la tabla de bugs de arriba.
- El sistema de selector de tipo de gráfico (`tipoGrafico.js` +
  `OPCIONES_TIPO_GRAFICO`) hoy solo existe en Genérico. Portarlo a SM
  Consultores es trabajo pendiente, no automático — hay que crear el
  archivo `tipoGrafico.js` ahí siguiendo la receta de este documento.
- `UDE_nuevo` sigue en paralelo a `ude/` original. No reemplazar `ude/`
  hasta validación explícita de Fabio.
