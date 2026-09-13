// ============================================================
//  INFORME GENÉRICO (con gráfico) – grafico_Grafico.js
//  Dibuja el gráfico de aspectos evaluados (varios estilos posibles) y lo
//  rasteriza a PNG para poder insertarlo en el Word.
//  Depende de: utils.js (escapeHTML)
//  Del que dependen: vistaPrevia_Grafico.js (llama a renderGraficoAspectos),
//  exportWord_Grafico.js (llama a generarImagenGraficoParaWord),
//  tipoGrafico.js (lee/cambia la variable tipoGraficoActual de acá abajo)
// ============================================================

/**
 * Tipo de gráfico actualmente seleccionado. Lo cambia tipoGrafico.js
 * cuando el usuario elige una opción en el modal. Vive acá (no en
 * tipoGrafico.js) porque este archivo es el dueño de todo lo relacionado
 * al dibujo del gráfico — tipoGrafico.js solo la lee/escribe.
 * Valores posibles: 'barras' | 'aros' | 'lollipop' | 'radar' | 'waffle'
 */
let tipoGraficoActual = 'barras';

/**
 * Punto de entrada: decide qué función de dibujo llamar según
 * tipoGraficoActual. Si no hay datos graficables, oculta el contenedor
 * sin importar el tipo elegido.
 */
function renderGraficoAspectos(datos) {
  const cont = document.getElementById('graficoAspectosContainer');
  if (!cont) return;

  if (!datos || datos.length === 0) {
    cont.style.display = 'none';
    cont.innerHTML = '';
    return;
  }

  switch (tipoGraficoActual) {
    case 'aros':
      dibujarAros(cont, datos);
      break;
    case 'lollipop':
      dibujarLollipop(cont, datos);
      break;
    case 'radar':
      dibujarRadar(cont, datos);
      break;
    case 'waffle':
      dibujarWaffle(cont, datos);
      break;
    case 'barras':
    default:
      dibujarBarras(cont, datos);
      break;
  }
}

/**
 * Dibuja un gráfico de barras horizontales (SVG puro, sin librerías
 * externas) con el % logrado de cada aspecto graficable.
 */
function dibujarBarras(cont, datos) {
  const anchoTotal = 600;
  const altoBarra = 26;
  const espacio = 14;
  const altoTotal = datos.length * (altoBarra + espacio) + espacio;
  const anchoEtiqueta = 170;
  const anchoBarraMax = anchoTotal - anchoEtiqueta - 60;

  let barras = '';
  datos.forEach(function(d, i) {
    const pct = Math.max(0, Math.min(100, (d.puntaje / d.maximo) * 100));
    const y = espacio + i * (altoBarra + espacio);
    const anchoBarra = (pct / 100) * anchoBarraMax;
    const color = pct >= 70 ? '#3f6b52' : (pct >= 40 ? '#b6863f' : '#c1503f');

    barras += `
      <text x="0" y="${y + altoBarra / 2 + 4}" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="#333">${escapeHTML(d.nombre).slice(0, 26)}</text>
      <rect x="${anchoEtiqueta}" y="${y}" width="${anchoBarraMax}" height="${altoBarra}" fill="#eef0ea" rx="4"></rect>
      <rect x="${anchoEtiqueta}" y="${y}" width="${anchoBarra}" height="${altoBarra}" fill="${color}" rx="4"></rect>
      <text x="${anchoEtiqueta + anchoBarraMax + 8}" y="${y + altoBarra / 2 + 4}" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="#333">${Math.round(pct)}%</text>
    `;
  });

  cont.innerHTML = `
    <svg viewBox="0 0 ${anchoTotal} ${altoTotal}" width="${anchoTotal}" height="${altoTotal}" style="width:100%;height:auto;display:block;" xmlns="http://www.w3.org/2000/svg">
      ${barras}
    </svg>
  `;
  cont.style.display = 'block';
}

/**
 * Dibuja aros de progreso, uno por aspecto, en fila (Opción B del mockup).
 * Algoritmo portado de sm_consultores/js/grafico_Grafico.js
 * (renderGraficoCompetencias) — misma geometría de círculo, adaptado a la
 * forma de datos de este informe ({nombre, puntaje, maximo}).
 */
