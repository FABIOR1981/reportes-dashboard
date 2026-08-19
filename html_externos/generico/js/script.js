// ============================================================
//  INFORME GENÉRICO – lógica propia del informe
//  Contrato: define window.downloadPDF, window.downloadWord
//  y llama a Botonera.init() al final (ver CONTEXTO_ARQUITECTURA_DASHBOARD.md)
// ============================================================

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
  const clasifEl = document.querySelector('input[name="clasificacion"]:checked');
  const clasificacion = clasifEl ? clasifEl.value : '';
  const aspectosContainer = document.getElementById('aspectosContainer');
  const tieneAspectos = aspectosContainer && aspectosContainer.querySelectorAll('.aspecto-block').length > 0;
  return titulo || resumen || desarrollo || conclusion || clasificacion || tieneAspectos;
}

// Datos de ejemplo para los aspectos evaluados, mostrados por defecto al
// abrir el informe (mismo criterio que defaultComps en SM Consultores):
// sirven como muestra de cómo luce la sección con contenido real.
const defaultAspectos = [
  { nombre: 'Organización', puntaje: 4, maximo: 5, descripcion: 'Se observa un manejo ordenado de las tareas asignadas, con buena planificación de los tiempos.' },
  { nombre: 'Comunicación', puntaje: 3, maximo: 5, descripcion: 'La comunicación con el equipo es adecuada, aunque podría reforzarse en instancias de mayor exigencia.' },
  { nombre: 'Cumplimiento de plazos', puntaje: 4, maximo: 5, descripcion: 'Las tareas se completan dentro de los plazos establecidos en la mayoría de los casos relevados.' }
];

