# Prompt estandarizado — Nuevo informe para reportes-dashboard

**Última actualización:** 13-09-2026

Copiá y pegá este prompt cada vez que quieras agregar un informe nuevo.
Completá los `[corchetes]` antes de enviarlo, y adjuntá los 2 archivos que se piden al final.

---

## PROMPT (copiar desde acá)

Quiero agregar un nuevo informe al repo `FABIOR1981/reportes-dashboard`,
siguiendo exactamente la arquitectura documentada en
`CONTEXTO_ARQUITECTURA_DASHBOARD.md` (adjunto). Ya conocés el proyecto —
no hace falta que vuelvas a explorar el repo, usá el contexto del archivo
adjunto y el documento de ejemplo que también adjunto.

**Datos del nuevo informe:**
- Nombre del informe: `[ej: Informe de Clima Laboral]`
- Carpeta destino dentro de `html_externos/`: `[ej: acme-consultores]`
- Nombre del archivo HTML principal: `generador_informe_[nombre].html`
- ¿Tiene aspectos/competencias graficables (gráfico de barras/aros/etc.)?: `[sí/no]`
- Documento de referencia adjunto: `[nombre del PDF o Word que muestra el diseño/contenido a replicar]`

**Quiero que generes la estructura completa, lista para copiar a `html_externos/[carpeta]/`,
siguiendo la CONVENCIÓN DE SEPARACIÓN DE ARCHIVOS documentada en la
sección correspondiente de `CONTEXTO_ARQUITECTURA_DASHBOARD.md` (no un
único `script.js` monolítico):**
```
html_externos/[carpeta]/
├── generador_informe_[nombre].html
├── nombre.txt                     # nombre lindo para el sidebar
├── css/style.css
└── js/
    ├── utils.js                   # helpers compartidos (escapeHTML, etc.)
    ├── vistaPrevia.js             # actualiza <div id="page1"> (y page2/page3 si aplica) en tiempo real
    ├── grafico.js                 # SOLO si hay aspectos/competencias graficables
    ├── tipoGrafico.js             # SOLO si ofrece más de un estilo de gráfico (ver receta en el contexto)
    ├── exportPdf.js               # define window.downloadPDF()
    ├── exportWord.js              # define window.downloadWord()
    └── script.js                  # orquestador: init() + DOMContentLoaded, llama a Botonera.init()
```

**Requisitos obligatorios (contrato del proyecto):**
1. El HTML debe incluir la botonera compartida:
   `<link rel="stylesheet" href="../_shared/botonera.css">` y
   `<script src="../_shared/botonera.js"></script>`, con el `<div class="btn-toolbar" id="actions">`
   y los botones `data-action="pdf|word|save|load|spellcheck|reset"` tal cual están
   documentados en la sección "Botonera compartida" de `CONTEXTO_ARQUITECTURA_DASHBOARD.md`.
2. `script.js` debe definir `window.downloadPDF()` y `window.downloadWord()`
   (en sus archivos correspondientes, según la separación de arriba),
   y llamar a `Botonera.init({...})` al final de su `init()`, con
   `camposGuardables`, `camposOrtografia` y (si aplica)
   `onResetExtra`/`onLoadExtra`/`onSaveExtra` ajustados a los campos de
   este informe.
3. **Regla del tooltip (obligatoria):** dentro de `downloadPDF`/`downloadWord`
   NUNCA asignar `btn.textContent` ni `btn.innerHTML` al botón de acción — eso rompe
   el `<span class="tooltip">` interno de forma permanente. Usar `btn.disabled` +
   el `#status` compartido para el feedback de progreso/éxito/error.
4. Vista previa en vivo: los campos del formulario deben reflejarse en tiempo real
   en un `<div id="page1">` (u otras páginas `page2`, `page3` si el diseño lo requiere),
   igual que en los informes existentes.
5. **PDF: usar `window.print()` nativo del navegador + reglas `@media print`
   en el CSS del informe. NO usar `html2canvas`+`jsPDF`** — ese método quedó
   deprecado en todo el proyecto (ver nota de migración en
   `CONTEXTO_ARQUITECTURA_DASHBOARD.md`) por artefactos de rasterización y
   cortes de página arbitrarios. Recordar: para ocultar del PDF elementos
   `position: fixed` (como la botonera), usar `display: none !important`
   en `@media print` — `visibility: hidden` no alcanza.
6. **Word:** documento nativo con `docx@8.5.0` (no imagen), replicando lo
   más fielmente posible el diseño del documento de referencia adjunto
   (colores, tablas, tipografía, logo/firma si corresponde). Si hay
   gráfico, rasterizarlo a PNG vía canvas oculto e insertarlo con
   `docx.ImageRun`.
7. Si el informe tiene aspectos/competencias graficables (SVG, sin
   librerías externas): implementar al menos un estilo de gráfico en
   `grafico.js`. Si se ofrece más de un estilo desde el arranque, sumar
   `tipoGrafico.js` con el modal selector, siguiendo exactamente el mismo
   patrón (dispatcher + array `OPCIONES_TIPO_GRAFICO` + miniatura
   autogenerada) documentado en la receta "Cómo agregar un tipo de
   gráfico nuevo" de `CONTEXTO_ARQUITECTURA_DASHBOARD.md`.
8. No modificar `_shared/botonera.js` ni `_shared/botonera.css` — el informe nuevo
   debe funcionar solo con lo que ya existe ahí.
9. Al final, decime si hace falta algún ajuste en `build-index.js`,
   `build-precache.js` o `sw.js` (normalmente solo el bump de
   `CACHE_VERSION` en `sw.js` — el resto escanea `html_externos/`
   automáticamente), y agregá una fila nueva a la tabla comparativa de
   `CONTEXTO_ARQUITECTURA_DASHBOARD.md`.

**Adjunto:**
1. `CONTEXTO_ARQUITECTURA_DASHBOARD.md` (contexto del proyecto)
2. `[el PDF o Word de referencia con el diseño/contenido del informe nuevo]`

---

## Notas de uso

- Si el documento de referencia tiene un diseño visual complejo (logos,
  colores de marca, tablas con formato específico), aclaralo
  explícitamente en el prompt — cuanto más detalle des sobre qué es fijo
  (cabezal, firma) y qué es editable por el usuario (nombre, fecha, texto
  libre), menos vueltas va a necesitar el resultado.
- Guardá siempre la versión más reciente de
  `CONTEXTO_ARQUITECTURA_DASHBOARD.md` para adjuntar (si en algún momento
  actualizás la arquitectura o encontrás un bug nuevo, agregalo ahí
  primero, así el próximo informe ya nace corregido).
- Después de recibir los archivos, probá el flujo completo (Descargar
  PDF, Descargar Word, Guardar, Cargar, Ortografía, Limpiar) antes de
  subirlo al repo — pedile a Claude que lo verifique primero con
  `node --check` + un harness jsdom, y confirmá vos el resultado real
  (documento generado) antes de dar algo por terminado.
