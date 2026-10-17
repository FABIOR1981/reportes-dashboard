// Gráfico de competencias (SVG, 7 estilos) y rasterizado a PNG para el Word.
// Usa escapeHTML de utils.js.

// Estilo elegido; lo cambia tipo_grafico.js. Valores: columnas | aros | barras | lollipop | radar | waffle | torta | anillo
let tipoGraficoActual = 'columnas';

const FUENTE_GRAFICO = 'font-family="Segoe UI, Arial, sans-serif"';

// Semáforo: verde >=70%, bronce 40-69%, rojo <40%
function colorPorcentaje(pct) {
  return pct >= 70 ? '#3f6b52' : (pct >= 40 ? '#b6863f' : '#c1503f');
}
function porcentaje(d) {
  return Math.max(0, Math.min(100, (d.puntaje / d.maximo) * 100));
}

function renderGraficoCompetencias(datos) {
  const cont = document.getElementById('graficoCompetenciasContainer');
  if (!cont) return;

  if (!datos || datos.length === 0) {
    cont.style.display = 'none';
    cont.innerHTML = '';
    return;
  }

  switch (tipoGraficoActual) {
    case 'aros': dibujarAros(cont, datos); break;
    case 'barras': dibujarBarras(cont, datos); break;
    case 'lollipop': dibujarLollipop(cont, datos); break;
    case 'radar': dibujarRadar(cont, datos); break;
    case 'waffle': dibujarWaffle(cont, datos); break;
    case 'torta': dibujarTorta(cont, datos); break;
    case 'anillo': dibujarAnillo(cont, datos); break;
    default: dibujarColumnas(cont, datos);
  }
}

// "6.1 - Liderazgo" -> { codigo: '6.1', texto: 'Liderazgo' }; sin código, codigo queda vacío
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
  const yLeyendaSerie = usaCodigos ? 236 : 283;
  const yCodigos = yLeyendaSerie + 26;
  const ancho = 640;
  const alto = usaCodigos ? yCodigos + filasPorColumna * filaLeyenda + 4 : 300;
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
        g += `<text x="${(b[2] + anchoBarra / 2).toFixed(1)}" y="${((y + yBase) / 2 + 3).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="600" ${FUENTE_GRAFICO} fill="#fff">${b[0]}</text>`;
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
    partes.forEach(function (p, i) {
      const col = i < filasPorColumna ? 0 : 1;
      const fila = col === 0 ? i : i - filasPorColumna;
      const x = x0 + col * 300;
      const y = yCodigos + fila * filaLeyenda;
      const lineas = wrapLabel(p.codigo + ' - ' + p.texto, 62, 2);
      lineas.forEach(function (linea, j) {
        const contenido = j === 0
          ? `<tspan font-weight="700">${escapeHTML(p.codigo)}</tspan>${escapeHTML(linea.slice(p.codigo.length))}`
          : escapeHTML(linea);
        g += `<text x="${x}" y="${y + j * 9}" font-size="7.5" ${FUENTE_GRAFICO} fill="#404040">${contenido}</text>`;
      });
    });
  }
  envolverSvg(cont, ancho, alto, g);
}

