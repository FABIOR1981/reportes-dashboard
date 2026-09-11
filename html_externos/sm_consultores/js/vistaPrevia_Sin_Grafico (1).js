// ============================================================
//  SM CONSULTORES (sin gráfico) – vistaPrevia_Sin_Grafico.js
//  Datos por defecto + bloques dinámicos de competencias + render de la
//  vista previa. Depende de: utils.js (fmtDate, fmtDateLong, val, setText)
// ============================================================
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

// ---------- Render de la vista previa ----------
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
