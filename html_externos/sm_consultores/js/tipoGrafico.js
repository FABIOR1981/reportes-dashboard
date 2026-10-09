// ============================================================
//  SM CONSULTORES (con gráfico) – tipoGrafico.js
//  Botón + modal para que la persona elija el estilo visual del gráfico
//  de competencias. NO dibuja nada él mismo — solo lee/escribe
//  tipoGraficoActual (definida en grafico_Grafico.js) y dispara un
//  redibujado llamando a renderPreview().
//  Depende de: grafico_Grafico.js (tipoGraficoActual, dibujarAros,
//  dibujarBarras, dibujarLollipop, dibujarRadar, dibujarWaffle),
//  vistaPrevia_Grafico.js (renderPreview)
//  Del que depende: script_Grafico.js (llama a initTipoGrafico() en su
//  init() y a aplicarTipoGraficoGuardado() al cargar un JSON)
// ============================================================

// Datos de ejemplo FIJOS, solo para dibujar las miniaturas del modal — no
// tienen relación con las competencias reales que cargó la persona.
const EJEMPLO_COMPETENCIAS_MODAL = [
  { nombre: 'Adaptabilidad', puntaje: 3, maximo: 5 },
  { nombre: 'Responsabilidad', puntaje: 4, maximo: 5 },
  { nombre: 'Cap. resolutiva', puntaje: 4, maximo: 5 },
  { nombre: 'Adhesión a normas', puntaje: 3, maximo: 5 },
  { nombre: 'Proactividad', puntaje: 2, maximo: 5 }
];

// Cada opción sabe su propia función de dibujo real — así la miniatura del
// modal SIEMPRE coincide con el gráfico real (misma función, solo cambian
// los datos de entrada).
const OPCIONES_TIPO_GRAFICO = [
  { valor: 'aros', etiqueta: 'Aros de progreso', dibujar: dibujarAros, minimoCompetencias: 1 },
  { valor: 'barras', etiqueta: 'Barras horizontales', dibujar: dibujarBarras, minimoCompetencias: 1 },
  { valor: 'lollipop', etiqueta: 'Puntos y línea', dibujar: dibujarLollipop, minimoCompetencias: 1 },
  { valor: 'radar', etiqueta: 'Radar (telaraña)', dibujar: dibujarRadar, minimoCompetencias: 3 },
  { valor: 'waffle', etiqueta: 'Pictograma (waffle)', dibujar: dibujarWaffle, minimoCompetencias: 1 }
];

function initTipoGrafico() {
  const btn = document.getElementById('tipoGraficoBtn');
  if (!btn) return;
  btn.addEventListener('click', abrirModalTipoGrafico);
}

/**
 * Aplica un estilo guardado (por ejemplo, el que viene en un JSON de
 * "Cargar datos"). Si el valor no existe (JSON viejo sin este dato o
 * valor desconocido), no cambia nada y se queda el estilo actual.
 */
function aplicarTipoGraficoGuardado(valor) {
  if (OPCIONES_TIPO_GRAFICO.some(function(op) { return op.valor === valor; })) {
    tipoGraficoActual = valor;
  }
}

/**
 * Genera el markup SVG de una miniatura llamando a la función de dibujo
 * REAL sobre un contenedor desconectado del DOM, con los datos de ejemplo.
 */
function generarMiniatura(fnDibujar) {
  const temp = document.createElement('div');
  fnDibujar(temp, EJEMPLO_COMPETENCIAS_MODAL);
  return temp.innerHTML;
}

/**
 * Cuenta cuántas competencias cargadas son "graficables" hoy (con nombre
 * y puntaje máximo > 0) — mismo criterio que usa renderPreview() en
 * vistaPrevia_Grafico.js. Se usa solo para decidir si ofrecer "Radar"
 * (necesita 3+).
 */
function contarCompetenciasGraficables() {
  const bloques = document.querySelectorAll('#compContainer .comp-block');
  let n = 0;
  bloques.forEach(function(block) {
    const nombre = block.querySelector('.c-nombre').value.trim();
    const maximo = parseFloat(block.querySelector('.c-maximo').value) || 0;
    if (nombre && maximo > 0) n++;
  });
  return n;
}

function abrirModalTipoGrafico() {
  // Si ya hay un modal abierto (doble click accidental), no duplicar
  if (document.querySelector('.tipoGrafico-modal-overlay')) return;

  const cantidadReal = contarCompetenciasGraficables();

  const overlay = document.createElement('div');
  overlay.className = 'tipoGrafico-modal-overlay';

  const opcionesHtml = OPCIONES_TIPO_GRAFICO.map(function(op) {
    const checked = op.valor === tipoGraficoActual ? 'checked' : '';
    const deshabilitada = cantidadReal < op.minimoCompetencias;
    const miniatura = generarMiniatura(op.dibujar);

    return `
      <label class="tipoGrafico-opcion${deshabilitada ? ' tipoGrafico-opcion--disabled' : ''}">
        <input type="radio" name="tipoGraficoRadio" value="${op.valor}" ${checked} ${deshabilitada ? 'disabled' : ''}>
        <div class="tipoGrafico-miniatura">${miniatura}</div>
        <span class="tipoGrafico-opcion-label">${op.etiqueta}</span>
        ${deshabilitada ? `<span class="tipoGrafico-opcion-nota">Necesita ${op.minimoCompetencias}+ competencias cargadas (con puntaje máximo &gt; 0)</span>` : ''}
      </label>
    `;
  }).join('');

  overlay.innerHTML = `
    <div class="tipoGrafico-modal" role="dialog" aria-modal="true" aria-labelledby="tipoGraficoModalTitulo">
      <h2 id="tipoGraficoModalTitulo">Tipo de gráfico</h2>
      <p class="tipoGrafico-modal-subtitulo">Las miniaturas usan datos de ejemplo, no los tuyos — elegí el estilo y el contenido real se arma solo.</p>
      <div class="tipoGrafico-opciones">
        ${opcionesHtml}
      </div>
      <div class="tipoGrafico-modal-actions">
        <button type="button" class="tipoGrafico-modal-cancel">Cancelar</button>
        <button type="button" class="tipoGrafico-modal-confirm">Aplicar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Resaltado visual del elegido (sin depender de :has())
  function actualizarResaltado() {
    overlay.querySelectorAll('.tipoGrafico-opcion').forEach(function(label) {
      const radio = label.querySelector('input[type="radio"]');
      label.classList.toggle('tipoGrafico-opcion--seleccionada', radio.checked);
    });
  }
  actualizarResaltado();
  overlay.querySelectorAll('input[name="tipoGraficoRadio"]').forEach(function(radio) {
    radio.addEventListener('change', actualizarResaltado);
  });

  function cerrar() {
    document.removeEventListener('keydown', alTeclear);
    overlay.remove();
  }
  function alTeclear(e) {
    if (e.key === 'Escape') cerrar();
  }
  document.addEventListener('keydown', alTeclear);

  overlay.querySelector('.tipoGrafico-modal-cancel').addEventListener('click', cerrar);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) cerrar(); // click afuera de la caja = cancelar
  });

  overlay.querySelector('.tipoGrafico-modal-confirm').addEventListener('click', function() {
    const seleccionado = overlay.querySelector('input[name="tipoGraficoRadio"]:checked');
    if (seleccionado) {
      tipoGraficoActual = seleccionado.value;
      renderPreview(); // redibuja la vista previa con el nuevo estilo
    }
    cerrar();
  });
}
