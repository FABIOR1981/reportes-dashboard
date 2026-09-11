// ============================================================
//  SM CONSULTORES (con gráfico) – grafico_Grafico.js
//  Dibuja el gráfico de aros de progreso (SVG) de competencias y lo
//  rasteriza a PNG para insertarlo en el Word.
//  Exclusivo de esta variante (no tiene par en "sin gráfico").
//  Del que dependen: vistaPrevia_Grafico.js (llama a
//  renderGraficoCompetencias), exportWord_Grafico.js (llama a
//  generarImagenGraficoParaWord)
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

// ---------- Datos por defecto de competencias (esqueleto extraído del ejemplo) ----------

function renderGraficoCompetencias(datos) {
  const cont = document.getElementById('graficoCompetenciasContainer');
  if (!cont) return;

  if (!datos || datos.length === 0) {
    cont.style.display = 'none';
    cont.innerHTML = '';
    return;
  }

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
 * Corta el nombre de una competencia en hasta "maxLineas" líneas de como
 * mucho "maxCharsPorLinea" caracteres cada una (para que entre debajo del
 * aro sin desbordar). Si sobra texto, la última línea termina en "…". Es
 * solo estético — el nombre completo sigue visible arriba, en el bloque
 * de texto de "Competencias evaluadas".
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
 * graficables) — en ese caso el Word simplemente no incluye imagen, igual
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

  // Ancho fijo prolijo dentro de la hoja Word, alto proporcional al original
  const anchoWord = 500;
  const altoWord = Math.round(anchoWord * (svgHeight / svgWidth));

  return { buffer: buffer, width: anchoWord, height: altoWord };
}

