(function(){
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  function fmtFecha(iso){
    if(!iso) return '';
    var p = iso.split('-');
    return parseInt(p[2],10) + ' de ' + meses[parseInt(p[1],10)-1] + ' de ' + p[0];
  }

  function calcularEdad(fechaNacIso, fechaRefIso){
    if(!fechaNacIso) return '';
    var nac = fechaNacIso.split('-').map(Number);
    var refIso = fechaRefIso || new Date().toISOString().slice(0,10);
    var ref = refIso.split('-').map(Number);
    var edad = ref[0] - nac[0];
    if(ref[1] < nac[1] || (ref[1] === nac[1] && ref[2] < nac[2])) edad--;
    return edad >= 0 ? edad : '';
  }

  function updatePreview(){
    var ciudad = document.getElementById('ciudad').value;
    var fecha = document.getElementById('fechaInforme').value;
    var institucion = document.getElementById('institucion').value;
    var titulo = document.getElementById('tituloInforme').value;
    var prefijo = document.getElementById('prefijo').value;
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

    var nombreCompleto = (apellidos + ' ' + nombres).trim() || '[Nombre del postulante]';
    var fechaStr = fecha ? fmtFecha(fecha) : '';

    // Encabezado
    document.getElementById('prevCiudadFecha').textContent = ciudad + (fechaStr ? ', ' + fechaStr : '');
    document.getElementById('prevInstitucion').textContent = profNombre || '[Nombre del profesional]';
    document.getElementById('prevTitulo').textContent = titulo || 'Informe de Evaluación Psicolaboral';

    // Info-box
    document.getElementById('prevNombre').textContent = nombreCompleto;
    document.getElementById('prevCargo').textContent = cargo || '[Cargo]';
    document.getElementById('prevEdad').textContent = (edad !== '' ? edad : '--');
    document.getElementById('prevCI').textContent = ci || '--';
    document.getElementById('prevFechaNac').textContent = fechaNacimiento ? fmtFecha(fechaNacimiento) : '--';
    document.getElementById('prevContacto').textContent = contacto || '--';
    // Cuerpo (el texto se reconstruye completo más abajo en bodyHTML)
    var bodyHTML = '';
    bodyHTML += '<p>A solicitud de <strong>' + (institucion || 'la institución') + '</strong>, se realizó entrevista psicolaboral ' + (prefijo || 'al') + ' postulante <strong>' + nombreCompleto + '</strong>.</p>';
    bodyHTML += '<p>La misma tuvo como finalidad evaluar competencias transversales en instancia de entrevista, a los efectos de desempeñar tareas como <strong>' + (cargo || 'el cargo postulado') + '</strong>.</p>';

    if(evaluacion){
      var parrafos = evaluacion.split(/\r?\n/);
      for(var i=0;i<parrafos.length;i++){
        if(parrafos[i].trim()) bodyHTML += '<p>' + parrafos[i] + '</p>';
      }
    } else {
      bodyHTML += '<p style="color:#aaa;font-style:italic;">[Aquí se desarrolla el texto de evaluación con las observaciones de la entrevista...]</p>';
    }

    document.getElementById('prevBody').innerHTML = bodyHTML;

    // Conclusión
    if(conclusion){
      document.getElementById('prevConclusion').innerHTML = conclusion.replace(/\r?\n/g,'<br>');
    } else {
      document.getElementById('prevConclusion').innerHTML = '<span style="color:#aaa;font-style:italic;">[Conclusión del informe...]</span>';
    }

    // Recomendación
    var rec = document.querySelector('input[name="recom"]:checked');
    var recVal = rec ? rec.value : 'Recomendable';
    document.getElementById('prevRec1').innerHTML = '<span class="check-box' + (recVal==='Recomendable'?' checked':'') + '"></span>';
    document.getElementById('prevRec2').innerHTML = '<span class="check-box' + (recVal==='Recomendable con Observación'?' checked':'') + '"></span>';
    document.getElementById('prevRec3').innerHTML = '<span class="check-box' + (recVal==='No Recomendable'?' checked':'') + '"></span>';

    // Firma
    document.getElementById('prevProfNombre').textContent = profNombre || '[Nombre del evaluador]';
    document.getElementById('prevProfCargo').textContent = profCargo || '[Cargo del evaluador]';
    document.getElementById('prevProfMat').textContent = (profCargo ? profCargo + ' - ' : '') + (profCel ? 'Cel. ' + profCel : '');
  }

  // Listeners robustos para CADA tipo de campo
  var camposTexto = ['ciudad','institucion','tituloInforme','prefijo','apellidos','nombres','cargo','ci','contacto','profNombre','profCel','profCargo'];
  for(var i=0;i<camposTexto.length;i++){
    var el = document.getElementById(camposTexto[i]);
    if(el){
      el.addEventListener('input', updatePreview);
      el.addEventListener('keyup', updatePreview);
    }
  }

  var camposFecha = ['fechaNacimiento'];
  for(var i=0;i<camposFecha.length;i++){
    var el = document.getElementById(camposFecha[i]);
    if(el){
      el.addEventListener('change', updatePreview);
      el.addEventListener('input', updatePreview);
    }
  }

  var camposTextarea = ['evaluacion','conclusion'];
  for(var i=0;i<camposTextarea.length;i++){
    var el = document.getElementById(camposTextarea[i]);
    if(el){
      el.addEventListener('input', updatePreview);
      el.addEventListener('keyup', updatePreview);
    }
  }

  var fechaEl = document.getElementById('fechaInforme');
  if(fechaEl){
    fechaEl.addEventListener('change', updatePreview);
    fechaEl.addEventListener('input', updatePreview);
  }

  var radios = document.querySelectorAll('input[name="recom"]');
  for(var i=0;i<radios.length;i++){
    radios[i].addEventListener('change', updatePreview);
  }

  window.resetForm = function(){
    if(!confirm('¿Estás seguro de que querés limpiar los datos del postulante y la evaluación?')) return;
    document.getElementById('apellidos').value = '';
    document.getElementById('nombres').value = '';
    document.getElementById('cargo').value = '';
    document.getElementById('ci').value = '';
    document.getElementById('fechaNacimiento').value = '';
    document.getElementById('contacto').value = '';
    document.getElementById('prefijo').value = 'al';
    document.getElementById('evaluacion').value = '';
    document.getElementById('conclusion').value = '';
    document.getElementById('fechaInforme').value = new Date().toISOString().slice(0,10);
    document.querySelector('input[name="recom"][value="Recomendable"]').checked = true;
    updatePreview();
  };

  window.downloadPDF = async function(){
    var btn = document.querySelector('[data-action="pdf"]');
    if(!btn) return;
    var originalText = btn.textContent;
    btn.textContent = 'Generando PDF...';
    btn.disabled = true;

    try {
      if(document.fonts && document.fonts.ready){
        await document.fonts.ready;
      }
      var page = document.getElementById('page1');
      var canvas = await html2canvas(page, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
      var imgData = canvas.toDataURL('image/png');
      var pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
      var pdfWidth = pdf.internal.pageSize.getWidth();
      var pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      var nombre = (document.getElementById('apellidos').value || 'informe').replace(/\s+/g,'_');
      pdf.save('Informe_Psicolaboral_' + nombre + '.pdf');
    } catch(e){
      alert('Error al generar PDF: ' + e.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  };

  // ---------- Descargar como Word (.docx nativo, sin imagen) ----------
  window.downloadWord = async function(){
    var btn = document.querySelector('[data-action="word"]');
    if(!btn) return;
    var originalText = btn.textContent;
    btn.textContent = 'Generando Word...';
    btn.disabled = true;

    try {
      var docx = window.docx;
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
          children: [new TextRun({ text: (profCargo ? profCargo + ' - ' : '') + (profCel ? 'Cel. ' + profCel : ''), color: GRAY, size: 17 })]
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
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      var nombre = (apellidos || 'informe').replace(/\s+/g,'_');
      a.href = url;
      a.download = 'Informe_Psicolaboral_' + nombre + '.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch(e){
      console.error(e);
      alert('Error al generar el Word: ' + e.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  };

  // ---------- Inicializar botonera compartida ----------
  Botonera.init({
    camposGuardables: ['ciudad','fechaInforme','institucion','tituloInforme','prefijo',
      'apellidos','nombres','cargo','ci','fechaNacimiento','contacto',
      'evaluacion','conclusion','profNombre','profCel','profCargo'],
    camposOrtografia: [
      {id:'tituloInforme', label:'Título del informe'},
      {id:'cargo', label:'Cargo al que postula'},
      {id:'evaluacion', label:'Texto de evaluación'},
      {id:'conclusion', label:'Conclusión'},
      {id:'profCargo', label:'Especialidad / Cargo profesional'}
    ],
    nombreArchivoBase: 'informe',
    onResetExtra: function() {
      document.getElementById('prefijo').value = 'al';
      document.getElementById('fechaInforme').value = new Date().toISOString().slice(0,10);
      updatePreview();
    },
    onLoadExtra: function() {
      updatePreview();
    }
  });

  // Inicializar
  updatePreview();
})();
