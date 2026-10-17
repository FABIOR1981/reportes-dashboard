const defaultComps = [
  { nombre: 'Adaptabilidad', puntaje: 3, maximo: 5, desc: 'Se adaptará a las dinámicas de la Empresa de manera aceptable.' },
  { nombre: 'Responsabilidad y compromiso', puntaje: 4, maximo: 5, desc: 'Demuestra ser responsable con tareas específicas y bien definidas.' },
  { nombre: 'Capacidad Resolutiva', puntaje: 4, maximo: 5, desc: 'Cuenta con buenos indicadores para adaptar estrategias y resolver tareas ante situaciones imprevistas.' },
  { nombre: 'Adhesión a las normas', puntaje: 3, maximo: 5, desc: 'Aceptable en lo que refiere a las normas establecidas por la Empresa.' },
  { nombre: 'Proactividad', puntaje: 3, maximo: 5, desc: 'Presenta una actitud dinámica, aunque en ocasiones actúa de manera más reactiva que analítica.' }
];

const compContainer = document.getElementById('compContainer');

function addCompBlock(data) {
  data = data || { nombre: '', puntaje: 3, maximo: 5, desc: '' };
  const div = document.createElement('div');
  div.className = 'comp-block';
  div.innerHTML = `
    <button type="button" class="del-btn">✕ quitar</button>
    <label>Nombre de la competencia</label>
    <input type="text" class="c-nombre" spellcheck="true" value="${escapeHTML(data.nombre)}">
    <div class="row2">
      <div><label>Puntaje obtenido</label><input type="number" class="c-puntaje" min="1" max="5" value="${escapeHTML(data.puntaje)}"></div>
      <div><label>Puntaje máximo</label><input type="number" class="c-maximo" min="1" max="10" value="${escapeHTML(data.maximo)}"></div>
    </div>
    <label>Descripción</label>
    <textarea class="c-desc" spellcheck="true">${escapeHTML(data.desc)}</textarea>
  `;
  div.querySelector('.del-btn').addEventListener('click', () => { div.remove(); updatePreview(); });
  div.querySelectorAll('input, textarea').forEach(el => el.addEventListener('input', updatePreview));
  compContainer.appendChild(div);
}

function updatePreview() {
  setText('out-fechaInforme', fmtDateLong(val('fechaInforme')));
  setText('out-elaboradoPor', val('elaboradoPor'));
  setText('out-consultoria', val('consultoria'));
  setText('out-consultoria2', val('consultoria'));
  setText('out-firmaNombre', val('elaboradoPor'));
  setText('out-firmaConsultora', val('consultoria'));

  // Logo: 1ª palabra / resto en la 2ª línea, igual que el Word
  const palabras = (val('logoNombre') || 'Shalon Morales').trim().split(/\s+/);
  document.getElementById('out-logoNombre1').textContent = palabras[0] || '';
  document.getElementById('out-logoNombre2').textContent = palabras.slice(1).join(' ');
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
  setText('out-solicitante2', val('solicitante'));
  setText('out-cargoEvaluado', '"' + (val('cargoEvaluado') || '-') + '"');

  setText('out-enfoqueTexto', val('enfoqueTexto'));
  setText('out-conclusionTexto', val('conclusionTexto'));
  setText('out-oportunidadTexto', val('oportunidadTexto'));

  const sel = document.querySelector('input[name=clasif]:checked');
  const clasif = sel ? sel.value : '';
  const check = document.getElementById('checkSvg').innerHTML;
  document.getElementById('chk-REC').innerHTML = clasif === 'RECOMENDABLE' ? check : '';
  document.getElementById('chk-OBS').innerHTML = clasif === 'RECOMENDABLE CON OBSERVACIÓN' ? check : '';
  document.getElementById('chk-NOREC').innerHTML = clasif === 'NO RECOMENDABLE' ? check : '';

  const compOut = document.getElementById('compOutContainer');
  compOut.innerHTML = '';
  const graficables = []; // solo competencias con nombre y máximo > 0
  compContainer.querySelectorAll('.comp-block').forEach(block => {
    const nombreRaw = block.querySelector('.c-nombre').value.trim();
    const puntajeRaw = block.querySelector('.c-puntaje').value.trim();
    const maximoRaw = block.querySelector('.c-maximo').value.trim();
    const item = document.createElement('div');
    item.className = 'comp-item';
    item.innerHTML = `
      <div class="comp-name">${escapeHTML(nombreRaw) || '(sin nombre)'}</div>
      <div class="comp-scores"><b>Puntaje obtenido:</b> ${escapeHTML(puntajeRaw) || '-'} &nbsp; <b>Puntaje máximo:</b> ${escapeHTML(maximoRaw) || '-'}</div>
      <div class="comp-desc">${procesarTextoMultilinea(block.querySelector('.c-desc').value)}</div>
    `;
    compOut.appendChild(item);

    const maximoNum = parseFloat(maximoRaw) || 0;
    if (nombreRaw && maximoNum > 0) {
      graficables.push({ nombre: nombreRaw, puntaje: parseFloat(puntajeRaw) || 0, maximo: maximoNum });
    }
  });
  renderGraficoCompetencias(graficables);
}