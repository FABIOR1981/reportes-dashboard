// Escapar texto para uso seguro dentro de atributos/markup SVG (el archivo
// original no tenía esta función; se agrega acá porque el gráfico arma su
// propio innerHTML con los nombres de las competencias).
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Datos por defecto de competencias (esqueleto extraído del ejemplo) ----------
const defaultComps = [
  {nombre:"Adaptabilidad", puntaje:3, maximo:5, desc:"Se adaptará a las dinámicas de la Empresa de manera aceptable."},
  {nombre:"Responsabilidad y compromiso", puntaje:4, maximo:5, desc:"Demuestra ser responsable con tareas específicas y bien definidas."},
  {nombre:"Capacidad Resolutiva", puntaje:4, maximo:5, desc:"Debido a su experiencia, la postulante cuenta con buenos indicadores para adaptar estrategias y resolver tareas ante situaciones imprevistas."},
  {nombre:"Adhesión a las normas", puntaje:3, maximo:5, desc:"Aceptable en lo que refiere a las normas establecidas por la Empresa, siempre y cuando las mismas estén alineadas con sus valores."},
  {nombre:"Proactividad", puntaje:3, maximo:5, desc:"Presenta una actitud dinámica, y en ocasiones poco eficiente al actuar de manera más reactiva que analítica."}
];

const compContainer = document.getElementById('compContainer');

function addCompBlock(data){
  data = data || {nombre:"", puntaje:3, maximo:5, desc:""};
  const div = document.createElement('div');
  div.className = 'comp-block';
  div.innerHTML = `
    <button type="button" class="del-btn">✕ quitar</button>
    <label>Nombre de la competencia</label>
    <input type="text" class="c-nombre" spellcheck="true" value="${data.nombre}">
    <div class="row2">
      <div><label>Puntaje obtenido</label><input type="number" class="c-puntaje" min="1" max="5" value="${data.puntaje}"></div>
      <div><label>Puntaje máximo</label><input type="number" class="c-maximo" min="1" max="10" value="${data.maximo}"></div>
    </div>
    <label>Descripción</label>
    <textarea class="c-desc" spellcheck="true">${data.desc}</textarea>
  `;
  div.querySelector('.del-btn').addEventListener('click', () => { div.remove(); renderPreview(); });
  div.querySelectorAll('input, textarea').forEach(el => el.addEventListener('input', renderPreview));
  compContainer.appendChild(div);
}

defaultComps.forEach(addCompBlock);
renderPreview();
document.getElementById('addCompBtn').addEventListener('click', () => { addCompBlock(); renderPreview(); });

// ---------- Helpers de formato ----------
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
function val(id){ return document.getElementById(id).value; }
function setText(id, text){ document.getElementById(id).textContent = text && text.trim() !== '' ? text : '-'; }

// ---------- Render de la vista previa ----------
function renderPreview(){
  setText('out-fechaInforme', fmtDateLong(val('fechaInforme')));
  setText('out-elaboradoPor', val('elaboradoPor'));
  setText('out-consultoria', val('consultoria'));

  // logo de marca: nombre (partido en 2 líneas por palabra) + leyenda
  const logoNombreVal = (val('logoNombre') || 'Shalon Morales').trim();
  const logoWords = logoNombreVal.split(' ');
  const logoHtml = logoWords.length > 1
    ? logoWords.join('<br>')
    : logoNombreVal;
  document.getElementById('out-logoNombre').innerHTML = logoHtml;
  setText('out-logoSub', (val('logoLeyenda') || 'CONSULTORES').toUpperCase());

  const nombre = val('nombre');
  setText('out-nombre', nombre);
  setText('out-nombre2', nombre);
  setText('out-cargoPostulacion', val('cargoPostulacion'));
  setText('out-fechaNac', fmtDate(val('fechaNac')));
  setText('out-edad', val('edad'));
  setText('out-ci', val('ci'));
  setText('out-contacto', val('contacto'));
  const horaTxt = val('horaEval') ? ` / Hora: ${val('horaEval')}` : '';
  setText('out-fechaHoraEval', (val('fechaEval') ? fmtDateLong(val('fechaEval')) : '-') + horaTxt);
  setText('out-solicitante', val('solicitante'));
  setText('out-cargoEvaluado', '"' + (val('cargoEvaluado') || '-') + '"');

  setText('out-enfoqueTexto', val('enfoqueTexto'));
  setText('out-conclusionTexto', val('conclusionTexto'));
  setText('out-oportunidadTexto', val('oportunidadTexto'));

  // clasificación (checkmark SVG en la fila correspondiente)
  const clasifElPreview = document.querySelector('input[name=clasif]:checked');
  const clasif = clasifElPreview ? clasifElPreview.value : '';
  const checkSvgHTML = document.getElementById('checkSvg').innerHTML;
  document.getElementById('chk-REC').innerHTML = clasif === 'RECOMENDABLE' ? checkSvgHTML : '';
  document.getElementById('chk-OBS').innerHTML = clasif === 'RECOMENDABLE CON OBSERVACIÓN' ? checkSvgHTML : '';
  document.getElementById('chk-NOREC').innerHTML = clasif === 'NO RECOMENDABLE' ? checkSvgHTML : '';

  // competencias -> página 2
  const compOut = document.getElementById('compOutContainer');
  compOut.innerHTML = '';
  const graficables = []; // { nombre, puntaje, maximo } solo de las que tienen máximo > 0
  compContainer.querySelectorAll('.comp-block').forEach(block => {
    const nombreCRaw = block.querySelector('.c-nombre').value.trim();
    const puntajeRaw = block.querySelector('.c-puntaje').value.trim();
    const maximoRaw = block.querySelector('.c-maximo').value.trim();
    const nombreC = nombreCRaw || '(sin nombre)';
    const puntaje = puntajeRaw || '-';
    const maximo = maximoRaw || '-';
    const desc = block.querySelector('.c-desc').value || '';
    const item = document.createElement('div');
    item.className = 'comp-item';
    item.innerHTML = `
      <div class="comp-name">${nombreC}</div>
      <div class="comp-scores"><b>Puntaje obtenido:</b> ${puntaje} &nbsp; <b>Puntaje máximo:</b> ${maximo}</div>
      <div class="comp-desc">${desc}</div>
    `;
    compOut.appendChild(item);

    // Solo entra al gráfico si tiene nombre y un máximo válido (> 0) para poder sacar %
    const puntajeNum = parseFloat(puntajeRaw) || 0;
    const maximoNum = parseFloat(maximoRaw) || 0;
    if (nombreCRaw && maximoNum > 0) {
      graficables.push({ nombre: nombreCRaw, puntaje: puntajeNum, maximo: maximoNum });
    }
  });
  renderGraficoCompetencias(graficables);
}

