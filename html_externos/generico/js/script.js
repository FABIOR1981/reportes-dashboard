// ============================================================
//  INFORME GENÉRICO – lógica propia del informe
//  Contrato: define window.downloadPDF, window.downloadWord
//  y llama a Botonera.init() al final
// ============================================================

// Escapar HTML para prevenir XSS
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Sanitizar nombres de archivo
function sanitizeFilename(str) {
  return str
    .replace(/[\/\\:?*"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 100)
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
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
  const clasifEl = document.querySelector('input[name="clasificacion"]:checked');
  const clasificacion = clasifEl ? clasifEl.value : '';
  const aspectosContainer = document.getElementById('aspectosContainer');
  const bloques = aspectosContainer ? aspectosContainer.querySelectorAll('.aspecto-block') : [];
  let tieneAspectosConContenido = false;
  bloques.forEach(block => {
    const nombre = block.querySelector('.asp-nombre')?.value.trim();
    const desc = block.querySelector('.asp-desc')?.value.trim();
    if (nombre || desc) tieneAspectosConContenido = true;
  });
  return titulo || resumen || desarrollo || conclusion || clasificacion || tieneAspectosConContenido;
}

// Datos de ejemplo para los aspectos evaluados
const defaultAspectos = [
  { nombre: 'Organización', puntaje: 4, maximo: 5, descripcion: 'Se observa un manejo ordenado de las tareas asignadas, con buena planificación de los tiempos.' },
  { nombre: 'Comunicación', puntaje: 3, maximo: 5, descripcion: 'La comunicación con el equipo es adecuada, aunque podría reforzarse en instancias de mayor exigencia.' },
  { nombre: 'Cumplimiento de plazos', puntaje: 4, maximo: 5, descripcion: 'Las tareas se completan dentro de los plazos establecidos en la mayoría de los casos relevados.' }
];

// Agregar bloque de aspecto dinámico
function addAspectoBlock(data) {
  data = data || { nombre: '', puntaje: 3, maximo: 5, descripcion: '' };
  const container = document.getElementById('aspectosContainer');

  const div = document.createElement('div');
  div.className = 'aspecto-block';
  div.innerHTML = `
    <button type="button" class="del-btn">✕ Eliminar</button>
    <div class="form-group">
      <label>Aspecto</label>
      <input type="text" class="asp-nombre" value="${escapeHTML(data.nombre || '')}" placeholder="Ej: Comunicación, Liderazgo, etc.">
    </div>
    <div class="row2">
      <div class="form-group">
        <label>Puntaje obtenido</label>
        <input type="number" class="asp-puntaje" min="0" max="10" value="${data.puntaje ?? 3}">
      </div>
      <div class="form-group">
        <label>Puntaje máximo</label>
        <input type="number" class="asp-maximo" min="1" max="10" value="${data.maximo ?? 5}">
      </div>
    </div>
    <div class="form-group">
      <label>Descripción</label>
      <textarea class="asp-desc" rows="3" placeholder="Descripción de la evaluación...">${escapeHTML(data.descripcion || '')}</textarea>
    </div>
  `;

  div.querySelector('.del-btn').addEventListener('click', () => {
    div.remove();
    updatePreview();
  });

  // Delegación de eventos para inputs y textareas
  div.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  });

  container.appendChild(div);
}

