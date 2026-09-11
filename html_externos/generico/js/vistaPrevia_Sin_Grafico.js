// ============================================================
//  INFORME GENÉRICO (sin gráfico) – vistaPrevia_Sin_Grafico.js
//  Bloques dinámicos de "aspectos" + render de la vista previa (#page1)
//  Depende de: utils.js (escapeHTML, debounce)
// ============================================================

// Datos de ejemplo para los aspectos evaluados
const defaultAspectos = [
  { nombre: 'Organización', puntaje: 4, maximo: 5, descripcion: 'Se observa un manejo ordenado de las tareas asignadas, con buena planificación de los tiempos.' },
  { nombre: 'Comunicación', puntaje: 3, maximo: 5, descripcion: 'La comunicación con el equipo es adecuada, aunque podría reforzarse en instancias de mayor exigencia.' },
  { nombre: 'Cumplimiento de plazos', puntaje: 4, maximo: 5, descripcion: 'Las tareas se completan dentro de los plazos establecidos en la mayoría de los casos relevados.' }
];

// Agregar bloque de aspecto dinámico
function addAspectoBlock(data) {
  data = data || { nombre: '', puntaje: 3, maximo: 5, descripcion: '' };
  const container = document.getElementById('aspectosContainer');

  const div = document.createElement('div');
  div.className = 'aspecto-block';
  div.innerHTML = `
    <button type="button" class="del-btn">✕ Eliminar</button>
    <div class="form-group">
      <label>Aspecto</label>
      <input type="text" class="asp-nombre" value="${escapeHTML(data.nombre || '')}" placeholder="Ej: Comunicación, Liderazgo, etc.">
    </div>
    <div class="row2">
      <div class="form-group">
        <label>Puntaje obtenido</label>
        <input type="number" class="asp-puntaje" min="0" max="10" value="${data.puntaje ?? 3}">
      </div>
      <div class="form-group">
        <label>Puntaje máximo</label>
        <input type="number" class="asp-maximo" min="1" max="10" value="${data.maximo ?? 5}">
      </div>
    </div>
    <div class="form-group">
      <label>Descripción</label>
      <textarea class="asp-desc" rows="3" placeholder="Descripción de la evaluación...">${escapeHTML(data.descripcion || '')}</textarea>
    </div>
  `;

  div.querySelector('.del-btn').addEventListener('click', function() {
    div.remove();
    updatePreview();
  });

  // Delegación de eventos para inputs y textareas
  div.querySelectorAll('input, textarea').forEach(function(el) {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  });

  container.appendChild(div);
}

