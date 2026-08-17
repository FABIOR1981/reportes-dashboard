// Sanitizar nombres de archivo
function sanitizeFilename(str) {
  return str
    .replace(/[\/\\:?*"<>|]/g, '_') // Reemplazar caracteres inválidos
    .replace(/\s+/g, '_')           // Reemplazar espacios
    .substring(0, 100)              // Limitar longitud
    .replace(/_+/g, '_')            // Limpiar múltiples guiones
    .replace(/^_+|_+$/g, '');       // Quitar guiones de inicio/final
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Validar que hay contenido para descargar
function hasContent() {
  const titulo = document.getElementById('tituloInforme').value.trim();
  const resumen = document.getElementById('resumen').value.trim();
  const desarrollo = document.getElementById('desarrollo').value.trim();
  const conclusion = document.getElementById('conclusion').value.trim();
  const clasificacion = document.querySelector('input[name="clasificacion"]:checked').value;
  const aspectosContainer = document.getElementById('aspectosContainer');
  const tieneAspectos = aspectosContainer && aspectosContainer.querySelectorAll('.aspecto-block').length > 0;
  return titulo || resumen || desarrollo || conclusion || clasificacion || tieneAspectos;
}

// Agregar bloque de aspecto dinámico
function addAspectoBlock(data) {
  data = data || { nombre: '', descripcion: '' };
  const container = document.getElementById('aspectosContainer');
  
  const div = document.createElement('div');
  div.className = 'aspecto-block';
  div.innerHTML = `
    <button type="button" class="del-btn">✕ Eliminar</button>
    <div class="form-group">
      <label>Aspecto</label>
      <input type="text" class="asp-nombre" value="${data.nombre || ''}" placeholder="Ej: Comunicación, Liderazgo, etc.">
    </div>
    <div class="form-group">
      <label>Descripción</label>
      <textarea class="asp-desc" rows="3" placeholder="Descripción de la evaluación...">${data.descripcion || ''}</textarea>
    </div>
  `;
  
  // Event listener para botón eliminar
  div.querySelector('.del-btn').addEventListener('click', () => {
    div.remove();
    updatePreview();
  });
  
  // Event listeners para actualizar preview
  div.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  });
  
  container.appendChild(div);
}

// Actualizar la vista previa ocultando secciones vacías (versión sin debounce)
function updatePreviewFn() {
  const titulo = document.getElementById('tituloInforme').value.trim();
  const destinatario = document.getElementById('destinatario').value.trim();
  const fecha = document.getElementById('fechaInforme').value;
  
  const resumen = document.getElementById('resumen').value.trim();
  const desarrollo = document.getElementById('desarrollo').value.trim();
  const conclusion = document.getElementById('conclusion').value.trim();
  const clasificacion = document.querySelector('input[name="clasificacion"]:checked').value;

  // Encabezado
  document.getElementById('prevTitulo').textContent = titulo || 'INFORME GENERAL';
  document.getElementById('prevDestinatario').textContent = destinatario ? 'Para: ' + destinatario : '';
  document.getElementById('prevFecha').textContent = fecha ? 'Fecha: ' + fecha : '';

  // Resumen
  const secResumen = document.getElementById('secResumen');
  const chkResumen = document.getElementById('chkResumen').checked;
  if (resumen && chkResumen) {
    document.getElementById('prevResumen').textContent = resumen;
    secResumen.style.display = 'block';
  } else {
    secResumen.style.display = 'none';
  }

  // Desarrollo
  const secDesarrollo = document.getElementById('secDesarrollo');
  const chkDesarrollo = document.getElementById('chkDesarrollo').checked;
  if (desarrollo && chkDesarrollo) {
    document.getElementById('prevDesarrollo').textContent = desarrollo;
    secDesarrollo.style.display = 'block';
  } else {
    secDesarrollo.style.display = 'none';
  }

  // Conclusión
  const secConclusion = document.getElementById('secConclusion');
  const chkConclusion = document.getElementById('chkConclusion').checked;
  if (conclusion && chkConclusion) {
    document.getElementById('prevConclusion').textContent = conclusion;
    secConclusion.style.display = 'block';
  } else {
    secConclusion.style.display = 'none';
  }
  
  // Clasificación
  const secClasificacion = document.getElementById('secClasificacion');
  const chkClasificacion = document.getElementById('chkClasificacion').checked;
  if (clasificacion && chkClasificacion) {
    document.getElementById('prevClasificacion').textContent = clasificacion;
    secClasificacion.style.display = 'block';
  } else {
    secClasificacion.style.display = 'none';
  }
  
  // Aspectos dinámicos
  const secAspectos = document.getElementById('secAspectos');
  const aspectosContainer = document.getElementById('aspectosContainer');
  const aspectosOutContainer = document.getElementById('aspectosOutContainer');
  
  const aspectosBlocks = aspectosContainer.querySelectorAll('.aspecto-block');
  if (aspectosBlocks.length > 0) {
    aspectosOutContainer.innerHTML = '';
    aspectosBlocks.forEach(block => {
      const nombre = block.querySelector('.asp-nombre').value.trim();
      const desc = block.querySelector('.asp-desc').value.trim();
      
      if (nombre || desc) {
        const item = document.createElement('div');
        item.className = 'aspecto-item';
        item.innerHTML = `
          <div class="aspecto-name">${nombre || '(sin nombre)'}</div>
          ${desc ? '<div class="aspecto-desc">' + desc + '</div>' : ''}
        `;
        aspectosOutContainer.appendChild(item);
      }
    });
    secAspectos.style.display = aspectosOutContainer.children.length > 0 ? 'block' : 'none';
  } else {
    secAspectos.style.display = 'none';
  }
}

// Versión con debounce para eventos
const updatePreview = debounce(updatePreviewFn, 300);

// Contrato: window.downloadPDF
window.downloadPDF = async function() {
  const btn = document.querySelector('[data-action="pdf"]');
  const status = document.getElementById('status');
  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Generando PDF, por favor espera...';

  try {
    // Validar contenido
    if (!hasContent()) {
      if (status) status.textContent = '⚠ El documento está vacío. Agregá contenido antes de descargar.';
      if (btn) btn.disabled = false;
      return;
    }

    // Validar librerías disponibles
    if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
      if (status) status.textContent = '⚠ Las librerías necesarias aún se están cargando. Intentá de nuevo en unos segundos.';
      if (btn) btn.disabled = false;
      return;
    }

    const { jsPDF } = window.jspdf;
    const element = document.getElementById('pdfPreview');
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    
    const nombreArchivo = sanitizeFilename(document.getElementById('tituloInforme').value.trim() || 'Informe_Generico') + '.pdf';
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
    // Validar contenido
    if (!hasContent()) {
      if (status) status.textContent = '⚠ El documento está vacío. Agregá contenido antes de descargar.';
      if (btn) btn.disabled = false;
      return;
    }

    // Validar librerías disponibles
    if (typeof docx === 'undefined') {
      if (status) status.textContent = '⚠ Las librerías necesarias aún se están cargando. Intentá de nuevo en unos segundos.';
      if (btn) btn.disabled = false;
      return;
    }

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

    const clasificacion = document.querySelector('input[name="clasificacion"]:checked').value;
    if (clasificacion) {
      children.push(new docx.Paragraph({ text: '' }));
      children.push(new docx.Paragraph({ text: 'Clasificación', heading: docx.HeadingLevel.HEADING_2 }));
      children.push(new docx.Paragraph({ text: clasificacion }));
    }
    // Aspectos dinámicos
    const aspectosContainer = document.getElementById('aspectosContainer');
    const aspectosBlocks = aspectosContainer.querySelectorAll('.aspecto-block');
    if (aspectosBlocks.length > 0) {
      let tieneAspecto = false;
      aspectosBlocks.forEach(block => {
        const nombre = block.querySelector('.asp-nombre').value.trim();
        const desc = block.querySelector('.asp-desc').value.trim();
        if (nombre || desc) {
          tieneAspecto = true;
        }
      });
      
      if (tieneAspecto) {
        children.push(new docx.Paragraph({ text: '' }));
        children.push(new docx.Paragraph({ text: 'Aspectos Evaluados', heading: docx.HeadingLevel.HEADING_2 }));
        
        aspectosBlocks.forEach(block => {
          const nombre = block.querySelector('.asp-nombre').value.trim();
          const desc = block.querySelector('.asp-desc').value.trim();
          if (nombre || desc) {
            if (nombre) {
              children.push(new docx.Paragraph({ text: nombre, style: 'Heading 3' }));
            }
            if (desc) {
              children.push(new docx.Paragraph({ text: desc }));
            }
          }
        });
      }
    }
    const doc = new docx.Document({
      sections: [{ properties: {}, children }]
    });

    const blob = await docx.Packer.toBlob(doc);
    const link = document.createElement('a');
    const blobUrl = URL.createObjectURL(blob);
    link.href = blobUrl;
    link.download = sanitizeFilename(document.getElementById('tituloInforme').value.trim() || 'Informe_Generico') + '.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Liberar memoria después de descargar
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

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

  // Event listeners para radios de clasificación
  document.querySelectorAll('input[name="clasificacion"]').forEach(radio => {
    radio.addEventListener('change', updatePreview);
  });
  
  // Event listeners para checkboxes de secciones
  const checkboxes = ['chkResumen', 'chkDesarrollo', 'chkConclusion', 'chkClasificacion'];
  checkboxes.forEach(id => {
    const chk = document.getElementById(id);
    if (chk) {
      chk.addEventListener('change', updatePreview);
    }
  });
  
  // Event listener para agregar aspectos
  const addAspectoBtn = document.getElementById('addAspectoBtn');
  if (addAspectoBtn) {
    addAspectoBtn.addEventListener('click', () => {
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
        { id: 'conclusion', label: 'Conclusión' }
      ],
      nombreArchivoBase: 'Informe_Generico',
      onResetExtra: function() {
        document.getElementById('fechaInforme').value = new Date().toISOString().slice(0, 10);
        document.querySelector('input[name="clasificacion"][value=""]').checked = true;        document.getElementById('aspectosContainer').innerHTML = '';        updatePreview();
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