// Actualizar la vista previa
function updatePreviewFn() {
  const titulo = document.getElementById('tituloInforme').value.trim();
  const destinatario = document.getElementById('destinatario').value.trim();
  const fecha = document.getElementById('fechaInforme').value;

  const resumen = document.getElementById('resumen').value.trim();
  const desarrollo = document.getElementById('desarrollo').value.trim();
  const conclusion = document.getElementById('conclusion').value.trim();
  const clasifEl = document.querySelector('input[name="clasificacion"]:checked');
  const clasificacion = clasifEl ? clasifEl.value : '';

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
  const clasifObsWrapper = document.getElementById('clasifObsWrapper');
  const clasifObservaciones = document.getElementById('clasifObservaciones').value.trim();
  const esConObservaciones = clasificacion === 'Con observaciones';

  if (clasifObsWrapper) {
    clasifObsWrapper.style.display = esConObservaciones ? 'block' : 'none';
  }

  if (clasificacion && chkClasificacion) {
    document.getElementById('prevClasificacion').textContent = clasificacion;
    document.getElementById('prevClasifObservaciones').textContent =
      (esConObservaciones && clasifObservaciones) ? clasifObservaciones : '';
    secClasificacion.style.display = 'block';
  } else {
    document.getElementById('prevClasifObservaciones').textContent = '';
    secClasificacion.style.display = 'none';
  }

  // Firma del firmante
  const secFirma = document.getElementById('secFirma');
  const chkFirma = document.getElementById('chkFirma').checked;
  const firmanteNombre = document.getElementById('firmanteNombre').value.trim();
  const firmanteCargo = document.getElementById('firmanteCargo').value.trim();
  const firmanteContacto = document.getElementById('firmanteContacto').value.trim();

  if (chkFirma && (firmanteNombre || firmanteCargo || firmanteContacto)) {
    document.getElementById('prevFirmanteNombre').textContent = firmanteNombre;
    document.getElementById('prevFirmanteCargo').textContent = firmanteCargo;
    document.getElementById('prevFirmanteContacto').textContent = firmanteContacto;
    secFirma.style.display = 'block';
  } else {
    secFirma.style.display = 'none';
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
      const puntaje = block.querySelector('.asp-puntaje').value.trim();
      const maximo = block.querySelector('.asp-maximo').value.trim();
      const desc = block.querySelector('.asp-desc').value.trim();

      const puntajeNum = parseFloat(puntaje) || 0;
      const maximoNum = parseFloat(maximo) || 0;
      const mostrarPuntajes = puntajeNum !== 0 || maximoNum !== 0;

      if (nombre || desc) {
        const item = document.createElement('div');
        item.className = 'aspecto-item';
        item.innerHTML = `
          <div class="aspecto-name">${escapeHTML(nombre) || '(sin nombre)'}</div>
          ${mostrarPuntajes ? '<div class="aspecto-scores"><b>Puntaje obtenido:</b> ' + escapeHTML(puntaje || '-') + ' &nbsp; <b>Puntaje máximo:</b> ' + escapeHTML(maximo || '-') + '</div>' : ''}
          ${desc ? '<div class="aspecto-desc">' + escapeHTML(desc) + '</div>' : ''}
        `;
        aspectosOutContainer.appendChild(item);
      }
    });
    secAspectos.style.display = aspectosOutContainer.children.length > 0 ? 'block' : 'none';
  } else {
    secAspectos.style.display = 'none';
  }
}

const updatePreview = debounce(updatePreviewFn, 300);

async function waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (e) { /* noop */ }
  }
}

