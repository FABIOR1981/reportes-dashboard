# 📋 REPORTES-DASHBOARD: CONTEXTO ARQUITECTURA
**Última actualización:** 17-08-2026

---

## 🎯 PROPÓSITO DEL PROYECTO

Dashboard dinámico para **generación de informes profesionales HTML**. Cada informe es una aplicación independiente con:
- 📝 Formulario dinámico
- 👁️ Vista previa en tiempo real (A4 simulada)
- 📥 Exportación a PDF y Word
- 💾 Guardado/carga de datos en JSON
- ✅ Revisión ortográfica con diccionario personalizado

**Hosting:** Netlify (SPA, sin backend)

---

## 📁 ESTRUCTURA DEL PROYECTO

```
reportes-dashboard/
├── index.html                           # Dashboard principal
├── index.json                           # Metadatos de informes
├── js/main.js                          # Lógica del dashboard
├── css/style.css                       # Estilos globales
│
├── html_externos/                      # Informes autocontenidos
│   ├── _shared/
│   │   ├── botonera.js                 # ⭐ LIBRERÍA COMPARTIDA: botones + diccionario
│   │   └── botonera.css                # Estilos de botonera
│   │
│   ├── generico/                       # ✨ INFORME GENÉRICO (Mejorado 08-2026)
│   │   ├── informe_generico.html       # Layout: 2 paneles lado a lado
│   │   ├── js/script.js                # Lógica + funciones de descarga
│   │   └── css/style.css               # Estilos + responsive
│   │
│   ├── sm consultores/                 # Informe Psicotécnico
│   │   ├── generador_informe_psicotecnico.html
│   │   ├── js/script_psicotecnico.js   # 3 páginas, competencias dinámicas
│   │   └── css/style_psicotecnico.css
│   │
│   └── ude/                            # Informe Psicolaboral
│       ├── generador_informe_psicolaboral.html
│       ├── js/script_psicolaboral.js   # 1 página, datos fijos
│       └── css/style_psicolaboral.css
│
└── para nuevo informe/
    ├── CONTEXTO_ARQUITECTURA_DASHBOARD.md
    └── PROMPT_NUEVO_INFORME.md
```

---

## 🛠️ STACK TECNOLÓGICO

| Aspecto | Tecnología | Versión |
|--------|-----------|---------|
| **Frontend** | HTML5 + CSS3 + JS Vanilla | - |
| **Exportación PDF** | html2canvas + jsPDF | 1.4.1 + 2.5.1 |
| **Exportación Word** | docx (UMD) | 8.5.0 |
| **Corrector ortográfico** | LanguageTool API | v2/check |
| **Build** | Node.js nativo | - |
| **Hosting** | Netlify | - |
| **Almacenamiento** | localStorage | - |

**Librerías cargadas vía CDN:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://unpkg.com/docx@8.5.0/build/index.js"></script>
```

---

## 📐 ARQUITECTURA LAYOUT

### Cada Informe: 2 Paneles Lado a Lado
```
┌───────────────────┬──────────────────────────┐
│  PANEL IZQUIERDO  │  PANEL DERECHO           │
│  (Formulario)     │  (Vista Previa A4)       │
│  520px fijo       │  Flex: 1 (ocupa resto)   │
│  height: 100vh    │  height: 100vh           │
│  scroll-y         │  scroll-y                │
└───────────────────┴──────────────────────────┘
```

**CSS Critical:**
```css
body { display: flex; min-height: 100vh; }
.form-panel { width: 520px; height: 100vh; overflow-y: auto; }
.preview-panel { flex: 1; height: 100vh; overflow-y: auto; }
```

**Página A4 simulada:**
- Ancho: `794px` (210mm @ 96dpi)
- Alto: `1123px` (297mm @ 96dpi)
- Padding: `50px 60px`

### Botonera Compartida
- Fixed: `top: 10px; right: 10px; z-index: 1000`
- 6 botones: PDF, Word, Guardar, Cargar, Ortografía, Limpiar
- Iconos SVG (no emoji)
- Status debajo

---

## 🔄 FLUJO DE DATOS

### Ciclo de Actualización
```
Usuario edita campo → Event listener
  → updatePreview() [con debounce 300ms]
  → Renderiza preview en tiempo real
  → Oculta secciones vacías automáticamente
