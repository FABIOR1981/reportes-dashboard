const TOTAL_COMPETENCIAS = 13;
let chartInstance = null;

// ==========================================
// 1. HELPERS AUTOCONTENIDOS
// ==========================================
function fmtDate(iso){
  if(!iso) return '-';
  const [y,m,d] = iso.split('-');
  if(!y) return iso;
  return `${d}/${m}/${y}`;
}

function fmtDateLong(iso){
  if(!iso) return '-';
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const [y,m,d] = iso.split('-');
  if(!y) return iso;
  return `${parseInt(d)} de ${meses[parseInt(m)-1]} ${y}`;
}

function val(id){ 
  const el = document.getElementById(id);
  return el ? el.value : ''; 
}

function setText(id, text){ 
  const el = document.getElementById(id);
  if(el) el.textContent = text && text.trim() !== '' ? text : '-'; 
}

// ==========================================
// 2. GENERACIÓN DE INPUTS Y RENDER
// ==========================================
function generarInputsCompetencias() {
  const container = document.getElementById('compContainer');
  let html = '';
  for (let i = 1; i <= TOTAL_COMPETENCIAS; i++) {
    html += `
      <div class="row2" style="margin-bottom:8px; align-items:center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
        <input type="text" id="comp_nombre_${i}" value="Competencia ${i}" style="width:50%; margin-bottom:0;" spellcheck="true">
        <div><label style="display:inline; margin-right:5px;">Obt:</label> <input type="number" id="comp_obt_${i}" value="0" min="0" max="10" style="width:60px; margin-bottom:0;"></div>
        <div><label style="display:inline; margin-right:5px;">Máx:</label> <input type="number" id="comp_max_${i}" value="10" min="1" max="10" style="width:60px; margin-bottom:0;"></div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function renderPreview(){
  setText('out-fechaInforme', fmtDateLong(val('fechaInforme')));
  setText('out-elaboradoPor', val('elaboradoPor'));
  setText('out-consultoria', val('consultoria'));

  const logoNombreVal = (val('logoNombre') || 'Shalon Morales').trim();
  document.getElementById('out-logoNombre').textContent = logoNombreVal.split(/\s+/).join('\n');
  setText('out-logoSub', (val('logoLeyenda') || 'CONSULTORES').toUpperCase());

  const nombre = val('nombre');
  const elaboradoPor = val('elaboradoPor') || 'Lic. Psic. Rita Morales';
  setText('out-nombre', val('nombre'));
  setText('out-nombre2', nombre);
  setText('out-cargoPostulacion', val('cargoPostulacion'));
  setText('out-cargoEvaluado', val('cargoPostulacion'));
  setText('out-fechaNac', fmtDate(val('fechaNac')));
  setText('out-fechaEval', fmtDateLong(val('fechaEval')));
  setText('out-edad', val('edad'));
  setText('out-ci', val('ci'));
  setText('out-contacto', val('contacto'));
  setText('out-solicitante', val('solicitante'));
  setText('out-firmaElaborado', elaboradoPor);
  setText('out-firmaNombre', elaboradoPor.replace(/^(lic\.?\s*)?(psic\.?\s*)?/i, '').trim());

  setText('out-fortalezasTexto', val('fortalezasTexto'));
  setText('out-debilidadesTexto', val('debilidadesTexto'));
  setText('out-conclusionTexto', val('conclusionTexto'));

  renderClasificacion();
  renderCompetencias();
  dibujarGrafico();
}

function renderClasificacion(){
  const seleccion = document.querySelector('input[name="clasif"]:checked');
  const valor = seleccion ? seleccion.value : 'RECOMENDABLE CON OBSERVACIÓN';
  const destinos = {
    'RECOMENDABLE': 'chk-REC',
    'RECOMENDABLE CON OBSERVACIÓN': 'chk-OBS',
    'NO RECOMENDABLE': 'chk-NOREC'
  };
  const destino = document.getElementById(destinos[valor]);
  if (destino) destino.replaceChildren(document.getElementById('checkSvg').content.cloneNode(true));
}

function obtenerCompetencias(){
  const competencias = [];
  for (let index = 1; index <= TOTAL_COMPETENCIAS; index++) {
    competencias.push({
      nombre: val(`comp_nombre_${index}`) || `Competencia ${index}`,
      obtenido: Number(val(`comp_obt_${index}`)) || 0,
      maximo: Number(val(`comp_max_${index}`)) || 0
    });
  }
  return competencias;
}

function renderCompetencias(){
  const container = document.getElementById('compOutContainer');
  const fragment = document.createDocumentFragment();
  obtenerCompetencias().forEach(function(competencia){
    const row = document.createElement('div');
    row.className = 'comp-summary';
    const name = document.createElement('span');
    name.className = 'comp-summary-name';
    name.textContent = competencia.nombre;
    const score = document.createElement('strong');
    score.className = 'comp-summary-score';
    score.textContent = `${competencia.obtenido} / ${competencia.maximo}`;
    row.append(name, score);
    fragment.appendChild(row);
  });
  container.replaceChildren(fragment);
}

function dibujarGrafico() {
  if (!window.Chart) return;
  const competencias = obtenerCompetencias();
  const ctx = document.getElementById('graficoCompetencias').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: competencias.map(competencia => competencia.nombre),
      datasets: [
        { label: 'Nivel obtenido', data: competencias.map(competencia => competencia.obtenido), backgroundColor: '#177789' },
        { label: 'Nivel esperado', data: competencias.map(competencia => competencia.maximo), backgroundColor: '#a5b5ab' }
      ]
    },
    options: {
      responsive: false,
      animation: false,
      indexAxis: 'y',
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { beginAtZero: true, max: 10, ticks: { stepSize: 2 } },
        y: { ticks: { autoSkip: false, font: { size: 9 } } }
      }
    }
  });
}

// ==========================================
// 3. INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  generarInputsCompetencias();
  
  // Asignar eventos de input a todo
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', renderPreview);
    el.addEventListener('change', renderPreview);
  });

  // Configurar Botonera Compartida
  const camposGuardables = ['fechaInforme','solicitante','nombre','cargoPostulacion','fechaNac','fechaEval','edad','ci','contacto','fortalezasTexto','debilidadesTexto','conclusionTexto'];
  for (let i = 1; i <= TOTAL_COMPETENCIAS; i++) {
    camposGuardables.push(`comp_nombre_${i}`, `comp_obt_${i}`, `comp_max_${i}`);
  }

  if (window.Botonera) {
    window.Botonera.init({
      camposGuardables: camposGuardables,
      camposNoLimpiar: ['consultoria','logoNombre','logoLeyenda','elaboradoPor'],
      camposOrtografia: [
        { id: 'fortalezasTexto', label: 'Fortalezas' },
        { id: 'debilidadesTexto', label: 'Debilidades' },
        { id: 'conclusionTexto', label: 'Conclusión' }
      ],
      nombreArchivoBase: 'Informe_ACE',
      onResetExtra: function() { renderPreview(); },
      onLoadExtra: function() { renderPreview(); }
    });
  }

  cargarFirmaReferencia();
  
  renderPreview();
});

// ==========================================
// 4. CONTRATO DE EXPORTACIÓN (PDF y WORD)
// ==========================================
window.downloadPDF = async function() {
  const btn = document.querySelector('[data-action="pdf"]');
  const status = document.getElementById('status');
  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Elegí "Guardar como PDF" en el diálogo de impresión...';

  const tituloOriginal = document.title;
  const nombre = val('nombre').trim() || 'Candidato';
  document.title = `Informe_ACE_${nombre.replace(/\s+/g, '_')}`;

  const restaurar = function() {
    document.title = tituloOriginal;
    if (btn) btn.disabled = false;
    if (status) status.textContent = '';
    window.removeEventListener('afterprint', restaurar);
  };

  window.addEventListener('afterprint', restaurar);
  setTimeout(function() { window.print(); }, 50);
};

let firmaReferenciaPromise;

function cargarFirmaReferencia(){
  if (!firmaReferenciaPromise) {
    firmaReferenciaPromise = fetch('../sm_consultores/generador_informe_psicotecnico_Grafico.html')
      .then(response => response.ok ? response.text() : Promise.reject(new Error('No se encontró la plantilla de firma')))
      .then(html => {
        const reference = new DOMParser().parseFromString(html, 'text/html');
        const source = reference.querySelector('#out-firmaImg');
        if (!source || !source.getAttribute('src')?.startsWith('data:image/')) return;
        const image = document.getElementById('out-firmaImg');
        image.src = source.getAttribute('src');
        return image.decode().then(() => { image.hidden = false; });
      })
      .catch(() => {});
  }
  return firmaReferenciaPromise;
}

window.downloadWord = async function() {
  const btn = document.querySelector('[data-action="word"]');
  const status = document.getElementById('status');
  if (!btn) return;
  btn.disabled = true;
  if (status) status.textContent = 'Generando Word...';

  try {
    const library = window.docx;
    if (!library) throw new Error('La librería docx no está cargada.');
    await cargarFirmaReferencia();

    const {
      Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
      WidthType, BorderStyle, AlignmentType, VerticalAlign, ShadingType,
      ImageRun, PageBreak
    } = library;
    const nombre = val('nombre').trim() || 'Candidato';
    const teal = '177789';
    const ink = '26343A';
    const light = 'E9ECF6';
    const borderColor = 'D7E2E3';
    const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const bordersNone = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
    const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: borderColor };
    const bordersThin = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
    const textRun = (text, options = {}) => new TextRun({ text: String(text || '-'), font: 'Calibri', size: 20, color: ink, ...options });
    const paragraph = (text, options = {}) => new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 120 },
      children: [textRun(text)],
      ...options
    });

    async function loadImage(path, width) {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
      const image = await createImageBitmap(await response.blob());
      const height = Math.round(width * image.height / image.width);
      const buffer = await response.arrayBuffer();
      image.close();
      return { data: buffer, width, height };
    }

    async function loadHeaderImage() {
      const response = await fetch('img/cabezal.png');
      if (!response.ok) throw new Error('No se pudo cargar img/cabezal.png');
      const source = await createImageBitmap(await response.blob());
      const canvas = document.createElement('canvas');
      canvas.width = source.width;
      canvas.height = source.height;
      const context = canvas.getContext('2d');
      context.drawImage(source, 0, 0);
      const sourceScale = source.width / 1505;
      const textScale = source.width / 605;
      context.fillStyle = '#FFFFFF';
      context.textAlign = 'left';
      context.font = `${14 * textScale}px "Segoe UI", Arial, sans-serif`;
      context.fillText('Informe:', 76 * sourceScale, 125 * sourceScale);
      context.font = `${25 * textScale}px "Segoe UI", Arial, sans-serif`;
      context.fillText('Evaluación de Competencias', 76 * sourceScale, 185 * sourceScale);
      context.fillText('Ejecutivas (A.C.E.)', 76 * sourceScale, 235 * sourceScale);
      context.textAlign = 'right';
      context.font = `italic ${19 * textScale}px Georgia, "Times New Roman", serif`;
      (val('logoNombre') || 'Shalon Morales').trim().split(/\s+/).forEach((line, index) => {
        context.fillText(line, 1470 * sourceScale, (337 + index * 42) * sourceScale);
      });
      context.fillStyle = '#CFE4E6';
      context.font = `${7 * textScale}px "Segoe UI", Arial, sans-serif`;
      context.fillText((val('logoLeyenda') || 'CONSULTORES').toUpperCase(), 1470 * sourceScale, 410 * sourceScale);
      const height = Math.round(600 * source.height / source.width);
      const imageResponse = await fetch(canvas.toDataURL('image/png'));
      const data = await imageResponse.arrayBuffer();
      source.close();
      return { data, width: 600, height };
    }

    function makeCell(text, options = {}) {
      const { fill, align = AlignmentType.LEFT, bold = false, width = 50 } = options;
      return new TableCell({
        width: { size: width, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: fill || 'FFFFFF' },
        margins: { top: 90, bottom: 90, left: 140, right: 140 },
        borders: bordersThin,
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: align, children: [textRun(text, { bold, color: fill === teal ? 'FFFFFF' : ink })] })]
      });
    }

    function sectionBanner(title, icon) {
      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: [
          new TableCell({
            width: { size: 90, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: teal },
            margins: { top: 130, bottom: 130, left: 180, right: 140 },
            borders: bordersNone,
            children: [new Paragraph({ children: [textRun(title, { color: 'FFFFFF', size: 25 })] })]
          }),
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: teal },
            margins: { top: 70, bottom: 70, left: 80, right: 80 },
            borders: bordersNone,
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({
              data: icon.data,
              transformation: { width: icon.width, height: icon.height }
            })] })]
          })
        ]})]
      });
    }

    function valueCell(text) {
      return makeCell(text, { fill: 'F7F8FC', align: AlignmentType.CENTER });
    }

    const headerImage = await loadHeaderImage();
    const tableIcon = await loadImage('img/tabla.png', 28);
    const targetIcon = await loadImage('img/diana.png', 28);
    const graphCanvas = document.getElementById('graficoCompetencias');
    const graphBytes = Uint8Array.from(atob(graphCanvas.toDataURL('image/png').split(',')[1]), char => char.charCodeAt(0));
    const graphImage = new ImageRun({ data: graphBytes, transformation: { width: 550, height: 364 } });
    const dateFormat = fmtDateLong(val('fechaInforme'));
    const evaluationDate = fmtDateLong(val('fechaEval'));
    const competencias = obtenerCompetencias();
    const selectedClassification = document.querySelector('input[name="clasif"]:checked');
    const classification = selectedClassification ? selectedClassification.value : 'RECOMENDABLE CON OBSERVACIÓN';
    const signatureImage = document.getElementById('out-firmaImg');
    const signature = !signatureImage.hidden && signatureImage.naturalWidth
      ? new ImageRun({
          data: Uint8Array.from(atob(signatureImage.src.split(',')[1]), char => char.charCodeAt(0)),
          transformation: { width: 130, height: Math.round(130 * signatureImage.naturalHeight / signatureImage.naturalWidth) }
        })
      : null;

    const header = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new ImageRun({ data: headerImage.data, transformation: { width: headerImage.width, height: headerImage.height } })]
    });
    const metadata = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: [
        new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders: bordersNone, children: [new Paragraph({ children: [textRun('Elaborado por: '), textRun(val('elaboradoPor'), { bold: true })] })] }),
        new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders: bordersNone, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [textRun('Consultoría: '), textRun(val('consultoria'), { bold: true })] })] })
      ]})]
    });
    const dataRows = [new TableRow({ children: [
      makeCell('DATOS', { fill: teal, align: AlignmentType.CENTER, bold: true }),
      makeCell('POSTULANTE', { fill: teal, align: AlignmentType.CENTER, bold: true })
    ]})];
    [
      ['NOMBRE:', val('nombre')],
      ['CARGO POSTULACIÓN:', val('cargoPostulacion')],
      ['FECHA DE NACIMIENTO:', fmtDate(val('fechaNac'))],
      ['EDAD:', val('edad')],
      ['C.I.:', val('ci')],
      ['CONTACTO:', val('contacto')],
      ['FECHA DE EVALUACIÓN:', evaluationDate]
    ].forEach(([label, value]) => dataRows.push(new TableRow({ children: [
      makeCell(label, { fill: light, bold: true }),
      valueCell(value)
    ]})));
    const dataTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: dataRows });

    const competenceRows = [new TableRow({ children: [
      makeCell('COMPETENCIA', { fill: teal, align: AlignmentType.CENTER, bold: true, width: 60 }),
      makeCell('OBTENIDO', { fill: teal, align: AlignmentType.CENTER, bold: true, width: 20 }),
      makeCell('MÁXIMO', { fill: teal, align: AlignmentType.CENTER, bold: true, width: 20 })
    ]})];
    competencias.forEach((competencia, index) => competenceRows.push(new TableRow({ children: [
      makeCell(competencia.nombre, { fill: index % 2 ? 'FFFFFF' : light, width: 60 }),
      valueCell(competencia.obtenido),
      valueCell(competencia.maximo)
    ]})));
    const competenceTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: competenceRows });

    const classificationRows = [new TableRow({ children: [
      makeCell('CLASIFICACIÓN', { fill: teal, align: AlignmentType.CENTER, bold: true, width: 75 }),
      makeCell('RESULTADO', { fill: teal, align: AlignmentType.CENTER, bold: true, width: 25 })
    ]})];
    ['RECOMENDABLE', 'RECOMENDABLE CON OBSERVACIÓN', 'NO RECOMENDABLE'].forEach((label, index) => {
      classificationRows.push(new TableRow({ children: [
        makeCell(label, { fill: index % 2 ? 'FFFFFF' : light, bold: true, width: 75 }),
        makeCell(label === classification ? '✓' : '', { fill: 'F7F8FC', align: AlignmentType.CENTER, bold: true, width: 25 })
      ]}));
    });
    const classificationTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: classificationRows });

    const children = [
      header,
      new Paragraph({ spacing: { after: 130 }, children: [textRun('Fecha: '), textRun(dateFormat, { bold: true, color: teal })] }),
      metadata,
      new Paragraph({ spacing: { before: 180, after: 140 }, alignment: AlignmentType.JUSTIFIED, children: [
        textRun(`A solicitud de ${val('solicitante') || 'la empresa'}, se realizó una evaluación de competencias ejecutivas a ${nombre} para el cargo de ${val('cargoPostulacion') || '-'}.`)
      ]}),
      sectionBanner('Objetivo', tableIcon),
      paragraph('El presente informe presenta los resultados de la Evaluación de Competencias Ejecutivas (A.C.E.), con los niveles obtenidos y esperados en cada competencia, junto con las fortalezas, áreas de mejora y conclusión del perfil evaluado.', { spacing: { before: 120, after: 160 } }),
      dataTable,
      new Paragraph({ children: [new PageBreak()] }),
      sectionBanner('Evaluación de Competencias', targetIcon),
      new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 100, after: 80 }, children: [textRun('Nivel obtenido en relación con el máximo definido para cada competencia.', { color: teal, size: 18 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [graphImage] }),
      competenceTable,
      new Paragraph({ children: [new PageBreak()] }),
      sectionBanner('Fortalezas', targetIcon),
      paragraph(val('fortalezasTexto')),
      sectionBanner('Áreas de mejora', targetIcon),
      paragraph(val('debilidadesTexto')),
      sectionBanner('Conclusión', targetIcon),
      paragraph(val('conclusionTexto')),
      new Paragraph({ spacing: { before: 160 }, children: [textRun(`Informe confidencial para uso exclusivo de ${val('solicitante') || 'la organización solicitante'} y ${val('consultoria') || 'SM Consultores'}.`, { color: '5B6B70', size: 18 })] }),
      classificationTable,
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 160 }, children: signature ? [signature] : [textRun(val('elaboradoPor'), { bold: true, color: teal, size: 24 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun(val('elaboradoPor'), { bold: true, color: teal })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun(val('consultoria'), { color: '5B6B70', size: 18 })] })
    ];

    const doc = new Document({ sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 720, right: 850, bottom: 720, left: 850 } } },
      children
    }] });
    const blob = await Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Informe_ACE_${nombre.replace(/\s+/g, '_')}.docx`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);

    if (status) status.textContent = 'Word descargado.';
  } catch (e) {
    console.error(e);
    if (status) status.textContent = `Error en Word: ${e.message}`;
  } finally {
    if (btn) btn.disabled = false;
    setTimeout(() => { if(status) status.textContent = ''; }, 4000);
  }
};