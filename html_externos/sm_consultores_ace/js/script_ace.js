const DEFAULT_COMPETENCIAS = [
  '6.1 - Liderazgo',
  '6.2 - Capacidad de trabajo en equipo y coordinación',
  '6.3 - Resolución de problemas, toma de decisiones y gestión de conflictos',
  '6.4 - Habilidades de comunicación efectiva y percepción de necesidades de los socios',
  '6.5 - Orientación al cliente, al socio y a resultados',
  '6.6 - Capacidad de negociación',
  '6.7 - Organización, planificación y cumplimiento normativo',
  '6.8 - Gestión eficiente y atención al detalle',
  '6.9 - Iniciativa, proactividad y enfoque comercial',
  '6.10 - Adaptabilidad y gestión del cambio',
  '6.11 - Conocimientos administrativos básicos',
  '6.12 - Manejo de tecnologías de la información básicos',
  '6.13 - Conocimiento de la comunidad, interacción y relacionamiento con actores externos'
];
let chartInstance = null;
let firmaReferenciaPromise;

function fmtDate(iso){
  if(!iso) return '-';
  const [year, month, day] = iso.split('-');
  return year ? `${day}/${month}/${year}` : iso;
}

function fmtDateLong(iso){
  if(!iso) return '-';
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const [year, month, day] = iso.split('-');
  if(!year) return iso;
  return `${parseInt(day, 10)} de ${meses[parseInt(month, 10) - 1]} ${year}`;
}

function val(id){
  const element = document.getElementById(id);
  return element ? element.value.trim() : '';
}

function setText(id, text){
  const element = document.getElementById(id);
  if(element) element.textContent = text && text.trim() ? text : '-';
}

function crearInputCompetencia(datos = {}, index = 1){
  const item = document.createElement('div');
  item.className = 'ace-comp-input';
  item.innerHTML = `
    <div class="ace-comp-heading">
      <label>Competencia ${index}</label>
      <button type="button" class="ace-comp-remove" aria-label="Quitar competencia">Quitar</button>
    </div>
    <input type="text" class="c-nombre" spellcheck="true">
    <div class="row2">
      <div><label>Puntaje obtenido</label><input type="number" class="c-obtenido" min="0" max="5" step="1"></div>
      <div><label>Puntaje máximo</label><input type="number" class="c-maximo" min="1" max="5" step="1"></div>
    </div>
    <label>Descripción de la competencia</label>
    <textarea class="c-descripcion" placeholder="Describe el indicador evaluado" spellcheck="true"></textarea>
  `;
  item.querySelector('.c-nombre').value = datos.nombre || '';
  item.querySelector('.c-obtenido').value = datos.obtenido ?? 0;
  item.querySelector('.c-maximo').value = datos.maximo ?? 3;
  item.querySelector('.c-descripcion').value = datos.descripcion || '';
  return item;
}

function generarInputsCompetencias(competencias = DEFAULT_COMPETENCIAS.map(nombre => ({ nombre, obtenido: 0, maximo: 5, descripcion: '' }))){
  const container = document.getElementById('compContainer');
  container.replaceChildren(...competencias.map((datos, index) => crearInputCompetencia(datos, index + 1)));
  actualizarBotonesCompetencias();
}

function actualizarBotonesCompetencias(){
  const items = document.querySelectorAll('#compContainer .ace-comp-input');
  items.forEach(item => {
    item.querySelector('.ace-comp-remove').disabled = items.length === 1;
  });
}

function obtenerCompetencias(){
  return Array.from(document.querySelectorAll('#compContainer .ace-comp-input')).map((item, index) => ({
    nombre: item.querySelector('.c-nombre').value.trim() || `Competencia ${index + 1}`,
    descripcion: item.querySelector('.c-descripcion').value.trim(),
    obtenido: Number(item.querySelector('.c-obtenido').value) || 0,
    maximo: Number(item.querySelector('.c-maximo').value) || 0
  }));
}

function envolverEtiqueta(texto, anchoMaximo = 15){
  const lineas = [];
  let linea = '';
  texto.split(/\s+/).forEach(palabra => {
    const candidata = linea ? `${linea} ${palabra}` : palabra;
    if(linea && candidata.length > anchoMaximo){
      lineas.push(linea);
      linea = palabra;
    } else {
      linea = candidata;
    }
  });
  if(linea) lineas.push(linea);
  return lineas;
}

