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

// ============================================================
//  HELPERS PARA DOCX – convertir texto con saltos de línea
// ============================================================

/**
 * Convierte texto con saltos de línea en array de párrafos docx.
 * Cada línea es un párrafo separado. Filtra líneas vacías.
 */
function textToDocxParagraphs(text, options) {
  options = options || {};
  if (!text || !text.trim()) return [];
  var lines = text.split(/\r?\n/).filter(function(line) { return line.trim() !== ''; });
  if (lines.length === 0) return [];
  return lines.map(function(line) {
    return new docx.Paragraph({
      children: [new docx.TextRun(Object.assign({ text: line }, options))],
      spacing: { after: 120 }
    });
  });
}

/**
 * Convierte texto con saltos de línea en array de párrafos docx.
 * Conserva líneas vacías (espaciado intencional).
 */
function textToDocxParagraphsPreserveEmpty(text, options) {
  options = options || {};
  if (!text) return [];
  var lines = text.split(/\r?\n/);
  return lines.map(function(line) {
    return new docx.Paragraph({
      children: [new docx.TextRun(Object.assign({ text: line }, options))],
      spacing: { after: 120 }
    });
  });
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
  bloques.forEach(function(block) {
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

  div.querySelector('.del-btn').addEventListener('click', function() {
    div.remove();
    updatePreview();
  });

  // Delegación de eventos para inputs y textareas
  div.querySelectorAll('input, textarea').forEach(function(el) {
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
  const graficoContainer = document.getElementById('graficoAspectosContainer');

  const aspectosBlocks = aspectosContainer.querySelectorAll('.aspecto-block');
  if (aspectosBlocks.length > 0) {
    aspectosOutContainer.innerHTML = '';
    const graficables = []; // { nombre, puntaje, maximo } solo de los que tienen máximo > 0
    aspectosBlocks.forEach(function(block) {
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

      // Solo entra al gráfico si tiene nombre y un máximo válido (> 0) para poder sacar %
      if (nombre && maximoNum > 0) {
        graficables.push({ nombre: nombre, puntaje: puntajeNum, maximo: maximoNum });
      }
    });
    secAspectos.style.display = aspectosOutContainer.children.length > 0 ? 'block' : 'none';
    renderGraficoAspectos(graficables);
  } else {
    secAspectos.style.display = 'none';
    renderGraficoAspectos([]);
  }
}

/**
 * Dibuja un gráfico de barras (SVG puro, sin librerías externas) con el
 * % logrado de cada aspecto graficable (los que tienen "puntaje máximo" > 0).
 * Si no hay ninguno graficable, oculta el contenedor y no dibuja nada.
 */
function renderGraficoAspectos(datos) {
  const cont = document.getElementById('graficoAspectosContainer');
  if (!cont) return;

  if (!datos || datos.length === 0) {
    cont.style.display = 'none';
    cont.innerHTML = '';
    return;
  }

  const anchoTotal = 600;
  const altoBarra = 26;
  const espacio = 14;
  const altoTotal = datos.length * (altoBarra + espacio) + espacio;
  const anchoEtiqueta = 170;
  const anchoBarraMax = anchoTotal - anchoEtiqueta - 60;

  let barras = '';
  datos.forEach(function(d, i) {
    const pct = Math.max(0, Math.min(100, (d.puntaje / d.maximo) * 100));
    const y = espacio + i * (altoBarra + espacio);
    const anchoBarra = (pct / 100) * anchoBarraMax;
    const color = pct >= 70 ? '#3f6b52' : (pct >= 40 ? '#b6863f' : '#c1503f');

    barras += `
      <text x="0" y="${y + altoBarra / 2 + 4}" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="#333">${escapeHTML(d.nombre).slice(0, 26)}</text>
      <rect x="${anchoEtiqueta}" y="${y}" width="${anchoBarraMax}" height="${altoBarra}" fill="#eef0ea" rx="4"></rect>
      <rect x="${anchoEtiqueta}" y="${y}" width="${anchoBarra}" height="${altoBarra}" fill="${color}" rx="4"></rect>
      <text x="${anchoEtiqueta + anchoBarraMax + 8}" y="${y + altoBarra / 2 + 4}" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="#333">${Math.round(pct)}%</text>
    `;
  });

  cont.innerHTML = `
    <svg viewBox="0 0 ${anchoTotal} ${altoTotal}" width="${anchoTotal}" height="${altoTotal}" style="width:100%;height:auto;display:block;" xmlns="http://www.w3.org/2000/svg">
      ${barras}
    </svg>
  `;
  cont.style.display = 'block';
}

/**
 * Convierte el SVG del gráfico de aspectos (ya dibujado en pantalla) a un
 * PNG en memoria, para poder insertarlo en el Word con docx.ImageRun
 * (el gráfico es SVG y docx no soporta SVG directamente, solo imágenes
 * rasterizadas). Devuelve null si no hay gráfico visible (sin aspectos
 * graficables) — en ese caso el Word simplemente no incluye imagen, igual
 * que el PDF no la incluiría.
 */
async function generarImagenGraficoParaWord() {
  const cont = document.getElementById('graficoAspectosContainer');
  const svgEl = cont ? cont.querySelector('svg') : null;
  if (!cont || cont.style.display === 'none' || !svgEl) return null;

  const svgWidth = parseInt(svgEl.getAttribute('width'), 10) || 600;
  const svgHeight = parseInt(svgEl.getAttribute('height'), 10) || 200;
  const escala = 2; // más nitidez dentro del documento Word

  const canvas = document.createElement('canvas');
  canvas.width = svgWidth * escala;
  canvas.height = svgHeight * escala;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const svgString = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await new Promise(function(resolve, reject) {
      const image = new Image();
      image.onload = function() { resolve(image); };
      image.onerror = reject;
      image.src = url;
    });
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } finally {
    URL.revokeObjectURL(url);
  }

  const dataUrl = canvas.toDataURL('image/png');
  const buffer = await (await fetch(dataUrl)).arrayBuffer();

  // Ancho fijo prolijo dentro de la hoja Word, alto proporcional al original
  const anchoWord = 500;
  const altoWord = Math.round(anchoWord * (svgHeight / svgWidth));

  return { buffer: buffer, width: anchoWord, height: altoWord };
}

const updatePreview = debounce(updatePreviewFn, 300);

async function waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (e) { /* noop */ }
  }
}

// ============================================================
//  CONTRATO: window.downloadPDF
// ============================================================
window.downloadPDF = async function() {
  const btn = document.querySelector('[data-action="pdf"]');
  const status = document.getElementById('status');
  if (btn) btn.disabled = true;

  if (!hasContent()) {
    if (status) status.textContent = '⚠ El documento está vacío. Agregá contenido antes de descargar.';
    if (btn) btn.disabled = false;
    return;
  }

  if (status) status.textContent = 'Elegí "Guardar como PDF" en el diálogo de impresión...';

  // MIGRADO de html2canvas+jsPDF a window.print() nativo del navegador.
  // El método anterior necesitaba un algoritmo propio para calcular
  // "cortes seguros" (calcularCortesSeguros/cortesPagina, ver historial)
  // porque jsPDF corta la imagen capturada a una altura fija en mm sin
  // saber qué hay dibujado ahí. Con window.print(), el motor de impresión
  // del navegador decide los saltos de página él mismo, respetando las
  // reglas "page-break-inside: avoid" que ya están puestas en el CSS
  // (@media print) sobre tablas, <hr>, los recuadros de clasificación y
  // el gráfico de aspectos — así que todo ese cálculo manual deja de
  // hacer falta. El resultado, de paso, sale idéntico al Word.
  const nombreArchivo = sanitizeFilename(document.getElementById('tituloInforme').value.trim() || 'Informe_Generico');
  const tituloOriginal = document.title;
  document.title = nombreArchivo;

  const restaurar = function() {
    document.title = tituloOriginal;
    if (btn) btn.disabled = false;
    if (status) status.textContent = '';
    window.removeEventListener('afterprint', restaurar);
  };
  window.addEventListener('afterprint', restaurar);
  setTimeout(function(){ window.print(); }, 50);
};

// ============================================================
//  CONTRATO: window.downloadWord
// ============================================================
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

    const nombreArchivo = sanitizeFilename(document.getElementById('tituloInforme').value.trim() || 'Informe_Generico') + '.docx';

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

    // ============================================================
    //  FIX WORD: Resumen con párrafos separados (no todo junto)
    // ============================================================
    const resumen = document.getElementById('resumen').value.trim();
    if (resumen && document.getElementById('chkResumen').checked) {
      children.push(new docx.Paragraph({ text: '' }));
      if (H2) {
        children.push(new docx.Paragraph({ text: 'Resumen / Antecedentes', heading: H2 }));
      } else {
        children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: 'Resumen / Antecedentes', bold: true, size: 26 })] }));
      }
      children.push.apply(children, textToDocxParagraphsPreserveEmpty(resumen));
    }

    // ============================================================
    //  FIX WORD: Desarrollo con párrafos separados
    // ============================================================
    const desarrollo = document.getElementById('desarrollo').value.trim();
    if (desarrollo && document.getElementById('chkDesarrollo').checked) {
      children.push(new docx.Paragraph({ text: '' }));
      if (H2) {
        children.push(new docx.Paragraph({ text: 'Desarrollo / Observaciones', heading: H2 }));
      } else {
        children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: 'Desarrollo / Observaciones', bold: true, size: 26 })] }));
      }
      children.push.apply(children, textToDocxParagraphsPreserveEmpty(desarrollo));
    }

    // ============================================================
    //  Aspectos evaluados
    // ============================================================
    const aspectosContainer = document.getElementById('aspectosContainer');
    const aspectosBlocks = aspectosContainer.querySelectorAll('.aspecto-block');
    if (aspectosBlocks.length > 0) {
      let tieneAspecto = false;
      aspectosBlocks.forEach(function(block) {
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

        // Gráfico de barras (si hay al menos un aspecto con puntaje máximo > 0)
        const imagenGrafico = await generarImagenGraficoParaWord();
        if (imagenGrafico) {
          children.push(new docx.Paragraph({
            children: [new docx.ImageRun({
              data: imagenGrafico.buffer,
              transformation: { width: imagenGrafico.width, height: imagenGrafico.height }
            })]
          }));
          children.push(new docx.Paragraph({ text: '' }));
        }

        aspectosBlocks.forEach(function(block) {
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
            // FIX: Descripción con párrafos separados
            if (desc) {
              children.push.apply(children, textToDocxParagraphsPreserveEmpty(desc));
            }
          }
        });
      }
    }

    // ============================================================
    //  FIX WORD: Conclusión con párrafos separados
    // ============================================================
    const conclusion = document.getElementById('conclusion').value.trim();
    if (conclusion && document.getElementById('chkConclusion').checked) {
      children.push(new docx.Paragraph({ text: '' }));
      if (H2) {
        children.push(new docx.Paragraph({ text: 'Conclusión', heading: H2 }));
      } else {
        children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: 'Conclusión', bold: true, size: 26 })] }));
      }
      children.push.apply(children, textToDocxParagraphsPreserveEmpty(conclusion));
    }

    // Clasificación
    const clasifElWord = document.querySelector('input[name="clasificacion"]:checked');
    const clasificacion = clasifElWord ? clasifElWord.value : '';
    if (clasificacion && document.getElementById('chkClasificacion').checked) {
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
          children.push.apply(children, textToDocxParagraphsPreserveEmpty(clasifObservaciones));
        }
      }
    }

    // Firma
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

    // ============================================================
    //  FIX: Márgenes de página en el documento
    // ============================================================
    const doc = new docx.Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 pulgada = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: children
      }]
    });

    const blob = await docx.Packer.toBlob(doc);
    await Botonera.guardarBlob(blob, nombreArchivo);

    if (status) status.textContent = '✔ Documento Word descargado con éxito.';
  } catch (e) {
    console.error(e);
    if (status) status.textContent = '⚠ Error al generar Word.';
  } finally {
    if (btn) btn.disabled = false;
    if (status) setTimeout(function() { status.textContent = ''; }, 4000);
  }
};

