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
