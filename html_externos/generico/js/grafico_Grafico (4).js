// ============================================================
//  INFORME GENÉRICO (con gráfico) – grafico.js
//  Dibuja el gráfico de barras SVG de aspectos evaluados y lo
//  rasteriza a PNG para poder insertarlo en el Word.
//  Depende de: utils.js (escapeHTML)
//  Del que dependen: vistaPrevia.js (llama a renderGraficoAspectos),
//  exportWord.js (llama a generarImagenGraficoParaWord)
// ============================================================

/**
 * Dibuja un gráfico de barras (SVG puro, sin librerías externas) con el
 * % logrado de cada aspecto graficable (los que tienen "puntaje máximo" > 0).
 * Si no hay ninguno graficable, oculta el contenedor y no dibuja nada.
 */
function renderGraficoAspectos(datos) {
  const cont = document.getElementById('graficoAspectosContainer');
  if (!cont) return;

  if (!datos || datos.length === 0) {
    cont.style.display = 'none';
    cont.innerHTML = '';
    return;
  }

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
