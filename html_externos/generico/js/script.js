// Actualizar la vista previa ocultando secciones vacías
function updatePreview() {
  const titulo = document.getElementById('tituloInforme').value.trim();
  const destinatario = document.getElementById('destinatario').value.trim();
  const fecha = document.getElementById('fechaInforme').value;
  
  const resumen = document.getElementById('resumen').value.trim();
  const desarrollo = document.getElementById('desarrollo').value.trim();
  const conclusion = document.getElementById('conclusion').value.trim();

  // Encabezado
  document.getElementById('prevTitulo').textContent = titulo || 'INFORME GENERAL';
  document.getElementById('prevDestinatario').textContent = destinatario ? 'Para: ' + destinatario : '';
  document.getElementById('prevFecha').textContent = fecha ? 'Fecha: ' + fecha : '';

  // Resumen
  const secResumen = document.getElementById('secResumen');
  if (resumen) {
    document.getElementById('prevResumen').textContent = resumen;
    secResumen.style.display = 'block';
  } else {
    secResumen.style.display = 'none';
  }

  // Desarrollo
  const secDesarrollo = document.getElementById('secDesarrollo');
  if (desarrollo) {
    document.getElementById('prevDesarrollo').textContent = desarrollo;
    secDesarrollo.style.display = 'block';
  } else {
    secDesarrollo.style.display = 'none';
  }

  // Conclusión
  const secConclusion = document.getElementById('secConclusion');
  if (conclusion) {
    document.getElementById('prevConclusion').textContent = conclusion;
    secConclusion.style.display = 'block';
  } else {
    secConclusion.style.display = 'none';
  }
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
    
    const nombreArchivo = (document.getElementById('tituloInforme').value.trim() || 'Informe_Generico') + '.pdf';
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
    const children = [
      new docx.Paragraph({ text: document.getElementById('tituloInforme').value.trim() || 'INFORME GENERAL', heading: docx.HeadingLevel.HEADING_1 })
    ];

    const destinatario = document.getElementById('destinatario').value.trim();
    if (destinatario) children.push(new docx.Paragraph({ text: 'Para: ' + destinatario }));

    const fecha = document.getElementById('fechaInforme').value;
    if (fecha) children.push(new docx.Paragraph({ text: 'Fecha: ' + fecha }));

    const resumen = document.getElementById('resumen').value.trim();
    if (resumen) {
      children.push(new docx.Paragraph({ text: '' }));
      children.push(new docx.Paragraph({ text: 'Resumen / Antecedentes', heading: docx.HeadingLevel.HEADING_2 }));
      children.push(new docx.Paragraph({ text: resumen }));
    }

    const desarrollo = document.getElementById('desarrollo').value.trim();
    if (desarrollo) {
      children.push(new docx.Paragraph({ text: '' }));
      children.push(new docx.Paragraph({ text: 'Desarrollo / Observaciones', heading: docx.HeadingLevel.HEADING_2 }));
      children.push(new docx.Paragraph({ text: desarrollo }));
    }

    const conclusion = document.getElementById('conclusion').value.trim();
    if (conclusion) {
      children.push(new docx.Paragraph({ text: '' }));
      children.push(new docx.Paragraph({ text: 'Conclusión', heading: docx.HeadingLevel.HEADING_2 }));
      children.push(new docx.Paragraph({ text: conclusion }));
    }

    const doc = new docx.Document({
      sections: [{ properties: {}, children }]
    });

    const blob = await docx.Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (document.getElementById('tituloInforme').value.trim() || 'Informe_Generico') + '.docx';
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