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
 * Valores posibles: 'columnas' | 'barras' | 'aros' | 'lollipop' | 'radar' | 'waffle' | 'torta' | 'anillo'
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
    case 'columnas':
      dibujarColumnas(cont, datos);
      break;
    case 'torta':
      dibujarTorta(cont, datos);
      break;
    case 'anillo':
      dibujarAnillo(cont, datos);
      break;
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

// Helpers compartidos por los estilos nuevos (torta, anillo, columnas).
// Mismos criterios que los del psicotécnico: semáforo verde >=70%, bronce 40-69%, rojo <40%.
const FUENTE_GRAFICO = 'font-family="Segoe UI, Arial, sans-serif"';

function colorPorcentaje(pct) {
  return pct >= 70 ? '#3f6b52' : (pct >= 40 ? '#b6863f' : '#c1503f');
}
function porcentaje(d) {
  return Math.max(0, Math.min(100, (d.puntaje / d.maximo) * 100));
}
function envolverSvg(cont, ancho, alto, contenido, estiloExtra) {
  cont.innerHTML = `
    <svg viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}" style="width:100%;${estiloExtra || ''}height:auto;display:block;" xmlns="http://www.w3.org/2000/svg">
      ${contenido}
    </svg>
  `;
  cont.style.display = 'block';
}


function redondear2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

// Columnas agrupadas (puntaje obtenido vs. máximo). Portado de ACE.
function separarCodigo(nombre) {
  const m = /^\s*(\d+(?:\.\d+)*)\s*[-–:.]\s*(.+)$/.exec(nombre || '');
  return m ? { codigo: m[1], texto: m[2].trim() } : { codigo: '', texto: (nombre || '').trim() };
}

