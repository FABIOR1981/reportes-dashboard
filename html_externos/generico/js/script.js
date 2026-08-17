// Actualizar la vista previa
function updatePreview() {
  const titulo = document.getElementById('tituloInforme');
  const destinatario = document.getElementById('destinatario');
  const fecha = document.getElementById('fechaInforme');
  const resumen = document.getElementById('resumen');
  const desarrollo = document.getElementById('desarrollo');
  const conclusion = document.getElementById('conclusion');

  if (titulo) document.getElementById('prevTitulo').textContent = titulo.value || 'INFORME GENERAL';
  if (destinatario) document.getElementById('prevDestinatario').textContent = 'Para: ' + (destinatario.value || '-');
  if (fecha) document.getElementById('prevFecha').textContent = 'Fecha: ' + (fecha.value || '-');
  if (resumen) document.getElementById('prevResumen').textContent = resumen.value || '-';
  if (desarrollo) document.getElementById('prevDesarrollo').textContent = desarrollo.value || '-';
  if (conclusion) document.getElementById('prevConclusion').textContent = conclusion.value || '-';
}

// Contrato: window.downloadPDF
window.downloadPDF = async function() {
  const btn = document.querySelector('[data-action="pdf"]');
  const status = document.getElementById('status');
  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Generando PDF, por favor espera...';

  try {
    const { jsPDF } = window.jspdf;
    const element = document.getElementById('pdfPreview');
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    
    const nombreArchivo = (document.getElementById('tituloInforme').value || 'Informe_Generico') + '.pdf';
    pdf.save(nombreArchivo);

    if (status) status.textContent = '✔ PDF descargado con éxito.';
  } catch (e) {
    console.error(e);
    if (status) status.textContent = '⚠ Error al generar el PDF.';
  } finally {
    if (btn) btn.disabled = false;
    if (status) setTimeout(() => { status.textContent = ''; }, 4000);
  }
};

// Contrato: window.downloadWord
window.downloadWord = async function() {
  const btn = document.querySelector('[data-action="word"]');
  const status = document.getElementById('status');
  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Generando Word, por favor espera...';

  try {
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({ text: document.getElementById('tituloInforme').value || 'INFORME GENERAL', heading: docx.HeadingLevel.HEADING_1 }),
          new docx.Paragraph({ text: 'Para: ' + (document.getElementById('destinatario').value || '-') }),
          new docx.Paragraph({ text: 'Fecha: ' + (document.getElementById('fechaInforme').value || '-') }),
          new docx.Paragraph({ text: '' }),
          new docx.Paragraph({ text: '1. Resumen / Antecedentes', heading: docx.HeadingLevel.HEADING_2 }),
          new docx.Paragraph({ text: document.getElementById('resumen').value || '-' }),
          new docx.Paragraph({ text: '2. Desarrollo / Observaciones', heading: docx.HeadingLevel.HEADING_2 }),
          new docx.Paragraph({ text: document.getElementById('desarrollo').value || '-' }),
          new docx.Paragraph({ text: '3. Conclusión', heading: docx.HeadingLevel.HEADING_2 }),
          new docx.Paragraph({ text: document.getElementById('conclusion').value || '-' })
        ]
      }]
    });

    const blob = await docx.Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (document.getElementById('tituloInforme').value || 'Informe_Generico') + '.docx';
    link.click();

    if (status) status.textContent = '✔ Documento Word descargado con éxito.';
  } catch (e) {
    console.error(e);
    if (status) status.textContent = '⚠ Error al generar Word.';
  } finally {
    if (btn) btn.disabled = false;
    if (status) setTimeout(() => { status.textContent = ''; }, 4000);
  }
};

// Inicialización de event listeners y Botonera
function init() {
  const campos = ['tituloInforme', 'destinatario', 'fechaInforme', 'resumen', 'desarrollo', 'conclusion'];

  campos.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updatePreview);
      el.addEventListener('change', updatePreview);
    }
  });

  if (typeof Botonera !== 'undefined') {
    Botonera.init({
      camposGuardables: campos,
      camposOrtografia: [
        { id: 'tituloInforme', label: 'Título del informe' },
        { id: 'resumen', label: 'Resumen' },
        { id: 'desarrollo', label: 'Desarrollo / Observaciones' },
        { id: 'conclusion', label: 'Conclusión' }
      ],
      nombreArchivoBase: 'Informe_Generico',
      onResetExtra: function() {
        document.getElementById('fechaInforme').value = new Date().toISOString().slice(0, 10);
        updatePreview();
      },
      onLoadExtra: function() {
        updatePreview();
      }
    });
  }

  const fechaInput = document.getElementById('fechaInforme');
  if (fechaInput && !fechaInput.value) {
    fechaInput.value = new Date().toISOString().slice(0, 10);
  }

  updatePreview();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}