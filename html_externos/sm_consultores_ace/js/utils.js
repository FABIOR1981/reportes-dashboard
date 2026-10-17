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

function fmtDate(iso) {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  return y ? `${d}/${m}/${y}` : iso;
}
function fmtDateLong(iso) {
  if (!iso) return '-';
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const [y, m, d] = iso.split('-');
  return y ? `${parseInt(d)} de ${meses[parseInt(m) - 1]} ${y}` : iso;
}
function val(id) { return document.getElementById(id).value; }
function setText(id, text) {
  document.getElementById(id).textContent = text && text.trim() !== '' ? text : '-';
}