function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

// Reemplaza saltos de línea por <br> para la vista previa
function procesarTextoMultilinea(str) {
  return escapeHTML(str).replace(/\r\n|\r|\n/g, '<br>');
}