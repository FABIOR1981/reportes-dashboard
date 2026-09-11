// ============================================================
//  UDE – script.js
//  Orquestador: listeners del formulario + Botonera.init() + arranque
//  inicial
//  Contrato del proyecto: define window.downloadPDF y window.downloadWord
//  (definidas en exportPdf.js y exportWord.js, cargados antes que este
//  archivo)
//  Depende de: utils.js, vistaPrevia.js, exportPdf.js, exportWord.js
//
//  NOTA DE ARQUITECTURA: ver la nota completa en utils.js sobre la
//  pérdida del IIFE original al dividir en archivos. El código de
//  arranque (que antes corría "suelto" dentro del IIFE, apoyado en el
//  hoisting interno de ese único archivo) se movió acá — al archivo que
//  carga último — y se envolvió en init() + DOMContentLoaded, mismo
//  patrón ya usado en informe_generico y sm_consultores.
// ============================================================

function init() {
// ---------- Listeners robustos para CADA tipo de campo ----------
var camposTexto = ['ciudad','institucion','tituloInforme','prefijo','apellidos','nombres','cargo','ci','contacto','profNombre','profCel','profCargo'];
for (var i = 0; i < camposTexto.length; i++) {
  var el = document.getElementById(camposTexto[i]);
  if (el) {
    el.addEventListener('input', updatePreview);
    el.addEventListener('keyup', updatePreview);
  }
}

var camposFecha = ['fechaNacimiento'];
for (var i = 0; i < camposFecha.length; i++) {
  var el = document.getElementById(camposFecha[i]);
  if (el) {
    el.addEventListener('change', updatePreview);
    el.addEventListener('input', updatePreview);
  }
}

var camposTextarea = ['evaluacion', 'conclusion'];
for (var i = 0; i < camposTextarea.length; i++) {
  var el = document.getElementById(camposTextarea[i]);
  if (el) {
    el.addEventListener('input', updatePreview);
    el.addEventListener('keyup', updatePreview);
  }
}

var fechaEl = document.getElementById('fechaInforme');
if (fechaEl) {
  fechaEl.addEventListener('change', updatePreview);
  fechaEl.addEventListener('input', updatePreview);
}

var radios = document.querySelectorAll('input[name="recom"]');
for (var i = 0; i < radios.length; i++) {
  radios[i].addEventListener('change', updatePreview);
}

// ---------- Inicializar botonera compartida ----------
Botonera.init({
  camposGuardables: ['ciudad','fechaInforme','institucion','tituloInforme','prefijo',
    'apellidos','nombres','cargo','ci','fechaNacimiento','contacto',
    'evaluacion','conclusion','profNombre','profCel','profCargo'],
  camposOrtografia: [
    {id:'tituloInforme', label:'Título del informe'},
    {id:'cargo', label:'Cargo al que postula'},
    {id:'evaluacion', label:'Texto de evaluación'},
    {id:'conclusion', label:'Conclusión'},
    {id:'profCargo', label:'Especialidad / Cargo profesional'}
  ],
  nombreArchivoBase: 'informe',
  onResetExtra: function() {
    document.getElementById('prefijo').value = 'al';
    document.getElementById('fechaInforme').value = new Date().toISOString().slice(0,10);
    updatePreview();
  },
  onLoadExtra: function() {
    updatePreview();
  }
});

// ---------- Inicializar vista previa ----------
updatePreview();
}

if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', init);
} else {
init();
}
