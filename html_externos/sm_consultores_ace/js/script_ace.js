const TOTAL_COMPETENCIAS = 13;
let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  generarInputsCompetencias();
  vincularEventos();
  inicializarBotonera();
  actualizarPreview();
});

function generarInputsCompetencias() {
  const container = document.getElementById('competencias-container');
  let html = '';
  for (let i = 1; i <= TOTAL_COMPETENCIAS; i++) {
    html += `
      <div class="comp-item">
        <input type="text" id="comp_nombre_${i}" placeholder="Competencia ${i}" value="Competencia ${i}" class="input-nombre">
        <div class="comp-scores">
          <label>Obt:</label>
          <input type="number" id="comp_obt_${i}" value="0" min="0" step="1">
          <label>Máx:</label>
          <input type="number" id="comp_max_${i}" value="10" min="1" step="1">
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function vincularEventos() {
  // Disparar redibujo y actualización de texto en cada tecleo
  const camposGenerales = ['nombreCandidato', 'cargoPostula', 'fortalezas', 'debilidades'];
  camposGenerales.forEach(id => {
    document.getElementById(id).addEventListener('input', actualizarPreview);
  });

  for (let i = 1; i <= TOTAL_COMPETENCIAS; i++) {
    document.getElementById(`comp_nombre_${i}`).addEventListener('input', actualizarPreview);
    document.getElementById(`comp_obt_${i}`).addEventListener('input', actualizarPreview);
    document.getElementById(`comp_max_${i}`).addEventListener('input', actualizarPreview);
  }
}

function actualizarPreview() {
  // Transponer datos de texto
  document.getElementById('prev_nombre').textContent = document.getElementById('nombreCandidato').value || '-';
  document.getElementById('prev_cargo').textContent = document.getElementById('cargoPostula').value || '-';
  document.getElementById('prev_fortalezas').textContent = document.getElementById('fortalezas').value || 'Sin registro.';
  document.getElementById('prev_debilidades').textContent = document.getElementById('debilidades').value || 'Sin registro.';

  dibujarGrafico();
}

function dibujarGrafico() {
  const labels = [];
  const dataObtenido = [];
  const dataMaximo = [];

  for (let i = 1; i <= TOTAL_COMPETENCIAS; i++) {
    labels.push(document.getElementById(`comp_nombre_${i}`).value || `Comp ${i}`);
    dataObtenido.push(Number(document.getElementById(`comp_obt_${i}`).value) || 0);
    dataMaximo.push(Number(document.getElementById(`comp_max_${i}`).value) || 0);
  }

  const ctx = document.getElementById('graficoCompetencias').getContext('2d');
  
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Gráfico de doble barra
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Resultado Obtenido',
          data: dataObtenido,
          backgroundColor: '#3f6b52', // Accent de tu CSS
          borderWidth: 1
        },
        {
          label: 'Máximo',
          data: dataMaximo,
          backgroundColor: '#a9c4b3', // Accent soft
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: false, // Fundamental en false para que html2canvas lo capture correctamente en A4
      animation: false,  // Desactivado para que en el export esté ya dibujado
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: { position: 'top' }
      }
    }
  });
}

function inicializarBotonera() {
  const camposGuardables = ['nombreCandidato', 'cargoPostula', 'fortalezas', 'debilidades'];
  for (let i = 1; i <= TOTAL_COMPETENCIAS; i++) {
    camposGuardables.push(`comp_nombre_${i}`, `comp_obt_${i}`, `comp_max_${i}`);
  }

  if (window.Botonera) {
    window.Botonera.init({
      camposGuardables: camposGuardables,
      camposNoLimpiar: [],
      camposOrtografia: [
        { id: 'fortalezas', label: 'Fortalezas' },
        { id: 'debilidades', label: 'Debilidades' }
      ],
      nombreArchivoBase: 'Informe_ACE',
      onResetExtra: function() {
        actualizarPreview();
      },
      onLoadExtra: function() {
        actualizarPreview();
      }
    });
  }
}

// Contrato de funciones requeridas para exportación
window.downloadPDF = function() {
  const btn = document.querySelector('[data-action="pdf"]');
  if(btn) btn.disabled = true;
  
  const statusEl = document.getElementById('status');
  if(statusEl) statusEl.textContent = 'Generando PDF, por favor espere...';

  const previewEl = document.getElementById('informe-preview');
  
  html2canvas(previewEl, { scale: 2, useCORS: true }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    
    // Configuración para el tamaño A4
    const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    const nombre = document.getElementById('nombreCandidato').value.trim() || 'Candidato';
    pdf.save(`Informe_ACE_${nombre.replace(/\s+/g, '_')}.pdf`);
    
    if(statusEl) statusEl.textContent = '✅ PDF descargado con éxito.';
    if(btn) btn.disabled = false;
  }).catch(err => {
    console.error(err);
    if(statusEl) statusEl.textContent = '❌ Error al generar PDF.';
    if(btn) btn.disabled = false;
  });
};

window.downloadWord = function() {
  alert("Este reporte utiliza un gráfico Canvas avanzado. Para mantener el esquema de doble barra visual con precisión, se requiere la exportación principal a formato PDF.");
};