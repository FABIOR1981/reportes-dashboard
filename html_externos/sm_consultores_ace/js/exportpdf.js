window.downloadPDF = function () {
  const status = document.getElementById('status');
  const btn = document.querySelector('[data-action="pdf"]');
  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Elegí "Guardar como PDF" en el diálogo de impresión...';

  // El título del documento es el nombre sugerido del PDF
  const tituloOriginal = document.title;
  document.title = `INFORME_EVALUACION_PSICOTECNICA_${(val('nombre') || 'postulante').trim().replace(/\s+/g, '_')}`;

  const restaurar = function () {
    document.title = tituloOriginal;
    if (btn) btn.disabled = false;
    if (status) status.textContent = '';
    window.removeEventListener('afterprint', restaurar);
  };
  window.addEventListener('afterprint', restaurar);
  setTimeout(function () { window.print(); }, 50);
};