function dibujarAros(cont, datos) {
  const porAro = 110;      // ancho asignado a cada aro dentro de la fila
  const r = 38;             // radio del aro
  const grosor = 10;        // grosor del trazo del aro
  const cy = 55;             // centro vertical de los aros
  const altoTotal = 150;
  const anchoTotal = datos.length * porAro;
  const circunferencia = 2 * Math.PI * r;

  let aros = '';
  datos.forEach(function(d, i) {
    const pct = Math.max(0, Math.min(100, (d.puntaje / d.maximo) * 100));
    const cx = porAro * i + porAro / 2;
    const largoValor = (circunferencia * pct / 100).toFixed(1);
    const color = pct >= 70 ? '#3f6b52' : (pct >= 40 ? '#b6863f' : '#c1503f');
    const lineas = wrapLabel(d.nombre, 13, 2);

    let etiquetaSvg = '';
    lineas.forEach(function(linea, j) {
      etiquetaSvg += `<text x="${cx}" y="${cy + r + 17 + j * 13}" text-anchor="middle" font-size="10.5" font-family="Segoe UI, Arial, sans-serif" fill="#555">${escapeHTML(linea)}</text>`;
    });

    aros += `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="${grosor}"></circle>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${grosor}" stroke-linecap="round" stroke-dasharray="${largoValor} 1000" transform="rotate(-90 ${cx} ${cy})"></circle>
      <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="15" font-family="Segoe UI, Arial, sans-serif" fill="#333">${Math.round(pct)}%</text>
      ${etiquetaSvg}
    `;
  });

  cont.innerHTML = `
    <svg viewBox="0 0 ${anchoTotal} ${altoTotal}" width="${anchoTotal}" height="${altoTotal}" style="width:100%;height:auto;display:block;" xmlns="http://www.w3.org/2000/svg">
      ${aros}
    </svg>
  `;
  cont.style.display = 'block';
}

/**
 * Corta el nombre de un aspecto en hasta "maxLineas" líneas de como mucho
 * "maxCharsPorLinea" caracteres cada una, para que entre debajo del aro
 * sin desbordar (usado por dibujarAros y dibujarRadar). Portado de
 * sm_consultores/js/grafico_Grafico.js (wrapLabel).
 */
function wrapLabel(nombre, maxCharsPorLinea, maxLineas) {
  const palabras = (nombre || '').trim().split(/\s+/);
  const lineas = [];
  let actual = '';
  for (const palabra of palabras) {
    const prueba = actual ? actual + ' ' + palabra : palabra;
    if (prueba.length <= maxCharsPorLinea || !actual) {
      actual = prueba;
    } else {
      lineas.push(actual);
      actual = palabra;
      if (lineas.length === maxLineas) break;
    }
  }
  if (actual) lineas.push(actual);
  return lineas.slice(0, maxLineas);
}

/**
 * Dibuja un gráfico de "puntos y línea" (lollipop): una línea fina desde
 * el margen izquierdo hasta el % logrado, terminando en un círculo, con
 * el número al lado. Opción A del mockup.
 */
function dibujarLollipop(cont, datos) {
  const anchoTotal = 600;
  const altoFila = 34;
  const espacio = 6;
  const altoTotal = datos.length * (altoFila + espacio) + espacio;
  const anchoEtiqueta = 170;
  const anchoLineaMax = anchoTotal - anchoEtiqueta - 60;

  let filas = '';
  datos.forEach(function(d, i) {
    const pct = Math.max(0, Math.min(100, (d.puntaje / d.maximo) * 100));
    const y = espacio + i * (altoFila + espacio) + altoFila / 2;
    const xInicio = anchoEtiqueta;
    const xFin = anchoEtiqueta + (pct / 100) * anchoLineaMax;
    const color = pct >= 70 ? '#3f6b52' : (pct >= 40 ? '#b6863f' : '#c1503f');

    filas += `
      <text x="0" y="${y + 4}" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="#333">${escapeHTML(d.nombre).slice(0, 26)}</text>
      <line x1="${xInicio}" y1="${y}" x2="${anchoEtiqueta + anchoLineaMax}" y2="${y}" stroke="#e5e7eb" stroke-width="2"></line>
      <line x1="${xInicio}" y1="${y}" x2="${xFin.toFixed(1)}" y2="${y}" stroke="${color}" stroke-width="2" stroke-linecap="round"></line>
      <circle cx="${xFin.toFixed(1)}" cy="${y}" r="6" fill="${color}" stroke="#fff" stroke-width="2"></circle>
      <text x="${anchoEtiqueta + anchoLineaMax + 12}" y="${y + 4}" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="#333" font-weight="500">${Math.round(pct)}%</text>
    `;
  });

  cont.innerHTML = `
    <svg viewBox="0 0 ${anchoTotal} ${altoTotal}" width="${anchoTotal}" height="${altoTotal}" style="width:100%;height:auto;display:block;" xmlns="http://www.w3.org/2000/svg">
      ${filas}
    </svg>
  `;
  cont.style.display = 'block';
}

