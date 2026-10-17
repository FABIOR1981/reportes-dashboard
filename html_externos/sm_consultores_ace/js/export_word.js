// Exportación a Word (.docx) del informe ACE, fiel a la vista previa.
// Usa img/cabezal.png (se le dibujan encima los textos), img/tabla.png e img/diana.png.
window.downloadWord = async function () {
  const btn = document.querySelector('[data-action="word"]');
  const status = document.getElementById('status');
  if (!btn) return;
  // No usar btn.textContent: reemplazaría el <span class="tooltip"> interno del botón.
  btn.disabled = true;
  if (status) status.textContent = 'Generando Word, por favor espera...';

  try {
    const docx = window.docx;
    if (!docx) { alert('La librería docx no está cargada.'); return; }
    const {
      Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
      WidthType, BorderStyle, AlignmentType, VerticalAlign, ShadingType, ImageRun, PageBreak
    } = docx;

    const TEAL = '177789', WHITE = 'FFFFFF', INK = '2C3E50', GRAY = '5D6D7E', GRAY_BG = 'F0F4F8', BORDER = 'D0D7DE';
    const v = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const run = (text, o) => new TextRun(Object.assign({ text: text, color: INK, size: 21, font: 'Calibri' }, o));
    const noBorders = () => { const n = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }; return { top: n, bottom: n, left: n, right: n }; };
    const thinBorders = () => { const b = { style: BorderStyle.SINGLE, size: 4, color: BORDER }; return { top: b, bottom: b, left: b, right: b }; };
    const pct = n => ({ size: n, type: WidthType.PERCENTAGE });

    async function cargarBitmap(path) {
      const resp = await fetch(path);
      if (!resp.ok) throw new Error('No se pudo cargar ' + path);
      return createImageBitmap(await resp.blob());
    }
    async function canvasABuffer(canvas) {
      return (await fetch(canvas.toDataURL('image/png'))).arrayBuffer();
    }

    // Cabezal: la imagen base + los mismos textos que se ven en la vista previa
    async function cabezal() {
      const outW = 605;
      const src = await cargarBitmap('img/cabezal.png');
      const canvas = document.createElement('canvas');
      canvas.width = src.width; canvas.height = src.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(src, 0, 0);
      const sS = src.width / 1505, tS = src.width / outW;
      ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'left';
      ctx.font = `${14 * tS}px "Segoe UI", Arial, sans-serif`;
      ctx.fillText('Informe:', 76 * sS, 125 * sS);
      ctx.font = `${25 * tS}px "Segoe UI", Arial, sans-serif`;
      ctx.fillText('Resultados de Evaluación', 76 * sS, 185 * sS);
      ctx.fillText('Psicotécnica', 76 * sS, 235 * sS);
      ctx.textAlign = 'right';
      ctx.font = `italic ${19 * tS}px Georgia, "Times New Roman", serif`;
      const p = (v('logoNombre') || 'Shalon Morales').split(/\s+/);
      [p[0], p.slice(1).join(' ')].forEach((l, i) => ctx.fillText(l, 1470 * sS, (337 + i * 42) * sS));
      ctx.fillStyle = '#CFE4E6';
      ctx.font = `${7 * tS}px "Segoe UI", Arial, sans-serif`;
      ctx.fillText((v('logoLeyenda') || 'CONSULTORES').toUpperCase(), 1470 * sS, 410 * sS);
      const h = Math.round(outW * src.height / src.width);
      src.close();
      return { buf: await canvasABuffer(canvas), w: outW, h: h };
    }

    // Icono: se quita el fondo blanco conectado al borde para que quede sobre el banner teal
    async function icono(path, width) {
      const img = await cargarBitmap(path);
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const px = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const W = canvas.width, H = canvas.height;
      const visto = new Uint8Array(W * H);
      const pila = [];
      const blanco = i => px.data[i] > 220 && px.data[i + 1] > 220 && px.data[i + 2] > 220 && px.data[i + 3] > 0;
      const agregar = (x, y) => {
        const pos = y * W + x;
        if (visto[pos]) return;
        visto[pos] = 1;
        if (blanco(pos * 4)) pila.push([x, y]);
      };
      for (let x = 0; x < W; x++) { agregar(x, 0); agregar(x, H - 1); }
      for (let y = 1; y < H - 1; y++) { agregar(0, y); agregar(W - 1, y); }
      while (pila.length) {
        const [x, y] = pila.pop();
        px.data[(y * W + x) * 4 + 3] = 0;
        if (x > 0) agregar(x - 1, y);
        if (x < W - 1) agregar(x + 1, y);
        if (y > 0) agregar(x, y - 1);
        if (y < H - 1) agregar(x, y + 1);
      }
      ctx.putImageData(px, 0, 0);
      const h = Math.round(width * img.height / img.width);
      img.close();
      return { buf: await canvasABuffer(canvas), w: width, h: h };
    }

    const fmtDate = iso => { if (!iso) return '-'; const [y, m, d] = iso.split('-'); return y ? `${d}/${m}/${y}` : iso; };
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const fmtLong = iso => { if (!iso) return '-'; const [y, m, d] = iso.split('-'); return y ? `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}` : iso; };

    const nombre = v('nombre'), solicitante = v('solicitante'), consultoria = v('consultoria'), elaboradoPor = v('elaboradoPor');
    const horaEval = v('horaEval');
    const clasifEl = document.querySelector('input[name="clasif"]:checked');
    const clasif = clasifEl ? clasifEl.value : '';
    const competencias = Array.from(document.querySelectorAll('#compContainer .comp-block')).map(b => ({
      nombre: b.querySelector('.c-nombre').value.trim(),
      puntaje: b.querySelector('.c-puntaje').value.trim(),
      maximo: b.querySelector('.c-maximo').value.trim()
    }));

    const headerImg = await cabezal();
    const tablaImg = await icono('img/tabla.png', 60);
    const dianaImg = await icono('img/diana.png', 60);

    const parrafos = texto => texto.split(/\r?\n/).filter(t => t.trim()).map(t => new Paragraph({
      alignment: AlignmentType.JUSTIFIED, spacing: { before: 120, after: 120 }, children: [run(t.trim())]
    }));

    function banner(titulo, icon) {
      return new Table({
        width: pct(100),
        rows: [new TableRow({ children: [
          new TableCell({
            width: pct(89), shading: { type: ShadingType.CLEAR, fill: TEAL },
            margins: { top: 140, bottom: 140, left: 200, right: 160 }, borders: noBorders(),
            children: [new Paragraph({ children: [run(titulo, { color: WHITE, size: 26 })] })]
          }),
          new TableCell({
            width: pct(1), shading: { type: ShadingType.CLEAR, fill: WHITE }, borders: noBorders(),
            children: [new Paragraph({ children: [new TextRun({ text: '' })] })]
          }),
          new TableCell({
            width: pct(10), shading: { type: ShadingType.CLEAR, fill: TEAL }, borders: noBorders(),
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
              new ImageRun({ data: icon.buf, transformation: { width: icon.w, height: icon.h } })
            ] })]
          })
        ] })]
      });
    }

    function celda(texto, o) {
      o = o || {};
      return new TableCell({
        width: pct(o.ancho || 50),
        shading: { type: ShadingType.CLEAR, fill: o.fill || WHITE },
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        borders: thinBorders(), verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          alignment: o.align || AlignmentType.LEFT,
          children: [run(texto, { bold: !!o.bold, color: o.color || INK, size: o.size || 19 })]
        })]
      });
    }

    const datos = [
      ['NOMBRE:', nombre],
      ['CARGO POSTULACIÓN:', v('cargoPostulacion')],
      ['C.I.', v('ci')],
      ['CONTACTO:', v('contacto')],
      ['FECHA DE EVALUACIÓN:', fmtEvalLinea(v('fechaEval'), horaEval)]
    ];
    const datosTable = new Table({
      width: pct(100),
      rows: [new TableRow({ children: [
        celda('DATOS', { fill: TEAL, color: WHITE, bold: true, size: 20, align: AlignmentType.CENTER }),
        celda('POSTULANTE', { fill: TEAL, color: WHITE, bold: true, size: 20, align: AlignmentType.CENTER })
      ] })].concat(datos.map(d => new TableRow({ children: [
        celda(d[0], { fill: GRAY_BG, bold: true }),
        celda(d[1] || '–', { align: AlignmentType.CENTER })
      ] })))
    });

    const metaRow = new Table({
      width: pct(100),
      rows: [new TableRow({ children: [
        new TableCell({ width: pct(50), borders: noBorders(), children: [new Paragraph({ children: [
          run('Elaborado por: ', { size: 19 }), run(elaboradoPor || '–', { size: 19, bold: true })
        ] })] }),
        new TableCell({ width: pct(50), borders: noBorders(), children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
          run('Consultoría: ', { size: 19 }), run(consultoria || '–', { size: 19, bold: true })
        ] })] })
      ] })]
    });

    const fortalezas = v('fortalezasTexto').split(/\r?\n/).filter(t => t.trim()).map(t => new Paragraph({
      bullet: { level: 0 }, spacing: { after: 60 }, children: [run(t.trim())]
    }));

    // La firma es opcional: img/firma.png
    async function firma() {
      try {
        const r = await fetch('img/firma.png');
        if (!r.ok) return null;
        const blob = await r.blob();
        const bmp = await createImageBitmap(blob);
        const w = 140, h = Math.round(w * bmp.height / bmp.width);
        bmp.close();
        return { buf: await blob.arrayBuffer(), w: w, h: h };
      } catch (e) { return null; }
    }
    const firmaImg = await firma();

    const datosGrafico = competencias.filter(c => c.nombre && parseFloat(c.maximo) > 0)
      .map(c => ({ nombre: c.nombre, puntaje: parseFloat(c.puntaje) || 0, maximo: parseFloat(c.maximo) }));
    // resultadoFinalHtml marca lo destacado con <b>; al partir por la etiqueta, los índices impares van en negrita
    const resultadoParrafo = datosGrafico.length ? [new Paragraph({
      alignment: AlignmentType.JUSTIFIED, spacing: { before: 160, after: 120 },
      children: resultadoFinalHtml(datosGrafico).split(/<\/?b>/).map((t, i) => run(t, { bold: i % 2 === 1 }))
    })] : [];

    const imagenGrafico = await generarImagenGraficoParaWord();
    const graficoParrafos = imagenGrafico ? [
      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: '' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new ImageRun({ data: imagenGrafico.buffer, transformation: { width: imagenGrafico.width, height: imagenGrafico.height } })
      ] })
    ] : [];

    function clasifRow(label) {
      return new TableRow({ children: [
        celda(label, { fill: GRAY_BG, bold: true, ancho: 75, size: 20 }),
        new TableCell({
          width: pct(25), shading: { type: ShadingType.CLEAR, fill: WHITE },
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          borders: thinBorders(), verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
            new TextRun({ text: clasif === label ? '✓' : '☐', bold: true, color: TEAL, size: 26 })
          ] })]
        })
      ] });
    }
    const clasifTable = new Table({
      width: pct(100),
      rows: [new TableRow({ children: [
        celda('CLASIFICACIÓN', { fill: TEAL, color: WHITE, bold: true, size: 20, ancho: 75, align: AlignmentType.CENTER }),
        celda('RESULTADO', { fill: TEAL, color: WHITE, bold: true, size: 20, ancho: 25, align: AlignmentType.CENTER })
      ] })].concat(['RECOMENDABLE', 'RECOMENDABLE CON OBSERVACIÓN', 'NO RECOMENDABLE'].map(clasifRow))
    });

    const cierre = (firmaImg ? [new Paragraph({
      alignment: AlignmentType.RIGHT, spacing: { before: 400 },
      children: [new ImageRun({ data: firmaImg.buf, transformation: { width: firmaImg.w, height: firmaImg.h } })]
    })] : []).concat([
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300 }, children: [run('Página 3/3', { color: GRAY, size: 16 })] })
    ]);

    const salto = () => new Paragraph({ children: [new PageBreak()] });
    const children = [].concat(
      [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [
        new ImageRun({ data: headerImg.buf, transformation: { width: headerImg.w, height: headerImg.h } })
      ] })],
      [new Paragraph({ spacing: { after: 60 }, children: [
        run('Fecha: ', { size: 20 }), run(fmtLong(v('fechaInforme')), { bold: true, color: TEAL, size: 20 })
      ] })],
      [new Paragraph({
        spacing: { before: 60, after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER, space: 4 } },
        children: [new TextRun({ text: '\u00A0' })]
      }), metaRow, datosTable],
      [new Paragraph({ spacing: { before: 240, after: 160 }, alignment: AlignmentType.JUSTIFIED, children: [
        run('A solicitud de la empresa '), run(solicitante || '–', { bold: true }),
        run(', el día ' + diaSemana(v('fechaEval')) + ' '), run(fmtFechaMayus(v('fechaEval')), { bold: true }),
        run(' se realizó una evaluación psicotécnica teniendo como objetivo de esta instancia evaluar las competencias y habilidades requeridas para el cargo '),
        run(v('cargoEvaluado') || '–', { bold: true })
      ] })],
      [banner('Objetivo', tablaImg)],
      parrafos(v('objetivoTexto')),
      parrafos(v('enfoqueTexto')),
      [salto(), banner('Fortalezas', dianaImg)],
      fortalezas,
      [banner('Debilidades', dianaImg)],
      parrafos(v('debilidadesTexto')),
      [new Paragraph({ spacing: { before: 240, after: 120 }, children: [run('Gráfica Competencias y habilidades', { bold: true, size: 24 })] })],
      graficoParrafos,
      resultadoParrafo,
      parrafos(v('perfilTexto')),
      [salto(), banner('Conclusión', dianaImg)],
      parrafos(v('conclusionTexto')),
      [new Paragraph({ children: [new TextRun({ text: '' })] }), clasifTable],
      cierre
    );

    const blob = await Packer.toBlob(new Document({ sections: [{ properties: {}, children: children }] }));
    await Botonera.guardarBlob(blob, 'Informe_Psicotecnico_ACE_' + (nombre || 'postulante').replace(/\s+/g, '_') + '.docx');
    if (status) status.textContent = '✔ Word descargado con éxito.';
  } catch (e) {
    console.error(e);
    if (status) status.textContent = '⚠ Error al generar el Word. Revisá la consola.';
    alert('Error al generar el Word: ' + e.message);
  } finally {
    btn.disabled = false;
    if (status) setTimeout(() => { status.textContent = ''; }, 4000);
  }
};
