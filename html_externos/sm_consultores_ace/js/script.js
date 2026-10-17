function init() {
  defaultComps.forEach(addCompBlock);
  document.getElementById('addCompBtn').addEventListener('click', () => { addCompBlock(); updatePreview(); });
  initTipoGrafico();

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
      'nombre', 'cargoPostulacion', 'ci', 'contacto',
      'fechaEval', 'horaEval', 'solicitante', 'cargoEvaluado', 'objetivoTexto',
      'enfoqueTexto', 'fortalezasTexto', 'debilidadesTexto', 'perfilTexto', 'conclusionTexto'],
    camposNoLimpiar: ['logoNombre', 'logoLeyenda'],
    camposOrtografia: [
      { id: 'objetivoTexto', label: 'Objetivo' },
      { id: 'enfoqueTexto', label: 'Enfoque' },
      { id: 'fortalezasTexto', label: 'Fortalezas' },
      { id: 'debilidadesTexto', label: 'Debilidades' },
      { id: 'perfilTexto', label: 'Perfil' },
      { id: 'conclusionTexto', label: 'Conclusión' }
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
      aplicarTipoGraficoGuardado(data.tipoGrafico);
      updatePreview();
    },
    onSaveExtra: function (data) {
      data.tipoGrafico = tipoGraficoActual;
      data.competencias = Array.from(compContainer.querySelectorAll('.comp-block')).map(block => ({
        nombre: block.querySelector('.c-nombre').value,
        puntaje: block.querySelector('.c-puntaje').value,
        maximo: block.querySelector('.c-maximo').value
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