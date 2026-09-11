// ============================================================
//  INFORME GENÉRICO (con gráfico) – exportPdf_Grafico.js
//  Contrato: define window.downloadPDF
//  Depende de: utils.js (hasContent, sanitizeFilename)
// ============================================================

// NOTA: esta función queda definida pero sin uso en ningún archivo
// del informe genérico (ni original ni _Grafico). Era parte del método
// viejo con html2canvas, que necesitaba esperar a que cargaran las
// fuentes antes de rasterizar. Con window.print() el navegador se
// encarga solo. La dejamos por si hace falta en el futuro, pero
// avisame si preferís que la borremos directamente.
async function waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (e) { /* noop */ }
  }
}

// ============================================================
//  CONTRATO: window.downloadPDF
// ============================================================
window.downloadPDF = async function() {
  const btn = document.querySelector('[data-action="pdf"]');
  const status = document.getElementById('status');
  if (btn) btn.disabled = true;

  if (!hasContent()) {
    if (status) status.textContent = '⚠ El documento está vacío. Agregá contenido antes de descargar.';
    if (btn) btn.disabled = false;
    return;
  }

  if (status) status.textContent = 'Elegí "Guardar como PDF" en el diálogo de impresión...';

  // MIGRADO de html2canvas+jsPDF a window.print() nativo del navegador.
  // El método anterior necesitaba un algoritmo propio para calcular
  // "cortes seguros" (calcularCortesSeguros/cortesPagina, ver historial)
  // porque jsPDF corta la imagen capturada a una altura fija en mm sin
  // saber qué hay dibujado ahí. Con window.print(), el motor de impresión
  // del navegador decide los saltos de página él mismo, respetando las
  // reglas "page-break-inside: avoid" que ya están puestas en el CSS
  // (@media print) sobre tablas, <hr>, los recuadros de clasificación y
  // el gráfico de aspectos — así que todo ese cálculo manual deja de
  // hacer falta. El resultado, de paso, sale idéntico al Word.
  const nombreArchivo = sanitizeFilename(document.getElementById('tituloInforme').value.trim() || 'Informe_Generico');
  const tituloOriginal = document.title;
  document.title = nombreArchivo;

  const restaurar = function() {
    document.title = tituloOriginal;
    if (btn) btn.disabled = false;
    if (status) status.textContent = '';
    window.removeEventListener('afterprint', restaurar);
  };
  window.addEventListener('afterprint', restaurar);
  setTimeout(function(){ window.print(); }, 50);
};
