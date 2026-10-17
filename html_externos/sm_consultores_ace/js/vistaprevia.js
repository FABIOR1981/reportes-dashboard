const defaultComps = [
  { nombre: '6.1 - Liderazgo', puntaje: 3, maximo: 5 },
  { nombre: '6.2 - Capacidad de trabajo en equipo y coordinación', puntaje: 4, maximo: 5 },
  { nombre: '6.3 - Resolución de problemas, toma de decisiones y gestión de conflictos', puntaje: 4, maximo: 5 },
  { nombre: '6.4 - Habilidades de comunicación efectiva y percepción de necesidades de los socios', puntaje: 4, maximo: 5 },
  { nombre: '6.5 - Orientación al cliente, al socio y a resultados', puntaje: 3, maximo: 5 },
  { nombre: '6.6 - Capacidad de negociación', puntaje: 4, maximo: 5 },
  { nombre: '6.7 - Organización, planificación y cumplimiento normativo', puntaje: 4, maximo: 5 },
  { nombre: '6.8 - Gestión eficiente y atención al detalle', puntaje: 3, maximo: 5 },
  { nombre: '6.9 - Iniciativa, proactividad y enfoque comercial', puntaje: 4, maximo: 5 },
  { nombre: '6.10 - Adaptabilidad y gestión del cambio', puntaje: 3, maximo: 5 },
  { nombre: '6.11 - Conocimientos administrativos básicos', puntaje: 4, maximo: 5 },
  { nombre: '6.12 - Manejo de tecnologías de la información básicos', puntaje: 3, maximo: 5 },
  { nombre: '6.13 - Conocimiento de la comunidad, interacción y relacionamiento con actores externos', puntaje: 5, maximo: 5 }
];

const compContainer = document.getElementById('compContainer');

function addCompBlock(data) {
  data = data || { nombre: '', puntaje: 2, maximo: 3 };
  const div = document.createElement('div');
  div.className = 'comp-block';
  div.innerHTML = `
    <button type="button" class="del-btn">✕ quitar</button>
    <label>Nombre de la competencia</label>
    <input type="text" class="c-nombre" spellcheck="true" value="${escapeHTML(data.nombre)}">
    <div class="row2">
      <div><label>Puntaje obtenido</label><input type="number" class="c-puntaje" min="0" max="10" value="${escapeHTML(data.puntaje)}"></div>
      <div><label>Puntaje máximo</label><input type="number" class="c-maximo" min="1" max="10" value="${escapeHTML(data.maximo)}"></div>
    </div>
  `;
  div.querySelector('.del-btn').addEventListener('click', () => { div.remove(); updatePreview(); });
  div.querySelectorAll('input, textarea').forEach(el => el.addEventListener('input', updatePreview));
  compContainer.appendChild(div);
}

function updatePreview() {
  setText('out-fechaInforme', fmtDateLong(val('fechaInforme')));
  setText('out-elaboradoPor', val('elaboradoPor'));
  setText('out-consultoria', val('consultoria'));

  // Logo: 1ª palabra / resto en la 2ª línea, igual que el Word
  const palabras = (val('logoNombre') || 'Shalon Morales').trim().split(/\s+/);
  document.getElementById('out-logoNombre1').textContent = palabras[0] || '';
  document.getElementById('out-logoNombre2').textContent = palabras.slice(1).join(' ');
  setText('out-logoSub', (val('logoLeyenda') || 'CONSULTORES').toUpperCase());

  const nombre = val('nombre');
  setText('out-nombre', nombre);
  setText('out-cargoPostulacion', val('cargoPostulacion'));
  setText('out-ci', val('ci'));
  setText('out-contacto', val('contacto'));
  setText('out-fechaHoraEval', fmtEvalLinea(val('fechaEval'), val('horaEval')));
  setText('out-solicitante', val('solicitante'));
  setText('out-diaSemana', diaSemana(val('fechaEval')));
  setText('out-fechaEvalIntro', fmtFechaMayus(val('fechaEval')));
  setText('out-cargoEvaluado', val('cargoEvaluado'));
  setText('out-objetivoTexto', val('objetivoTexto'));
  setText('out-enfoqueTexto', val('enfoqueTexto'));
  setText('out-debilidadesTexto', val('debilidadesTexto'));
  setText('out-conclusionTexto', val('conclusionTexto'));

  const lista = document.getElementById('out-fortalezasTexto');
  lista.innerHTML = val('fortalezasTexto').split(/\r?\n/).filter(t => t.trim())
    .map(t => `<li>${escapeHTML(t.trim())}</li>`).join('');

  const sel = document.querySelector('input[name=clasif]:checked');
  const clasif = sel ? sel.value : '';
  const check = document.getElementById('checkSvg').innerHTML;
  document.getElementById('chk-REC').innerHTML = clasif === 'RECOMENDABLE' ? check : '';
  document.getElementById('chk-OBS').innerHTML = clasif === 'RECOMENDABLE CON OBSERVACIÓN' ? check : '';
  document.getElementById('chk-NOREC').innerHTML = clasif === 'NO RECOMENDABLE' ? check : '';

  const graficables = []; // solo competencias con nombre y máximo > 0
  compContainer.querySelectorAll('.comp-block').forEach(block => {
    const nombreRaw = block.querySelector('.c-nombre').value.trim();
    const puntajeRaw = block.querySelector('.c-puntaje').value.trim();
    const maximoNum = parseFloat(block.querySelector('.c-maximo').value) || 0;
    if (nombreRaw && maximoNum > 0) {
      graficables.push({ nombre: nombreRaw, puntaje: parseFloat(puntajeRaw) || 0, maximo: maximoNum });
    }
  });
  renderGraficoCompetencias(graficables);
  document.getElementById('out-pieGrafico').innerHTML = pieGraficoPartes(val('pieGraficoTexto'), graficables)
    .map(p => '<div class="body-text">' + p.map(x => x.bold ? '<b>' + escapeHTML(x.t) + '</b>' : escapeHTML(x.t)).join('') + '</div>')
    .join('');
}

// Frase de cierre del gráfico: total obtenido / posible y nivel según el %
function nivelDesempeno(pct) {
  if (pct >= 85) return 'desempeño sobresaliente';
  if (pct >= 70) return 'desempeño satisfactorio con buen potencial de desarrollo';
  if (pct >= 50) return 'desempeño aceptable con aspectos a desarrollar';
  return 'desempeño por debajo de lo esperado';
}
// Pie de gráfico: reemplaza {obtenido}, {maximo}, {porcentaje}, {nivel}; devuelve párrafos de partes {t, bold} (**negrita**)
function pieGraficoPartes(texto, datos) {
  const obtenido = datos.reduce((a, d) => a + d.puntaje, 0);
  const maximo = datos.reduce((a, d) => a + d.maximo, 0);
  const pct = maximo ? Math.round(obtenido / maximo * 100) : 0;
  const t = texto
    .replace(/\{obtenido\}/g, obtenido)
    .replace(/\{maximo\}/g, maximo)
    .replace(/\{porcentaje\}/g, pct)
    .replace(/\{nivel\}/g, nivelDesempeno(pct));
  return t.split(/\r?\n/).filter(l => l.trim())
    .map(l => l.split('**').map((s, i) => ({ t: s, bold: i % 2 === 1 })).filter(p => p.t));
}