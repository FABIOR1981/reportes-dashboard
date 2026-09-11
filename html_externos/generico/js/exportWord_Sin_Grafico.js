// ============================================================
//  INFORME GENÉRICO (sin gráfico) – exportWord_Sin_Grafico.js
//  Contrato: define window.downloadWord
//  Depende de: utils.js (hasContent, sanitizeFilename), docx (vendor)
// ============================================================

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
