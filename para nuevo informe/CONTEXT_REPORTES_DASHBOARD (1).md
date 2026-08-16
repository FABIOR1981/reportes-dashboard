# CONTEXT: Reportes Dashboard – FABIOR1981/reportes-dashboard

## 1. Propósito del proyecto
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
```html
<div class="btn-toolbar" id="actions">
  <button class="btn btn-primary" data-action="pdf" aria-label="Descargar PDF">
    📄<span class="tooltip">Descargar PDF</span>
  </button>
  <button class="btn btn-primary" data-action="word" aria-label="Descargar Word">
    📝<span class="tooltip">Descargar Word</span>
  </button>
  <button class="btn btn-secondary" data-action="save" aria-label="Guardar datos">
    💾<span class="tooltip">Guardar datos</span>
  </button>
  <button class="btn btn-secondary" data-action="load" aria-label="Cargar datos">
    📂<span class="tooltip">Cargar datos</span>
  </button>
  <input type="file" id="loadInput" accept="application/json,.json" hidden>
  <button class="btn btn-tertiary" data-action="spellcheck" aria-label="Revisar ortografía">
    🔤<span class="tooltip">Revisar ortografía</span>
  </button>
  <button class="btn btn-danger" data-action="reset" aria-label="Limpiar formulario">
    🗑<span class="tooltip">Limpiar formulario</span>
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
- Botones: 40×40px, solo iconos, border-radius 8px.
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
| Texto seleccionado al hacer clic en botón | Navegador selecciona emoji | `user-select: none` en botón + `visibility: hidden` en tooltip |
| Tooltip tapado por header | Aparecía arriba del botón | Tooltip aparece DEBAJO (`top: calc(100% + 8px)`) |
| Botones de PDF/Word no encontrados | Buscaban `id="downloadBtn"` | Cambiados a `document.querySelector('[data-action="pdf"]')` |
| Tooltip del botón PDF/Word deja de aparecer después del primer clic | El handler hacía `btn.textContent = 'Generando...'` y luego `btn.textContent = originalText` para mostrar el estado de carga. `textContent` reemplaza TODOS los hijos del botón por un único nodo de texto plano, destruyendo el `<span class="tooltip">` interno de forma permanente (no se recupera ni recargando el JS, solo con un refresh completo de la página) | No tocar `textContent`/`innerHTML` del botón; usar `btn.disabled = true/false` para el estado visual y el `#status` compartido para el mensaje de progreso ("Generando PDF...", "✔ PDF descargado con éxito.", etc.) |

## 8. Decisiones de diseño tomadas

- **Botonera en cada informe** (no en el dashboard): cada informe es autocontenido, más fácil de mantener individualmente.
- **Posición fixed** dentro del iframe: visualmente parece parte del dashboard sin la complejidad de comunicación iframe-padre.
- **Iconos unificados** en todos los informes: 📄 PDF, 📝 Word, 💾 Guardar, 📂 Cargar, 🔤 Ortografía, 🗑 Limpiar.
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