/**
 * Dibuja un gráfico de aros de progreso (SVG puro, sin librerías externas)
 * con el % logrado de cada competencia graficable (las que tienen "puntaje
 * máximo" > 0, expresado como 0-100%). Un aro por competencia, en fila,
 * mismo semáforo de colores que el resto del proyecto (verde ≥70%, bronce
 * 40-69%, rojo <40%). Si no hay ninguna graficable, oculta el contenedor y
 * no dibuja nada.
 */
function renderGraficoCompetencias(datos) {
  const cont = document.getElementById('graficoCompetenciasContainer');
  if (!cont) return;

  if (!datos || datos.length === 0) {
    cont.style.display = 'none';
    cont.innerHTML = '';
    return;
  }

  const porAro = 110;      // ancho asignado a cada aro dentro de la fila
  const r = 38;             // radio del aro
  const grosor = 10;        // grosor del trazo del aro
  const cy = 55;             // centro vertical de los aros
  const altoTotal = 150;
  const anchoTotal = datos.length * porAro;
  const circunferencia = 2 * Math.PI * r;

  let aros = '';
  datos.forEach(function(d, i) {
    const pct = Math.max(0, Math.min(100, (d.puntaje / d.maximo) * 100));
    const cx = porAro * i + porAro / 2;
    const largoValor = (circunferencia * pct / 100).toFixed(1);
    const color = pct >= 70 ? '#3f6b52' : (pct >= 40 ? '#b6863f' : '#c1503f');
    const lineas = wrapLabel(d.nombre, 13, 2);

    let etiquetaSvg = '';
    lineas.forEach(function(linea, j) {
      etiquetaSvg += `<text x="${cx}" y="${cy + r + 17 + j * 13}" text-anchor="middle" font-size="10.5" font-family="Segoe UI, Arial, sans-serif" fill="#555">${escapeHTML(linea)}</text>`;
    });

    aros += `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="${grosor}"></circle>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${grosor}" stroke-linecap="round" stroke-dasharray="${largoValor} 1000" transform="rotate(-90 ${cx} ${cy})"></circle>
      <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="15" font-family="Segoe UI, Arial, sans-serif" fill="#333">${Math.round(pct)}%</text>
      ${etiquetaSvg}
    `;
  });

  cont.innerHTML = `
    <svg viewBox="0 0 ${anchoTotal} ${altoTotal}" width="${anchoTotal}" height="${altoTotal}" style="width:100%;height:auto;display:block;" xmlns="http://www.w3.org/2000/svg">
      ${aros}
    </svg>
  `;
  cont.style.display = 'block';
}

/**
 * Corta el nombre de una competencia en hasta "maxLineas" líneas de como
 * mucho "maxCharsPorLinea" caracteres cada una (para que entre debajo del
 * aro sin desbordar). Si sobra texto, la última línea termina en "…". Es
 * solo estético — el nombre completo sigue visible arriba, en el bloque
 * de texto de "Competencias evaluadas".
 */
