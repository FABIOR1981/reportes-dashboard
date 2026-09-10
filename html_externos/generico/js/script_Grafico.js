// ============================================================
//  INFORME GENÉRICO (con gráfico) – script.js
//  Orquestador: listeners del formulario + Botonera.init()
//  Contrato del proyecto: define window.downloadPDF y window.downloadWord
//  (definidas en exportPdf.js y exportWord.js, cargados antes que este archivo)
//  Depende de: utils.js, grafico.js, vistaPrevia.js, exportPdf.js, exportWord.js
// ============================================================

function init() {
  // Setear fecha ANTES de Botonera.init()
  const fechaInput = document.getElementById('fechaInforme');
  if (fechaInput && !fechaInput.value) {
    fechaInput.value = new Date().toISOString().slice(0, 10);
  }

  const campos = [
    'tituloInforme', 'destinatario', 'fechaInforme', 'resumen', 'desarrollo',
    'conclusion', 'clasifObservaciones', 'firmanteNombre', 'firmanteCargo', 'firmanteContacto',
    'chkResumen', 'chkDesarrollo', 'chkConclusion', 'chkClasificacion', 'chkFirma'
  ];

  campos.forEach(function(id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updatePreview);
      el.addEventListener('change', updatePreview);
    }
  });

  document.querySelectorAll('input[name="clasificacion"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      const clasifObsWrapper = document.getElementById('clasifObsWrapper');
      if (clasifObsWrapper) {
        clasifObsWrapper.style.display = (radio.value === 'Con observaciones' && radio.checked) ? 'block' : 'none';
      }
      updatePreview();
    });
  });

  const addAspectoBtn = document.getElementById('addAspectoBtn');
  if (addAspectoBtn) {
    addAspectoBtn.addEventListener('click', function() {
      addAspectoBlock();
      updatePreview();
    });
  }

  if (typeof Botonera !== 'undefined') {
    Botonera.init({
      camposGuardables: campos,
      camposOrtografia: [
        { id: 'tituloInforme', label: 'Título del informe' },
        { id: 'resumen', label: 'Resumen' },
        { id: 'desarrollo', label: 'Desarrollo / Observaciones' },
        { id: 'conclusion', label: 'Conclusión' },
        { id: 'clasifObservaciones', label: 'Observaciones de la clasificación' },
        { id: 'firmanteCargo', label: 'Cargo / Especialidad del firmante' }
      ],
      nombreArchivoBase: 'Informe_Generico_Grafico',
      onResetExtra: function() {
        document.getElementById('fechaInforme').value = new Date().toISOString().slice(0, 10);
        document.querySelector('input[name="clasificacion"][value=""]').checked = true;
        document.getElementById('aspectosContainer').innerHTML = '';
        const clasifObsWrapper = document.getElementById('clasifObsWrapper');
        if (clasifObsWrapper) clasifObsWrapper.style.display = 'none';

        // Resetear todos los checkboxes de visibilidad
        ['chkResumen', 'chkDesarrollo', 'chkConclusion', 'chkClasificacion', 'chkFirma'].forEach(function(id) {
          const el = document.getElementById(id);
          if (el) el.checked = true;
        });

        updatePreview();
      },
      onLoadExtra: function(data) {
        if (Array.isArray(data.aspectos)) {
          document.getElementById('aspectosContainer').innerHTML = '';
          data.aspectos.forEach(addAspectoBlock);
          window.__datosCargados__ = true;
        }
        // Restaurar estado de checkboxes si vienen en el JSON
        ['chkResumen', 'chkDesarrollo', 'chkConclusion', 'chkClasificacion', 'chkFirma'].forEach(function(id) {
          if (data[id] !== undefined) {
            const el = document.getElementById(id);
            if (el) el.checked = data[id];
          }
        });
        updatePreview();
      },
      onSaveExtra: function(data) {
        const bloques = document.querySelectorAll('#aspectosContainer .aspecto-block');
        data.aspectos = Array.from(bloques).map(function(block) {
          return {
            nombre: block.querySelector('.asp-nombre').value,
            puntaje: block.querySelector('.asp-puntaje').value,
            maximo: block.querySelector('.asp-maximo').value,
            descripcion: block.querySelector('.asp-desc').value
          };
        });
        // Guardar estado de checkboxes
        ['chkResumen', 'chkDesarrollo', 'chkConclusion', 'chkClasificacion', 'chkFirma'].forEach(function(id) {
          const el = document.getElementById(id);
          if (el) data[id] = el.checked;
        });
      }
    });
  }

  // Cargar aspectos por defecto SOLO si no se cargaron datos guardados
  if (!window.__datosCargados__) {
    defaultAspectos.forEach(addAspectoBlock);
  }

  updatePreview();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