function actualizarResumenGrafico(competencias){
  const destino = document.getElementById('out-resumenGrafico');
  const obtenido = competencias.reduce((total, item) => total + item.obtenido, 0);
  const maximo = competencias.reduce((total, item) => total + item.maximo, 0);
  if(!destino) return { obtenido, maximo, porcentaje: 0 };
  const porcentaje = maximo ? Math.round(obtenido / maximo * 100) : 0;
  if(maximo){
    const resultado = document.createElement('strong');
    resultado.textContent = `${obtenido} sobre ${maximo}`;
    destino.replaceChildren(
      document.createTextNode('El resultado final es '),
      resultado,
      document.createTextNode(`, equivalente al ${porcentaje}% del máximo posible.`)
    );
  } else {
    destino.textContent = 'Completa los puntajes máximos para calcular el resultado final.';
  }
  return { obtenido, maximo, porcentaje };
}

function renderClasificacion(){
  const seleccion = document.querySelector('input[name="clasif"]:checked');
  const destinos = {
    'RECOMENDABLE': 'chk-REC',
    'RECOMENDABLE CON OBSERVACIÓN': 'chk-OBS',
    'NO RECOMENDABLE': 'chk-NOREC'
  };
  Object.values(destinos).forEach(id => document.getElementById(id).replaceChildren());
  const target = document.getElementById(destinos[seleccion ? seleccion.value : 'RECOMENDABLE CON OBSERVACIÓN']);
  target.replaceChildren(document.getElementById('checkSvg').content.cloneNode(true));
}

function renderCompetencias(competencias){
  const container = document.getElementById('compOutContainer');
  const fragment = document.createDocumentFragment();
  competencias.forEach(competencia => {
    const row = document.createElement('div');
    row.className = 'comp-summary';
    const details = document.createElement('div');
    details.className = 'comp-summary-details';
    const name = document.createElement('strong');
    name.className = 'comp-summary-name';
    name.textContent = competencia.nombre;
    const description = document.createElement('span');
    description.className = 'comp-summary-description';
    description.textContent = competencia.descripcion || 'Descripción pendiente';
    const score = document.createElement('strong');
    score.className = 'comp-summary-score';
    score.textContent = `${competencia.obtenido} / ${competencia.maximo}`;
    details.append(name, description);
    row.append(details, score);
    fragment.appendChild(row);
  });
  container.replaceChildren(fragment);
}

function dibujarGrafico(competencias){
  if(!window.Chart) return;
  const canvas = document.getElementById('graficoCompetencias');
  if(!canvas) return;
  const maximoPuntaje = Math.max(0.5, ...competencias.map(item => item.maximo));
  const escalaMaxima = Math.ceil(maximoPuntaje * 2) / 2 + 0.5;
  if(chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: competencias.map(item => envolverEtiqueta(item.nombre)),
      datasets: [
        { label: 'Puntaje Obtenido', data: competencias.map(item => item.obtenido), backgroundColor: '#08A8DF', maxBarThickness: 22 },
        { label: 'Puntaje Máximo', data: competencias.map(item => item.maximo), backgroundColor: '#155A78', maxBarThickness: 22 }
      ]
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        title: { display: true, text: 'Competencias', color: '#666', font: { size: 14, weight: 'normal' }, padding: { bottom: 8 } },
        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { autoSkip: false, maxRotation: 0, minRotation: 0, font: { size: 8 } } },
        y: {
          beginAtZero: true,
          max: escalaMaxima,
          ticks: { stepSize: 0.5, font: { size: 9 }, callback: value => String(value).replace('.', ',') }
        }
      }
    },
    plugins: [{
      id: 'aceDataLabels',
      afterDatasetsDraw(chart){
        const { ctx } = chart;
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        chart.data.datasets.forEach((dataset, datasetIndex) => {
          chart.getDatasetMeta(datasetIndex).data.forEach((bar, index) => {
            if(Number(dataset.data[index]) <= 0) return;
            const { x, y, base } = bar.getProps(['x', 'y', 'base'], true);
            ctx.fillText(String(dataset.data[index]), x, y + (base - y) / 2);
          });
        });
        ctx.restore();
      }
    }]
  });
}

function renderPreview(){
  setText('out-fechaInforme', fmtDateLong(val('fechaInforme')));
  setText('out-elaboradoPor', val('elaboradoPor'));
  setText('out-consultoria', val('consultoria'));
  const logoNombre = val('logoNombre') || 'Shalon Morales';
  const logoElement = document.getElementById('out-logoNombre');
  logoElement.textContent = logoNombre.split(/\s+/).join('\n');
  setText('out-logoSub', (val('logoLeyenda') || 'CONSULTORES').toUpperCase());

  const nombre = val('nombre');
  const elaboradoPor = val('elaboradoPor') || 'Lic. Psic. Rita Morales';
  setText('out-nombre', nombre);
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
  const competencias = obtenerCompetencias();
  renderCompetencias(competencias);
  actualizarResumenGrafico(competencias);
  dibujarGrafico(competencias);
}

