// ============================================================
//  SM CONSULTORES (con gráfico) – grafico_Grafico.js
//  Dibuja el gráfico de competencias (SVG, 5 estilos posibles) y lo
//  rasteriza a PNG para insertarlo en el Word.
//  Exclusivo de esta variante (no tiene par en "sin gráfico").
//  Del que dependen: vistaPrevia_Grafico.js (llama a
//  renderGraficoCompetencias), exportWord_Grafico.js (llama a
//  generarImagenGraficoParaWord), tipoGrafico.js (lee/cambia la variable
//  tipoGraficoActual de acá abajo y usa las funciones dibujarX)
// ============================================================

// Escapar texto para uso seguro dentro de atributos/markup SVG (el archivo
// original no tenía esta función; se agrega acá porque el gráfico arma su
// propio innerHTML con los nombres de las competencias).
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Estilo de gráfico actualmente seleccionado. Lo cambia tipoGrafico.js
 * cuando la persona elige una opción en el modal (o al cargar un JSON
 * guardado). Vive acá porque este archivo es el dueño de todo lo
 * relacionado al dibujo — tipoGrafico.js solo la lee/escribe.
 * Valores posibles: 'aros' | 'barras' | 'lollipop' | 'radar' | 'waffle'
 * Por defecto 'aros' (el estilo que tenía este informe antes de poder elegir).
 */
let tipoGraficoActual = 'aros';

const FUENTE_GRAFICO = 'font-family="Segoe UI, Arial, sans-serif"';

// Semáforo de colores compartido por todos los estilos (verde ≥70%, bronce 40-69%, rojo <40%)
function colorPorcentaje(pct) {
  return pct >= 70 ? '#3f6b52' : (pct >= 40 ? '#b6863f' : '#c1503f');
}
function porcentaje(d) {
  return Math.max(0, Math.min(100, (d.puntaje / d.maximo) * 100));
}

/**
 * Punto de entrada: decide qué función de dibujo llamar según
 * tipoGraficoActual. Si no hay datos graficables, oculta el contenedor
 * sin importar el estilo elegido.
 */
function renderGraficoCompetencias(datos) {
  const cont = document.getElementById('graficoCompetenciasContainer');
  if (!cont) return;

  if (!datos || datos.length === 0) {
    cont.style.display = 'none';
    cont.innerHTML = '';
    return;
  }

  switch (tipoGraficoActual) {
    case 'barras':
      dibujarBarras(cont, datos);
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
    case 'aros':
    default:
      dibujarAros(cont, datos);
      break;
  }
}

/**
 * Etiqueta de una fila (barras, puntos y línea, pictograma): el nombre
 * completo de la competencia, en hasta 2 líneas, alineado a la izquierda
 * y centrado verticalmente sobre "yCentro".
 */
function etiquetaFila(x, yCentro, nombre) {
  const lineas = wrapLabel(nombre, 26, 2);
  if (lineas.length < 2) {
    return `<text x="${x}" y="${yCentro + 4}" font-size="12" ${FUENTE_GRAFICO} fill="#333">${escapeHTML(lineas[0] || '')}</text>`;
  }
  return lineas.map(function(linea, j) {
    return `<text x="${x}" y="${yCentro + (j === 0 ? -2 : 10)}" font-size="11" ${FUENTE_GRAFICO} fill="#333">${escapeHTML(linea)}</text>`;
  }).join('');
}

function envolverSvg(cont, ancho, alto, contenido, estiloExtra) {
  cont.innerHTML = `
    <svg viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}" style="width:100%;${estiloExtra || ''}height:auto;display:block;" xmlns="http://www.w3.org/2000/svg">
      ${contenido}
    </svg>
  `;
  cont.style.display = 'block';
}

