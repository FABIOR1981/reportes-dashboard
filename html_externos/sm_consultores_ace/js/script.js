function init() {
  // 1. Configurar la Botonera Compartida
  Botonera.init({
    camposGuardables: ['nombre', 'puesto', 'observaciones'], // IDs exactos del DOM
    camposNoLimpiar: [],
    camposOrtografia: [
      { id: 'observaciones', label: 'Observaciones / Resumen' }
    ],
    nombreArchivoBase: 'ACE',
    onResetExtra: function() {
      updatePreview();
    },
    onLoadExtra: function(data) {
      updatePreview();
    }
  });

  // 2. Habilitar la descarga PDF nativa una vez que el DOM está cargado
  const pdfBtn = document.querySelector('[data-action="pdf"]');
  if (pdfBtn) {
    pdfBtn.disabled = false;
    const tooltip = pdfBtn.querySelector('.tooltip');
    if (tooltip) tooltip.textContent = 'Descargar PDF';
  }

  // 3. Vincular los eventos de escritura al sistema de Vista Previa (tiempo real)
  const inputs = document.querySelectorAll('.form-panel input, .form-panel textarea');
  inputs.forEach(input => {
    input.addEventListener('input', updatePreview);
  });

  // Disparo inicial
  updatePreview();
}

// Arrancar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);