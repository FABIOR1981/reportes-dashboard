// ============================================================
//  UDE – utils.js
//  Utilidades genéricas sin estado.
//  Usado por: vistaPrevia.js, exportWord.js, script.js
//
//  NOTA DE ARQUITECTURA: el script_psicolaboral.js original envolvía TODO
//  el archivo en un IIFE `(function(){ ... })();` para aislar su scope
//  del resto de la página. Al dividir en varios archivos con <script>
//  planos (sin bundler ni ES6 modules), ese aislamiento se pierde: estas
//  funciones pasan a vivir en el scope global compartido entre archivos,
//  igual que ya sucede en generico y sm_consultores. Es un cambio de
//  arquitectura real, consciente y aceptado (ver conversación del
//  11-09-2026) para unificar el patrón de división de JS en los 3 informes.
// ============================================================
const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function fmtFecha(iso){
  if(!iso) return '';
  var p = iso.split('-');
  return parseInt(p[2],10) + ' de ' + meses[parseInt(p[1],10)-1] + ' de ' + p[0];
}

function calcularEdad(fechaNacIso, fechaRefIso){
  if(!fechaNacIso) return '';
  var nac = fechaNacIso.split('-').map(Number);
  var refIso = fechaRefIso || new Date().toISOString().slice(0,10);
  var ref = refIso.split('-').map(Number);
  var edad = ref[0] - nac[0];
  if(ref[1] < nac[1] || (ref[1] === nac[1] && ref[2] < nac[2])) edad--;
  return edad >= 0 ? edad : '';
}
