// ============================================================
//  INFORME GENÉRICO – utils.js
//  Utilidades genéricas sin estado.
//  Usado por: vistaPrevia.js, exportPdf.js, exportWord.js, script.js
// ============================================================

// Escapar HTML para prevenir XSS
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Sanitizar nombres de archivo
function sanitizeFilename(str) {
  return str
    .replace(/[\/\\:?*"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 100)
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Validar que hay contenido para descargar
function hasContent() {
  const titulo = document.getElementById('tituloInforme').value.trim();
  const resumen = document.getElementById('resumen').value.trim();
  const desarrollo = document.getElementById('desarrollo').value.trim();
  const conclusion = document.getElementById('conclusion').value.trim();
  const clasifEl = document.querySelector('input[name="clasificacion"]:checked');
  const clasificacion = clasifEl ? clasifEl.value : '';
  const aspectosContainer = document.getElementById('aspectosContainer');
  const bloques = aspectosContainer ? aspectosContainer.querySelectorAll('.aspecto-block') : [];
  let tieneAspectosConContenido = false;
  bloques.forEach(function(block) {
    const nombre = block.querySelector('.asp-nombre')?.value.trim();
    const desc = block.querySelector('.asp-desc')?.value.trim();
    if (nombre || desc) tieneAspectosConContenido = true;
  });
  return titulo || resumen || desarrollo || conclusion || clasificacion || tieneAspectosConContenido;
}