async function cargarFirmaReferencia(){
  if(!firmaReferenciaPromise){
    firmaReferenciaPromise = fetch('../sm_consultores/generador_informe_psicotecnico_Grafico.html')
      .then(response => response.ok ? response.text() : Promise.reject(new Error('No se encontró la plantilla de firma')))
      .then(html => {
        const reference = new DOMParser().parseFromString(html, 'text/html');
        const source = reference.querySelector('#out-firmaImg');
        const src = source && source.getAttribute('src');
        if(!src || !src.startsWith('data:image/')) return;
        const image = document.getElementById('out-firmaImg');
        image.src = src;
        return image.decode().then(() => { image.hidden = false; });
      })
      .catch(() => {});
  }
  return firmaReferenciaPromise;
}

function inicializar(){
  generarInputsCompetencias();
  const panel = document.getElementById('panel');
  const container = document.getElementById('compContainer');
  panel.addEventListener('input', renderPreview);
  panel.addEventListener('change', renderPreview);
  document.getElementById('addCompBtn').addEventListener('click', () => {
    const number = container.children.length + 1;
    container.appendChild(crearInputCompetencia({ nombre: `Competencia ${number}`, obtenido: 0, maximo: 5 }, number));
    actualizarBotonesCompetencias();
    renderPreview();
  });
  container.addEventListener('click', event => {
    if(!event.target.closest('.ace-comp-remove') || container.children.length <= 1) return;
    event.target.closest('.ace-comp-input').remove();
    actualizarBotonesCompetencias();
    renderPreview();
  });
  const camposGuardables = [
    'fechaInforme','solicitante','nombre','cargoPostulacion','fechaNac','fechaEval','edad','ci','contacto',
    'fortalezasTexto','debilidadesTexto','conclusionTexto'
  ];
  if(window.Botonera){
    window.Botonera.init({
      camposGuardables,
      camposNoLimpiar: ['consultoria','logoNombre','logoLeyenda','elaboradoPor'],
      camposOrtografia: [
        { id: 'fortalezasTexto', label: 'Fortalezas' },
        { id: 'debilidadesTexto', label: 'Áreas de mejora' },
        { id: 'conclusionTexto', label: 'Conclusión' }
      ],
      nombreArchivoBase: 'Informe_ACE',
      onResetExtra: () => {
        generarInputsCompetencias();
        renderPreview();
      },
      onLoadExtra: data => {
        const competencias = Array.isArray(data.competencias)
          ? data.competencias
          : DEFAULT_COMPETENCIAS.map((nombre, index) => ({
              nombre: data[`comp_nombre_${index + 1}`] || nombre,
              obtenido: data[`comp_obt_${index + 1}`] ?? 0,
              maximo: data[`comp_max_${index + 1}`] ?? 5,
              descripcion: ''
            }));
        generarInputsCompetencias(competencias);
        renderPreview();
      },
      onSaveExtra: data => {
        data.competencias = obtenerCompetencias();
      }
    });
  }
  cargarFirmaReferencia().then(renderPreview);
  renderPreview();
}

document.addEventListener('DOMContentLoaded', inicializar);

window.downloadPDF = async function(){
  const button = document.querySelector('[data-action="pdf"]');
  const status = document.getElementById('status');
  if(button) button.disabled = true;
  if(status) status.textContent = 'Elegí "Guardar como PDF" en el diálogo de impresión...';
  await cargarFirmaReferencia();
  const originalTitle = document.title;
  const nombre = val('nombre') || 'Candidato';
  document.title = `Informe_ACE_${nombre.replace(/\s+/g, '_')}`;
  const restore = function(){
    document.title = originalTitle;
    if(button) button.disabled = false;
    if(status) status.textContent = '';
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);
  setTimeout(() => window.print(), 50);
};

