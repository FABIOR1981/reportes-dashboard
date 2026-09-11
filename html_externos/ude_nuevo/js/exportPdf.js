// ============================================================
//  UDE – exportPdf.js
//  Contrato: define window.downloadPDF
//  Depende de: utils.js (no usa nada directamente, pero se agrupa acá
//  por prolijidad con el resto de informes)
// ============================================================

// NOTA: window.resetForm queda definida pero SIN USO en ningún lado del
// proyecto (no hay ningún botón ni código que la llame — se revisó el
// HTML y botonera.js). El reseteo real del formulario lo hace
// Botonera.init({ onResetExtra: ... }) en script.js. Se conserva acá tal
// cual estaba en el original por si hace falta en el futuro — avisame si
// preferís que la eliminemos directamente (mismo criterio que con
// waitForFonts() en el informe genérico).
window.resetForm = function(){
  if(!confirm('¿Estás seguro de que querés limpiar los datos del postulante y la evaluación?')) return;
  document.getElementById('apellidos').value = '';
  document.getElementById('nombres').value = '';
  document.getElementById('cargo').value = '';
  document.getElementById('ci').value = '';
  document.getElementById('fechaNacimiento').value = '';
  document.getElementById('contacto').value = '';
  document.getElementById('prefijo').value = 'al';
  document.getElementById('evaluacion').value = '';
  document.getElementById('conclusion').value = '';
  document.getElementById('fechaInforme').value = new Date().toISOString().slice(0,10);
  document.querySelector('input[name="recom"][value="Recomendable"]').checked = true;
  updatePreview();
};


// ---------- Descargar como PDF ----------
window.downloadPDF = async function(){
  var btn = document.querySelector('[data-action="pdf"]');
  var status = document.getElementById('status');
  if(!btn) return;
  btn.disabled = true;

  if (status) status.textContent = 'Elegí "Guardar como PDF" en el diálogo de impresión...';

  // MIGRADO de html2canvas+jsPDF a window.print() nativo del navegador.
  // El método anterior le sacaba una "foto" (rasterizada) a la vista
  // previa, y esa aproximación arrastraba bugs de texto pisado tipo
  // "Cargα" en vez de "Cargo:" (aproximación de kerning) y de tamaño
  // de fuente distinto al Word (aproximación de escala). window.print()
  // usa el mismo motor que ya dibuja la vista previa en pantalla — sin
  // aproximaciones — así que el resultado sale idéntico al Word. El CSS
  // de la sección "@media print" (en style_psicolaboral.css) es el que
  // define qué se ve en el PDF resultante (oculta el panel del
  // formulario, muestra solo la página, fuerza que se impriman los
  // colores de fondo).
  var tituloOriginal = document.title;
  // El navegador usa el <title> de la página como nombre sugerido en el
  // diálogo de "Guardar como PDF".
  document.title = 'Informe_Psicolaboral_' + (document.getElementById('apellidos').value || 'informe').replace(/\s+/g,'_');

  var restaurar = function() {
    document.title = tituloOriginal;
    btn.disabled = false;
    if (status) status.textContent = '';
    window.removeEventListener('afterprint', restaurar);
  };
  // "afterprint" se dispara al cerrar el diálogo, se haya guardado el
  // PDF o cancelado.
  window.addEventListener('afterprint', restaurar);

  setTimeout(function(){ window.print(); }, 50);
};
