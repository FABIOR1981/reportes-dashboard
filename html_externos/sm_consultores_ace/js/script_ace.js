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
          backgroundColor: '#3f6b52', 
          borderWidth: 1
        },
        {
          label: 'Máximo',
          data: dataMaximo,
          backgroundColor: '#a9c4b3',
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

// =======================================================
// CONTRATO: EXPORTACIÓN A PDF Y WORD
// =======================================================

window.downloadPDF = async function() {
  const btn = document.querySelector('[data-action="pdf"]');
  const status = document.getElementById('status');
  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Generando PDF, por favor espera...';

  try {
    const previewEl = document.getElementById('informe-preview');
    const canvas = await html2canvas(previewEl, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    
    const nombre = document.getElementById('nombreCandidato').value.trim() || 'Candidato';
    pdf.save(`Informe_ACE_${nombre.replace(/\s+/g, '_')}.pdf`);
    
    if (status) status.textContent = '✔ PDF descargado con éxito.';
  } catch (e) {
    console.error(e);
    if (status) status.textContent = '⚠ Error al generar el PDF.';
  } finally {
    if (btn) btn.disabled = false;
    if (status) setTimeout(() => { status.textContent = ''; }, 4000);
  }
};

window.downloadWord = async function() {
  const btn = document.querySelector('[data-action="word"]');
  const status = document.getElementById('status');
  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Generando Word, por favor espera...';

  try {
    const nombre = document.getElementById('nombreCandidato').value.trim() || '-';
    const cargo = document.getElementById('cargoPostula').value.trim() || '-';
    const fortalezas = document.getElementById('fortalezas').value.trim() || 'Sin registro.';
    const debilidades = document.getElementById('debilidades').value.trim() || 'Sin registro.';

    // 1. Capturar el Canvas de Chart.js como imagen Base64
    const canvasGrafico = document.getElementById('graficoCompetencias');
    const imgDataCompleta = canvasGrafico.toDataURL("image/png");
    const imgDataB64 = imgDataCompleta.split(',')[1]; 

    // 2. Construir la estructura del documento Word
    const children = [
      new docx.Paragraph({ 
        text: "SM Consultores", 
        heading: docx.HeadingLevel.HEADING_1,
        alignment: docx.AlignmentType.CENTER
      }),
      new docx.Paragraph({ 
        text: "Evaluación de Competencias Ejecutivas (A.C.E.)", 
        heading: docx.HeadingLevel.HEADING_2,
        alignment: docx.AlignmentType.CENTER
      }),
      new docx.Paragraph({ text: "" }), 
      new docx.Paragraph({
        children: [
          new docx.TextRun({ text: "Candidato: ", bold: true }),
          new docx.TextRun({ text: nombre })
        ]
      }),
      new docx.Paragraph({
        children: [
          new docx.TextRun({ text: "Cargo: ", bold: true }),
          new docx.TextRun({ text: cargo })
        ]
      }),
      new docx.Paragraph({ text: "" }), 
      new docx.Paragraph({ text: "Fortalezas", heading: docx.HeadingLevel.HEADING_3 }),
      new docx.Paragraph({ text: fortalezas }),
      new docx.Paragraph({ text: "" }),
      new docx.Paragraph({ text: "Debilidades / Áreas de Mejora", heading: docx.HeadingLevel.HEADING_3 }),
      new docx.Paragraph({ text: debilidades }),
      new docx.Paragraph({ text: "" }),
      new docx.Paragraph({ text: "Perfil de Competencias", heading: docx.HeadingLevel.HEADING_3 }),
      new docx.Paragraph({ text: "" }),
      
      // 3. Inyectar la imagen del gráfico nativamente en el Word
      new docx.Paragraph({
        alignment: docx.AlignmentType.CENTER,
        children: [
          new docx.ImageRun({
            data: Uint8Array.from(atob(imgDataB64), c => c.charCodeAt(0)),
            transformation: {
              width: 550, 
              height: 300
            }
          })
        ]
      })
    ];

    const doc = new docx.Document({
      sections: [{ properties: {}, children: children }]
    });

    const blob = await docx.Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Informe_ACE_${nombre.replace(/\s+/g, '_')}.docx`;
    link.click();

    if (status) status.textContent = '✔ Documento Word descargado con éxito.';
  } catch (e) {
    console.error(e);
    if (status) status.textContent = '⚠ Error al generar el Word.';
  } finally {
    if (btn) btn.disabled = false;
    if (status) setTimeout(() => { status.textContent = ''; }, 4000);
  }
};