function wrapLabel(nombre, maxCharsPorLinea, maxLineas) {
  const palabras = (nombre || '').trim().split(/\s+/);
  const lineas = [];
  let actual = '';
  for (const palabra of palabras) {
    const prueba = actual ? actual + ' ' + palabra : palabra;
    if (prueba.length <= maxCharsPorLinea || !actual) {
      actual = prueba;
    } else {
      lineas.push(actual);
      actual = palabra;
      if (lineas.length === maxLineas) break;
    }
  }
  if (lineas.length < maxLineas && actual) lineas.push(actual);

  const totalUsado = lineas.join(' ').length;
  if (totalUsado < nombre.trim().length && lineas.length > 0) {
    let ultima = lineas[lineas.length - 1].replace(/…$/, '');
    if (ultima.length > maxCharsPorLinea - 1) ultima = ultima.slice(0, maxCharsPorLinea - 1);
    lineas[lineas.length - 1] = ultima + '…';
  }
  return lineas.slice(0, maxLineas);
}

/**
 * Convierte el SVG del gráfico de competencias (ya dibujado en pantalla) a un
 * PNG en memoria, para poder insertarlo en el Word con docx.ImageRun (el
 * gráfico es SVG y docx no soporta SVG directamente, solo imágenes
 * rasterizadas). Devuelve null si no hay gráfico visible (sin competencias
 * graficables) — en ese caso el Word simplemente no incluye imagen, igual
 * que el PDF no la incluiría (el PDF captura la vista previa tal cual está).
 */