// ============================================================
//  Inicialización
// ============================================================
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

  campos.forEach(function(id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updatePreview);
      el.addEventListener('change', updatePreview);
    }
  });

  document.querySelectorAll('input[name="clasificacion"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      const clasifObsWrapper = document.getElementById('clasifObsWrapper');
      if (clasifObsWrapper) {
        clasifObsWrapper.style.display = (radio.value === 'Con observaciones' && radio.checked) ? 'block' : 'none';
      }
      updatePreview();
    });
  });

  const addAspectoBtn = document.getElementById('addAspectoBtn');
  if (addAspectoBtn) {
    addAspectoBtn.addEventListener('click', function() {
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
      nombreArchivoBase: 'Informe_Generico_Grafico',
      onResetExtra: function() {
        document.getElementById('fechaInforme').value = new Date().toISOString().slice(0, 10);
        document.querySelector('input[name="clasificacion"][value=""]').checked = true;
        document.getElementById('aspectosContainer').innerHTML = '';
        const clasifObsWrapper = document.getElementById('clasifObsWrapper');
        if (clasifObsWrapper) clasifObsWrapper.style.display = 'none';

        // Resetear todos los checkboxes de visibilidad
        ['chkResumen', 'chkDesarrollo', 'chkConclusion', 'chkClasificacion', 'chkFirma'].forEach(function(id) {
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
        ['chkResumen', 'chkDesarrollo', 'chkConclusion', 'chkClasificacion', 'chkFirma'].forEach(function(id) {
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
        ['chkResumen', 'chkDesarrollo', 'chkConclusion', 'chkClasificacion', 'chkFirma'].forEach(function(id) {
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
