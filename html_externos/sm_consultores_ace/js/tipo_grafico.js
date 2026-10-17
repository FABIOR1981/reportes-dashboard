// Botón + modal para elegir el estilo del gráfico. Lee/escribe tipoGraficoActual (grafico_competencias.js)
// y redibuja con updatePreview().

// Datos fijos solo para las miniaturas del modal
const EJEMPLO_COMPETENCIAS_MODAL = [
  { nombre: 'Adaptabilidad', puntaje: 3, maximo: 5 },
  { nombre: 'Responsabilidad', puntaje: 4, maximo: 5 },
  { nombre: 'Cap. resolutiva', puntaje: 4, maximo: 5 },
  { nombre: 'Adhesión a normas', puntaje: 3, maximo: 5 },
  { nombre: 'Proactividad', puntaje: 1, maximo: 5 }
];

const OPCIONES_TIPO_GRAFICO = [
  { valor: 'columnas', etiqueta: 'Columnas agrupadas', dibujar: dibujarColumnas, minimoCompetencias: 1 },
  { valor: 'aros', etiqueta: 'Aros de progreso', dibujar: dibujarAros, minimoCompetencias: 1 },
  { valor: 'barras', etiqueta: 'Barras horizontales', dibujar: dibujarBarras, minimoCompetencias: 1 },
  { valor: 'lollipop', etiqueta: 'Puntos y línea', dibujar: dibujarLollipop, minimoCompetencias: 1 },
  { valor: 'radar', etiqueta: 'Radar (telaraña)', dibujar: dibujarRadar, minimoCompetencias: 3 },
  { valor: 'waffle', etiqueta: 'Pictograma (waffle)', dibujar: dibujarWaffle, minimoCompetencias: 1 },
  { valor: 'torta', etiqueta: 'Torta por nivel', dibujar: dibujarTorta, minimoCompetencias: 1 },
  { valor: 'anillo', etiqueta: 'Anillo por competencia', dibujar: dibujarAnillo, minimoCompetencias: 1 }
];

function initTipoGrafico() {
  const btn = document.getElementById('tipoGraficoBtn');
  if (btn) btn.addEventListener('click', abrirModalTipoGrafico);
}

// Ignora valores desconocidos (JSON viejo sin este dato)
function aplicarTipoGraficoGuardado(valor) {
  if (OPCIONES_TIPO_GRAFICO.some(function (op) { return op.valor === valor; })) {
    tipoGraficoActual = valor;
  }
}

function generarMiniatura(fnDibujar) {
  const temp = document.createElement('div');
  fnDibujar(temp, EJEMPLO_COMPETENCIAS_MODAL);
  return temp.innerHTML;
}

// Mismo criterio que updatePreview(): nombre y máximo > 0
function contarCompetenciasGraficables() {
  let n = 0;
  compContainer.querySelectorAll('.comp-block').forEach(function (block) {
    const nombre = block.querySelector('.c-nombre').value.trim();
    const maximo = parseFloat(block.querySelector('.c-maximo').value) || 0;
    if (nombre && maximo > 0) n++;
  });
  return n;
}

function abrirModalTipoGrafico() {
  if (document.querySelector('.tipoGrafico-modal-overlay')) return;

  const cantidadReal = contarCompetenciasGraficables();
  const overlay = document.createElement('div');
  overlay.className = 'tipoGrafico-modal-overlay';

  const opcionesHtml = OPCIONES_TIPO_GRAFICO.map(function (op) {
    const checked = op.valor === tipoGraficoActual ? 'checked' : '';
    const deshabilitada = cantidadReal < op.minimoCompetencias;
    return `
      <label class="tipoGrafico-opcion${deshabilitada ? ' tipoGrafico-opcion--disabled' : ''}">
        <input type="radio" name="tipoGraficoRadio" value="${op.valor}" ${checked} ${deshabilitada ? 'disabled' : ''}>
        <div class="tipoGrafico-miniatura">${generarMiniatura(op.dibujar)}</div>
        <span class="tipoGrafico-opcion-label">${op.etiqueta}</span>
        ${deshabilitada ? `<span class="tipoGrafico-opcion-nota">Necesita ${op.minimoCompetencias}+ competencias cargadas (con puntaje máximo &gt; 0)</span>` : ''}
      </label>
    `;
  }).join('');

  overlay.innerHTML = `
    <div class="tipoGrafico-modal" role="dialog" aria-modal="true" aria-labelledby="tipoGraficoModalTitulo">
      <h2 id="tipoGraficoModalTitulo">Tipo de gráfico</h2>
      <p class="tipoGrafico-modal-subtitulo">Las miniaturas usan datos de ejemplo, no los tuyos — elegí el estilo y el contenido real se arma solo.</p>
      <div class="tipoGrafico-opciones">${opcionesHtml}</div>
      <div class="tipoGrafico-modal-actions">
        <button type="button" class="tipoGrafico-modal-cancel">Cancelar</button>
        <button type="button" class="tipoGrafico-modal-confirm">Aplicar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  function actualizarResaltado() {
    overlay.querySelectorAll('.tipoGrafico-opcion').forEach(function (label) {
      label.classList.toggle('tipoGrafico-opcion--seleccionada', label.querySelector('input[type="radio"]').checked);
    });
  }
  actualizarResaltado();
  overlay.querySelectorAll('input[name="tipoGraficoRadio"]').forEach(function (radio) {
    radio.addEventListener('change', actualizarResaltado);
  });

  function cerrar() {
    document.removeEventListener('keydown', alTeclear);
    overlay.remove();
  }
  function alTeclear(e) { if (e.key === 'Escape') cerrar(); }
  document.addEventListener('keydown', alTeclear);

  overlay.querySelector('.tipoGrafico-modal-cancel').addEventListener('click', cerrar);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) cerrar(); });
  overlay.querySelector('.tipoGrafico-modal-confirm').addEventListener('click', function () {
    const sel = overlay.querySelector('input[name="tipoGraficoRadio"]:checked');
    if (sel) {
      tipoGraficoActual = sel.value;
      updatePreview();
    }
    cerrar();
  });
}