async function generarImagenGraficoParaWord() {
  const cont = document.getElementById('graficoCompetenciasContainer');
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

document.querySelectorAll('#panel input, #panel textarea').forEach(el => {
  el.addEventListener('input', renderPreview);
  el.addEventListener('change', renderPreview);
});
document.querySelectorAll('input[name=clasif]').forEach(el => el.addEventListener('change', renderPreview));


const cabezalFieldIds = ['consultoria', 'elaboradoPor', 'logoNombre', 'logoLeyenda'];
document.getElementById('editCabezal').addEventListener('change', (e) => {
  const unlocked = e.target.checked;
  cabezalFieldIds.forEach(id => {
    document.getElementById(id).readOnly = !unlocked;
  });
});



// ---------- Descargar PDF ----------
window.downloadPDF = function() {
  const status = document.getElementById('status');
  const btn = document.querySelector('[data-action="pdf"]');
  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Elegí "Guardar como PDF" en el diálogo de impresión...';

  // MIGRADO de html2canvas+jsPDF a window.print() nativo del navegador.
  // El método anterior le sacaba una "foto" (rasterizada) a la vista
  // previa, y esa aproximación arrastraba tres bugs distintos con la
  // misma raíz: texto más chico que en el Word (aproximación de fuente),
  // letras pisadas tipo "Cargα" en vez de "Cargo:" (aproximación de
  // kerning), y el gráfico de competencias cortado en el borde de la
  // página (aproximación de cómo se escala un SVG). window.print() usa el
  // mismo motor que ya dibuja la vista previa en pantalla — sin
  // aproximaciones — así que el resultado sale idéntico al Word: texto
  // vectorial real, kerning correcto, SVG escalado correctamente. El CSS
  // de la sección "@media print" (en style_psicotecnico_Grafico.css) es
  // el que define qué se ve en el PDF resultante (oculta el panel del
  // formulario, muestra solo las 3 páginas, un salto de página por cada
  // una, fuerza que se impriman los colores de fondo).
  const nombreArchivo = (val('nombre') || 'postulante').trim().replace(/\s+/g,'_');
  const tituloOriginal = document.title;
  // El navegador usa el <title> de la página como nombre sugerido en el
  // diálogo de "Guardar como PDF" — lo dejamos armado con el mismo nombre
  // que usaba el método anterior, para no perder esa comodidad.
  document.title = `INFORME_EVALUACION_PSICOTECNICA_${nombreArchivo}`;

  const restaurar = function() {
    document.title = tituloOriginal;
    if (btn) btn.disabled = false;
    if (status) status.textContent = '';
    window.removeEventListener('afterprint', restaurar);
  };
  // "afterprint" se dispara al cerrar el diálogo, se haya guardado el PDF
  // o cancelado — es el momento correcto para restaurar todo, en vez de
  // adivinar con un setTimeout fijo.
  window.addEventListener('afterprint', restaurar);

  // Pequeño respiro para que el navegador termine de aplicar el <title>
  // nuevo antes de abrir el diálogo (en algunos navegadores, si se llama
  // a print() en el mismo tick, el diálogo alcanza a abrirse todavía con
  // el título viejo).
  setTimeout(function(){ window.print(); }, 50);
};

// ============================================================
//  EXPORTACIÓN A WORD (.docx) – SM Consultores
//  Diseño fiel a la vista previa del informe psicotécnico
//  Agregar al final de script.js
// ============================================================

window.downloadWord = async function() {
  const btn = document.querySelector('[data-action="word"]');
  const status = document.getElementById('status');
  if (!btn) return;
  // IMPORTANTE: no usar btn.textContent para mostrar "Generando..." dentro del botón.
  // El botón contiene un <span class="tooltip"> interno; asignar textContent lo
  // reemplaza por un único nodo de texto plano y el tooltip desaparece para siempre.
  // El feedback de progreso se muestra en el panel #status en su lugar.
  btn.disabled = true;
  if (status) status.textContent = 'Generando Word, por favor espera...';

  try {
    const docx = window.docx;
    if (!docx) {
      alert('La librería docx no está cargada. Verificá la etiqueta <script> en el HTML.');
      return;
    }
    const {
      Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
      WidthType, BorderStyle, AlignmentType, VerticalAlign, ShadingType,
      ImageRun, PageBreak
    } = docx;

    // ---------- Helpers ----------
    const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    function fmtDateLong(iso) {
      if (!iso) return '-';
      const [y, m, d] = iso.split('-');
      if (!y) return iso;
      return `${parseInt(d)} de ${meses[parseInt(m)-1]} de ${y}`;
    }
    function fmtDate(iso) {
      if (!iso) return '-';
      const [y, m, d] = iso.split('-');
      if (!y) return iso;
      return `${d}/${m}/${y}`;
    }
    function v(id) {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }

    async function getHeaderImageData(logoNombre, logoLeyenda) {
      const outputWidth = 605;
      const response = await fetch('img/cabezal.png');
      if (!response.ok) throw new Error('No se pudo cargar img/cabezal.png');
      const source = await createImageBitmap(await response.blob());
      const canvas = document.createElement('canvas');
      canvas.width = source.width;
      canvas.height = source.height;
      const context = canvas.getContext('2d');
      context.drawImage(source, 0, 0);

      const sourceScale = source.width / 1505;
      const textScale = source.width / outputWidth;
      context.fillStyle = '#FFFFFF';
      context.textAlign = 'left';
      context.font = `${14 * textScale}px "Segoe UI", Arial, sans-serif`;
      context.fillText('Informe:', 76 * sourceScale, 125 * sourceScale);
      context.font = `${25 * textScale}px "Segoe UI", Arial, sans-serif`;
      context.fillText('Resultados de Evaluación', 76 * sourceScale, 185 * sourceScale);
      context.fillText('Psicotécnica', 76 * sourceScale, 235 * sourceScale);

      context.textAlign = 'right';
      context.font = `italic ${19 * textScale}px Georgia, "Times New Roman", serif`;
      const logoLines = (logoNombre || 'Shalon Morales').split(/\s+/);
      logoLines.forEach((line, index) => {
        context.fillText(line, 1470 * sourceScale, (337 + index * 42) * sourceScale);
      });
      context.fillStyle = '#CFE4E6';
      context.font = `${7 * textScale}px "Segoe UI", Arial, sans-serif`;
      context.fillText((logoLeyenda || 'CONSULTORES').toUpperCase(), 1470 * sourceScale, 410 * sourceScale);

      const sourceWidth = source.width;
      const sourceHeight = source.height;
      source.close();
      const imageResponse = await fetch(canvas.toDataURL('image/png'));
      return {
        buf: await imageResponse.arrayBuffer(),
        w: outputWidth,
        h: Math.round(outputWidth * sourceHeight / sourceWidth)
      };
    }

    // ---------- Colores ----------
    const TEAL    = '177789';
    const TEAL_LT = '2c8a8a';
    const WHITE   = 'FFFFFF';
    const INK     = '2C3E50';
    const GRAY    = '5D6D7E';
    const GRAY_BG = 'f0f4f8';
    const BORDER  = 'd0d7de';

    function noBorders() {
      const n = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
      return { top: n, bottom: n, left: n, right: n };
    }
    function thinBorders(color) {
      const b = { style: BorderStyle.SINGLE, size: 4, color: color || BORDER };
      return { top: b, bottom: b, left: b, right: b };
    }

    // ---------- Imágenes del DOM ----------
    async function getImageData(selector, maxW) {
      const el = document.querySelector(selector);
      if (!el || !el.src) return null;
      try {
        const img = new Image();
        img.src = el.src;
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
        const ratio = img.height / img.width;
        const w = Math.min(img.width, maxW);
        const h = Math.round(w * ratio);
        const resp = await fetch(el.src);
        const buf = await resp.arrayBuffer();
        return { buf, w, h };
      } catch (e) { return null; }
    }

    async function getStaticImageData(path, width) {
      const response = await fetch(path);
      if (!response.ok) throw new Error('No se pudo cargar ' + path);
      const blob = await response.blob();
      const image = await createImageBitmap(blob);
      const height = Math.round(width * image.height / image.width);
      const buffer = await blob.arrayBuffer();
      image.close();
      return { buf: buffer, w: width, h: height };
    }

    // ---------- Datos del formulario ----------
    const fechaInforme     = v('fechaInforme');
    const elaboradoPor     = v('elaboradoPor');
    const consultoria      = v('consultoria');
    const logoNombre       = v('logoNombre') || 'Shalon Morales';
    const logoLeyenda      = v('logoLeyenda') || 'CONSULTORES';
    const nombre           = v('nombre');
    const cargoPostulacion = v('cargoPostulacion');
    const fechaNac         = v('fechaNac');
    const edad             = v('edad');
    const ci               = v('ci');
    const contacto         = v('contacto');
    const fechaEval        = v('fechaEval');
    const horaEval         = v('horaEval');
    const solicitante      = v('solicitante');
    const cargoEvaluado    = v('cargoEvaluado');
    const enfoqueTexto     = v('enfoqueTexto');
    const conclusionTexto  = v('conclusionTexto');
    const oportunidadTexto = v('oportunidadTexto');

    const headerImg = await getHeaderImageData(logoNombre, logoLeyenda);
    const firmaImg  = await getImageData('#out-firmaImg', 140);
    const tablaImg  = await getStaticImageData('img/tabla.png', 60);
    const dianaImg  = await getStaticImageData('img/diana.png', 60);

    let fechaHoraEval = fmtDateLong(fechaEval);
    if (horaEval) fechaHoraEval += ` / Hora: ${horaEval}`;

    const clasifEl = document.querySelector('input[name="clasif"]:checked');
    const clasif = clasifEl ? clasifEl.value : 'RECOMENDABLE';

    // Competencias
    const compBlocks = document.querySelectorAll('#compContainer .comp-block');
    const competencias = [];
    compBlocks.forEach(block => {
      const n = block.querySelector('.c-nombre');
      const p = block.querySelector('.c-puntaje');
      const m = block.querySelector('.c-maximo');
      const d = block.querySelector('.c-desc');
      competencias.push({
        nombre: n ? n.value.trim() : '',
        puntaje: p ? p.value.trim() : '',
        maximo: m ? m.value.trim() : '',
        desc: d ? d.value.trim() : ''
      });
    });

    // ---------- Construcción del documento ----------

    // 1. HEADER BANNER
    const bannerImage = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new ImageRun({
        data: headerImg.buf,
        transformation: { width: headerImg.w, height: headerImg.h }
      })]
    });

    // 2. Logo + Fecha
    const logoParagraphs = [new Paragraph({ spacing: { after: 60 }, children: [
        new TextRun({ text: 'Fecha: ', color: INK, size: 20, font: 'Calibri' }),
        new TextRun({ text: fmtDateLong(fechaInforme), bold: true, color: TEAL, size: 20, font: 'Calibri' })
      ]})];

    // 3. Línea separadora
    const separator = new Paragraph({
      spacing: { before: 60, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER, space: 4 } },
      children: [new TextRun({ text: '\u00A0' })]
    });

    // 4. Elaborado por / Consultoría
    const metaRow = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: noBorders(),
          children: [new Paragraph({ children: [
            new TextRun({ text: 'Elaborado por: ', color: INK, size: 19, font: 'Calibri' }),
            new TextRun({ text: elaboradoPor || '–', bold: true, color: INK, size: 19, font: 'Calibri' })
          ]})]
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: noBorders(),
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
            new TextRun({ text: 'Consultoría: ', color: INK, size: 19, font: 'Calibri' }),
            new TextRun({ text: consultoria || '–', bold: true, color: INK, size: 19, font: 'Calibri' })
          ]})]
        })
      ]})]
    });

    // 5. Tabla DATOS / POSTULANTE
    function dataCell(label, value, isLabel) {
      return new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: isLabel ? GRAY_BG : WHITE },
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        borders: thinBorders(),
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          alignment: isLabel ? AlignmentType.LEFT : AlignmentType.CENTER,
          children: [
            new TextRun({ text: isLabel ? label : (value || '–'), bold: isLabel, color: isLabel ? INK : INK, size: 19, font: 'Calibri' })
          ]
        })]
      });
    }

    const datosRows = [
      new TableRow({ children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: TEAL },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          borders: thinBorders(),
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: 'DATOS', bold: true, color: WHITE, size: 20, font: 'Calibri' })
          ]})]
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: TEAL },
          margins: { top: 100, bottom: 100, left: 160, right: 160 },
          borders: thinBorders(),
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: 'POSTULANTE', bold: true, color: WHITE, size: 20, font: 'Calibri' })
          ]})]
        })
      ]})
    ];
    [
      ['NOMBRE', nombre],
      ['CARGO POSTULACIÓN:', cargoPostulacion],
      ['FECHA DE NAC:', fmtDate(fechaNac)],
      ['EDAD', edad],
      ['C.I.', ci],
      ['CONTACTO.', contacto],
      ['FECHA DE EVALUACIÓN:', fechaHoraEval]
    ].forEach(([label, value]) => {
      datosRows.push(new TableRow({ children: [
        dataCell(label, null, true),
        dataCell(null, value, false)
      ]}));
    });

    const datosTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: datosRows
    });

    // 6. Texto introductorio (solo "A solicitud de..." — va ANTES del
    // banner "Objetivo", igual que en la vista previa/HTML: <div
    // class="intro-text"> está antes de <div class="section-title-row">
    // "Objetivo").
    const introParagraphs = [
      new Paragraph({ spacing: { before: 240, after: 160 }, alignment: AlignmentType.JUSTIFIED, children: [
        new TextRun({ text: 'A solicitud de ', color: INK, size: 21, font: 'Calibri' }),
        new TextRun({ text: solicitante || 'la empresa', bold: true, color: INK, size: 21, font: 'Calibri' }),
        new TextRun({ text: ', se realizó una evaluación psicotécnica a la Sra./Sr. ', color: INK, size: 21, font: 'Calibri' }),
        new TextRun({ text: nombre || '–', bold: true, color: INK, size: 21, font: 'Calibri' }),
        new TextRun({ text: '.', color: INK, size: 21, font: 'Calibri' })
      ]})
    ];

    // 7. Sección Objetivo (banner teal)
    function sectionBanner(title, iconImage) {
      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: [
          new TableCell({
            width: { size: iconImage ? 89 : 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: TEAL },
            margins: { top: 140, bottom: 140, left: 200, right: 160 },
            borders: noBorders(),
            children: [new Paragraph({ children: [
              new TextRun({ text: title, color: WHITE, size: 26, font: 'Calibri' })
            ]})]
          }),
          iconImage ? new TableCell({
            width: { size: 1, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: WHITE },
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            borders: noBorders(),
            children: [new Paragraph({ children: [new TextRun({ text: '' })] })]
          }) : null,
          iconImage ? new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: WHITE },
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            borders: noBorders(),
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
              new ImageRun({ data: iconImage.buf, transformation: { width: iconImage.w, height: iconImage.h } })
            ]})]
          }) : null
        ].filter(Boolean) })]
      });
    }

    // El párrafo "El presente informe tiene como objetivo..." va DESPUÉS
    // del banner "Objetivo" — igual que en la vista previa/HTML, donde
    // <div class="body-text"> aparece justo debajo de la fila del título
    // "Objetivo", no antes. No existe un campo "objetivoTexto" separado
    // en el formulario: este texto (con "cargoEvaluado" insertado) es el
    // contenido real y único de esta sección.
    // BUG CORREGIDO (dos partes):
    //  1) Antes este párrafo estaba mezclado dentro de "introParagraphs",
    //     por lo que se imprimía ANTES del banner "Objetivo" en vez de
    //     después (justo al revés que en la vista previa).
    //  2) Una corrección previa (ver historial) lo había dejado vacío del
    //     todo para sacar un contenido duplicado que no correspondía —
    //     correcto sacar lo duplicado, pero faltaba poner ACÁ el párrafo
    //     que sí corresponde.
    const objetivoParagraphs = [
      new Paragraph({ spacing: { after: 160 }, alignment: AlignmentType.JUSTIFIED, children: [
        new TextRun({ text: 'El presente informe tiene como objetivo evaluar las competencias de la/el postulante, para lo cual se llevó a cabo una entrevista psicolaboral. Dicha instancia tuvo como finalidad analizar las competencias necesarias para el adecuado desempeño de las tareas correspondientes al cargo ', color: INK, size: 21, font: 'Calibri' }),
        new TextRun({ text: cargoEvaluado || '–', bold: true, color: INK, size: 21, font: 'Calibri' }),
        new TextRun({ text: '. A continuación, se presentan los resultados obtenidos y el puntaje alcanzado en cada una de las competencias evaluadas.', color: INK, size: 21, font: 'Calibri' })
      ]})
    ];

    // ---------- PÁGINA 2 ----------

    // Escala de valoración
    const escalaHeading = new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 200, after: 120 },
      children: [new TextRun({ text: 'Escala de Valoración.', bold: true, color: TEAL, size: 21, font: 'Calibri' })]
    });
    const escalaParagraphs = [];
    [
      '1 (Insuficiente): No alcanza los estándares mínimos.',
      '2 (Bajo): Cumple parcialmente; requiere supervisión.',
      '3 (Adecuado): Cumple de manera correcta; puede mejorar en algunos aspectos.',
      '4 (Muy Bueno): Desempeño sólido, cercano al nivel máximo.',
      '5 (Excelente): Supera los estándares esperados.'
    ].forEach(line => {
      escalaParagraphs.push(new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 60 },
        children: [new TextRun({ text: line, color: INK, size: 19, font: 'Calibri' })]
      }));
    });

    // Competencias
    const compParagraphs = [];
    competencias.forEach((c, i) => {
      if (i > 0) compParagraphs.push(new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: '' })] }));
      compParagraphs.push(new Paragraph({ spacing: { after: 40 }, children: [
        new TextRun({ text: c.nombre || '–', bold: true, color: TEAL, size: 22, font: 'Calibri' })
      ]}));
      compParagraphs.push(new Paragraph({ spacing: { after: 60 }, children: [
        new TextRun({ text: 'Puntaje obtenido: ', bold: true, color: TEAL, size: 19, font: 'Calibri' }),
        new TextRun({ text: c.puntaje || '–', color: TEAL, size: 19, font: 'Calibri' }),
        new TextRun({ text: '    Puntaje máximo: ', bold: true, color: TEAL, size: 19, font: 'Calibri' }),
        new TextRun({ text: c.maximo || '–', color: TEAL, size: 19, font: 'Calibri' })
      ]}));
      if (c.desc) {
        compParagraphs.push(new Paragraph({ spacing: { after: 80 }, children: [
          new TextRun({ text: c.desc, color: INK, size: 20, font: 'Calibri' })
        ]}));
      }
    });

    // Gráfico de competencias (si hay al menos una con puntaje máximo > 0)
    const graficoParagraphs = [];
    const imagenGrafico = await generarImagenGraficoParaWord();
    if (imagenGrafico) {
      graficoParagraphs.push(new Paragraph({ spacing: { before: 200 }, children: [
        new TextRun({ text: '' })
      ]}));
      graficoParagraphs.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({
          data: imagenGrafico.buffer,
          transformation: { width: imagenGrafico.width, height: imagenGrafico.height }
        })]
      }));
    }

    // ---------- PÁGINA 3 ----------

    // Sección Evaluación de Competencias
    const evalBanner = sectionBanner('Evaluación de Competencias', dianaImg);

    // Enfoque
    const enfoqueParagraphs = [];
    if (enfoqueTexto) {
      enfoqueTexto.split(/\r?\n/).forEach(p => {
        if (p.trim()) enfoqueParagraphs.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 120, before: 120 },
          children: [new TextRun({ text: p.trim(), color: INK, size: 21, font: 'Calibri' })]
        }));
      });
    }

    // Sección Conclusión
    const concBanner = sectionBanner('Conclusión', dianaImg);

    // Conclusión
    const conclusionParagraphs = [];
    if (conclusionTexto) {
      conclusionTexto.split(/\r?\n/).forEach(p => {
        if (p.trim()) conclusionParagraphs.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 120, before: 120 },
          children: [new TextRun({ text: p.trim(), color: INK, size: 21, font: 'Calibri' })]
        }));
      });
    }

    // Oportunidad de mejora
    const oportunidadParagraphs = [];
    if (oportunidadTexto && oportunidadTexto.trim()) {
      oportunidadParagraphs.push(new Paragraph({
        spacing: { before: 160, after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: 'Como oportunidad de mejora', bold: true, color: INK, size: 21, font: 'Calibri' }),
          new TextRun({ text: ', ', color: INK, size: 21, font: 'Calibri' })
        ]
      }));
      // El resto del texto
      const resto = oportunidadTexto.trim();
      // Quitar "Como oportunidad de mejora" si está al inicio
      const cleanText = resto.replace(/^Como oportunidad de mejora[,\s]*/i, '');
      oportunidadParagraphs.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 120 },
        children: [new TextRun({ text: cleanText, color: INK, size: 21, font: 'Calibri' })]
      }));
    }

    // Tabla Clasificación
    function clasifRow(label, checked) {
      return new TableRow({ children: [
        new TableCell({
          width: { size: 75, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: GRAY_BG },
          margins: { top: 120, bottom: 120, left: 200, right: 160 },
          borders: thinBorders(),
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ children: [
            new TextRun({ text: label, bold: true, color: INK, size: 20, font: 'Calibri' })
          ]})]
        }),
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: WHITE },
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          borders: thinBorders(),
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: checked ? '✓' : '☐', bold: true, color: TEAL, size: 26 })
          ]})]
        })
      ]});
    }

    const clasifTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [
          new TableCell({
            width: { size: 75, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: TEAL },
            margins: { top: 100, bottom: 100, left: 200, right: 160 },
            borders: thinBorders(),
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
              new TextRun({ text: 'CLASIFICACIÓN', bold: true, color: WHITE, size: 20, font: 'Calibri' })
            ]})]
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: TEAL },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            borders: thinBorders(),
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
              new TextRun({ text: 'RESULTADO', bold: true, color: WHITE, size: 20, font: 'Calibri' })
            ]})]
          })
        ]}),
        clasifRow('RECOMENDABLE', clasif === 'RECOMENDABLE'),
        clasifRow('RECOMENDABLE CON OBSERVACIÓN', clasif === 'RECOMENDABLE CON OBSERVACIÓN'),
        clasifRow('NO RECOMENDABLE', clasif === 'NO RECOMENDABLE')
      ]
    });

    // Firma
    const firmaParagraphs = [
      new Paragraph({
        spacing: { before: 300, after: 200 },
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({
          text: 'Dicho informe debe mantener la reserva confidencial como es habitual, siendo de uso exclusivo del directorio de ' + (consultoria || 'la consultoría') + '.',
          color: GRAY, size: 18, font: 'Calibri'
        })]
      })
    ];

    if (firmaImg) {
      firmaParagraphs.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
        children: [new ImageRun({ data: firmaImg.buf, transformation: { width: firmaImg.w, height: firmaImg.h } })]
      }));
    }

    firmaParagraphs.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100 },
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: '7F8C8D', space: 4 } },
      children: [new TextRun({ text: '\u00A0' })]
    }));
    firmaParagraphs.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80 },
      children: [new TextRun({ text: elaboradoPor || '[Nombre del evaluador]', bold: true, color: TEAL, size: 22, font: 'Calibri' })]
    }));
    firmaParagraphs.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: consultoria || '[Consultoría]', color: GRAY, size: 17, font: 'Calibri' })]
    }));
    firmaParagraphs.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300 },
      children: [new TextRun({ text: 'Página 3/3', color: GRAY, size: 16, font: 'Calibri' })]
    }));

    // ---------- Ensamblar documento ----------
    const children = [].concat(
      [bannerImage],
      logoParagraphs,
      [separator, metaRow, datosTable],
      introParagraphs,
      [sectionBanner('Objetivo', tablaImg)],
      objetivoParagraphs,
      [new Paragraph({ children: [new PageBreak()] })],
      [escalaHeading],
      escalaParagraphs,
      compParagraphs,
      graficoParagraphs,
      [new Paragraph({ children: [new PageBreak()] })],
      [evalBanner],
      enfoqueParagraphs,
      [concBanner],
      conclusionParagraphs,
      oportunidadParagraphs,
      [clasifTable],
      firmaParagraphs
    );

    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const nombreArchivo = (nombre || 'postulante').replace(/\s+/g, '_');
    a.href = url;
    a.download = 'Informe_Psicotecnico_' + nombreArchivo + '.docx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    if (status) status.textContent = '✔ Word descargado con éxito.';

  } catch (e) {
    console.error(e);
    if (status) status.textContent = '⚠ Error al generar el Word. Revisá la consola.';
    alert('Error al generar el Word: ' + e.message);
  } finally {
    if (btn) btn.disabled = false;
    if (status) setTimeout(() => { status.textContent = ''; }, 4000);
  }
};
// ============================================================
//  FIN EXPORTACIÓN WORD
// ============================================================

  // ---------- Inicializar botonera compartida ----------
  Botonera.init({
    camposGuardables: ['fechaInforme','elaboradoPor','consultoria','logoNombre','logoLeyenda',
      'nombre','cargoPostulacion','fechaNac','edad','ci','contacto',
      'fechaEval','horaEval','solicitante','cargoEvaluado',
      'enfoqueTexto','conclusionTexto','oportunidadTexto'],
    camposNoLimpiar: ['logoNombre','logoLeyenda'],
    camposOrtografia: [
      {id:'enfoqueTexto', label:'Enfoque / Objetivo'},
      {id:'conclusionTexto', label:'Conclusión'},
      {id:'oportunidadTexto', label:'Oportunidad de mejora'}
    ],
    nombreArchivoBase: 'Informe_Psicotecnico_Grafico',
    onResetExtra: function() {
      document.getElementById('compContainer').innerHTML = '';
      renderPreview();
    },
    onLoadExtra: function(data) {
      // Si el JSON trae competencias guardadas (formato nuevo), reconstruir
      // los bloques desde cero. Si no las trae (JSON viejo), dejamos los
      // bloques actuales tal cual están en pantalla.
      if (Array.isArray(data.competencias)) {
        document.getElementById('compContainer').innerHTML = '';
        data.competencias.forEach(addCompBlock);
      }
      renderPreview();
    },
    onSaveExtra: function(data) {
      const bloques = document.querySelectorAll('#compContainer .comp-block');
      data.competencias = Array.from(bloques).map(function(block) {
        return {
          nombre: block.querySelector('.c-nombre').value,
          puntaje: block.querySelector('.c-puntaje').value,
          maximo: block.querySelector('.c-maximo').value,
          desc: block.querySelector('.c-desc').value
        };
      });
    }
  });