/**
 * Aros de progreso, uno por competencia, en fila. (Es el gráfico que
 * tenía este informe desde siempre — misma geometría.)
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
    const pct = porcentaje(d);
    const cx = porAro * i + porAro / 2;
    const largoValor = (circunferencia * pct / 100).toFixed(1);
    const color = colorPorcentaje(pct);
    const lineas = wrapLabel(d.nombre, 13, 2);

    let etiquetaSvg = '';
    lineas.forEach(function(linea, j) {
      etiquetaSvg += `<text x="${cx}" y="${cy + r + 17 + j * 13}" text-anchor="middle" font-size="10.5" ${FUENTE_GRAFICO} fill="#555">${escapeHTML(linea)}</text>`;
    });

    aros += `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="${grosor}"></circle>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${grosor}" stroke-linecap="round" stroke-dasharray="${largoValor} 1000" transform="rotate(-90 ${cx} ${cy})"></circle>
      <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="15" ${FUENTE_GRAFICO} fill="#333">${Math.round(pct)}%</text>
      ${etiquetaSvg}
    `;
  });

  envolverSvg(cont, anchoTotal, altoTotal, aros);
}

/**
 * Barras horizontales con el % logrado de cada competencia.
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
    const pct = porcentaje(d);
    const y = espacio + i * (altoBarra + espacio);
    const anchoBarra = (pct / 100) * anchoBarraMax;
    const color = colorPorcentaje(pct);

    barras += `
      ${etiquetaFila(0, y + altoBarra / 2, d.nombre)}
      <rect x="${anchoEtiqueta}" y="${y}" width="${anchoBarraMax}" height="${altoBarra}" fill="#eef0ea" rx="4"></rect>
      <rect x="${anchoEtiqueta}" y="${y}" width="${anchoBarra.toFixed(1)}" height="${altoBarra}" fill="${color}" rx="4"></rect>
      <text x="${anchoEtiqueta + anchoBarraMax + 8}" y="${y + altoBarra / 2 + 4}" font-size="12" ${FUENTE_GRAFICO} fill="#333">${Math.round(pct)}%</text>
    `;
  });

  envolverSvg(cont, anchoTotal, altoTotal, barras);
}

/**
 * "Puntos y línea" (lollipop): una línea fina hasta el % logrado,
 * terminando en un círculo, con el número al lado.
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
    const pct = porcentaje(d);
    const y = espacio + i * (altoFila + espacio) + altoFila / 2;
    const xInicio = anchoEtiqueta;
    const xFin = anchoEtiqueta + (pct / 100) * anchoLineaMax;
    const color = colorPorcentaje(pct);

    filas += `
      ${etiquetaFila(0, y, d.nombre)}
      <line x1="${xInicio}" y1="${y}" x2="${anchoEtiqueta + anchoLineaMax}" y2="${y}" stroke="#e5e7eb" stroke-width="2"></line>
      <line x1="${xInicio}" y1="${y}" x2="${xFin.toFixed(1)}" y2="${y}" stroke="${color}" stroke-width="2" stroke-linecap="round"></line>
      <circle cx="${xFin.toFixed(1)}" cy="${y}" r="6" fill="${color}" stroke="#fff" stroke-width="2"></circle>
      <text x="${anchoEtiqueta + anchoLineaMax + 12}" y="${y + 4}" font-size="12" ${FUENTE_GRAFICO} fill="#333" font-weight="500">${Math.round(pct)}%</text>
    `;
  });

  envolverSvg(cont, anchoTotal, altoTotal, filas);
}

/**
 * Pictograma (waffle): una fila de 10 cuadrados por competencia,
 * rellenando de a uno según el % logrado (redondeado a la decena más
 * cercana).
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
    const pct = porcentaje(d);
    const llenos = Math.round(pct / 10);
    const y = espacio + i * (altoFila + espacio);
    const color = colorPorcentaje(pct);

    let cuadrados = '';
    for (let c = 0; c < numCuad; c++) {
      const x = anchoEtiqueta + c * (cuadSize + gapCuad);
      const relleno = c < llenos ? color : '#eef0ea';
      cuadrados += `<rect x="${x}" y="${y}" width="${cuadSize}" height="${cuadSize}" rx="3" fill="${relleno}"></rect>`;
    }

    filas += `
      ${etiquetaFila(0, y + cuadSize / 2, d.nombre)}
      ${cuadrados}
      <text x="${anchoEtiqueta + numCuad * (cuadSize + gapCuad) + 4}" y="${y + cuadSize / 2 + 4}" font-size="12" ${FUENTE_GRAFICO} fill="#333" font-weight="500">${Math.round(pct)}%</text>
    `;
  });

  envolverSvg(cont, anchoTotal, altoTotal, filas);
}

/**
 * Radar / telaraña con un vértice por competencia (360°/N, empezando
 * arriba, en sentido horario). Con menos de 3 competencias un radar no
 * tiene sentido visual — se muestra un aviso. El modal (tipoGrafico.js)
 * ya evita ofrecer esta opción en ese caso; esto cubre, por ejemplo, un
 * JSON guardado con "radar" y luego pocas competencias.
 */
