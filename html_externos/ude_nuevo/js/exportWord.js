// ============================================================
//  UDE – exportWord.js
//  Contrato: define window.downloadWord
//  Depende de: utils.js (fmtFecha, calcularEdad), docx (vendor)
// ============================================================
// ---------- Descargar como Word (.docx nativo, sin imagen) ----------
window.downloadWord = async function(){
  var btn = document.querySelector('[data-action="word"]');
  var status = document.getElementById('status');
  if(!btn) return;
  // IMPORTANTE: no usar btn.textContent para mostrar "Generando..." dentro del botón.
  // El botón contiene un <span class="tooltip"> interno; asignar textContent lo
  // reemplaza por un único nodo de texto plano y el tooltip desaparece para siempre.
  // El feedback de progreso se muestra en el panel #status en su lugar.
  btn.disabled = true;
  if (status) status.textContent = 'Generando Word, por favor espera...';

  try {
    var docx = window.docx;
    var nombreArchivoElegido = 'Informe_Psicolaboral_' + (document.getElementById('apellidos').value || 'informe').replace(/\s+/g,'_') + '.docx';

    var Document = docx.Document, Packer = docx.Packer, Paragraph = docx.Paragraph,
        TextRun = docx.TextRun, Table = docx.Table, TableRow = docx.TableRow,
        TableCell = docx.TableCell, WidthType = docx.WidthType, BorderStyle = docx.BorderStyle,
        AlignmentType = docx.AlignmentType, VerticalAlign = docx.VerticalAlign,
        ShadingType = docx.ShadingType;

    var NAVY = '154360', BLUE = '2874A6', GRAY = '5D6D7E', INK = '2C3E50';
    var BORDER_COLOR = 'AED6F1', BOX_BG = 'F8F9F9', LIGHTBLUE = 'D6EAF8';

    // ----- Recolectar los mismos datos que usa la vista previa -----
    var ciudad = document.getElementById('ciudad').value;
    var fecha = document.getElementById('fechaInforme').value;
    var institucion = document.getElementById('institucion').value;
    var titulo = document.getElementById('tituloInforme').value || 'Informe de Evaluación Psicolaboral';
    var prefijo = document.getElementById('prefijo').value || 'al';
    var apellidos = document.getElementById('apellidos').value;
    var nombres = document.getElementById('nombres').value;
    var cargo = document.getElementById('cargo').value;
    var ci = document.getElementById('ci').value;
    var fechaNacimiento = document.getElementById('fechaNacimiento').value;
    var contacto = document.getElementById('contacto').value;
    var edad = calcularEdad(fechaNacimiento, fecha);
    var evaluacion = document.getElementById('evaluacion').value;
    var conclusion = document.getElementById('conclusion').value;
    var profNombre = document.getElementById('profNombre').value;
    var profCel = document.getElementById('profCel').value;
    var profCargo = document.getElementById('profCargo').value;
    var recEl = document.querySelector('input[name="recom"]:checked');
    var recVal = recEl ? recEl.value : 'Recomendable';

    var nombreCompleto = (apellidos + ' ' + nombres).trim() || '[Nombre del postulante]';
    var fechaStr = fecha ? fmtFecha(fecha) : '';

    function noBorders(){
      var n = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
      return { top:n, bottom:n, left:n, right:n };
    }

    // ----- Encabezado -----
    var headerParagraphs = [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: ciudad + (fechaStr ? ', ' + fechaStr : ''), color: GRAY, size: 20 })]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 120 },
        children: [new TextRun({ text: (profNombre || '[Nombre del profesional]').toUpperCase(), bold: true, color: NAVY, size: 36 })]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 40, after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: NAVY, space: 8 } },
        children: [new TextRun({ text: titulo, bold: true, color: BLUE, size: 24 })]
      })
    ];

    // ----- Caja de datos (tabla 2 columnas x 3 filas) -----
    function infoCell(label, value){
      return new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        shading: { type: ShadingType.CLEAR, fill: BOX_BG },
        margins: { top: 120, bottom: 120, left: 160, right: 160 },
        borders: { top:{style:BorderStyle.SINGLE,size:4,color:BORDER_COLOR}, bottom:{style:BorderStyle.SINGLE,size:4,color:BORDER_COLOR}, left:{style:BorderStyle.SINGLE,size:4,color:BORDER_COLOR}, right:{style:BorderStyle.SINGLE,size:4,color:BORDER_COLOR} },
        children: [new Paragraph({ children: [
          new TextRun({ text: label, bold: true, color: INK, size: 21 }),
          new TextRun({ text: value, color: INK, size: 21 })
        ]})]
      });
    }
    var infoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [ infoCell('Postulante  ', nombreCompleto), infoCell('Cargo:  ', cargo || '[Cargo]') ] }),
        new TableRow({ children: [ infoCell('Edad:  ', String(edad !== '' ? edad : '--')), infoCell('CI:  ', ci || '--') ] }),
        new TableRow({ children: [ infoCell('Fecha de nacimiento:  ', fechaNacimiento ? fmtFecha(fechaNacimiento) : '--'), infoCell('Contacto:  ', contacto || '--') ] })
      ]
    });

    // ----- Cuerpo -----
    var bodyParagraphs = [];
    bodyParagraphs.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED, spacing: { after: 160 },
      children: [
        new TextRun({ text: 'A solicitud de ', color: INK, size: 21 }),
        new TextRun({ text: institucion || 'la institución', bold: true, color: INK, size: 21 }),
        new TextRun({ text: ', se realizó entrevista psicolaboral ' + prefijo + ' postulante ', color: INK, size: 21 }),
        new TextRun({ text: nombreCompleto, bold: true, color: INK, size: 21 }),
        new TextRun({ text: '.', color: INK, size: 21 })
      ]
    }));
    bodyParagraphs.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED, spacing: { after: 160 },
      children: [
        new TextRun({ text: 'La misma tuvo como finalidad evaluar competencias transversales en instancia de entrevista, a los efectos de desempeñar tareas como ', color: INK, size: 21 }),
        new TextRun({ text: cargo || 'el cargo postulado', bold: true, color: INK, size: 21 }),
        new TextRun({ text: '.', color: INK, size: 21 })
      ]
    }));
    (evaluacion || '').split(/\r?\n/).forEach(function(p){
      if(p.trim()){
        bodyParagraphs.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED, spacing: { after: 160 },
          children: [new TextRun({ text: p.trim(), color: INK, size: 21 })]
        }));
      }
    });

    // ----- Conclusión -----
    var conclusionHeading = new Paragraph({
      spacing: { before: 200, after: 160 },
      border: { left: { style: BorderStyle.SINGLE, size: 24, color: BLUE, space: 8 } },
      children: [new TextRun({ text: 'CONCLUSIÓN', bold: true, color: NAVY, size: 25 })]
    });
    var conclusionParagraphs = [];
    (conclusion || '').split(/\r?\n/).forEach(function(p){
      if(p.trim()){
        conclusionParagraphs.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED, spacing: { after: 160 },
          children: [new TextRun({ text: p.trim(), color: INK, size: 21 })]
        }));
      }
    });

    // ----- Tabla de recomendación -----
    function recCell(label, checked){
      return [
        new TableCell({
          width: { size: 75, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          shading: { type: ShadingType.CLEAR, fill: LIGHTBLUE },
          margins: { top: 140, bottom: 140, left: 200, right: 120 },
          borders: { top:{style:BorderStyle.SINGLE,size:4,color:BORDER_COLOR}, bottom:{style:BorderStyle.SINGLE,size:4,color:BORDER_COLOR}, left:{style:BorderStyle.SINGLE,size:4,color:BORDER_COLOR}, right:{style:BorderStyle.SINGLE,size:4,color:BORDER_COLOR} },
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: NAVY, size: 21 })] })]
        }),
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 140, bottom: 140, left: 120, right: 120 },
          borders: { top:{style:BorderStyle.SINGLE,size:4,color:BORDER_COLOR}, bottom:{style:BorderStyle.SINGLE,size:4,color:BORDER_COLOR}, left:{style:BorderStyle.SINGLE,size:4,color:BORDER_COLOR}, right:{style:BorderStyle.SINGLE,size:4,color:BORDER_COLOR} },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: checked ? '☑' : '☐', bold: true, color: NAVY, size: 26 })] })]
        })
      ];
    }
    var recTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: recCell('Recomendable', recVal === 'Recomendable') }),
        new TableRow({ children: recCell('Recomendable con Observación', recVal === 'Recomendable con Observación') }),
        new TableRow({ children: recCell('No Recomendable', recVal === 'No Recomendable') })
      ]
    });

    // ----- Pie y firma -----
    var footerParagraphs = [
      new Paragraph({
        spacing: { before: 200, after: 400 },
        children: [new TextRun({ text: 'Dicho informe debe mantener la reserva confidencial, como es habitual, siendo de uso exclusivo del directorio de UDE.', color: GRAY, size: 18 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: '7F8C8D', space: 4 } },
        children: [new TextRun({ text: '\u00A0' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
        children: [new TextRun({ text: profNombre || '[Nombre del evaluador]', bold: true, color: NAVY, size: 22 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: profCargo || '[Cargo del evaluador]', color: GRAY, size: 17 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: profCel ? 'Cel. ' + profCel : '', color: GRAY, size: 17 })]
      })
    ];

    var doc = new Document({
      sections: [{
        properties: {},
        children: [].concat(
          headerParagraphs,
          [infoTable, new Paragraph({ text: '', spacing: { after: 160 } })],
          bodyParagraphs,
          [conclusionHeading],
          conclusionParagraphs,
          [new Paragraph({ text: '', spacing: { after: 100 } }), recTable],
          footerParagraphs
        )
      }]
    });

    var blob = await Packer.toBlob(doc);
    await Botonera.guardarBlob(blob, nombreArchivoElegido);
    if (status) status.textContent = '✔ Word descargado con éxito.';
  } catch(e){
    console.error(e);
    if (status) status.textContent = '⚠ Error al generar el Word. Revisá la consola.';
    alert('Error al generar el Word: ' + e.message);
  } finally {
    btn.disabled = false;
    if (status) setTimeout(function(){ status.textContent = ''; }, 4000);
  }
};
