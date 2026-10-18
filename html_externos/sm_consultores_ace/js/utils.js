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

// Evita colas como 7.300000000000001 al sumar decimales
function redondear2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

// "15 de Agosto de 2025" (mes con mayúscula, como en el PDF)
function fmtFechaMayus(iso) {
  if (!iso) return '-';
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const [y, m, d] = iso.split('-');
  return y ? `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}` : iso;
}
function diaSemana(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][new Date(y, m - 1, d).getDay()];
}
// "Viernes 15 de Agosto / Hora 14:00hs"
function fmtEvalLinea(iso, hora) {
  if (!iso) return '-';
  const dia = diaSemana(iso);
  const [, m, d] = iso.split('-');
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${parseInt(d)} de ${meses[parseInt(m) - 1]}` + (hora ? ` / Hora ${hora}hs` : '');
}
function setText(id, text) {
  document.getElementById(id).textContent = text && text.trim() !== '' ? text : '-';
}