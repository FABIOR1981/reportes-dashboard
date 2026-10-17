function init() {
  // Fecha del informe: hoy, si el usuario no la cargó
  const fechaInf = document.getElementById('fechaInforme');
  if (!fechaInf.value) {
    const h = new Date();
    fechaInf.value = `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
  }
  defaultComps.forEach(addCompBlock);
  document.getElementById('addCompBtn').addEventListener('click', () => { addCompBlock(); updatePreview(); });
  initTipoGrafico();

  // Antes del listener genérico: un click del usuario fija la clasificación a mano
  document.querySelectorAll('input[name=clasif]').forEach(r => r.addEventListener('click', () => { clasifManual = true; }));

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
      'enfoqueTexto', 'fortalezasTexto', 'debilidadesTexto', 'pieGraficoTexto', 'conclusionTexto'],
    camposNoLimpiar: ['logoNombre', 'logoLeyenda'],
    camposOrtografia: [
      { id: 'objetivoTexto', label: 'Objetivo' },
      { id: 'enfoqueTexto', label: 'Enfoque' },
      { id: 'fortalezasTexto', label: 'Fortalezas' },
      { id: 'debilidadesTexto', label: 'Debilidades' },
      { id: 'pieGraficoTexto', label: 'Pie de gráfico' },
      { id: 'conclusionTexto', label: 'Conclusión' }
    ],
    nombreArchivoBase: 'Informe_Psicotecnico_ACE',
    onResetExtra: function () {
      clasifManual = false;
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