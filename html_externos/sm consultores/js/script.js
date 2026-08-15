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
  const clasif = document.querySelector('input[name=clasif]:checked').value;
  const checkSvgHTML = document.getElementById('checkSvg').innerHTML;
  document.getElementById('chk-REC').innerHTML = clasif === 'RECOMENDABLE' ? checkSvgHTML : '';
  document.getElementById('chk-OBS').innerHTML = clasif === 'RECOMENDABLE CON OBSERVACIÓN' ? checkSvgHTML : '';
  document.getElementById('chk-NOREC').innerHTML = clasif === 'NO RECOMENDABLE' ? checkSvgHTML : '';

  // competencias -> página 2
  const compOut = document.getElementById('compOutContainer');
  compOut.innerHTML = '';
  compContainer.querySelectorAll('.comp-block').forEach(block => {
    const nombreC = block.querySelector('.c-nombre').value || '(sin nombre)';
    const puntaje = block.querySelector('.c-puntaje').value || '-';
    const maximo = block.querySelector('.c-maximo').value || '-';
    const desc = block.querySelector('.c-desc').value || '';
    const item = document.createElement('div');
    item.className = 'comp-item';
    item.innerHTML = `
      <div class="comp-name">${nombreC}</div>
      <div class="comp-scores"><b>Puntaje obtenido:</b> ${puntaje} &nbsp; <b>Puntaje máximo:</b> ${maximo}</div>
      <div class="comp-desc">${desc}</div>
    `;
    compOut.appendChild(item);
  });
}

document.querySelectorAll('#panel input, #panel textarea').forEach(el => {
  el.addEventListener('input', renderPreview);
  el.addEventListener('change', renderPreview);
});
document.querySelectorAll('input[name=clasif]').forEach(el => el.addEventListener('change', renderPreview));

document.getElementById('resetBtn').addEventListener('click', () => {
  if(confirm('¿Limpiar todos los campos del formulario?')){
    document.querySelectorAll('#panel input[type=text], #panel input[type=date], #panel input[type=number], #panel textarea').forEach(el => {
      if(!cabezalFieldIds.includes(el.id)) el.value = '';
    });
    compContainer.innerHTML = '';
    defaultComps.forEach(addCompBlock);
    renderPreview();
  }
});