// Actualizar la vista previa
function updatePreviewFn() {
  const titulo = document.getElementById('tituloInforme').value.trim();
  const destinatario = document.getElementById('destinatario').value.trim();
  const fecha = document.getElementById('fechaInforme').value;

  const resumen = document.getElementById('resumen').value.trim();
  const desarrollo = document.getElementById('desarrollo').value.trim();
  const conclusion = document.getElementById('conclusion').value.trim();
  const clasifEl = document.querySelector('input[name="clasificacion"]:checked');
  const clasificacion = clasifEl ? clasifEl.value : '';

  // Encabezado
  document.getElementById('prevTitulo').textContent = titulo || 'INFORME GENERAL';
  document.getElementById('prevDestinatario').textContent = destinatario ? 'Para: ' + destinatario : '';
  document.getElementById('prevFecha').textContent = fecha ? 'Fecha: ' + fecha : '';

  // Resumen
  const secResumen = document.getElementById('secResumen');
  const chkResumen = document.getElementById('chkResumen').checked;
  if (resumen && chkResumen) {
    document.getElementById('prevResumen').textContent = resumen;
    secResumen.style.display = 'block';
  } else {
    secResumen.style.display = 'none';
  }

  // Desarrollo
  const secDesarrollo = document.getElementById('secDesarrollo');
  const chkDesarrollo = document.getElementById('chkDesarrollo').checked;
  if (desarrollo && chkDesarrollo) {
    document.getElementById('prevDesarrollo').textContent = desarrollo;
    secDesarrollo.style.display = 'block';
  } else {
    secDesarrollo.style.display = 'none';
  }

  // Conclusión
  const secConclusion = document.getElementById('secConclusion');
  const chkConclusion = document.getElementById('chkConclusion').checked;
  if (conclusion && chkConclusion) {
    document.getElementById('prevConclusion').textContent = conclusion;
    secConclusion.style.display = 'block';
  } else {
    secConclusion.style.display = 'none';
  }

  // Clasificación
  const secClasificacion = document.getElementById('secClasificacion');
  const chkClasificacion = document.getElementById('chkClasificacion').checked;
  const clasifObsWrapper = document.getElementById('clasifObsWrapper');
  const clasifObservaciones = document.getElementById('clasifObservaciones').value.trim();
  const esConObservaciones = clasificacion === 'Con observaciones';

  if (clasifObsWrapper) {
    clasifObsWrapper.style.display = esConObservaciones ? 'block' : 'none';
  }

  if (clasificacion && chkClasificacion) {
    document.getElementById('prevClasificacion').textContent = clasificacion;
    document.getElementById('prevClasifObservaciones').textContent =
      (esConObservaciones && clasifObservaciones) ? clasifObservaciones : '';
    secClasificacion.style.display = 'block';
  } else {
    document.getElementById('prevClasifObservaciones').textContent = '';
    secClasificacion.style.display = 'none';
  }

  // Firma del firmante
  const secFirma = document.getElementById('secFirma');
  const chkFirma = document.getElementById('chkFirma').checked;
  const firmanteNombre = document.getElementById('firmanteNombre').value.trim();
  const firmanteCargo = document.getElementById('firmanteCargo').value.trim();
  const firmanteContacto = document.getElementById('firmanteContacto').value.trim();

  if (chkFirma && (firmanteNombre || firmanteCargo || firmanteContacto)) {
    document.getElementById('prevFirmanteNombre').textContent = firmanteNombre;
    document.getElementById('prevFirmanteCargo').textContent = firmanteCargo;
    document.getElementById('prevFirmanteContacto').textContent = firmanteContacto;
    secFirma.style.display = 'block';
  } else {
    secFirma.style.display = 'none';
  }

  // Aspectos dinámicos
  const secAspectos = document.getElementById('secAspectos');
  const aspectosContainer = document.getElementById('aspectosContainer');
  const aspectosOutContainer = document.getElementById('aspectosOutContainer');

  const aspectosBlocks = aspectosContainer.querySelectorAll('.aspecto-block');
  if (aspectosBlocks.length > 0) {
    aspectosOutContainer.innerHTML = '';
    aspectosBlocks.forEach(function(block) {
      const nombre = block.querySelector('.asp-nombre').value.trim();
      const puntaje = block.querySelector('.asp-puntaje').value.trim();
      const maximo = block.querySelector('.asp-maximo').value.trim();
      const desc = block.querySelector('.asp-desc').value.trim();

      const puntajeNum = parseFloat(puntaje) || 0;
      const maximoNum = parseFloat(maximo) || 0;
      const mostrarPuntajes = puntajeNum !== 0 || maximoNum !== 0;

      if (nombre || desc) {
        const item = document.createElement('div');
        item.className = 'aspecto-item';
        item.innerHTML = `
          <div class="aspecto-name">${escapeHTML(nombre) || '(sin nombre)'}</div>
          ${mostrarPuntajes ? '<div class="aspecto-scores"><b>Puntaje obtenido:</b> ' + escapeHTML(puntaje || '-') + ' &nbsp; <b>Puntaje máximo:</b> ' + escapeHTML(maximo || '-') + '</div>' : ''}
          ${desc ? '<div class="aspecto-desc">' + escapeHTML(desc) + '</div>' : ''}
        `;
        aspectosOutContainer.appendChild(item);
      }
    });
    secAspectos.style.display = aspectosOutContainer.children.length > 0 ? 'block' : 'none';
  } else {
    secAspectos.style.display = 'none';
  }
}

const updatePreview = debounce(updatePreviewFn, 300);