// Contrato: window.downloadPDF
window.downloadPDF = async function() {
  const btn = document.querySelector('[data-action="pdf"]');
  const status = document.getElementById('status');
  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Generando PDF, por favor espera...';

  try {
    if (!hasContent()) {
      if (status) status.textContent = '⚠ El documento está vacío. Agregá contenido antes de descargar.';
      return;
    }

    if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
      if (status) status.textContent = '⚠ Las librerías necesarias aún se están cargando. Intentá de nuevo en unos segundos.';
      return;
    }

    await waitForFonts();

    const { jsPDF } = window.jspdf;
    const element = document.getElementById('pdfPreview');

    // El mismo contenedor que se usa para capturar el PDF tiene, en
    // pantallas angostas, un recorte visual (max-height + overflow) para
    // que se pueda hacer scroll cómodo en el formulario (ver CSS
    // responsive de .page-a4). Si generamos el PDF con la ventana
    // angosta, ese recorte también afecta la captura y el informe queda
    // incompleto. Lo neutralizamos solo durante la captura y lo
    // restauramos enseguida, sin que el usuario note el cambio.
    const prevMaxHeight = element.style.maxHeight;
    const prevOverflow = element.style.overflow;
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';

    let canvas;
    try {
      canvas = await html2canvas(element, { scale: 2, useCORS: true });
    } finally {
      element.style.maxHeight = prevMaxHeight;
      element.style.overflow = prevOverflow;
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Margen de tolerancia para no generar una página extra en blanco
    // por una diferencia de menos de 1mm (redondeo de la conversión
    // px -> mm), que en la práctica es invisible para el usuario.
    const EPSILON_MM = 1;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > EPSILON_MM) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const nombreArchivo = sanitizeFilename(document.getElementById('tituloInforme').value.trim() || 'Informe_Generico') + '.pdf';
    pdf.save(nombreArchivo);

    if (status) status.textContent = '✔ PDF descargado con éxito.';
  } catch (e) {
    console.error(e);
    if (status) status.textContent = '⚠ Error al generar el PDF. Revisá la consola.';
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
    if (!hasContent()) {
      if (status) status.textContent = '⚠ El documento está vacío. Agregá contenido antes de descargar.';
      return;
    }

    if (typeof docx === 'undefined') {
      if (status) status.textContent = '⚠ Las librerías necesarias aún se están cargando. Intentá de nuevo en unos segundos.';
      return;
    }

    // Verificar que HeadingLevel existe, si no usar alternativa
    const H1 = docx.HeadingLevel ? docx.HeadingLevel.HEADING_1 : undefined;
    const H2 = docx.HeadingLevel ? docx.HeadingLevel.HEADING_2 : undefined;
    const H3 = docx.HeadingLevel ? docx.HeadingLevel.HEADING_3 : undefined;
    const center = docx.AlignmentType ? docx.AlignmentType.CENTER : undefined;

    const children = [];

    // Título
    if (H1) {
      children.push(new docx.Paragraph({ text: document.getElementById('tituloInforme').value.trim() || 'INFORME GENERAL', heading: H1 }));
    } else {
      children.push(new docx.Paragraph({
        children: [new docx.TextRun({ text: document.getElementById('tituloInforme').value.trim() || 'INFORME GENERAL', bold: true, size: 32 })],
        spacing: { after: 200 }
      }));
    }

    const destinatario = document.getElementById('destinatario').value.trim();
    if (destinatario) children.push(new docx.Paragraph({ text: 'Para: ' + destinatario }));

    const fecha = document.getElementById('fechaInforme').value;
    if (fecha) children.push(new docx.Paragraph({ text: 'Fecha: ' + fecha }));

    const resumen = document.getElementById('resumen').value.trim();
    if (resumen) {
      children.push(new docx.Paragraph({ text: '' }));
      if (H2) {
        children.push(new docx.Paragraph({ text: 'Resumen / Antecedentes', heading: H2 }));
      } else {
        children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: 'Resumen / Antecedentes', bold: true, size: 26 })] }));
      }
      children.push(new docx.Paragraph({ text: resumen }));
    }

    const desarrollo = document.getElementById('desarrollo').value.trim();
    if (desarrollo) {
      children.push(new docx.Paragraph({ text: '' }));
      if (H2) {
        children.push(new docx.Paragraph({ text: 'Desarrollo / Observaciones', heading: H2 }));
      } else {
        children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: 'Desarrollo / Observaciones', bold: true, size: 26 })] }));
      }
      children.push(new docx.Paragraph({ text: desarrollo }));
    }

    const aspectosContainer = document.getElementById('aspectosContainer');
    const aspectosBlocks = aspectosContainer.querySelectorAll('.aspecto-block');
    if (aspectosBlocks.length > 0) {
      let tieneAspecto = false;
      aspectosBlocks.forEach(block => {
        const nombre = block.querySelector('.asp-nombre').value.trim();
        const desc = block.querySelector('.asp-desc').value.trim();
        if (nombre || desc) tieneAspecto = true;
      });

      if (tieneAspecto) {
        children.push(new docx.Paragraph({ text: '' }));
        if (H2) {
          children.push(new docx.Paragraph({ text: 'Aspectos Evaluados', heading: H2 }));
        } else {
          children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: 'Aspectos Evaluados', bold: true, size: 26 })] }));
        }

        aspectosBlocks.forEach(block => {
          const nombre = block.querySelector('.asp-nombre').value.trim();
          const puntaje = block.querySelector('.asp-puntaje').value.trim();
          const maximo = block.querySelector('.asp-maximo').value.trim();
          const desc = block.querySelector('.asp-desc').value.trim();
          const puntajeNum = parseFloat(puntaje) || 0;
          const maximoNum = parseFloat(maximo) || 0;
          const mostrarPuntajes = puntajeNum !== 0 || maximoNum !== 0;
          if (nombre || desc) {
            if (nombre) {
              if (H3) {
                children.push(new docx.Paragraph({ text: nombre, heading: H3 }));
              } else {
                children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: nombre, bold: true, size: 24 })] }));
              }
            }
            if (mostrarPuntajes) {
              children.push(new docx.Paragraph({
                children: [
                  new docx.TextRun({ text: 'Puntaje obtenido: ' + (puntaje || '-') + '   Puntaje máximo: ' + (maximo || '-'), bold: true })
                ]
              }));
            }
            if (desc) children.push(new docx.Paragraph({ text: desc }));
          }
        });
      }
    }

    const conclusion = document.getElementById('conclusion').value.trim();
    if (conclusion) {
      children.push(new docx.Paragraph({ text: '' }));
      if (H2) {
        children.push(new docx.Paragraph({ text: 'Conclusión', heading: H2 }));
      } else {
        children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: 'Conclusión', bold: true, size: 26 })] }));
      }
      children.push(new docx.Paragraph({ text: conclusion }));
    }

    const clasifElWord = document.querySelector('input[name="clasificacion"]:checked');
    const clasificacion = clasifElWord ? clasifElWord.value : '';
    if (clasificacion) {
      children.push(new docx.Paragraph({ text: '' }));
      if (H2) {
        children.push(new docx.Paragraph({ text: 'Clasificación', heading: H2 }));
      } else {
        children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: 'Clasificación', bold: true, size: 26 })] }));
      }
      children.push(new docx.Paragraph({ text: clasificacion }));

      if (clasificacion === 'Con observaciones') {
        const clasifObservaciones = document.getElementById('clasifObservaciones').value.trim();
        if (clasifObservaciones) {
          children.push(new docx.Paragraph({ text: clasifObservaciones }));
        }
      }
    }

    const chkFirma = document.getElementById('chkFirma').checked;
    const firmanteNombre = document.getElementById('firmanteNombre').value.trim();
    const firmanteCargo = document.getElementById('firmanteCargo').value.trim();
    const firmanteContacto = document.getElementById('firmanteContacto').value.trim();
    if (chkFirma && (firmanteNombre || firmanteCargo || firmanteContacto)) {
      children.push(new docx.Paragraph({ text: '' }));
      children.push(new docx.Paragraph({ text: '' }));
      children.push(new docx.Paragraph({
        text: '_______________________',
        alignment: center
      }));
      if (firmanteNombre) {
        children.push(new docx.Paragraph({
          children: [new docx.TextRun({ text: firmanteNombre, bold: true })],
          alignment: center
        }));
      }
      if (firmanteCargo) {
        children.push(new docx.Paragraph({ text: firmanteCargo, alignment: center }));
      }
      if (firmanteContacto) {
        children.push(new docx.Paragraph({ text: firmanteContacto, alignment: center }));
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
    // Aumentar timeout para evitar liberar el blob antes del download
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

    if (status) status.textContent = '✔ Documento Word descargado con éxito.';
  } catch (e) {
    console.error(e);
    if (status) status.textContent = '⚠ Error al generar Word.';
  } finally {
    if (btn) btn.disabled = false;
    if (status) setTimeout(() => { status.textContent = ''; }, 4000);
  }
};

