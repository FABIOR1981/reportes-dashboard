# Prompt estandarizado — Nuevo informe para reportes-dashboard

Copiá y pegá este prompt cada vez que quieras agregar un informe nuevo.
Completá los `[corchetes]` antes de enviarlo, y adjuntá los 2 archivos que se piden al final.

---

## PROMPT (copiar desde acá)

Quiero agregar un nuevo informe al repo `FABIOR1981/reportes-dashboard`,
siguiendo exactamente la arquitectura documentada en `CONTEXTO_ARQUITECTURA_DASHBOARD.md`
(adjunto). Ya conocés el proyecto — no hace falta que vuelvas a explorar el repo,
usá el contexto del archivo adjunto y el documento de ejemplo que también adjunto.

**Datos del nuevo informe:**
- Nombre del informe: `[ej: Informe de Clima Laboral]`
- Carpeta destino dentro de `html_externos/`: `[ej: acme-consultores]`
- Nombre del archivo HTML principal: `generador_informe_[nombre].html`
- Documento de referencia adjunto: `[nombre del PDF o Word que muestra el diseño/contenido a replicar]`

**Quiero que generes la estructura completa, lista para copiar a `html_externos/[carpeta]/`:**
```
html_externos/[carpeta]/
├── generador_informe_[nombre].html
├── css/style.css
└── js/script.js
```

**Requisitos obligatorios (contrato del proyecto):**
1. El HTML debe incluir la botonera compartida:
   `<link rel="stylesheet" href="../_shared/botonera.css">` y
   `<script src="../_shared/botonera.js"></script>`, con el `<div class="btn-toolbar" id="actions">`
   y los botones `data-action="pdf|word|save|load|spellcheck|reset"` tal cual están
   documentados en la sección 4 de `CONTEXTO_ARQUITECTURA_DASHBOARD.md`.
2. El `script.js` debe definir `window.downloadPDF()` y `window.downloadWord()`,
   y llamar a `Botonera.init({...})` al final, con `camposGuardables`, `camposOrtografia`
   y (si aplica) `onResetExtra`/`onLoadExtra` ajustados a los campos de este informe.
3. **Regla del tooltip (obligatoria):** dentro de `downloadPDF`/`downloadWord`
   NUNCA asignar `btn.textContent` ni `btn.innerHTML` al botón de acción — eso rompe
   el `<span class="tooltip">` interno de forma permanente. Usar `btn.disabled` +
   el `#status` compartido para el feedback de progreso/éxito/error, exactamente
   como quedó documentado en la sección 10 de `CONTEXTO_ARQUITECTURA_DASHBOARD.md`.
4. Vista previa en vivo: los campos del formulario deben reflejarse en tiempo real
   en un `<div id="page1">` (u otras páginas `page2`, `page3` si el diseño lo requiere),
   igual que en los informes existentes.
5. Exportar a PDF con `html2canvas` + `jsPDF` (captura de la vista previa) y a Word
   con la librería `docx@8.5.0` (documento nativo, no imagen), replicando lo más
   fielmente posible el diseño del documento de referencia adjunto (colores, tablas,
   tipografía, logo/firma si corresponde).
6. No modificar `_shared/botonera.js` ni `_shared/botonera.css` — el informe nuevo
   debe funcionar solo con lo que ya existe ahí.
7. Al final, decime si hace falta algún ajuste en `build-index.js` o `index.json`
   (normalmente no, porque el build escanea `html_externos/` automáticamente),
   y agregá una fila nueva a la tabla de la sección 6 de `CONTEXTO_ARQUITECTURA_DASHBOARD.md`
   comparando este informe con los existentes.

**Adjunto:**
1. `CONTEXTO_ARQUITECTURA_DASHBOARD.md` (contexto del proyecto)
2. `[el PDF o Word de referencia con el diseño/contenido del informe nuevo]`

---

## Notas de uso

- Si el documento de referencia tiene un diseño visual complejo (logos, colores de marca,
  tablas con formato específico), aclaralo explícitamente en el prompt — cuanto más
  detalle des sobre qué es fijo (cabezal, firma) y qué es editable por el usuario
  (nombre, fecha, texto libre), menos vueltas va a necesitar el resultado.
- Guardá siempre la versión más reciente de `CONTEXTO_ARQUITECTURA_DASHBOARD.md` para adjuntar
  (si en algún momento actualizás la arquitectura o encontrás un bug nuevo, agregalo
  ahí primero, así el próximo informe ya nace corregido).
- Después de recibir los archivos, probá el flujo completo (Descargar PDF, Descargar
  Word, Guardar, Cargar, Ortografía, Limpiar) antes de subirlo al repo — igual que
  hicimos con los dos informes existentes.
