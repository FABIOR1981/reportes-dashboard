// ============================================================
//  INFORME GENÉRICO (con gráfico) – tipoGrafico.js
//  Botón + modal para que el usuario elija el estilo visual del gráfico
//  de aspectos evaluados. NO dibuja nada él mismo — solo lee/escribe
//  tipoGraficoActual (definida en grafico_Grafico.js) y dispara un
//  redibujado llamando a updatePreviewFn().
//  Depende de: grafico_Grafico.js (tipoGraficoActual),
//  vistaPrevia_Grafico.js (updatePreviewFn)
//  Del que depende: script_Grafico.js (llama a initTipoGrafico() en su init())
// ============================================================

// Opciones disponibles hoy. Cuando se sumen lollipop/radar, alcanza con
// agregar una línea acá — el modal se arma solo a partir de esta lista.
const OPCIONES_TIPO_GRAFICO = [
  { valor: 'barras', etiqueta: 'Barras horizontales' },
  { valor: 'aros', etiqueta: 'Aros de progreso' }
];

function initTipoGrafico() {
  const btn = document.getElementById('tipoGraficoBtn');
  if (!btn) return; // el botón no existe en el HTML todavía / informe sin este feature
  btn.addEventListener('click', abrirModalTipoGrafico);
}

function abrirModalTipoGrafico() {
  // Si ya hay un modal abierto (doble click accidental), no duplicar
  if (document.querySelector('.tipoGrafico-modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'tipoGrafico-modal-overlay';

  const opcionesHtml = OPCIONES_TIPO_GRAFICO.map(function(op) {
    const checked = op.valor === tipoGraficoActual ? 'checked' : '';
    return `
      <label class="tipoGrafico-opcion">
        <input type="radio" name="tipoGraficoRadio" value="${op.valor}" ${checked}>
        <span>${op.etiqueta}</span>
      </label>
    `;
  }).join('');

  overlay.innerHTML = `
    <div class="tipoGrafico-modal" role="dialog" aria-modal="true" aria-labelledby="tipoGraficoModalTitulo">
      <h2 id="tipoGraficoModalTitulo">Tipo de gráfico</h2>
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
