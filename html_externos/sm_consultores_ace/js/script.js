function init() {
  defaultComps.forEach(addCompBlock);
  document.getElementById('addCompBtn').addEventListener('click', () => { addCompBlock(); updatePreview(); });

  document.querySelectorAll('#panel input, #panel textarea').forEach(el => {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  });

  const cabezalIds = ['consultoria', 'elaboradoPor', 'logoNombre', 'logoLeyenda'];
  document.getElementById('editCabezal').addEventListener('change', e => {
    cabezalIds.forEach(id => { document.getElementById(id).readOnly = !e.target.checked; });
  });

  Botonera.init({
    camposGuardables: ['fechaInforme', 'elaboradoPor', 'consultoria', 'logoNombre', 'logoLeyenda',
      'nombre', 'cargoPostulacion', 'fechaNac', 'edad', 'ci', 'contacto',
      'fechaEval', 'horaEval', 'solicitante', 'cargoEvaluado',
      'enfoqueTexto', 'conclusionTexto', 'oportunidadTexto'],
    camposNoLimpiar: ['logoNombre', 'logoLeyenda'],
    camposOrtografia: [
      { id: 'enfoqueTexto', label: 'Enfoque / Objetivo' },
      { id: 'conclusionTexto', label: 'Conclusión' },
      { id: 'oportunidadTexto', label: 'Oportunidad de mejora' }
    ],
    nombreArchivoBase: 'Informe_Psicotecnico_ACE',
    onResetExtra: function () {
      compContainer.innerHTML = '';
      updatePreview();
    },
    onLoadExtra: function (data) {
      if (Array.isArray(data.competencias)) {
        compContainer.innerHTML = '';
        data.competencias.forEach(addCompBlock);
      }
      updatePreview();
    },
    onSaveExtra: function (data) {
      data.competencias = Array.from(compContainer.querySelectorAll('.comp-block')).map(block => ({
        nombre: block.querySelector('.c-nombre').value,
        puntaje: block.querySelector('.c-puntaje').value,
        maximo: block.querySelector('.c-maximo').value,
        desc: block.querySelector('.c-desc').value
      }));
    }
  });

  updatePreview();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}