window.downloadWord = async function(){
  const button = document.querySelector('[data-action="word"]');
  const status = document.getElementById('status');
  if(!button) return;
  button.disabled = true;
  if(status) status.textContent = 'Generando Word...';

  try{
    const docx = window.docx;
    if(!docx) throw new Error('La librería docx no está cargada.');
    await cargarFirmaReferencia();
    const {
      Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
      WidthType, BorderStyle, AlignmentType, VerticalAlign, ShadingType, ImageRun, PageBreak
    } = docx;
    const teal = '177789';
    const ink = '26343A';
    const light = 'E9ECF6';
    const borderColor = 'D7E2E3';
    const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const bordersNone = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
    const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: borderColor };
    const bordersThin = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
    const textRun = (text, options = {}) => new TextRun({ text: String(text == null || text === '' ? '-' : text), font: 'Calibri', size: 20, color: ink, ...options });
    const paragraph = (text, options = {}) => new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 120 },
      children: [textRun(text)],
      ...options
    });

    async function loadImage(path, width){
      const response = await fetch(path);
      if(!response.ok) throw new Error(`No se pudo cargar ${path}`);
      const blob = await response.blob();
      const image = await createImageBitmap(blob);
      const height = Math.round(width * image.height / image.width);
      const data = await blob.arrayBuffer();
      image.close();
      return { data, width, height };
    }

    async function loadHeaderImage(){
      const response = await fetch('img/cabezal.png');
      if(!response.ok) throw new Error('No se pudo cargar img/cabezal.png');
      const source = await createImageBitmap(await response.blob());
      const canvas = document.createElement('canvas');
      canvas.width = source.width;
      canvas.height = source.height;
      const context = canvas.getContext('2d');
      context.drawImage(source, 0, 0);
      const scale = source.width / 1505;
      const textScale = source.width / 605;
      context.fillStyle = '#FFFFFF';
      context.textAlign = 'left';
      context.font = `${14 * textScale}px Segoe UI, Arial, sans-serif`;
      context.fillText('Informe:', 76 * scale, 125 * scale);
      context.font = `${25 * textScale}px Segoe UI, Arial, sans-serif`;
      context.fillText('Evaluación de Competencias', 76 * scale, 185 * scale);
      context.fillText('Ejecutivas (A.C.E.)', 76 * scale, 235 * scale);
      context.textAlign = 'right';
      context.font = `italic ${19 * textScale}px Georgia, Times New Roman, serif`;
      (val('logoNombre') || 'Shalon Morales').split(/\s+/).forEach((line, index) => {
        context.fillText(line, 1470 * scale, (337 + index * 42) * scale);
      });
      context.fillStyle = '#CFE4E6';
      context.font = `${7 * textScale}px Segoe UI, Arial, sans-serif`;
      context.fillText((val('logoLeyenda') || 'CONSULTORES').toUpperCase(), 1470 * scale, 410 * scale);
      const height = Math.round(560 * source.height / source.width);
      source.close();
      const data = await (await fetch(canvas.toDataURL('image/png'))).arrayBuffer();
      return { data, width: 560, height };
    }

    function makeCell(text, options = {}){
      const { fill = 'FFFFFF', align = AlignmentType.LEFT, bold = false, width = 50 } = options;
      return new TableCell({
        width: { size: width, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill },
        margins: { top: 90, bottom: 90, left: 140, right: 140 },
        borders: bordersThin,
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: align, children: [textRun(text, { bold, color: fill === teal ? 'FFFFFF' : ink })] })]
      });
    }

    function sectionBanner(title, icon){
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
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ data: icon.data, transformation: { width: icon.width, height: icon.height } })] })]
          })
        ]})]
      });
    }

    const nombre = val('nombre') || 'Candidato';
    const competencias = obtenerCompetencias();
    const summary = actualizarResumenGrafico(competencias);
    const chartCanvas = document.getElementById('graficoCompetencias');
    const graphBytes = Uint8Array.from(atob(chartCanvas.toDataURL('image/png').split(',')[1]), char => char.charCodeAt(0));
    const headerImage = await loadHeaderImage();
    const tableIcon = await loadImage('img/tabla.png', 28);
    const targetIcon = await loadImage('img/diana.png', 28);
    const signatureImage = document.getElementById('out-firmaImg');
    let signatureRun = null;
    if(!signatureImage.hidden && signatureImage.naturalWidth){
      const signatureResponse = await fetch(signatureImage.src);
      const signatureBytes = await signatureResponse.arrayBuffer();
      signatureRun = new ImageRun({
        data: signatureBytes,
        transformation: { width: 130, height: Math.round(130 * signatureImage.naturalHeight / signatureImage.naturalWidth) }
      });
    }

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
      ['FECHA DE EVALUACIÓN:', fmtDateLong(val('fechaEval'))]
    ].forEach(([label, value]) => dataRows.push(new TableRow({ children: [makeCell(label, { fill: light, bold: true }), makeCell(value, { fill: 'F7F8FC', align: AlignmentType.CENTER })] })));
    const dataTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: dataRows });

    const competenceRows = [new TableRow({ children: [
      makeCell('COMPETENCIA / DESCRIPCIÓN', { fill: teal, align: AlignmentType.CENTER, bold: true, width: 60 }),
      makeCell('OBTENIDO', { fill: teal, align: AlignmentType.CENTER, bold: true, width: 20 }),
      makeCell('MÁXIMO', { fill: teal, align: AlignmentType.CENTER, bold: true, width: 20 })
    ]})];
    competencias.forEach((competencia, index) => {
      const fill = index % 2 ? 'FFFFFF' : light;
      const detailCell = new TableCell({
        width: { size: 60, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill },
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
        borders: bordersThin,
        children: [
          new Paragraph({ spacing: { after: 30 }, children: [textRun(competencia.nombre, { bold: true })] }),
          new Paragraph({ children: [textRun(competencia.descripcion || 'Descripción pendiente', { color: '5B6B70', size: 17 })] })
        ]
      });
      competenceRows.push(new TableRow({ children: [detailCell, makeCell(competencia.obtenido, { fill: 'F7F8FC', align: AlignmentType.CENTER, width: 20 }), makeCell(competencia.maximo, { fill: 'F7F8FC', align: AlignmentType.CENTER, width: 20 })] }));
    });
    const competenceTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: competenceRows });

    const selectedClassification = document.querySelector('input[name="clasif"]:checked');
    const classification = selectedClassification ? selectedClassification.value : 'RECOMENDABLE CON OBSERVACIÓN';
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
    const graphImage = new ImageRun({ data: graphBytes, transformation: { width: 550, height: 279 } });

    const children = [
      header,
      new Paragraph({ spacing: { after: 130 }, children: [textRun('Fecha: '), textRun(fmtDateLong(val('fechaInforme')), { bold: true, color: teal })] }),
      metadata,
      dataTable,
      paragraph(`A solicitud de ${val('solicitante') || 'la empresa'}, se realizó una evaluación de competencias ejecutivas a ${nombre} para el cargo de ${val('cargoPostulacion') || '-'}.`),
      sectionBanner('Objetivo', tableIcon),
      paragraph('El presente informe presenta los resultados de la Evaluación de Competencias Ejecutivas (A.C.E.), con los niveles obtenidos y esperados en cada competencia, junto con las fortalezas, áreas de mejora y conclusión del perfil evaluado.'),
      new Paragraph({ children: [new PageBreak()] }),
      sectionBanner('Gráfica Competencias y habilidades', targetIcon),
      new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 80, after: 60 }, children: [textRun('Puntaje obtenido en relación con el puntaje máximo de cada competencia.', { color: teal, size: 18 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [graphImage] }),
      paragraph(`El resultado final es ${summary.obtenido} sobre ${summary.maximo}, equivalente al ${summary.porcentaje}% del máximo posible.`, { alignment: AlignmentType.LEFT }),
      competenceTable,
      new Paragraph({ children: [new PageBreak()] }),
      sectionBanner('Fortalezas', targetIcon),
      paragraph(val('fortalezasTexto')),
      sectionBanner('Áreas de mejora', targetIcon),
      paragraph(val('debilidadesTexto')),
      sectionBanner('Conclusión', targetIcon),
      paragraph(val('conclusionTexto')),
      new Paragraph({ spacing: { before: 140 }, children: [textRun(`Informe confidencial para uso exclusivo de ${val('solicitante') || 'la organización solicitante'} y ${val('consultoria') || 'SM Consultores'}.`, { color: '5B6B70', size: 18 })] }),
      classificationTable,
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 140 }, children: signatureRun ? [signatureRun] : [textRun(val('elaboradoPor'), { bold: true, color: teal, size: 24 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun(val('elaboradoPor'), { bold: true, color: teal })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [textRun(val('consultoria'), { color: '5B6B70', size: 18 })] })
    ];

    const documentFile = new Document({ sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 720, right: 850, bottom: 720, left: 850 } } },
      children
    }] });
    const blob = await Packer.toBlob(documentFile);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Informe_ACE_${nombre.replace(/\s+/g, '_')}.docx`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    if(status) status.textContent = 'Word descargado.';
  } catch(error){
    console.error(error);
    if(status) status.textContent = `Error en Word: ${error.message}`;
  } finally {
    if(button) button.disabled = false;
    setTimeout(() => { if(status) status.textContent = ''; }, 4000);
  }
};