/**
 * Dibuja un pictograma (waffle): una fila de 10 cuadrados por aspecto,
 * rellenando de a uno según el % logrado (redondeado a la decena más
 * cercana). Mismo layout de dos columnas (etiqueta a la izquierda, %
 * a la derecha) y misma paleta de color por umbral que dibujarBarras.
 */
function dibujarWaffle(cont, datos) {
  const anchoTotal = 600;
  const cuadSize = 20;
  const gapCuad = 4;
  const numCuad = 10;
  const altoFila = 30;
  const espacio = 14;
  const altoTotal = datos.length * (altoFila + espacio) + espacio;
  const anchoEtiqueta = 170;

  let filas = '';
  datos.forEach(function(d, i) {
    const pct = Math.max(0, Math.min(100, (d.puntaje / d.maximo) * 100));
    const llenos = Math.round(pct / 10);
    const y = espacio + i * (altoFila + espacio);
    const color = pct >= 70 ? '#3f6b52' : (pct >= 40 ? '#b6863f' : '#c1503f');

    let cuadrados = '';
    for (let c = 0; c < numCuad; c++) {
      const x = anchoEtiqueta + c * (cuadSize + gapCuad);
      const relleno = c < llenos ? color : '#eef0ea';
      cuadrados += `<rect x="${x}" y="${y}" width="${cuadSize}" height="${cuadSize}" rx="3" fill="${relleno}"></rect>`;
    }

    filas += `
      <text x="0" y="${y + cuadSize / 2 + 4}" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="#333">${escapeHTML(d.nombre).slice(0, 26)}</text>
      ${cuadrados}
      <text x="${anchoEtiqueta + numCuad * (cuadSize + gapCuad) + 4}" y="${y + cuadSize / 2 + 4}" font-size="12" font-family="Segoe UI, Arial, sans-serif" fill="#333" font-weight="500">${Math.round(pct)}%</text>
    `;
  });

  cont.innerHTML = `
    <svg viewBox="0 0 ${anchoTotal} ${altoTotal}" width="${anchoTotal}" height="${altoTotal}" style="width:100%;height:auto;display:block;" xmlns="http://www.w3.org/2000/svg">
      ${filas}
    </svg>
  `;
  cont.style.display = 'block';
}

/**
 * Dibuja un radar/telaraña con un vértice por aspecto (Opción C del
 * mockup). A diferencia del mockup (armado a mano para exactamente 5
 * puntos), esta versión calcula los ángulos con trigonometría para
 * cualquier cantidad de aspectos (360°/N, empezando arriba, en sentido
 * horario).
 *
 * Con menos de 3 aspectos un radar no tiene sentido visual real (con 2
 * puntos es una línea, con 1 es un punto) — en ese caso se muestra un
 * aviso en vez de un dibujo confuso. El modal de selección (tipoGrafico.js)
 * ya evita ofrecer esta opción cuando hay menos de 3 aspectos cargados,
 * así que este caso es solo una red de seguridad adicional (por ejemplo,
 * si en el futuro se restaura una selección guardada de "radar" junto con
 * un JSON viejo de solo 2 aspectos).
 */