// Etiqueta de fila (hasta 2 líneas) centrada verticalmente sobre yCentro
function etiquetaFila(x, yCentro, nombre) {
  const lineas = wrapLabel(nombre, 26, 2);
  if (lineas.length < 2) {
    return `<text x="${x}" y="${yCentro + 4}" font-size="12" ${FUENTE_GRAFICO} fill="#333">${escapeHTML(lineas[0] || '')}</text>`;
  }
  return lineas.map(function (linea, j) {
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

function dibujarAros(cont, datos) {
  const porAro = 110, r = 38, grosor = 10, cy = 55, altoTotal = 150;
  const anchoTotal = datos.length * porAro;
  const circunferencia = 2 * Math.PI * r;

  let aros = '';
  datos.forEach(function (d, i) {
    const pct = porcentaje(d);
    const cx = porAro * i + porAro / 2;
    const largoValor = (circunferencia * pct / 100).toFixed(1);
    const color = colorPorcentaje(pct);
    const etiquetaSvg = wrapLabel(d.nombre, 13, 2).map(function (linea, j) {
      return `<text x="${cx}" y="${cy + r + 17 + j * 13}" text-anchor="middle" font-size="10.5" ${FUENTE_GRAFICO} fill="#555">${escapeHTML(linea)}</text>`;
    }).join('');

    aros += `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="${grosor}"></circle>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${grosor}" stroke-linecap="round" stroke-dasharray="${largoValor} 1000" transform="rotate(-90 ${cx} ${cy})"></circle>
      <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="15" ${FUENTE_GRAFICO} fill="#333">${Math.round(pct)}%</text>
      ${etiquetaSvg}
    `;
  });
  envolverSvg(cont, anchoTotal, altoTotal, aros);
}

function dibujarBarras(cont, datos) {
  const anchoTotal = 600, altoBarra = 26, espacio = 14, anchoEtiqueta = 170;
  const altoTotal = datos.length * (altoBarra + espacio) + espacio;
  const anchoBarraMax = anchoTotal - anchoEtiqueta - 60;

  let barras = '';
  datos.forEach(function (d, i) {
    const pct = porcentaje(d);
    const y = espacio + i * (altoBarra + espacio);
    const anchoBarra = (pct / 100) * anchoBarraMax;
    barras += `
      ${etiquetaFila(0, y + altoBarra / 2, d.nombre)}
      <rect x="${anchoEtiqueta}" y="${y}" width="${anchoBarraMax}" height="${altoBarra}" fill="#eef0ea" rx="4"></rect>
      <rect x="${anchoEtiqueta}" y="${y}" width="${anchoBarra.toFixed(1)}" height="${altoBarra}" fill="${colorPorcentaje(pct)}" rx="4"></rect>
      <text x="${anchoEtiqueta + anchoBarraMax + 8}" y="${y + altoBarra / 2 + 4}" font-size="12" ${FUENTE_GRAFICO} fill="#333">${Math.round(pct)}%</text>
    `;
  });
  envolverSvg(cont, anchoTotal, altoTotal, barras);
}

function dibujarLollipop(cont, datos) {
  const anchoTotal = 600, altoFila = 34, espacio = 6, anchoEtiqueta = 170;
  const altoTotal = datos.length * (altoFila + espacio) + espacio;
  const anchoLineaMax = anchoTotal - anchoEtiqueta - 60;

  let filas = '';
  datos.forEach(function (d, i) {
    const pct = porcentaje(d);
    const y = espacio + i * (altoFila + espacio) + altoFila / 2;
    const xFin = anchoEtiqueta + (pct / 100) * anchoLineaMax;
    const color = colorPorcentaje(pct);
    filas += `
      ${etiquetaFila(0, y, d.nombre)}
      <line x1="${anchoEtiqueta}" y1="${y}" x2="${anchoEtiqueta + anchoLineaMax}" y2="${y}" stroke="#e5e7eb" stroke-width="2"></line>
      <line x1="${anchoEtiqueta}" y1="${y}" x2="${xFin.toFixed(1)}" y2="${y}" stroke="${color}" stroke-width="2" stroke-linecap="round"></line>
      <circle cx="${xFin.toFixed(1)}" cy="${y}" r="6" fill="${color}" stroke="#fff" stroke-width="2"></circle>
      <text x="${anchoEtiqueta + anchoLineaMax + 12}" y="${y + 4}" font-size="12" ${FUENTE_GRAFICO} fill="#333" font-weight="500">${Math.round(pct)}%</text>
    `;
  });
  envolverSvg(cont, anchoTotal, altoTotal, filas);
}

// Pictograma: 10 cuadrados por competencia, rellenos según el % redondeado a la decena
function dibujarWaffle(cont, datos) {
  const anchoTotal = 600, cuadSize = 20, gapCuad = 4, numCuad = 10, altoFila = 30, espacio = 14, anchoEtiqueta = 170;
  const altoTotal = datos.length * (altoFila + espacio) + espacio;

  let filas = '';
  datos.forEach(function (d, i) {
    const pct = porcentaje(d);
    const llenos = Math.round(pct / 10);
    const y = espacio + i * (altoFila + espacio);
    const color = colorPorcentaje(pct);

    let cuadrados = '';
    for (let c = 0; c < numCuad; c++) {
      const x = anchoEtiqueta + c * (cuadSize + gapCuad);
      cuadrados += `<rect x="${x}" y="${y}" width="${cuadSize}" height="${cuadSize}" rx="3" fill="${c < llenos ? color : '#eef0ea'}"></rect>`;
    }
    filas += `
      ${etiquetaFila(0, y + cuadSize / 2, d.nombre)}
      ${cuadrados}
      <text x="${anchoEtiqueta + numCuad * (cuadSize + gapCuad) + 4}" y="${y + cuadSize / 2 + 4}" font-size="12" ${FUENTE_GRAFICO} fill="#333" font-weight="500">${Math.round(pct)}%</text>
    `;
  });
  envolverSvg(cont, anchoTotal, altoTotal, filas);
}

// Torta: cantidad de competencias por nivel de logro (Alto >=70, Medio 40-69, Bajo <40)
function dibujarTorta(cont, datos) {
  const niveles = [
    { etiqueta: 'Alto (70% o más)', color: colorPorcentaje(100), nombres: [] },
    { etiqueta: 'Medio (40% a 69%)', color: colorPorcentaje(50), nombres: [] },
    { etiqueta: 'Bajo (menos de 40%)', color: colorPorcentaje(0), nombres: [] }
  ];
  datos.forEach(function (d) {
    const pct = porcentaje(d);
    niveles[pct >= 70 ? 0 : (pct >= 40 ? 1 : 2)].nombres.push(d.nombre);
  });

  const total = datos.length;
  const anchoTotal = 600, altoTotal = 230, cx = 115, cy = 115, R = 95;
  const presentes = niveles.filter(function (n) { return n.nombres.length > 0; });

  function punto(anguloDeg, radio) {
    const rad = (Math.PI / 180) * anguloDeg;
    return { x: cx + radio * Math.cos(rad), y: cy + radio * Math.sin(rad) };
  }

  let porciones = '';
  let angulo = -90;
  presentes.forEach(function (n) {
    const fraccion = n.nombres.length / total;
    const barrido = fraccion * 360;

    if (presentes.length === 1) {
      // Un arco de 360° no se puede dibujar con un path
      porciones += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${n.color}"></circle>`;
    } else {
      const e0 = punto(angulo, R);
      const e1 = punto(angulo + barrido, R);
      const d = `M ${cx} ${cy} L ${e0.x.toFixed(2)} ${e0.y.toFixed(2)} A ${R} ${R} 0 ${barrido > 180 ? 1 : 0} 1 ${e1.x.toFixed(2)} ${e1.y.toFixed(2)} Z`;
      porciones += `<path d="${d}" fill="${n.color}" stroke="#fff" stroke-width="2" stroke-linejoin="round"></path>`;
    }

    if (fraccion >= 0.1) {
      const pt = punto(angulo + barrido / 2, R * 0.62);
      porciones += `<text x="${pt.x.toFixed(1)}" y="${(pt.y + 5).toFixed(1)}" text-anchor="middle" font-size="14" font-weight="600" ${FUENTE_GRAFICO} fill="#fff">${Math.round(fraccion * 100)}%</text>`;
    }
    angulo += barrido;
  });

  const xLeyenda = 250, altoEntrada = 66;
  const yInicio = Math.max(14, (altoTotal - presentes.length * altoEntrada) / 2 + 6);
  let leyenda = '';
  presentes.forEach(function (n, i) {
    const y = yInicio + i * altoEntrada;
    const cant = n.nombres.length;
    const lineasNombres = wrapLabel(n.nombres.join(', '), 52, 2);
    leyenda += `
      <rect x="${xLeyenda}" y="${y}" width="12" height="12" rx="2" fill="${n.color}"></rect>
      <text x="${xLeyenda + 20}" y="${y + 11}" font-size="13" font-weight="600" ${FUENTE_GRAFICO} fill="#333">${n.etiqueta}: ${cant} (${Math.round(cant / total * 100)}%)</text>
      ${lineasNombres.map(function (linea, j) {
        return `<text x="${xLeyenda + 20}" y="${y + 28 + j * 13}" font-size="11" ${FUENTE_GRAFICO} fill="#555">${escapeHTML(linea)}</text>`;
      }).join('')}
    `;
  });
  envolverSvg(cont, anchoTotal, altoTotal, porciones + leyenda);
}

// Anillo: una porción por competencia (tamaño = su puntaje sobre el total, color = su semáforo)
function dibujarAnillo(cont, datos) {
  const anchoTotal = 600, altoFila = 22;
  const altoTotal = Math.max(230, datos.length * altoFila + 30);
  const cx = 115, cy = altoTotal / 2, R = 95, rInterno = 56;

  const totalPuntos = datos.reduce(function (acc, d) { return acc + Math.max(0, d.puntaje); }, 0);
  const totalMaximo = datos.reduce(function (acc, d) { return acc + d.maximo; }, 0);
  const conPuntos = datos.filter(function (d) { return d.puntaje > 0; });

  function punto(anguloDeg, radio) {
    const rad = (Math.PI / 180) * anguloDeg;
    return { x: cx + radio * Math.cos(rad), y: cy + radio * Math.sin(rad) };
  }

  let porciones = '';
  if (totalPuntos <= 0) {
    porciones += `<circle cx="${cx}" cy="${cy}" r="${(R + rInterno) / 2}" fill="none" stroke="#e5e7eb" stroke-width="${R - rInterno}"></circle>`;
  } else if (conPuntos.length === 1) {
    const d = conPuntos[0];
    porciones += `<circle cx="${cx}" cy="${cy}" r="${(R + rInterno) / 2}" fill="none" stroke="${colorPorcentaje(porcentaje(d))}" stroke-width="${R - rInterno}"></circle>`;
    porciones += `<text x="${cx}" y="${cy - R + 24}" text-anchor="middle" font-size="12" font-weight="600" ${FUENTE_GRAFICO} fill="#fff">${datos.indexOf(d) + 1}</text>`;
  } else {
    let angulo = -90;
    datos.forEach(function (d, i) {
      if (d.puntaje <= 0) return;
      const barrido = (d.puntaje / totalPuntos) * 360;
      const a0 = angulo, a1 = angulo + barrido;
      const grande = barrido > 180 ? 1 : 0;
      const e0 = punto(a0, R), e1 = punto(a1, R), i0 = punto(a0, rInterno), i1 = punto(a1, rInterno);
      const trazo = `M ${e0.x.toFixed(2)} ${e0.y.toFixed(2)} A ${R} ${R} 0 ${grande} 1 ${e1.x.toFixed(2)} ${e1.y.toFixed(2)} ` +
                    `L ${i1.x.toFixed(2)} ${i1.y.toFixed(2)} A ${rInterno} ${rInterno} 0 ${grande} 0 ${i0.x.toFixed(2)} ${i0.y.toFixed(2)} Z`;
      porciones += `<path d="${trazo}" fill="${colorPorcentaje(porcentaje(d))}" stroke="#fff" stroke-width="2" stroke-linejoin="round"></path>`;
      if (barrido >= 14) {
        const pt = punto(a0 + barrido / 2, (R + rInterno) / 2);
        porciones += `<text x="${pt.x.toFixed(1)}" y="${(pt.y + 4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="600" ${FUENTE_GRAFICO} fill="#fff">${i + 1}</text>`;
      }
      angulo += barrido;
    });
  }

  const centro = `
    <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="22" ${FUENTE_GRAFICO} fill="#333">${totalPuntos}/${totalMaximo}</text>
    <text x="${cx}" y="${cy + 20}" text-anchor="middle" font-size="11" ${FUENTE_GRAFICO} fill="#555">puntos</text>
  `;

  const xLeyenda = 250;
  const yInicio = (altoTotal - datos.length * altoFila) / 2;
  let leyenda = '';
  datos.forEach(function (d, i) {
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

// Radar: un vértice por competencia; con menos de 3 muestra un aviso
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

  const ancho = 460, alto = 310, cx = ancho / 2, cy = 156, R = 100, n = datos.length;

  function puntoEn(anguloDeg, radio) {
    const rad = (Math.PI / 180) * anguloDeg;
    return { x: cx + radio * Math.cos(rad), y: cy + radio * Math.sin(rad) };
  }

  const angulos = [];
  for (let i = 0; i < n; i++) angulos.push(-90 + i * (360 / n));

  let grid = '';
  [0.33, 0.66, 1].forEach(function (frac) {
    const pts = angulos.map(function (a) {
      const p = puntoEn(a, R * frac);
      return p.x.toFixed(1) + ',' + p.y.toFixed(1);
    }).join(' ');
    grid += `<polygon points="${pts}" fill="none" stroke="#e5e7eb" stroke-width="1"></polygon>`;
  });

  let ejes = '';
  angulos.forEach(function (a) {
    const p = puntoEn(a, R);
    ejes += `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="#e5e7eb" stroke-width="1"></line>`;
  });

  const puntosData = [];
  let puntosSvg = '';
  let etiquetas = '';
  datos.forEach(function (d, i) {
    const pct = porcentaje(d);
    const p = puntoEn(angulos[i], R * (pct / 100));
    puntosData.push(p.x.toFixed(1) + ',' + p.y.toFixed(1));
    puntosSvg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${colorPorcentaje(pct)}"></circle>`;

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

// Corta el nombre en hasta maxLineas líneas; si sobra texto, termina en "…"
function wrapLabel(nombre, maxCharsPorLinea, maxLineas) {
  nombre = nombre || '';
  const palabras = nombre.trim().split(/\s+/);
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

  if (lineas.join(' ').length < nombre.trim().length && lineas.length > 0) {
    let ultima = lineas[lineas.length - 1].replace(/…$/, '');
    if (ultima.length > maxCharsPorLinea - 1) ultima = ultima.slice(0, maxCharsPorLinea - 1);
    lineas[lineas.length - 1] = ultima + '…';
  }
  return lineas.slice(0, maxLineas);
}

// Rasteriza el SVG visible a PNG para docx.ImageRun (docx no soporta SVG). Devuelve null si no hay gráfico.
async function generarImagenGraficoParaWord() {
  const cont = document.getElementById('graficoCompetenciasContainer');
  const svgEl = cont ? cont.querySelector('svg') : null;
  if (!cont || cont.style.display === 'none' || !svgEl) return null;

  const svgWidth = parseInt(svgEl.getAttribute('width'), 10) || 600;
  const svgHeight = parseInt(svgEl.getAttribute('height'), 10) || 200;
  const escala = 2;

  const canvas = document.createElement('canvas');
  canvas.width = svgWidth * escala;
  canvas.height = svgHeight * escala;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const svgBlob = new Blob([new XMLSerializer().serializeToString(svgEl)], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = await new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = reject;
      image.src = url;
    });
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  } finally {
    URL.revokeObjectURL(url);
  }

  const buffer = await (await fetch(canvas.toDataURL('image/png'))).arrayBuffer();

  // Los estilos en filas quedan muy altos con muchas competencias: se limita el alto
  const altoMaxWord = 380;
  let anchoWord = 500;
  let altoWord = Math.round(anchoWord * (svgHeight / svgWidth));
  if (altoWord > altoMaxWord) {
    altoWord = altoMaxWord;
    anchoWord = Math.round(altoMaxWord * (svgWidth / svgHeight));
  }
  return { buffer: buffer, width: anchoWord, height: altoWord };
}
