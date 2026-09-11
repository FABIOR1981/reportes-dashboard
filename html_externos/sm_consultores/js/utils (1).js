// ============================================================
//  SM CONSULTORES – utils.js
//  Único archivo 100% compartido entre "sin gráfico" y "con gráfico".
//  Usado por: vistaPrevia_Sin_Grafico.js / vistaPrevia_Grafico.js,
//  exportWord_Sin_Grafico.js / exportWord_Grafico.js (redefine sus propias
//  copias internas de fmtDate/fmtDateLong/val porque el Word arma el
//  documento con datos ya leídos del DOM al momento de exportar — ver nota
//  en exportWord*.js), script_Sin_Grafico.js / script_Grafico.js
// ============================================================
// ---------- Helpers de formato ----------
function fmtDate(iso){
  if(!iso) return '-';
  const [y,m,d] = iso.split('-');
  if(!y) return iso;
  return `${d}/${m}/${y}`;
}
function fmtDateLong(iso){
  if(!iso) return '-';
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const [y,m,d] = iso.split('-');
  if(!y) return iso;
  return `${parseInt(d)} de ${meses[parseInt(m)-1]} ${y}`;
}
function val(id){ return document.getElementById(id).value; }
function setText(id, text){ document.getElementById(id).textContent = text && text.trim() !== '' ? text : '-'; }
