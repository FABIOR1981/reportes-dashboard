const defaultComps = [
  { nombre: 'Liderazgo', puntaje: 2, maximo: 3 },
  { nombre: 'Capacidad de trabajo en equipo y coordinación', puntaje: 3, maximo: 3 },
  { nombre: 'Resolución de problemas, toma de decisiones y gestión de conflictos', puntaje: 2, maximo: 3 },
  { nombre: 'Habilidades de comunicación efectiva y percepción de necesidades de los socios', puntaje: 2, maximo: 3 },
  { nombre: 'Orientación al cliente, al socio y a resultados', puntaje: 2, maximo: 3 },
  { nombre: 'Capacidad de negociación', puntaje: 2, maximo: 3 },
  { nombre: 'Organización, planificación y cumplimiento normativo', puntaje: 3, maximo: 3 },
  { nombre: 'Gestión eficiente y atención al detalle', puntaje: 2, maximo: 3 },
  { nombre: 'Iniciativa, proactividad y enfoque comercial', puntaje: 2, maximo: 3 },
  { nombre: 'Adaptabilidad y gestión del cambio', puntaje: 2, maximo: 3 }
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
  setText('out-perfilTexto', val('perfilTexto'));
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
  document.getElementById('out-resultadoFinal').innerHTML = resultadoFinalHtml(graficables);
}

// Frase de cierre del gráfico: total obtenido / posible y nivel según el %
function nivelDesempeno(pct) {
  if (pct >= 85) return 'desempeño sobresaliente';
  if (pct >= 70) return 'desempeño satisfactorio con buen potencial de desarrollo';
  if (pct >= 50) return 'desempeño aceptable con aspectos a desarrollar';
  return 'desempeño por debajo de lo esperado';
}
function resultadoFinalHtml(datos) {
  if (!datos.length) return '';
  const obtenido = datos.reduce((a, d) => a + d.puntaje, 0);
  const maximo = datos.reduce((a, d) => a + d.maximo, 0);
  const pct = Math.round(obtenido / maximo * 100);
  return `El resultado final es <b>${obtenido} sobre ${maximo}</b>, equivalente al ${pct}% del máximo posible, lo que refleja un <b>${nivelDesempeno(pct)}</b>.`;
}