```

### Exportación PDF
```
Click [PDF] → Validar contenido (no vacío)
  → Validar librerías → html2canvas()
  → jsPDF.addImage() → Sanitizar nombre
  → pdf.save()
```

---

## 📊 INFORMES DISPONIBLES

### 1️⃣ INFORME GENÉRICO ✨ (Actualizado 08-2026)

**Características:**
- ✅ Estructura flexible y reutilizable
- ✅ Secciones controlables con checkboxes (mostrar/ocultar)
- ✅ Clasificación con radio buttons
- ✅ **Aspectos dinámicos:** Agregar/eliminar múltiples aspectos evaluados
- ✅ Exportación completa a PDF y Word

**Mejoras implementadas (08-2026):**
- 🔒 **Seguridad:** Sanitización de nombres archivo, escapado de HTML (XSS prevention)
- ⚡ **Performance:** Debounce en updatePreview (300ms)
- ✔️ **Validación:** No permite descargar si documento está vacío
- 📱 **Responsive:** Media queries, estilos de impresión
- ✅ **Accesibilidad:** Focus states, aria-live, labels correctos

---

### 2️⃣ INFORME PSICOTÉCNICO (SM Consultores)
- 3 páginas, competencias dinámicas, escala 1-5

### 3️⃣ INFORME PSICOLABORAL (UDE)
- 1 página compacta, datos fijos

---

## ⭐ BOTONERA COMPARTIDA (`_shared/botonera.js`)

### Implementación
```javascript
Botonera.init({
  camposGuardables: [],         // IDs de inputs
  camposOrtografia: [],         // IDs de textareas
  nombreArchivoBase: 'informe',
  onResetExtra: null,           // Callback personalizado
  onLoadExtra: null
})
```

### Seguridad (08-2026)
- ✅ `escapeHTML()` para prevenir XSS
- ✅ Validación regex en entrada diccionario
- ✅ localStorage con fallback

---

## 🔐 CONTRATOS Y REGLAS

### Contrato: `window.downloadPDF()` y `window.downloadWord()`

**❌ NUNCA hacer:**
```javascript
btn.textContent = 'Generando...';  // Destruye el tooltip
```

**✅ SIEMPRE hacer:**
```javascript
btn.disabled = true;
status.textContent = 'Generando...';  // Usa #status, no modifica botón
```

### Validación de Contenido
```javascript
function hasContent() {
  // Verificar que hay algo por exportar
  return titulo || resumen || desarrollo || conclusion || aspectos.length > 0;
}
```

### Sanitización de Nombres
```javascript
function sanitizeFilename(str) {
  return str
    .replace(/[\/\\:?*"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}
```

---

## 🛡️ PROBLEMAS CONOCIDOS Y SOLUCIONES

### 1. Competencias no se ven en preview
**Solución:** Agregar `renderPreview()` después de cargar datos por defecto

### 2. Vista previa bajo formulario
**Solución:** Asegurar `body { display: flex; min-height: 100vh; }`

### 3. XSS en revisión ortográfica
**Solución:** Usar `escapeHTML()` al renderizar contenido del usuario

### 4. Caracteres inválidos en nombres archivo
**Solución:** Usar `sanitizeFilename()`

---

## 📋 CHECKLIST PARA NUEVO INFORME

- [ ] Crear `html_externos/[nombre]/` con HTML, JS, CSS
- [ ] Implementar `window.downloadPDF()` y `window.downloadWord()`
- [ ] Llamar `Botonera.init({ camposGuardables: [...] })`
- [ ] Layout: `body { display: flex; }` + paneles 520px / flex:1
- [ ] Testar PDF, Word, Guardar, Cargar, Ortografía, Limpiar
- [ ] Agregar en `index.json` y dashboard

---

## 🚀 NOTAS FINALES

- **Sin backend:** Todo ocurre en cliente
- **localStorage:** Datos persisten entre sesiones
- **CDN:** No hay node_modules
- **Offline:** Funciona excepto revisión ortográfica
- **Print:** `@media print` optimiza impresión

**Última actualización:** 17-08-2026 (Informe Genérico mejorado con seguridad + performance)
Dashboard dinámico para reportes HTML. Centraliza visualizaciones e informes autocontenidos en un panel navegable con menú lateral. Cada informe es un generador de informes profesionales con formularios, vistas previas y exportación a PDF/Word.

## 2. Estructura de carpetas

```
reportes-dashboard/
├── index.html              # Dashboard principal (barra lateral + iframe)
├── index.json              # Índice generado automáticamente por build-index.js
├── build-index.js          # Script Node nativo (usa fs/path, zero dependencies)
├── package.json            # {"scripts": {"build": "node build-index.js"}}
├── netlify.toml            # SPA fallback + build command
├── css/                    # Estilos del dashboard
├── js/                     # main.js del dashboard
├── old/                    # Versiones anteriores (ignorado por build-index.js)
└── html_externos/          # Reportes HTML organizados por área
    ├── _shared/
    │   ├── botonera.css    # Estilos compartidos de botones (compacta, fixed, tooltips)
    │   └── botonera.js     # Lógica compartida: guardar/cargar JSON, ortografía, diccionario, limpiar
    ├── sm consultores/
    │   ├── generador_informe_psicotecnico.html
    │   ├── css/style.css   # ~152KB con imágenes base64, diseño gráfico complejo
    │   └── js/script.js    # Competencias dinámicas, 3 páginas preview, PDF, Word
    └── ude/
        ├── generador_informe_psicolaboral.html
        ├── css/style.css   # ~6KB, diseño simple
        └── js/script.js    # Estructura fija, 1 página preview, PDF, Word
```

## 3. Stack tecnológico
- Dashboard: HTML5 + CSS + JS vanilla (SPA simple, sin frameworks)
- Reportes: HTML5 + CSS + JS vanilla (autocontenidos)
- PDF: html2canvas + jspdf (captura DOM como imagen)
- Word: docx@8.5.0 UMD (construye documentos nativos)
- Build: Node.js nativo (fs/path, zero npm dependencies)
- Corrector: LanguageTool API (https://api.languagetool.org/v2/check)
- Hosting: Netlify (SPA fallback configurado)

## 4. Arquitectura de la botonera compartida

### HTML de cada informe define:
Los iconos son SVG inline (estilo outline, `class="btn-icon"`, `stroke="currentColor"`), no emojis. Se actualizó en agosto 2026 (ver sección 8).
```html
<div class="btn-toolbar" id="actions">
  <button class="btn btn-primary" data-action="pdf" aria-label="Descargar PDF">
    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    <span class="tooltip">Descargar PDF</span>
  </button>
  <button class="btn btn-primary" data-action="word" aria-label="Descargar Word">
    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
    <span class="tooltip">Descargar Word</span>
  </button>
  <button class="btn btn-secondary" data-action="save" aria-label="Guardar datos">
    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    <span class="tooltip">Guardar datos</span>
  </button>
  <button class="btn btn-secondary" data-action="load" aria-label="Cargar datos">
    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
    <span class="tooltip">Cargar datos</span>
  </button>
  <input type="file" id="loadInput" accept="application/json,.json" hidden>
  <button class="btn btn-tertiary" data-action="spellcheck" aria-label="Revisar ortografía">
    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    <span class="tooltip">Revisar ortografía</span>
  </button>
  <button class="btn btn-danger" data-action="reset" aria-label="Limpiar formulario">
    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
    <span class="tooltip">Limpiar formulario</span>
  </button>
</div>
<div id="status"></div>
<div id="spellPanel"></div>
<div id="dicPanel">
  <label>Diccionario técnico personalizado...</label>
  <div id="dicAddRow">
    <input type="text" id="dicInput" placeholder="Agregar palabra...">
    <button type="button" id="dicAddBtn">+ Agregar</button>
  </div>
  <div id="dicList"></div>
</div>
```

### CSS (botonera.css)
- Selectores con alta especificidad: `#actions.btn-toolbar` y `#actions.btn-toolbar .btn` para ganar sobre `#actions` de los CSS de los informes.
- `position: fixed; top: 10px; right: 10px; z-index: 1000;` → botonera flotante arriba a la derecha del iframe.
- Botones: 40×40px, solo iconos, border-radius 8px, fondo blanco con borde gris claro (`#e5e7eb`) e ícono en el color semántico (`btn-primary` azul oscuro, `btn-secondary` azul, `btn-tertiary` gris oscuro, `btn-danger` rojo sobre fondo rojo claro `#fdecea`). Actualizado en agosto 2026: antes tenían fondo de color sólido.
- Tooltip: aparece DEBAJO del botón (`top: calc(100% + 8px)`), usa `visibility: hidden` + `opacity: 0` para ser no-interactivo cuando no está en hover.
- `user-select: none` en el botón completo para evitar selección de texto al hacer clic.
- Status: fijo debajo de la botonera (`top: 56px; right: 10px`).

### JS (botonera.js)
- `Botonera.init({ camposGuardables, camposNoLimpiar, camposOrtografia, nombreArchivoBase, onResetExtra, onLoadExtra })`
- Lee botones del DOM por `data-action` y les agrega event listeners.
- Hooks: `window.downloadPDF()` y `window.downloadWord()` deben estar definidos por cada informe.
- Guardar/Cargar: JSON con todos los campos del formulario.
- Ortografía: LanguageTool API, con diccionario técnico personalizado en localStorage.

## 5. Contrato por informe

Cada `script.js` de informe DEBE:
1. Definir `window.downloadPDF()` — implementación propia.
2. Definir `window.downloadWord()` — implementación propia.
3. Llamar `Botonera.init({ ... })` con la configuración específica.

### UDE (psicolaboral)
```javascript
Botonera.init({
  camposGuardables: ['ciudad','fechaInforme','institucion','tituloInforme','prefijo',
    'apellidos','nombres','cargo','ci','fechaNacimiento','contacto',
    'evaluacion','conclusion','profNombre','profCel','profCargo'],
  camposOrtografia: [
    {id:'tituloInforme', label:'Título del informe'},
    {id:'cargo', label:'Cargo al que postula'},
    {id:'evaluacion', label:'Texto de evaluación'},
    {id:'conclusion', label:'Conclusión'},
    {id:'profCargo', label:'Especialidad / Cargo profesional'}
  ],
  nombreArchivoBase: 'informe',
  onResetExtra: function() {
    document.getElementById('prefijo').value = 'al';
    document.getElementById('fechaInforme').value = new Date().toISOString().slice(0,10);
    updatePreview();
  },
  onLoadExtra: function() { updatePreview(); }
});
```

### SM Consultores (psicotécnico)
```javascript
Botonera.init({
  camposGuardables: ['fechaInforme','elaboradoPor','consultoria','logoNombre','logoLeyenda',
    'nombre','cargoPostulacion','fechaNac','edad','ci','contacto',
    'fechaEval','horaEval','solicitante','cargoEvaluado',
    'enfoqueTexto','conclusionTexto','oportunidadadTexto'],
  camposNoLimpiar: ['logoNombre','logoLeyenda'],
  camposOrtografia: [
    {id:'enfoqueTexto', label:'Enfoque / Objetivo'},
    {id:'conclusionTexto', label:'Conclusión'},
    {id:'oportunidadadTexto', label:'Oportunidad de mejora'}
  ],
  nombreArchivoBase: 'Informe_Psicotecnico',
  onResetExtra: function() {
    document.getElementById('compContainer').innerHTML = '';
    renderPreview();
  },
  onLoadExtra: function() { renderPreview(); }
});
```

## 6. Diferencias entre informes

| Aspecto | UDE (psicolaboral) | SM Consultores (psicotécnico) |
|---------|-------------------|------------------------------|
| Páginas | 1 | 3 (con saltos de página) |
| Competencias | Fijas en texto libre | Dinámicas (agregar/eliminar/editar) |
| Clasificación | Radio simple | Checkbox visual con SVG |
| CSS | ~6KB simple | ~152KB complejo (banner, firma, imágenes base64) |
| Word | Exporta texto plano con tablas | Exporta con fondos teal, imágenes, Calibri |

## 7. Problemas conocidos y soluciones aplicadas

| Problema | Causa | Solución |
|----------|-------|----------|
| CSS de informe pisa botonera | `#actions` en style.css de cada informe | Selectores `#actions.btn-toolbar` (mayor especificidad) |
| Botonera compacta no funcionaba | `cloneNode` no copia event listeners | Botonera definida directamente en HTML, no clonada |
| Texto seleccionado al hacer clic en botón | Navegador seleccionaba el emoji (ya no aplica: desde agosto 2026 los botones usan íconos SVG, no emoji) | `user-select: none` en botón + `visibility: hidden` en tooltip (se mantiene por robustez aunque el riesgo original de selección de texto desapareció al pasar a SVG) |
| Tooltip tapado por header | Aparecía arriba del botón | Tooltip aparece DEBAJO (`top: calc(100% + 8px)`) |
| Botones de PDF/Word no encontrados | Buscaban `id="downloadBtn"` | Cambiados a `document.querySelector('[data-action="pdf"]')` |
| Tooltip del botón PDF/Word deja de aparecer después del primer clic | El handler hacía `btn.textContent = 'Generando...'` y luego `btn.textContent = originalText` para mostrar el estado de carga. `textContent` reemplaza TODOS los hijos del botón por un único nodo de texto plano, destruyendo el `<span class="tooltip">` interno de forma permanente (no se recupera ni recargando el JS, solo con un refresh completo de la página) | No tocar `textContent`/`innerHTML` del botón; usar `btn.disabled = true/false` para el estado visual y el `#status` compartido para el mensaje de progreso ("Generando PDF...", "✔ PDF descargado con éxito.", etc.) |

## 8. Decisiones de diseño tomadas

- **Botonera en cada informe** (no en el dashboard): cada informe es autocontenido, más fácil de mantener individualmente.
- **Posición fixed** dentro del iframe: visualmente parece parte del dashboard sin la complejidad de comunicación iframe-padre.
- **Iconos unificados** en todos los informes: SVG inline estilo outline (no emoji, cambio hecho en agosto 2026) — documento (PDF), disco/guardar (Word), flecha abajo (Guardar), flecha arriba (Cargar), check (Ortografía), tacho de basura (Limpiar). Fondo blanco, ícono en color semántico; ver sección 4 para el markup de cada uno.
- **Botonera alineada a la derecha** (`right: 10px`) del iframe — se probó una variante a la izquierda pero se revirtió a la derecha, que es la posición definitiva.
- **Tooltip por debajo**: evita que quede tapado por el header del dashboard.
- **Diccionario en localStorage**: palabras técnicas personalizadas persisten entre sesiones.

## 9. Instrucciones de build y deploy

```bash
npm run build        # Genera index.json escaneando html_externos/
npx serve .          # Desarrollo local
```

Netlify: build command `npm run build`, publish directory `.`, SPA fallback `/* → /index.html`.

## 10. Notas para desarrollo futuro

- Si se agrega un tercer informe, debe seguir el mismo contrato: definir `downloadPDF`, `downloadWord`, y llamar `Botonera.init()`.
- Las rutas `../_shared/` funcionan porque todos los informes están a un nivel de profundidad dentro de `html_externos/`.
- `index.json` se regenera automáticamente — no editar manualmente.
- La carpeta `old/` no se escanea por `build-index.js`.
- **Regla para `downloadPDF`/`downloadWord`**: nunca asignar `btn.textContent` ni `btn.innerHTML` sobre los botones de la botonera para mostrar estados de carga ("Generando PDF...", etc.) — destruye el `<span class="tooltip">` interno de forma permanente. Usar siempre `#status` para mensajes de progreso/éxito/error, y solo `btn.disabled` para el estado visual del botón durante la generación. Patrón correcto:
  ```javascript
  window.downloadPDF = async function() {
    const btn = document.querySelector('[data-action="pdf"]');
    const status = document.getElementById('status');
    if (btn) btn.disabled = true;
    if (status) status.textContent = 'Generando PDF, por favor espera...';
    try {
      // ... generar y descargar el archivo ...
      if (status) status.textContent = '✔ PDF descargado con éxito.';
    } catch (e) {
      if (status) status.textContent = '⚠ Error al generar el PDF. Revisá la consola.';
    } finally {
      if (btn) btn.disabled = false;
      if (status) setTimeout(() => { status.textContent = ''; }, 4000);
    }
  };
  ```
- **Evitar código duplicado/muerto**: si se reescribe `downloadWord` (u otro hook) durante el desarrollo, borrar la versión vieja en vez de dejar dos definiciones de `window.downloadWord` en el mismo archivo — la última sobrescribe a la primera silenciosamente, y la primera queda como código muerto que confunde a quien lea el archivo después (esto pasó en `sm consultores/js/script.js`, corregido en agosto 2026).