// ---------- Descarga de PDF ----------
document.getElementById('downloadBtn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  const btn = document.getElementById('downloadBtn');
  btn.disabled = true;
  status.textContent = 'Generando PDF, por favor espera...';

  try{
    // Esperar a que las fuentes estén completamente cargadas antes de capturar.
    // Si html2canvas captura el texto antes de que la fuente termine de cargar,
    // usa métricas de una fuente distinta a la que se ve en pantalla y las palabras
    // quedan pegadas entre sí (el bug de "estándaresmínimos").
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageIds = ['page1','page2','page3'];

    for(let i=0; i<pageIds.length; i++){
      const el = document.getElementById(pageIds[i]);
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor:'#ffffff',
        letterRendering: true // clave: dibuja letra por letra en vez de por palabra,
                               // evita que el ancho de las palabras se calcule mal y se superpongan
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      if(i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    const nombreArchivo = (val('nombre') || 'postulante').trim().replace(/\s+/g,'_');
    pdf.save(`INFORME_EVALUACION_PSICOTECNICA_${nombreArchivo}.pdf`);
    status.textContent = '✔ PDF descargado con éxito.';
  }catch(err){
    console.error(err);
    status.textContent = '⚠ Error al generar el PDF. Revisá la consola.';
  }finally{
    btn.disabled = false;
    setTimeout(()=>{ status.textContent=''; }, 4000);
  }
});

// ---------- Cabezal: bloqueo/edición de datos fijos ----------
const cabezalFieldIds = ['consultoria', 'elaboradoPor', 'logoNombre', 'logoLeyenda'];
document.getElementById('editCabezal').addEventListener('change', (e) => {
  const unlocked = e.target.checked;
  cabezalFieldIds.forEach(id => {
    document.getElementById(id).readOnly = !unlocked;
  });
});

// ---------- Guardar datos (JSON) ----------
function gatherFormData(){
  const data = {};
  document.querySelectorAll('#panel > fieldset input[id], #panel > fieldset textarea[id]').forEach(el => {
    data[el.id] = el.value;
  });
  const clasifEl = document.querySelector('input[name=clasif]:checked');
  data.clasif = clasifEl ? clasifEl.value : '';
  data.competencias = [];
  compContainer.querySelectorAll('.comp-block').forEach(block => {
    data.competencias.push({
      nombre: block.querySelector('.c-nombre').value,
      puntaje: block.querySelector('.c-puntaje').value,
      maximo: block.querySelector('.c-maximo').value,
      desc: block.querySelector('.c-desc').value
    });
  });
  return data;
}

document.getElementById('saveBtn').addEventListener('click', () => {
  const status = document.getElementById('status');
  try{
    const data = gatherFormData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const nombreArchivo = (val('nombre') || 'informe').trim().replace(/\s+/g,'_');
    a.href = url;
    a.download = `DATOS_INFORME_${nombreArchivo}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    status.textContent = '✔ Datos guardados. Guardá ese archivo para continuar luego.';
  }catch(err){
    console.error(err);
    status.textContent = '⚠ No se pudieron guardar los datos.';
  }
  setTimeout(()=>{ status.textContent=''; }, 5000);
});

// ---------- Cargar datos (JSON) ----------
document.getElementById('loadBtn').addEventListener('click', () => {
  document.getElementById('loadInput').click();
});

document.getElementById('loadInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const status = document.getElementById('status');
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try{
      const data = JSON.parse(ev.target.result);
      Object.keys(data).forEach(key => {
        if(key === 'clasif' || key === 'competencias') return;
        const el = document.getElementById(key);
        if(el) el.value = data[key];
      });
      if(data.clasif){
        const radio = document.querySelector(`input[name=clasif][value="${data.clasif}"]`);
        if(radio) radio.checked = true;
      }
      if(Array.isArray(data.competencias) && data.competencias.length){
        compContainer.innerHTML = '';
        data.competencias.forEach(c => addCompBlock(c));
      }
      renderPreview();
      status.textContent = '✔ Datos cargados. Podés continuar editando.';
    }catch(err){
      console.error(err);
      alert('El archivo elegido no es un JSON válido generado por esta herramienta.');
    }
    setTimeout(()=>{ status.textContent=''; }, 5000);
  };
  reader.readAsText(file);
  e.target.value = '';
});

// ---------- Revisar ortografía y gramática ----------

// Diccionario técnico: palabras que NO deben marcarse como error.
// Incluye términos propios de psicología laboral que el corrector no conoce.
const DICCIONARIO_BASE = [
  'psic', 'psicolaboral', 'ansiógeno', 'ansiógenos', 'ansiógena', 'ansiógenas',
  'resiliencia', 'resiliente', 'proactividad', 'adaptabilidad'
];

function getDiccionarioPersonalizado(){
  try{
    return JSON.parse(localStorage.getItem('correctorDiccionario') || '[]');
  }catch(e){ return []; }
}
function setDiccionarioPersonalizado(arr){
  localStorage.setItem('correctorDiccionario', JSON.stringify(arr));
}
function palabraEnDiccionario(palabra){
  const p = palabra.toLowerCase().replace(/[.,;:!?"']/g, '');
  const dic = [...DICCIONARIO_BASE, ...getDiccionarioPersonalizado()].map(w => w.toLowerCase());
  return dic.includes(p);
}

function renderDiccionarioPanel(){
  const cont = document.getElementById('dicList');
  const custom = getDiccionarioPersonalizado();
  cont.innerHTML = custom.length
    ? custom.map(w => `<span class="dic-chip">${w} <button type="button" class="dic-del" data-w="${w}">✕</button></span>`).join('')
    : '<span style="color:#999;">Sin palabras agregadas todavía.</span>';
  cont.querySelectorAll('.dic-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const updated = getDiccionarioPersonalizado().filter(w => w !== btn.dataset.w);
      setDiccionarioPersonalizado(updated);
      renderDiccionarioPanel();
    });
  });
}
renderDiccionarioPanel();

document.getElementById('dicAddBtn').addEventListener('click', () => {
  const input = document.getElementById('dicInput');
  const palabra = input.value.trim();
  if(!palabra) return;
  const custom = getDiccionarioPersonalizado();
  if(!custom.map(w=>w.toLowerCase()).includes(palabra.toLowerCase())){
    custom.push(palabra);
    setDiccionarioPersonalizado(custom);
    renderDiccionarioPanel();
  }
  input.value = '';
});
document.getElementById('dicInput').addEventListener('keydown', (e) => {
  if(e.key === 'Enter'){ e.preventDefault(); document.getElementById('dicAddBtn').click(); }
});

async function checkSpellingText(text){
  if(!text || !text.trim()) return [];
  const resp = await fetch('https://api.languagetool.org/v2/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({ text: text, language: 'es' })
  });
  if(!resp.ok) throw new Error('Error de API: ' + resp.status);
  const json = await resp.json();
  return json.matches || [];
}

document.getElementById('spellBtn').addEventListener('click', async () => {
  const panel = document.getElementById('spellPanel');
  const btn = document.getElementById('spellBtn');
  btn.disabled = true;
  panel.innerHTML = 'Revisando ortografía y gramática, un momento...';

  try{
    const fields = [
      {label: 'Solicitado por (empresa)', text: val('solicitante')},
      {label: 'Objetivo (cargo evaluado)', text: val('cargoEvaluado')},
      {label: 'Texto: Enfoque', text: val('enfoqueTexto')},
      {label: 'Texto: Conclusión', text: val('conclusionTexto')},
      // Se agrega el inicio de la frase ("Como oportunidad de mejora, ") solo para
      // el análisis, así el corrector no cree que el texto empieza ahí y no pide
      // mayúscula inicial. Ese prefijo se descuenta después con offsetAjuste.
      {label: 'Texto: Oportunidad de mejora', text: 'Como oportunidad de mejora, ' + val('oportunidadTexto'), offsetAjuste: 'Como oportunidad de mejora, '.length, original: val('oportunidadTexto')},
    ];
    compContainer.querySelectorAll('.comp-block').forEach((block, idx) => {
      const nombreC = block.querySelector('.c-nombre').value || `Competencia ${idx+1}`;
      fields.push({label: `${nombreC} (descripción)`, text: block.querySelector('.c-desc').value});
    });

    let html = '';
    let totalIssues = 0;
    for(const f of fields){
      if(!f.text || !f.text.trim()) continue;
      const matches = await checkSpellingText(f.text);
      const textoOriginal = f.original !== undefined ? f.original : f.text;
      const ajuste = f.offsetAjuste || 0;
      const items = [];
      matches.forEach(m => {
        const bad = f.text.substring(m.offset, m.offset + m.length);
        if(palabraEnDiccionario(bad)) return; // ignorar palabras del diccionario técnico
        if(ajuste && m.offset < ajuste) return; // ignorar coincidencias dentro del prefijo agregado
        const suggestion = (m.replacements && m.replacements[0]) ? m.replacements[0].value : null;
        items.push(suggestion
          ? `<li>"${bad}" → <b>${suggestion}</b> <button type="button" class="dic-ignore" data-w="${bad}">no es un error, ignorar siempre</button></li>`
          : `<li>"${bad}": ${m.message} <button type="button" class="dic-ignore" data-w="${bad}">no es un error, ignorar siempre</button></li>`);
      });
      if(items.length){
        totalIssues += items.length;
        html += `<div class="spell-field"><b>${f.label}</b><ul>${items.join('')}</ul></div>`;
      }
    }
    panel.innerHTML = totalIssues
      ? html
      : '✔ No se encontraron errores ortográficos ni gramaticales.';
    panel.querySelectorAll('.dic-ignore').forEach(b => {
      b.addEventListener('click', () => {
        const custom = getDiccionarioPersonalizado();
        if(!custom.map(w=>w.toLowerCase()).includes(b.dataset.w.toLowerCase())){
          custom.push(b.dataset.w);
          setDiccionarioPersonalizado(custom);
          renderDiccionarioPanel();
        }
        document.getElementById('spellBtn').click();
      });
    });
  }catch(err){
    console.error(err);
    panel.innerHTML = '⚠ No se pudo conectar con el corrector ortográfico. Verificá tu conexión a internet e intentá de nuevo.';
  }finally{
    btn.disabled = false;
  }
});

// Inicializar
(function setDefaultDates(){
  const today = new Date().toISOString().slice(0,10);
  const fi = document.getElementById('fechaInforme');
  const fe = document.getElementById('fechaEval');
  if(!fi.value) fi.value = today;
  if(!fe.value) fe.value = today;
})();
renderPreview();

// ============================================================
//  EXPORTACIÓN A WORD (.docx) – SM Consultores
//  Código independiente. Agregado al final de script.js
// ============================================================

window.downloadWord = async function() {
  const btn = document.getElementById('wordBtn');
  if (!btn) return;
  const originalText = btn.textContent;
  btn.textContent = 'Generando Word…';
  btn.disabled = true;

  try {
    // --- Helpers de formato ---
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

    // --- Recolección de datos ---
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
    const oportunidadTexto = v('oportunidadadTexto');

    let fechaHoraEval = fmtDateLong(fechaEval);
    if (horaEval) fechaHoraEval += ` / Hora: ${horaEval}`;

    const clasifEl = document.querySelector('input[name="clasif"]:checked');
    const clasif = clasifEl ? clasifEl.value : 'RECOMENDABLE';

    // Competencias dinámicas
    const compBlocks = document.querySelectorAll('#compContainer .comp-block');
    const competencias = [];
    compBlocks.forEach(block => {
      const nombreC = block.querySelector('.c-nombre');
      const puntaje = block.querySelector('.c-puntaje');
      const maximo  = block.querySelector('.c-maximo');
      const desc    = block.querySelector('.c-desc');
      competencias.push({
        nombre: nombreC ? nombreC.value.trim() : '',
        puntaje: puntaje ? puntaje.value.trim() : '',
        maximo: maximo ? maximo.value.trim() : '',
        desc: desc ? desc.value.trim() : ''
      });
    });

    // --- API docx ---
    const docx = window.docx;
    if (!docx) {
      alert('La librería docx no está cargada. Verificá la etiqueta <script> en el HTML.');
      return;
    }
    const {
      Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
      WidthType, BorderStyle, AlignmentType, VerticalAlign, ShadingType
    } = docx;

    // --- Estilos ---
    const NAVY   = '154360';
    const BLUE   = '2874A6';
    const GRAY   = '5D6D7E';
    const INK    = '2C3E50';
    const BORDER = 'AED6F1';
    const BOX_BG = 'F8F9F9';
    const LBLUE  = 'D6EAF8';

    // --- Encabezado ---
    const headerParagraphs = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: logoNombre.toUpperCase(), bold: true, color: NAVY, size: 36 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: (logoLeyenda || 'CONSULTORES').toUpperCase(), color: GRAY, size: 20 })]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 300 },
        children: [new TextRun({ text: fmtDateLong(fechaInforme), color: GRAY, size: 20 })]
      })
    ];

    // --- Tabla datos postulante ---
    function infoCell(label, value) {
      return new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        shading: { type: ShadingType.CLEAR, fill: BOX_BG },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        borders: {
          top:    { style: BorderStyle.SINGLE, size: 4, color: BORDER },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
          left:   { style: BorderStyle.SINGLE, size: 4, color: BORDER },
          right:  { style: BorderStyle.SINGLE, size: 4, color: BORDER }
        },
        children: [new Paragraph({
          children: [
            new TextRun({ text: label + ' ', bold: true, color: INK, size: 20 }),
            new TextRun({ text: value || '–', color: INK, size: 20 })
          ]
        })]
      });
    }

    const infoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [infoCell('Nombre:', nombre), infoCell('Cargo al que postula:', cargoPostulacion)] }),
        new TableRow({ children: [infoCell('Fecha de nac.:', fmtDate(fechaNac)), infoCell('Edad:', edad)] }),
        new TableRow({ children: [infoCell('C.I.:', ci), infoCell('Contacto:', contacto)] }),
        new TableRow({ children: [infoCell('Fecha de evaluación:', fechaHoraEval), infoCell('Consultoría:', consultoria)] })
      ]
    });

    // --- Cuerpo ---
    const bodyParagraphs = [];

    bodyParagraphs.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 160 },
      children: [
        new TextRun({ text: 'A solicitud de ', color: INK, size: 21 }),
        new TextRun({ text: solicitante || 'la empresa', bold: true, color: INK, size: 21 }),
        new TextRun({ text: ', se realizó una evaluación psicotécnica a la Sra./Sr. ', color: INK, size: 21 }),
        new TextRun({ text: nombre || '–', bold: true, color: INK, size: 21 }),
        new TextRun({ text: '.', color: INK, size: 21 })
      ]
    }));

    bodyParagraphs.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 160 },
      children: [
        new TextRun({ text: 'El presente informe tiene como objetivo evaluar las competencias de la/el postulante, para lo cual se llevó a cabo una entrevista psicolaboral. Dicha instancia tuvo como finalidad analizar las competencias necesarias para el adecuado desempeño de las tareas correspondientes al cargo ', color: INK, size: 21 }),
        new TextRun({ text: cargoEvaluado || '–', bold: true, color: INK, size: 21 }),
        new TextRun({ text: '. A continuación, se presentan los resultados obtenidos y el puntaje alcanzado en cada una de las competencias evaluadas.', color: INK, size: 21 })
      ]
    }));

    // Escala
    bodyParagraphs.push(new Paragraph({
      spacing: { before: 200, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 6 } },
      children: [new TextRun({ text: 'ESCALA DE VALORACIÓN', bold: true, color: NAVY, size: 22 })]
    }));
    [
      '1 (Insuficiente): No alcanza los estándares mínimos.',
      '2 (Bajo): Cumple parcialmente; requiere supervisión.',
      '3 (Adecuado): Cumple de manera correcta; puede mejorar en algunos aspectos.',
      '4 (Muy Bueno): Desempeño sólido, cercano al nivel máximo.',
      '5 (Excelente): Supera los estándares esperados.'
    ].forEach(line => {
      bodyParagraphs.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: line, color: INK, size: 20 })] }));
    });

    // Competencias
    bodyParagraphs.push(new Paragraph({
      spacing: { before: 300, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 6 } },
      children: [new TextRun({ text: 'EVALUACIÓN DE COMPETENCIAS', bold: true, color: NAVY, size: 22 })]
    }));

    const compHeader = new TableRow({ children: [
      new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, shading: { type: ShadingType.CLEAR, fill: LBLUE }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, borders: { top:{style:BorderStyle.SINGLE,size:4,color:BORDER}, bottom:{style:BorderStyle.SINGLE,size:4,color:BORDER}, left:{style:BorderStyle.SINGLE,size:4,color:BORDER}, right:{style:BorderStyle.SINGLE,size:4,color:BORDER} }, children: [new Paragraph({ children: [new TextRun({ text: 'Competencia', bold: true, color: NAVY, size: 20 })] })] }),
      new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, shading: { type: ShadingType.CLEAR, fill: LBLUE }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, borders: { top:{style:BorderStyle.SINGLE,size:4,color:BORDER}, bottom:{style:BorderStyle.SINGLE,size:4,color:BORDER}, left:{style:BorderStyle.SINGLE,size:4,color:BORDER}, right:{style:BorderStyle.SINGLE,size:4,color:BORDER} }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Puntaje', bold: true, color: NAVY, size: 20 })] })] }),
      new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, shading: { type: ShadingType.CLEAR, fill: LBLUE }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, borders: { top:{style:BorderStyle.SINGLE,size:4,color:BORDER}, bottom:{style:BorderStyle.SINGLE,size:4,color:BORDER}, left:{style:BorderStyle.SINGLE,size:4,color:BORDER}, right:{style:BorderStyle.SINGLE,size:4,color:BORDER} }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Máximo', bold: true, color: NAVY, size: 20 })] })] }),
      new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, shading: { type: ShadingType.CLEAR, fill: LBLUE }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, borders: { top:{style:BorderStyle.SINGLE,size:4,color:BORDER}, bottom:{style:BorderStyle.SINGLE,size:4,color:BORDER}, left:{style:BorderStyle.SINGLE,size:4,color:BORDER}, right:{style:BorderStyle.SINGLE,size:4,color:BORDER} }, children: [new Paragraph({ children: [new TextRun({ text: 'Descripción / Observaciones', bold: true, color: NAVY, size: 20 })] })] })
    ]});

    const compRows = [compHeader];
    competencias.forEach(c => {
      compRows.push(new TableRow({ children: [
        new TableCell({ margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders: { top:{style:BorderStyle.SINGLE,size:4,color:BORDER}, bottom:{style:BorderStyle.SINGLE,size:4,color:BORDER}, left:{style:BorderStyle.SINGLE,size:4,color:BORDER}, right:{style:BorderStyle.SINGLE,size:4,color:BORDER} }, children: [new Paragraph({ children: [new TextRun({ text: c.nombre || '–', color: INK, size: 20 })] })] }),
        new TableCell({ margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders: { top:{style:BorderStyle.SINGLE,size:4,color:BORDER}, bottom:{style:BorderStyle.SINGLE,size:4,color:BORDER}, left:{style:BorderStyle.SINGLE,size:4,color:BORDER}, right:{style:BorderStyle.SINGLE,size:4,color:BORDER} }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: c.puntaje || '–', color: INK, size: 20 })] })] }),
        new TableCell({ margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders: { top:{style:BorderStyle.SINGLE,size:4,color:BORDER}, bottom:{style:BorderStyle.SINGLE,size:4,color:BORDER}, left:{style:BorderStyle.SINGLE,size:4,color:BORDER}, right:{style:BorderStyle.SINGLE,size:4,color:BORDER} }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: c.maximo || '–', color: INK, size: 20 })] })] }),
        new TableCell({ margins: { top: 80, bottom: 80, left: 120, right: 120 }, borders: { top:{style:BorderStyle.SINGLE,size:4,color:BORDER}, bottom:{style:BorderStyle.SINGLE,size:4,color:BORDER}, left:{style:BorderStyle.SINGLE,size:4,color:BORDER}, right:{style:BorderStyle.SINGLE,size:4,color:BORDER} }, children: [new Paragraph({ children: [new TextRun({ text: c.desc || '–', color: INK, size: 20 })] })] })
      ]}));
    });
    const compTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: compRows });

    // Conclusión
    const conclusionHeading = new Paragraph({
      spacing: { before: 300, after: 120 },
      border: { left: { style: BorderStyle.SINGLE, size: 24, color: BLUE, space: 8 } },
      children: [new TextRun({ text: 'CONCLUSIÓN', bold: true, color: NAVY, size: 24 })]
    });
    const conclusionParagraphs = [];
    if (conclusionTexto) {
      conclusionTexto.split(/\r?\n/).forEach(p => {
        if (p.trim()) conclusionParagraphs.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 }, children: [new TextRun({ text: p.trim(), color: INK, size: 21 })] }));
      });
    }

    // Oportunidad de mejora
    const oportunidadParagraphs = [];
    if (oportunidadTexto && oportunidadTexto.trim()) {
      oportunidadParagraphs.push(new Paragraph({
        spacing: { before: 200, after: 120 },
        border: { left: { style: BorderStyle.SINGLE, size: 24, color: BLUE, space: 8 } },
        children: [new TextRun({ text: 'OPORTUNIDAD DE MEJORA', bold: true, color: NAVY, size: 24 })]
      }));
      oportunidadTexto.split(/\r?\n/).forEach(p => {
        if (p.trim()) oportunidadParagraphs.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 }, children: [new TextRun({ text: p.trim(), color: INK, size: 21 })] }));
      });
    }

    // Clasificación
    const clasifHeading = new Paragraph({
      spacing: { before: 300, after: 160 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 6 } },
      children: [new TextRun({ text: 'CLASIFICACIÓN', bold: true, color: NAVY, size: 22 })]
    });

    function clasifCell(label, checked) {
      return [
        new TableCell({
          width: { size: 75, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          shading: { type: ShadingType.CLEAR, fill: LBLUE },
          margins: { top: 120, bottom: 120, left: 160, right: 120 },
          borders: { top:{style:BorderStyle.SINGLE,size:4,color:BORDER}, bottom:{style:BorderStyle.SINGLE,size:4,color:BORDER}, left:{style:BorderStyle.SINGLE,size:4,color:BORDER}, right:{style:BorderStyle.SINGLE,size:4,color:BORDER} },
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: NAVY, size: 21 })] })]
        }),
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          borders: { top:{style:BorderStyle.SINGLE,size:4,color:BORDER}, bottom:{style:BorderStyle.SINGLE,size:4,color:BORDER}, left:{style:BorderStyle.SINGLE,size:4,color:BORDER}, right:{style:BorderStyle.SINGLE,size:4,color:BORDER} },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: checked ? '✓' : '☐', bold: true, color: NAVY, size: 26 })] })]
        })
      ];
    }
    const clasifTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: clasifCell('RECOMENDABLE', clasif === 'RECOMENDABLE') }),
        new TableRow({ children: clasifCell('RECOMENDABLE CON OBSERVACIÓN', clasif === 'RECOMENDABLE CON OBSERVACIÓN') }),
        new TableRow({ children: clasifCell('NO RECOMENDABLE', clasif === 'NO RECOMENDABLE') })
      ]
    });

    // Firma
    const footerParagraphs = [
      new Paragraph({
        spacing: { before: 400, after: 300 },
        children: [new TextRun({ text: 'Dicho informe debe mantener la reserva confidencial como es habitual, siendo de uso exclusivo del directorio de ' + (consultoria || 'la consultoría') + '.', color: GRAY, size: 18 })]
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
        children: [new TextRun({ text: elaboradoPor || '[Nombre del evaluador]', bold: true, color: NAVY, size: 22 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: consultoria || '[Consultoría]', color: GRAY, size: 17 })]
      })
    ];

    // --- Ensamblar documento ---
    const doc = new Document({
      sections: [{
        properties: {},
        children: [].concat(
          headerParagraphs,
          [infoTable, new Paragraph({ text: '', spacing: { after: 160 } })],
          bodyParagraphs,
          [compTable],
          [conclusionHeading],
          conclusionParagraphs,
          oportunidadParagraphs,
          [clasifHeading, clasifTable],
          footerParagraphs
        )
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

  } catch (e) {
    console.error(e);
    alert('Error al generar el Word: ' + e.message);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
};
// ============================================================
//  FIN EXPORTACIÓN WORD
// ============================================================