// Columnas agrupadas: puntaje obtenido vs. máximo por competencia (como el gráfico del PDF)
function dibujarColumnas(cont, datos) {
  const partes = datos.map(function (d) { return separarCodigo(d.nombre); });
  const usaCodigos = partes.every(function (p) { return p.codigo; });
  const filaLeyenda = 20;
  const filasPorColumna = Math.ceil(datos.length / 2);
  const lineasLeyenda = usaCodigos ? partes.map(function (p) { return wrapLabel(p.codigo + ' - ' + p.texto, 62, 2); }) : [];
  const altoCol = [0, 1].map(function (c) {
    return lineasLeyenda.slice(c * filasPorColumna, (c + 1) * filasPorColumna)
      .reduce(function (a, l) { return a + l.length * 9 + 7; }, 0);
  });
  const yLeyendaSerie = usaCodigos ? 236 : 283;
  const yCodigos = yLeyendaSerie + 26;
  const ancho = 640;
  const alto = usaCodigos ? yCodigos + Math.max(altoCol[0], altoCol[1]) + 4 : 300;
  const x0 = 40, x1 = ancho - 10, yTop = 40, yBase = 200;
  const colObtenido = '#1aa7ec', colMaximo = '#0e5c78';
  const maxVal = Math.max.apply(null, datos.map(function (d) { return d.maximo; }));
  const yMax = Math.ceil(maxVal * 2) / 2 + 0.5;
  const escalaY = function (v) { return yBase - (v / yMax) * (yBase - yTop); };

  let g = `<text x="${ancho / 2}" y="20" text-anchor="middle" font-size="14" ${FUENTE_GRAFICO} fill="#595959">Competencias</text>`;
  for (let v = 0; v <= yMax + 0.001; v += 0.5) {
    const y = escalaY(v);
    g += `<line x1="${x0}" y1="${y.toFixed(1)}" x2="${x1}" y2="${y.toFixed(1)}" stroke="#d9d9d9" stroke-width="0.7"></line>` +
      `<text x="${x0 - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="8" ${FUENTE_GRAFICO} fill="#595959">${v.toFixed(1)}</text>`;
  }

  const anchoGrupo = (x1 - x0) / datos.length;
  const anchoBarra = Math.min(22, anchoGrupo * 0.36);
  datos.forEach(function (d, i) {
    const centro = x0 + anchoGrupo * (i + 0.5);
    [[d.puntaje, colObtenido, centro - anchoBarra], [d.maximo, colMaximo, centro]].forEach(function (b) {
      const y = escalaY(b[0]);
      g += `<rect x="${b[2].toFixed(1)}" y="${y.toFixed(1)}" width="${anchoBarra.toFixed(1)}" height="${(yBase - y).toFixed(1)}" fill="${b[1]}"></rect>`;
      if (b[0] > 0) {
        g += `<text x="${(b[2] + anchoBarra / 2).toFixed(1)}" y="${((y + yBase) / 2 + 3).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="600" ${FUENTE_GRAFICO} fill="#fff">${redondear2(b[0])}</text>`;
      }
    });
    if (usaCodigos) {
      g += `<text x="${centro.toFixed(1)}" y="${yBase + 14}" text-anchor="middle" font-size="9" font-weight="600" ${FUENTE_GRAFICO} fill="#595959">${escapeHTML(partes[i].codigo)}</text>`;
    } else {
      g += wrapLabel(d.nombre, 13, 5).map(function (linea, j) {
        return `<text x="${centro.toFixed(1)}" y="${yBase + 12 + j * 9}" text-anchor="middle" font-size="7.5" ${FUENTE_GRAFICO} fill="#595959">${escapeHTML(linea)}</text>`;
      }).join('');
    }
  });

  g += `<line x1="${x0}" y1="${yBase}" x2="${x1}" y2="${yBase}" stroke="#bfbfbf" stroke-width="1"></line>` +
    `<rect x="${ancho / 2 - 120}" y="${yLeyendaSerie}" width="8" height="8" fill="${colObtenido}"></rect>` +
    `<text x="${ancho / 2 - 108}" y="${yLeyendaSerie + 8}" font-size="9" ${FUENTE_GRAFICO} fill="#595959">Puntaje Obtenido</text>` +
    `<rect x="${ancho / 2 + 10}" y="${yLeyendaSerie}" width="8" height="8" fill="${colMaximo}"></rect>` +
    `<text x="${ancho / 2 + 22}" y="${yLeyendaSerie + 8}" font-size="9" ${FUENTE_GRAFICO} fill="#595959">Puntaje Máximo</text>`;

  if (usaCodigos) {
    // Leyenda en 2 columnas (la 1ª lleva la mitad redondeada hacia arriba); cada entrada ocupa hasta 2 líneas
    const yCol = [yCodigos, yCodigos];
    partes.forEach(function (p, i) {
      const col = i < filasPorColumna ? 0 : 1;
      const x = x0 + col * 300;
      const y = yCol[col];
      lineasLeyenda[i].forEach(function (linea, j) {
        const contenido = j === 0
          ? `<tspan font-weight="700">${escapeHTML(p.codigo)}</tspan>${escapeHTML(linea.slice(p.codigo.length))}`
          : escapeHTML(linea);
        g += `<text x="${x}" y="${y + j * 9}" font-size="7.5" ${FUENTE_GRAFICO} fill="#404040">${contenido}</text>`;
      });
      yCol[col] += lineasLeyenda[i].length * 9 + 7;
    });
  }
  envolverSvg(cont, ancho, alto, g);
}

