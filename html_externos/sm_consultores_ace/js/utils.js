function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Reemplaza saltos de línea por <br> para la vista previa
function procesarTextoMultilinea(str) {
  return escapeHTML(str).replace(/\n/g, '<br>');
}