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
 * Valores posibles: 'barras' | 'aros' (más adelante: 'lollipop' | 'radar')
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
 * sin desbordar (usado solo por dibujarAros). Portado de
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