// Torta y anillo. Portados del psicotécnico (con gráfico), mismos colores y reglas.
function dibujarTorta(cont, datos) {
  const niveles = [
    { etiqueta: 'Alto (70% o más)', color: colorPorcentaje(100), nombres: [] },
    { etiqueta: 'Medio (40% a 69%)', color: colorPorcentaje(50), nombres: [] },
    { etiqueta: 'Bajo (menos de 40%)', color: colorPorcentaje(0), nombres: [] }
  ];
  datos.forEach(function(d) {
    const pct = porcentaje(d);
    const idx = pct >= 70 ? 0 : (pct >= 40 ? 1 : 2);
    niveles[idx].nombres.push(d.nombre);
  });

  const total = datos.length;
  const anchoTotal = 600;
  const altoTotal = 230;
  const cx = 115;
  const cy = 115;
  const R = 95;
  const presentes = niveles.filter(function(n) { return n.nombres.length > 0; });

  function punto(anguloDeg, radio) {
    const rad = (Math.PI / 180) * anguloDeg;
    return { x: cx + radio * Math.cos(rad), y: cy + radio * Math.sin(rad) };
  }

  let porciones = '';
  let angulo = -90;
  presentes.forEach(function(n) {
    const fraccion = n.nombres.length / total;
    const barrido = fraccion * 360;

    if (presentes.length === 1) {
      // Un solo nivel = círculo completo (un arco de 360° no se puede dibujar con un path)
      porciones += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${n.color}"></circle>`;
    } else {
      const e0 = punto(angulo, R);
      const e1 = punto(angulo + barrido, R);
      const grande = barrido > 180 ? 1 : 0;
      const d = `M ${cx} ${cy} L ${e0.x.toFixed(2)} ${e0.y.toFixed(2)} A ${R} ${R} 0 ${grande} 1 ${e1.x.toFixed(2)} ${e1.y.toFixed(2)} Z`;
      porciones += `<path d="${d}" fill="${n.color}" stroke="#fff" stroke-width="2" stroke-linejoin="round"></path>`;
    }

    // Porcentaje dentro de la porción (solo si hay lugar)
    if (fraccion >= 0.1) {
      const pt = punto(angulo + barrido / 2, R * 0.62);
      porciones += `<text x="${pt.x.toFixed(1)}" y="${(pt.y + 5).toFixed(1)}" text-anchor="middle" font-size="14" font-weight="600" ${FUENTE_GRAFICO} fill="#fff">${Math.round(fraccion * 100)}%</text>`;
    }
    angulo += barrido;
  });

  // Leyenda a la derecha: nivel, cantidad, % y nombres de las competencias
  const xLeyenda = 250;
  const altoEntrada = 66;
  const yInicio = Math.max(14, (altoTotal - presentes.length * altoEntrada) / 2 + 6);
  let leyenda = '';
  presentes.forEach(function(n, i) {
    const y = yInicio + i * altoEntrada;
    const cant = n.nombres.length;
    const pct = Math.round(cant / total * 100);
    const lineasNombres = wrapLabel(n.nombres.join(', '), 52, 2);
    leyenda += `
      <rect x="${xLeyenda}" y="${y}" width="12" height="12" rx="2" fill="${n.color}"></rect>
      <text x="${xLeyenda + 20}" y="${y + 11}" font-size="13" font-weight="600" ${FUENTE_GRAFICO} fill="#333">${n.etiqueta}: ${cant} (${pct}%)</text>
      ${lineasNombres.map(function(linea, j) {
        return `<text x="${xLeyenda + 20}" y="${y + 28 + j * 13}" font-size="11" ${FUENTE_GRAFICO} fill="#555">${escapeHTML(linea)}</text>`;
      }).join('')}
    `;
  });

  envolverSvg(cont, anchoTotal, altoTotal, porciones + leyenda);
}

/**
 * Anillo: UNA porción por competencia. El tamaño de cada porción es su
 * puntaje sobre el total de puntos obtenidos, y el color sigue el mismo
 * semáforo de los otros estilos según el % de ESA competencia. Como varias
 * porciones pueden compartir color, cada una lleva un número y la leyenda
 * lista "N. competencia — puntaje/máximo (%)". En el centro se muestra el
 * total de puntos obtenidos sobre el total posible.
 */
