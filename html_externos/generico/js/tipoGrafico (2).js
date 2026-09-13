// ============================================================
//  INFORME GENÉRICO (con gráfico) – tipoGrafico.js
//  Botón + modal para que el usuario elija el estilo visual del gráfico
//  de aspectos evaluados. NO dibuja nada él mismo — solo lee/escribe
//  tipoGraficoActual (definida en grafico_Grafico.js) y dispara un
//  redibujado llamando a updatePreviewFn().
//  Depende de: grafico_Grafico.js (tipoGraficoActual, dibujarBarras,
//  dibujarAros, dibujarLollipop, dibujarRadar), vistaPrevia_Grafico.js
//  (updatePreviewFn)
//  Del que depende: script_Grafico.js (llama a initTipoGrafico() en su init())
// ============================================================

// Datos de ejemplo FIJOS, solo para dibujar las miniaturas del modal — no
// tienen relación con los aspectos reales que cargó el usuario. Los
// valores replican el mockup original (opciones_grafico_competencias.html)
// para que las miniaturas se vean iguales a como se diseñaron.
const EJEMPLO_ASPECTOS_MODAL = [
  { nombre: 'Adaptabilidad', puntaje: 8, maximo: 10 },
  { nombre: 'Responsabilidad', puntaje: 9, maximo: 10 },
  { nombre: 'Cap. resolutiva', puntaje: 8.5, maximo: 10 },
  { nombre: 'Adhesión a normas', puntaje: 7, maximo: 10 },
  { nombre: 'Proactividad', puntaje: 5.5, maximo: 10 }
];

// Cada opción sabe su propia función de dibujo real — así la miniatura del
// modal SIEMPRE coincide con el gráfico real (misma función, mismo código,
// solo cambian los datos de entrada). Si el día de mañana se ajustan
// colores o espaciados en grafico_Grafico.js, las miniaturas se actualizan
// solas, sin tocar nada acá.
const OPCIONES_TIPO_GRAFICO = [
  { valor: 'barras', etiqueta: 'Barras horizontales', dibujar: dibujarBarras, minimoAspectos: 1 },
  { valor: 'aros', etiqueta: 'Aros de progreso', dibujar: dibujarAros, minimoAspectos: 1 },
  { valor: 'lollipop', etiqueta: 'Puntos y línea', dibujar: dibujarLollipop, minimoAspectos: 1 },
  { valor: 'radar', etiqueta: 'Radar (telaraña)', dibujar: dibujarRadar, minimoAspectos: 3 }
];

function initTipoGrafico() {
  const btn = document.getElementById('tipoGraficoBtn');
  if (!btn) return; // el botón no existe en el HTML todavía / informe sin este feature
  btn.addEventListener('click', abrirModalTipoGrafico);
}

/**
 * Genera el markup SVG de una miniatura llamando a la función de dibujo
 * REAL sobre un contenedor desconectado del DOM (nunca se agrega a la
 * página), con los datos de ejemplo fijos. Como las funciones dibujarX
 * solo hacen matemática a partir del viewBox (no miden el layout real de
 * la página), funcionan igual de bien sobre un div desconectado.
 */
function generarMiniatura(fnDibujar) {
  const temp = document.createElement('div');
  fnDibujar(temp, EJEMPLO_ASPECTOS_MODAL);
  return temp.innerHTML;
}

/**
 * Cuenta cuántos aspectos cargados por el usuario son "graficables" hoy
 * (con nombre y puntaje máximo > 0) — mismo criterio que usa
 * updatePreviewFn() en vistaPrevia_Grafico.js. Se usa solo para decidir
 * si ofrecer o no la opción "Radar" (necesita 3+).
 */
function contarAspectosGraficables() {
  const bloques = document.querySelectorAll('#aspectosContainer .aspecto-block');
  let n = 0;
  bloques.forEach(function(block) {
    const nombre = block.querySelector('.asp-nombre').value.trim();
    const maximo = parseFloat(block.querySelector('.asp-maximo').value) || 0;
    if (nombre && maximo > 0) n++;
  });
  return n;
}

function abrirModalTipoGrafico() {
  // Si ya hay un modal abierto (doble click accidental), no duplicar
  if (document.querySelector('.tipoGrafico-modal-overlay')) return;

  const cantidadReal = contarAspectosGraficables();

  const overlay = document.createElement('div');
  overlay.className = 'tipoGrafico-modal-overlay';

  const opcionesHtml = OPCIONES_TIPO_GRAFICO.map(function(op) {
    const checked = op.valor === tipoGraficoActual ? 'checked' : '';
    const deshabilitada = cantidadReal < op.minimoAspectos;
    const miniatura = generarMiniatura(op.dibujar);

    return `
      <label class="tipoGrafico-opcion${deshabilitada ? ' tipoGrafico-opcion--disabled' : ''}">
        <input type="radio" name="tipoGraficoRadio" value="${op.valor}" ${checked} ${deshabilitada ? 'disabled' : ''}>
        <div class="tipoGrafico-miniatura">${miniatura}</div>
        <span class="tipoGrafico-opcion-label">${op.etiqueta}</span>
        ${deshabilitada ? `<span class="tipoGrafico-opcion-nota">Necesita ${op.minimoAspectos}+ aspectos cargados (con puntaje máximo &gt; 0)</span>` : ''}
      </label>
    `;
  }).join('');

  overlay.innerHTML = `
    <div class="tipoGrafico-modal" role="dialog" aria-modal="true" aria-labelledby="tipoGraficoModalTitulo">
      <h2 id="tipoGraficoModalTitulo">Tipo de gráfico</h2>
      <p class="tipoGrafico-modal-subtitulo">Las miniaturas usan datos de ejemplo, no los tuyos — elegí el estilo, el contenido real se arma solo.</p>
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

  // Resaltado visual del elegido, sin depender de :has() (ver nota en
  // style_Grafico.css) — se marca la que ya viene "checked" al abrir, y se
  // actualiza cada vez que el usuario cambia de radio dentro del modal.
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
    overlay.remove();
  }

  overlay.querySelector('.tipoGrafico-modal-cancel').addEventListener('click', cerrar);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) cerrar(); // click afuera de la caja = cancelar
  });

  overlay.querySelector('.tipoGrafico-modal-confirm').addEventListener('click', function() {
    const seleccionado = overlay.querySelector('input[name="tipoGraficoRadio"]:checked');
    if (seleccionado) {
      tipoGraficoActual = seleccionado.value;
      updatePreviewFn(); // redibuja el preview completo con el nuevo tipo
    }
    cerrar();
  });
}