// Inicialización
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

  campos.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updatePreview);
      el.addEventListener('change', updatePreview);
    }
  });

  document.querySelectorAll('input[name="clasificacion"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const clasifObsWrapper = document.getElementById('clasifObsWrapper');
      if (clasifObsWrapper) {
        clasifObsWrapper.style.display = (radio.value === 'Con observaciones' && radio.checked) ? 'block' : 'none';
      }
      updatePreview();
    });
  });

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
        { id: 'conclusion', label: 'Conclusión' },
        { id: 'clasifObservaciones', label: 'Observaciones de la clasificación' },
        { id: 'firmanteCargo', label: 'Cargo / Especialidad del firmante' }
      ],
      nombreArchivoBase: 'Informe_Generico',
      onResetExtra: function() {
        document.getElementById('fechaInforme').value = new Date().toISOString().slice(0, 10);
        document.querySelector('input[name="clasificacion"][value=""]').checked = true;
        document.getElementById('aspectosContainer').innerHTML = '';
        const clasifObsWrapper = document.getElementById('clasifObsWrapper');
        if (clasifObsWrapper) clasifObsWrapper.style.display = 'none';

        // Resetear todos los checkboxes de visibilidad
        ['chkResumen', 'chkDesarrollo', 'chkConclusion', 'chkClasificacion', 'chkFirma'].forEach(id => {
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
        ['chkResumen', 'chkDesarrollo', 'chkConclusion', 'chkClasificacion', 'chkFirma'].forEach(id => {
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
        ['chkResumen', 'chkDesarrollo', 'chkConclusion', 'chkClasificacion', 'chkFirma'].forEach(id => {
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