function dibujarAnillo(cont, datos) {
  const anchoTotal = 600;
  const altoFila = 22;
  const altoTotal = Math.max(230, datos.length * altoFila + 30);
  const cx = 115;
  const cy = altoTotal / 2;
  const R = 95;
  const rInterno = 56;

  const totalPuntos = datos.reduce(function(acc, d) { return acc + Math.max(0, d.puntaje); }, 0);
  const totalMaximo = datos.reduce(function(acc, d) { return acc + d.maximo; }, 0);
  const conPuntos = datos.filter(function(d) { return d.puntaje > 0; });

  function punto(anguloDeg, radio) {
    const rad = (Math.PI / 180) * anguloDeg;
    return { x: cx + radio * Math.cos(rad), y: cy + radio * Math.sin(rad) };
  }

  let porciones = '';
  if (totalPuntos <= 0) {
    // Nadie sumó puntos: anillo gris vacío
    porciones += `<circle cx="${cx}" cy="${cy}" r="${(R + rInterno) / 2}" fill="none" stroke="#e5e7eb" stroke-width="${R - rInterno}"></circle>`;
  } else if (conPuntos.length === 1) {
    // Una sola porción = anillo completo (un arco de 360° no se puede dibujar con un path)
    const d = conPuntos[0];
    porciones += `<circle cx="${cx}" cy="${cy}" r="${(R + rInterno) / 2}" fill="none" stroke="${colorPorcentaje(porcentaje(d))}" stroke-width="${R - rInterno}"></circle>`;
    porciones += `<text x="${cx}" y="${cy - R + 24}" text-anchor="middle" font-size="12" font-weight="600" ${FUENTE_GRAFICO} fill="#fff">${datos.indexOf(d) + 1}</text>`;
  } else {
    let angulo = -90;
    datos.forEach(function(d, i) {
      if (d.puntaje <= 0) return;
      const fraccion = d.puntaje / totalPuntos;
      const barrido = fraccion * 360;
      const a0 = angulo;
      const a1 = angulo + barrido;
      const grande = barrido > 180 ? 1 : 0;
      const e0 = punto(a0, R);
      const e1 = punto(a1, R);
      const i0 = punto(a0, rInterno);
      const i1 = punto(a1, rInterno);
      const trazo = `M ${e0.x.toFixed(2)} ${e0.y.toFixed(2)} A ${R} ${R} 0 ${grande} 1 ${e1.x.toFixed(2)} ${e1.y.toFixed(2)} ` +
                    `L ${i1.x.toFixed(2)} ${i1.y.toFixed(2)} A ${rInterno} ${rInterno} 0 ${grande} 0 ${i0.x.toFixed(2)} ${i0.y.toFixed(2)} Z`;
      porciones += `<path d="${trazo}" fill="${colorPorcentaje(porcentaje(d))}" stroke="#fff" stroke-width="2" stroke-linejoin="round"></path>`;

      // Número de la competencia dentro de su porción (si hay lugar)
      if (barrido >= 14) {
        const pt = punto(a0 + barrido / 2, (R + rInterno) / 2);
        porciones += `<text x="${pt.x.toFixed(1)}" y="${(pt.y + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="600" ${FUENTE_GRAFICO} fill="#fff">${i + 1}</text>`;
      }
      angulo += barrido;
    });
  }

  // Centro: puntos obtenidos / puntos posibles
  const centro = `
    <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="22" ${FUENTE_GRAFICO} fill="#333">${totalPuntos}/${totalMaximo}</text>
    <text x="${cx}" y="${cy + 20}" text-anchor="middle" font-size="11" ${FUENTE_GRAFICO} fill="#555">puntos</text>
  `;

  // Leyenda: una fila por competencia, centrada verticalmente
  const xLeyenda = 250;
  const yInicio = (altoTotal - datos.length * altoFila) / 2;
  let leyenda = '';
  datos.forEach(function(d, i) {
    const pct = porcentaje(d);
    const y = yInicio + i * altoFila;
    const nombre = wrapLabel(d.nombre, 34, 1)[0] || '';
    leyenda += `
      <rect x="${xLeyenda}" y="${y + 3}" width="12" height="12" rx="2" fill="${colorPorcentaje(pct)}"></rect>
      <text x="${xLeyenda + 20}" y="${y + 13}" font-size="12" ${FUENTE_GRAFICO} fill="#333">${i + 1}. ${escapeHTML(nombre)}</text>
      <text x="${anchoTotal - 4}" y="${y + 13}" text-anchor="end" font-size="12" font-weight="600" ${FUENTE_GRAFICO} fill="#333">${d.puntaje}/${d.maximo} (${Math.round(pct)}%)</text>
    `;
  });

  envolverSvg(cont, anchoTotal, altoTotal, porciones + centro + leyenda);
}