// Agregar bloque de aspecto dinámico
// Estructura calcada de "Competencias evaluadas" (SM Consultores):
// nombre + puntaje obtenido/máximo + descripción.
function addAspectoBlock(data) {
  data = data || { nombre: '', puntaje: 3, maximo: 5, descripcion: '' };
  const container = document.getElementById('aspectosContainer');

  const div = document.createElement('div');
  div.className = 'aspecto-block';
  div.innerHTML = `
    <button type="button" class="del-btn">✕ Eliminar</button>
    <div class="form-group">
      <label>Aspecto</label>
      <input type="text" class="asp-nombre" value="${data.nombre || ''}" placeholder="Ej: Comunicación, Liderazgo, etc.">
    </div>
    <div class="row2">
      <div class="form-group">
        <label>Puntaje obtenido</label>
        <input type="number" class="asp-puntaje" min="1" max="10" value="${data.puntaje ?? 3}">
      </div>
      <div class="form-group">
        <label>Puntaje máximo</label>
        <input type="number" class="asp-maximo" min="1" max="10" value="${data.maximo ?? 5}">
      </div>
    </div>
    <div class="form-group">
      <label>Descripción</label>
      <textarea class="asp-desc" rows="3" placeholder="Descripción de la evaluación...">${data.descripcion || ''}</textarea>
    </div>
  `;

  div.querySelector('.del-btn').addEventListener('click', () => {
    div.remove();
    updatePreview();
  });

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

  // El campo de texto de observaciones solo tiene sentido cuando la
  // clasificación elegida es justamente "Con observaciones".
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

  // Firma del firmante (mismo criterio que "Datos del profesional" en UDE:
  // los datos ingresados se usan para armar el bloque de firma al pie).
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

      // Solo mostrar la línea de puntajes si al menos uno de los dos
      // valores es distinto de cero. "0 / 0" significa "sin puntuar":
      // ni el dato ni la etiqueta deben aparecer en la vista previa.
      const puntajeNum = parseFloat(puntaje) || 0;
      const maximoNum = parseFloat(maximo) || 0;
      const mostrarPuntajes = puntajeNum !== 0 || maximoNum !== 0;

      if (nombre || desc) {
        const item = document.createElement('div');
        item.className = 'aspecto-item';
        item.innerHTML = `
          <div class="aspecto-name">${nombre || '(sin nombre)'}</div>
          ${mostrarPuntajes ? '<div class="aspecto-scores"><b>Puntaje obtenido:</b> ' + (puntaje || '-') + ' &nbsp; <b>Puntaje máximo:</b> ' + (maximo || '-') + '</div>' : ''}
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

// Espera a que las fuentes web terminen de cargar antes de capturar el DOM.
// Sin esto, html2canvas puede capturar el frame con la fuente de respaldo
// (fallback) todavía activa, generando un PDF con métricas de texto
// distintas a las que se ven en pantalla (saltos de línea desalineados).
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
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // ---- Paginación real en A4 ----
    // En vez de forzar TODO el canvas capturado dentro de una única página
    // de 210x297mm (lo que distorsiona/recorta el contenido cuando el
    // informe es más largo que una hoja A4), se calcula la altura real de
    // la imagen manteniendo el ancho fijo a 210mm, y se recorta en franjas
    // de 297mm de alto, agregando tantas páginas como haga falta.
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight; // desplaza la imagen hacia arriba
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

    // Orden narrativo coherente con UDE / SM Consultores:
    // aspectos evaluados (evidencia detallada) → conclusión → clasificación
    // (siempre la ÚLTIMA sección, es el veredicto final).
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
        children.push(new docx.Paragraph({ text: 'Aspectos Evaluados', heading: docx.HeadingLevel.HEADING_2 }));

        aspectosBlocks.forEach(block => {
          const nombre = block.querySelector('.asp-nombre').value.trim();
          const puntaje = block.querySelector('.asp-puntaje').value.trim();
          const maximo = block.querySelector('.asp-maximo').value.trim();
          const desc = block.querySelector('.asp-desc').value.trim();
          const puntajeNum = parseFloat(puntaje) || 0;
          const maximoNum = parseFloat(maximo) || 0;
          const mostrarPuntajes = puntajeNum !== 0 || maximoNum !== 0;
          if (nombre || desc) {
            if (nombre) children.push(new docx.Paragraph({ text: nombre, heading: docx.HeadingLevel.HEADING_3 }));
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
      children.push(new docx.Paragraph({ text: 'Conclusión', heading: docx.HeadingLevel.HEADING_2 }));
      children.push(new docx.Paragraph({ text: conclusion }));
    }

    const clasifElWord = document.querySelector('input[name="clasificacion"]:checked');
    const clasificacion = clasifElWord ? clasifElWord.value : '';
    if (clasificacion) {
      children.push(new docx.Paragraph({ text: '' }));
      children.push(new docx.Paragraph({ text: 'Clasificación', heading: docx.HeadingLevel.HEADING_2 }));
      children.push(new docx.Paragraph({ text: clasificacion }));

      if (clasificacion === 'Con observaciones') {
        const clasifObservaciones = document.getElementById('clasifObservaciones').value.trim();
        if (clasifObservaciones) {
          children.push(new docx.Paragraph({ text: clasifObservaciones }));
        }
      }
    }

    // Firma del firmante (mismo dato usado en la vista previa)
    const chkFirma = document.getElementById('chkFirma').checked;
    const firmanteNombre = document.getElementById('firmanteNombre').value.trim();
    const firmanteCargo = document.getElementById('firmanteCargo').value.trim();
    const firmanteContacto = document.getElementById('firmanteContacto').value.trim();
    if (chkFirma && (firmanteNombre || firmanteCargo || firmanteContacto)) {
      children.push(new docx.Paragraph({ text: '' }));
      children.push(new docx.Paragraph({ text: '' }));
      children.push(new docx.Paragraph({ text: '_______________________', alignment: docx.AlignmentType.CENTER }));
      if (firmanteNombre) {
        children.push(new docx.Paragraph({
          children: [new docx.TextRun({ text: firmanteNombre, bold: true })],
          alignment: docx.AlignmentType.CENTER
        }));
      }
      if (firmanteCargo) {
        children.push(new docx.Paragraph({ text: firmanteCargo, alignment: docx.AlignmentType.CENTER }));
      }
      if (firmanteContacto) {
        children.push(new docx.Paragraph({ text: firmanteContacto, alignment: docx.AlignmentType.CENTER }));
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
  const campos = ['tituloInforme', 'destinatario', 'fechaInforme', 'resumen', 'desarrollo', 'conclusion', 'clasifObservaciones', 'firmanteNombre', 'firmanteCargo', 'firmanteContacto'];

  campos.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updatePreview);
      el.addEventListener('change', updatePreview);
    }
  });

  document.querySelectorAll('input[name="clasificacion"]').forEach(radio => {
    radio.addEventListener('change', () => {
      // Toggle inmediato (sin esperar el debounce de updatePreview) para
      // que el campo de observaciones aparezca/desaparezca al instante.
      const clasifObsWrapper = document.getElementById('clasifObsWrapper');
      if (clasifObsWrapper) {
        clasifObsWrapper.style.display = (radio.value === 'Con observaciones' && radio.checked) ? 'block' : 'none';
      }
      updatePreview();
    });
  });

  const checkboxes = ['chkResumen', 'chkDesarrollo', 'chkConclusion', 'chkClasificacion', 'chkFirma'];
  checkboxes.forEach(id => {
    const chk = document.getElementById(id);
    if (chk) chk.addEventListener('change', updatePreview);
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

  // Precargar aspectos de ejemplo (solo al abrir el informe; "Limpiar
  // formulario" los vacía y no los vuelve a cargar, igual que compContainer
  // en SM Consultores).
  defaultAspectos.forEach(addAspectoBlock);

  updatePreview();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
