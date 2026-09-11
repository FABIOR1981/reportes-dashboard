// ============================================================
//  SM CONSULTORES (sin gráfico) – script_Sin_Grafico.js
//  Orquestador: arranque inicial + listeners del formulario + Botonera.init()
//  Contrato del proyecto: define window.downloadPDF y window.downloadWord
//  (definidas en exportPdf_Sin_Grafico.js y exportWord_Sin_Grafico.js,
//  cargados antes que este archivo)
//  Depende de: utils.js, vistaPrevia_Sin_Grafico.js,
//  exportPdf_Sin_Grafico.js, exportWord_Sin_Grafico.js
//
//  NOTA DE ARQUITECTURA: el script.js original de este informe NO tenía
//  wrapper init()/DOMContentLoaded — todo el código de arranque corría
//  "suelto" al nivel superior del archivo, apoyado en que las funciones
//  declaradas más abajo en el mismo archivo (fmtDate, val, setText,
//  renderPreview) quedan disponibles por "hoisting" dentro de ESE archivo.
//  Al dividir en varios archivos, ese hoisting deja de alcanzar entre
//  archivos distintos, así que el código de arranque se movió acá (al
//  archivo que carga último) y se envolvió en init() + comprobación de
//  document.readyState, igual que ya usa informe_generico. El resultado es
//  el mismo: se ejecuta apenas el documento está listo, sin cambios de
//  comportamiento para quien usa el informe.
// ============================================================

function init() {
  // ---------- Carga inicial de competencias por defecto ----------
  defaultComps.forEach(addCompBlock);
  renderPreview();
  document.getElementById('addCompBtn').addEventListener('click', () => { addCompBlock(); renderPreview(); });

  // ---------- Listeners del formulario ----------
  document.querySelectorAll('#panel input, #panel textarea').forEach(el => {
    el.addEventListener('input', renderPreview);
    el.addEventListener('change', renderPreview);
  });
  document.querySelectorAll('input[name=clasif]').forEach(el => el.addEventListener('change', renderPreview));

  const cabezalFieldIds = ['consultoria', 'elaboradoPor', 'logoNombre', 'logoLeyenda'];
  document.getElementById('editCabezal').addEventListener('change', (e) => {
    const unlocked = e.target.checked;
    cabezalFieldIds.forEach(id => {
      document.getElementById(id).readOnly = !unlocked;
    });
  });

  // ---------- Inicializar botonera compartida ----------
  Botonera.init({
    camposGuardables: ['fechaInforme','elaboradoPor','consultoria','logoNombre','logoLeyenda',
      'nombre','cargoPostulacion','fechaNac','edad','ci','contacto',
      'fechaEval','horaEval','solicitante','cargoEvaluado',
      'enfoqueTexto','conclusionTexto','oportunidadTexto'],
    camposNoLimpiar: ['logoNombre','logoLeyenda'],
    camposOrtografia: [
      {id:'enfoqueTexto', label:'Enfoque / Objetivo'},
      {id:'conclusionTexto', label:'Conclusión'},
      {id:'oportunidadTexto', label:'Oportunidad de mejora'}
    ],
    nombreArchivoBase: 'Informe_Psicotecnico',
    onResetExtra: function() {
      document.getElementById('compContainer').innerHTML = '';
      renderPreview();
    },
    onLoadExtra: function(data) {
      // Si el JSON trae competencias guardadas (formato nuevo), reconstruir
      // los bloques desde cero. Si no las trae (JSON viejo), dejamos los
      // bloques actuales tal cual están en pantalla.
      if (Array.isArray(data.competencias)) {
        document.getElementById('compContainer').innerHTML = '';
        data.competencias.forEach(addCompBlock);
      }
      renderPreview();
    },
    onSaveExtra: function(data) {
      const bloques = document.querySelectorAll('#compContainer .comp-block');
      data.competencias = Array.from(bloques).map(function(block) {
        return {
          nombre: block.querySelector('.c-nombre').value,
          puntaje: block.querySelector('.c-puntaje').value,
          maximo: block.querySelector('.c-maximo').value,
          desc: block.querySelector('.c-desc').value
        };
      });
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
