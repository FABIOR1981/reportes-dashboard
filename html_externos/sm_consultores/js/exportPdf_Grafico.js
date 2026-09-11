// ============================================================
//  SM CONSULTORES (con gráfico) – exportPdf_Grafico.js
//  Contrato: define window.downloadPDF
//  Depende de: utils.js (val)
// ============================================================
window.downloadPDF = async function() {
  const status = document.getElementById('status');
  const btn = document.querySelector('[data-action="pdf"]');
  if (btn) btn.disabled = true;

  if (status) status.textContent = 'Elegí "Guardar como PDF" en el diálogo de impresión...';

  // MIGRADO de html2canvas+jsPDF a window.print() nativo del navegador.
  // El método anterior le sacaba una "foto" (rasterizada) a la vista
  // previa, y esa aproximación arrastraba tres bugs distintos con la
  // misma raíz: texto más chico que en el Word (aproximación de fuente),
  // letras pisadas tipo "Cargα" en vez de "Cargo:" (aproximación de
  // kerning), y el gráfico de competencias cortado en el borde de la
  // página (aproximación de cómo se escala un SVG). window.print() usa el
  // mismo motor que ya dibuja la vista previa en pantalla — sin
  // aproximaciones — así que el resultado sale idéntico al Word: texto
  // vectorial real, kerning correcto, SVG escalado correctamente. El CSS
  // de la sección "@media print" (en style_psicotecnico_Grafico.css) es
  // el que define qué se ve en el PDF resultante (oculta el panel del
  // formulario, muestra solo las 3 páginas, un salto de página por cada
  // una, fuerza que se impriman los colores de fondo).
  const tituloOriginal = document.title;
  // El navegador usa el <title> de la página como nombre sugerido en el
  // diálogo de "Guardar como PDF" — lo dejamos armado con el mismo nombre
  // que usaba el método anterior, para no perder esa comodidad.
  document.title = `INFORME_EVALUACION_PSICOTECNICA_${(val('nombre') || 'postulante').trim().replace(/\s+/g, '_')}`;

  const restaurar = function() {
    document.title = tituloOriginal;
    if (btn) btn.disabled = false;
    if (status) status.textContent = '';
    window.removeEventListener('afterprint', restaurar);
  };
  // "afterprint" se dispara al cerrar el diálogo, se haya guardado el PDF
  // o cancelado — es el momento correcto para restaurar todo, en vez de
  // adivinar con un setTimeout fijo.
  window.addEventListener('afterprint', restaurar);

  // Pequeño respiro para que el navegador termine de aplicar el <title>
  // nuevo antes de abrir el diálogo (en algunos navegadores, si se llama
  // a print() en el mismo tick, el diálogo alcanza a abrirse todavía con
  // el título viejo).
  setTimeout(function(){ window.print(); }, 50);
};

// ============================================================
//  EXPORTACIÓN A WORD (.docx) – SM Consultores
//  Diseño fiel a la vista previa del informe psicotécnico
//  Agregar al final de script.js
// ============================================================