function dibujarRadar(cont, datos) {
  if (datos.length < 3) {
    cont.innerHTML = `
      <div style="padding:16px;text-align:center;color:#6b7280;font-size:13px;font-family:Segoe UI, Arial, sans-serif;">
        El gráfico de radar necesita al menos 3 competencias con puntaje máximo definido.
      </div>
    `;
    cont.style.display = 'block';
    return;
  }

  const ancho = 460;      // más ancho que alto: las etiquetas de los costados necesitan lugar
  const alto = 310;
  const cx = ancho / 2;
  const cy = 156;
  const R = 100;
  const n = datos.length;

  function puntoEn(anguloDeg, radio) {
    const rad = (Math.PI / 180) * anguloDeg;
    return { x: cx + radio * Math.cos(rad), y: cy + radio * Math.sin(rad) };
  }

  const angulos = [];
  for (let i = 0; i < n; i++) angulos.push(-90 + i * (360 / n));

  // Anillos de referencia al 33/66/100% del radio
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

  // Polígono de datos + puntos + etiquetas (nombre y %)
  const puntosData = [];
  let puntosSvg = '';
  let etiquetas = '';
  datos.forEach(function(d, i) {
    const pct = porcentaje(d);
    const p = puntoEn(angulos[i], R * (pct / 100));
    puntosData.push(p.x.toFixed(1) + ',' + p.y.toFixed(1));
    puntosSvg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${colorPorcentaje(pct)}"></circle>`;

    // Etiqueta: nombre (1 línea) y debajo el %. Arriba del todo se corre un poco
    // hacia arriba para no pisar el vértice; en los costados se alinea hacia afuera.
    const pLabel = puntoEn(angulos[i], R + 22);
    const cosA = Math.cos((Math.PI / 180) * angulos[i]);
    const sinA = Math.sin((Math.PI / 180) * angulos[i]);
    const anchor = cosA > 0.3 ? 'start' : (cosA < -0.3 ? 'end' : 'middle');
    const yNombre = sinA < -0.5 ? pLabel.y - 9 : pLabel.y + 2;
    const nombre = wrapLabel(d.nombre, 15, 1)[0] || '';
    etiquetas += `<text x="${pLabel.x.toFixed(1)}" y="${yNombre.toFixed(1)}" text-anchor="${anchor}" font-size="11" ${FUENTE_GRAFICO} fill="#555">${escapeHTML(nombre)}</text>` +
      `<text x="${pLabel.x.toFixed(1)}" y="${(yNombre + 13).toFixed(1)}" text-anchor="${anchor}" font-size="11" font-weight="600" ${FUENTE_GRAFICO} fill="#333">${Math.round(pct)}%</text>`;
  });

  const poligono = `<polygon points="${puntosData.join(' ')}" fill="#3f6b52" fill-opacity="0.25" stroke="#3f6b52" stroke-width="2"></polygon>`;

  envolverSvg(cont, ancho, alto, grid + ejes + poligono + puntosSvg + etiquetas, 'max-width:460px;margin:0 auto;');
}

/**
 * Corta el nombre de una competencia en hasta "maxLineas" líneas de como
 * mucho "maxCharsPorLinea" caracteres cada una (para que entre sin
 * desbordar). Si sobra texto, la última línea termina en "…". Es solo
 * estético — el nombre completo sigue visible arriba, en el bloque de
 * texto de "Competencias evaluadas".
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
  if (lineas.length < maxLineas && actual) lineas.push(actual);

  const totalUsado = lineas.join(' ').length;
  if (totalUsado < nombre.trim().length && lineas.length > 0) {
    let ultima = lineas[lineas.length - 1].replace(/…$/, '');
    if (ultima.length > maxCharsPorLinea - 1) ultima = ultima.slice(0, maxCharsPorLinea - 1);
    lineas[lineas.length - 1] = ultima + '…';
  }
  return lineas.slice(0, maxLineas);
}

/**
 * Convierte el SVG del gráfico de competencias (ya dibujado en pantalla) a un
 * PNG en memoria, para poder insertarlo en el Word con docx.ImageRun (el
 * gráfico es SVG y docx no soporta SVG directamente, solo imágenes
 * rasterizadas). Devuelve null si no hay gráfico visible (sin competencias
 * graficables) o si el contenedor muestra solo un aviso (radar con menos de
 * 3 competencias) — en ese caso el Word simplemente no incluye imagen, igual
 * que el PDF no la incluiría (el PDF captura la vista previa tal cual está).
 */
async function generarImagenGraficoParaWord() {
  const cont = document.getElementById('graficoCompetenciasContainer');
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

  // Ancho fijo prolijo dentro de la hoja Word, alto proporcional al original.
  // Con muchas competencias, los estilos en filas (barras, puntos, pictograma)
  // quedan muy altos: se limita el alto y se achica el ancho en proporción.
  const altoMaxWord = 380;
  let anchoWord = 500;
  let altoWord = Math.round(anchoWord * (svgHeight / svgWidth));
  if (altoWord > altoMaxWord) {
    altoWord = altoMaxWord;
    anchoWord = Math.round(altoMaxWord * (svgWidth / svgHeight));
  }

  return { buffer: buffer, width: anchoWord, height: altoWord };
}
