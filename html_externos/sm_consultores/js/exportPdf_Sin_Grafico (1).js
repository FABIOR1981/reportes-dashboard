// ============================================================
//  SM CONSULTORES (sin gráfico) – exportPdf_Sin_Grafico.js
//  Contrato: define window.downloadPDF
//  Depende de: utils.js (val)
// ============================================================
// ---------- Descargar PDF ----------
window.downloadPDF = async function() {
  const status = document.getElementById('status');
  const btn = document.querySelector('[data-action="pdf"]');
  if (btn) btn.disabled = true;

  if (status) status.textContent = 'Elegí "Guardar como PDF" en el diálogo de impresión...';

  // MIGRADO de html2canvas+jsPDF a window.print() nativo del navegador.
  // El método anterior le sacaba una "foto" (rasterizada) a la vista
  // previa, y esa aproximación arrastraba bugs de texto pisado, tamaño de
  // fuente distinto al Word, y gráficos cortados. window.print() usa el
  // mismo motor que ya dibuja la vista previa en pantalla — sin
  // aproximaciones — así que el resultado sale idéntico al Word. El CSS
  // de la sección "@media print" (en style_psicotecnico.css) es el que
  // define qué se ve en el PDF resultante.
  const tituloOriginal = document.title;
  document.title = `INFORME_EVALUACION_PSICOTECNICA_${(val('nombre') || 'postulante').trim().replace(/\s+/g, '_')}`;

  const restaurar = function() {
    document.title = tituloOriginal;
    if (btn) btn.disabled = false;
    if (status) status.textContent = '';
    window.removeEventListener('afterprint', restaurar);
  };
  window.addEventListener('afterprint', restaurar);
  setTimeout(function(){ window.print(); }, 50);
};