function dibujarRadar(cont, datos) {
  if (datos.length < 3) {
    cont.innerHTML = `
      <div style="padding:16px;text-align:center;color:#6b7280;font-size:13px;font-family:Segoe UI, Arial, sans-serif;">
        El gráfico de radar necesita al menos 3 aspectos con puntaje máximo definido.
      </div>
    `;
    cont.style.display = 'block';
    return;
  }

  const size = 320;
  const cx = size / 2;
  const cy = size / 2 + 4;
  const R = 92;
  const n = datos.length;

  function puntoEn(anguloDeg, radio) {
    const rad = (Math.PI / 180) * anguloDeg;
    return { x: cx + radio * Math.cos(rad), y: cy + radio * Math.sin(rad) };
  }

  // Un eje por aspecto, empezando arriba (-90°) y repartidos parejo
  const angulos = [];
  for (let i = 0; i < n; i++) angulos.push(-90 + i * (360 / n));

  // Anillos de referencia (grid) al 33/66/100% del radio
  let grid = '';
  [0.33, 0.66, 1].forEach(function(frac) {
    const pts = angulos.map(function(a) {
      const p = puntoEn(a, R * frac);
      return p.x.toFixed(1) + ',' + p.y.toFixed(1);
    }).join(' ');
    grid += `<polygon points="${pts}" fill="none" stroke="#e5e7eb" stroke-width="1"></polygon>`;
  });

  // Ejes desde el centro hasta cada vértice
  let ejes = '';
  angulos.forEach(function(a) {
    const p = puntoEn(a, R);
    ejes += `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="#e5e7eb" stroke-width="1"></line>`;
  });

  // Polígono de datos + puntos + etiquetas
  const puntosData = [];
  let puntosSvg = '';
  let etiquetas = '';
  datos.forEach(function(d, i) {
    const pct = Math.max(0, Math.min(100, (d.puntaje / d.maximo) * 100));
    const p = puntoEn(angulos[i], R * (pct / 100));
    puntosData.push(p.x.toFixed(1) + ',' + p.y.toFixed(1));

    const color = pct >= 70 ? '#3f6b52' : (pct >= 40 ? '#b6863f' : '#c1503f');
    puntosSvg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${color}"></circle>`;

    const pLabel = puntoEn(angulos[i], R + 24);
    const cosA = Math.cos((Math.PI / 180) * angulos[i]);
    const anchor = cosA > 0.3 ? 'start' : (cosA < -0.3 ? 'end' : 'middle');
    const primeraLinea = wrapLabel(d.nombre, 14, 1)[0] || '';
    etiquetas += `<text x="${pLabel.x.toFixed(1)}" y="${pLabel.y.toFixed(1)}" text-anchor="${anchor}" font-size="11" font-family="Segoe UI, Arial, sans-serif" fill="#555">${escapeHTML(primeraLinea)}</text>`;
  });

  const poligono = `<polygon points="${puntosData.join(' ')}" fill="#3f6b52" fill-opacity="0.25" stroke="#3f6b52" stroke-width="2"></polygon>`;

  const alto = size + 24;
  cont.innerHTML = `
    <svg viewBox="0 0 ${size} ${alto}" width="${size}" height="${alto}" style="width:100%;max-width:420px;height:auto;display:block;margin:0 auto;" xmlns="http://www.w3.org/2000/svg">
      ${grid}${ejes}${poligono}${puntosSvg}${etiquetas}
    </svg>
  `;
  cont.style.display = 'block';
}

/**
 * Convierte el SVG del gráfico de aspectos (ya dibujado en pantalla) a un
 * PNG en memoria, para poder insertarlo en el Word con docx.ImageRun
 * (el gráfico es SVG y docx no soporta SVG directamente, solo imágenes
 * rasterizadas). Devuelve null si no hay gráfico visible (sin aspectos
 * graficables) — en ese caso el Word simplemente no incluye imagen, igual
 * que el PDF no la incluiría.
 */
async function generarImagenGraficoParaWord() {
  const cont = document.getElementById('graficoAspectosContainer');
  const svgEl = cont ? cont.querySelector('svg') : null;
  if (!cont || cont.style.display === 'none' || !svgEl) return null;

  const svgWidth = parseInt(svgEl.getAttribute('width'), 10) || 600;
  const svgHeight = parseInt(svgEl.getAttribute('height'), 10) || 200;
  const escala = 2; // más nitidez dentro del documento Word

  const canvas = document.createElement('canvas');
  canvas.width = svgWidth * escala;
  canvas.height = svgHeight * escala;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const svgString = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await new Promise(function(resolve, reject) {
      const image = new Image();
      image.onload = function() { resolve(image); };
      image.onerror = reject;
      image.src = url;
    });
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } finally {
    URL.revokeObjectURL(url);
  }

  const dataUrl = canvas.toDataURL('image/png');
  const buffer = await (await fetch(dataUrl)).arrayBuffer();

  // Ancho fijo prolijo dentro de la hoja Word, alto proporcional al original
  const anchoWord = 500;
  const altoWord = Math.round(anchoWord * (svgHeight / svgWidth));

  return { buffer: buffer, width: anchoWord, height: altoWord };
}
