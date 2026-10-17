const TOTAL_COMPETENCIAS = 13;
let chartInstance = null;

// ==========================================
// 1. HELPERS AUTOCONTENIDOS
// ==========================================
function fmtDate(iso){
  if(!iso) return '-';
  const [y,m,d] = iso.split('-');
  if(!y) return iso;
  return `${d}/${m}/${y}`;
}

function fmtDateLong(iso){
  if(!iso) return '-';
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const [y,m,d] = iso.split('-');
  if(!y) return iso;
  return `${parseInt(d)} de ${meses[parseInt(m)-1]} ${y}`;
}

function val(id){ 
  const el = document.getElementById(id);
  return el ? el.value : ''; 
}

function setText(id, text){ 
  const el = document.getElementById(id);
  if(el) el.textContent = text && text.trim() !== '' ? text : '-'; 
}

// ==========================================
// 2. GENERACIÓN DE INPUTS Y RENDER
// ==========================================
function generarInputsCompetencias() {
  const container = document.getElementById('compContainer');
  let html = '';
  for (let i = 1; i <= TOTAL_COMPETENCIAS; i++) {
    html += `
      <div class="row2" style="margin-bottom:8px; align-items:center; border-bottom: 1px solid #eee; padding-bottom: 5px;">
        <input type="text" id="comp_nombre_${i}" value="Competencia ${i}" style="width:50%; margin-bottom:0;" spellcheck="true">
        <div><label style="display:inline; margin-right:5px;">Obt:</label> <input type="number" id="comp_obt_${i}" value="0" min="0" max="10" style="width:60px; margin-bottom:0;"></div>
        <div><label style="display:inline; margin-right:5px;">Máx:</label> <input type="number" id="comp_max_${i}" value="10" min="1" max="10" style="width:60px; margin-bottom:0;"></div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function renderPreview(){
  // Cabezal y Logo
  setText('out-fechaInforme', fmtDateLong(val('fechaInforme')));
  setText('out-elaboradoPor', val('elaboradoPor'));
  setText('out-consultoria', val('consultoria'));
  
  const logoNombreVal = (val('logoNombre') || 'Shalon Morales').trim();
  const logoWords = logoNombreVal.split(' ');
  const logoHtml = logoWords.length > 1 ? logoWords.join('<br>') : logoNombreVal;
  document.getElementById('out-logoNombre').innerHTML = logoHtml;
  setText('out-logoSub', (val('logoLeyenda') || 'CONSULTORES').toUpperCase());

  // Datos postulante
  setText('out-nombre', val('nombre'));
  setText('out-cargoPostulacion', val('cargoPostulacion'));
  setText('out-fechaNac', fmtDate(val('fechaNac')));
  setText('out-edad', val('edad'));
  setText('out-ci', val('ci'));
  setText('out-contacto', val('contacto'));
  setText('out-solicitante', val('solicitante'));

  // Textos
  setText('out-fortalezasTexto', val('fortalezasTexto'));
  setText('out-debilidadesTexto', val('debilidadesTexto'));
  setText('out-conclusionTexto', val('conclusionTexto'));

  dibujarGrafico();
}

function dibujarGrafico() {
  const labels = [];
  const dataObtenido = [];
  const dataMaximo = [];

  for (let i = 1; i <= TOTAL_COMPETENCIAS; i++) {
    labels.push(val(`comp_nombre_${i}`) || `Comp ${i}`);
    dataObtenido.push(Number(val(`comp_obt_${i}`)) || 0);
    dataMaximo.push(Number(val(`comp_max_${i}`)) || 0);
  }

  const ctx = document.getElementById('graficoCompetencias').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Nivel Obtenido', data: dataObtenido, backgroundColor: '#2f5240' },
        { label: 'Nivel Esperado', data: dataMaximo, backgroundColor: '#a5b5ab' }
      ]
    },
    options: {
      responsive: false,
      animation: false, // Fundamental para exportación
      scales: { 
        y: { beginAtZero: true, max: 10 } 
      }
    }
  });
}

// ==========================================
// 3. INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  generarInputsCompetencias();
  
  // Asignar eventos de input a todo
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', renderPreview);
  });

  // Configurar Botonera Compartida
  const camposGuardables = ['fechaInforme','solicitante','nombre','cargoPostulacion','fechaNac','edad','ci','contacto','fortalezasTexto','debilidadesTexto','conclusionTexto'];
  for (let i = 1; i <= TOTAL_COMPETENCIAS; i++) {
    camposGuardables.push(`comp_nombre_${i}`, `comp_obt_${i}`, `comp_max_${i}`);
  }

  if (window.Botonera) {
    window.Botonera.init({
      camposGuardables: camposGuardables,
      camposNoLimpiar: ['consultoria','logoNombre','logoLeyenda','elaboradoPor'],
      camposOrtografia: [
        { id: 'fortalezasTexto', label: 'Fortalezas' },
        { id: 'debilidadesTexto', label: 'Debilidades' },
        { id: 'conclusionTexto', label: 'Conclusión' }
      ],
      nombreArchivoBase: 'Informe_ACE',
      onResetExtra: function() { renderPreview(); },
      onLoadExtra: function() { renderPreview(); }
    });
  }
  
  renderPreview();
});

// ==========================================
// 4. CONTRATO DE EXPORTACIÓN (PDF y WORD)
// ==========================================
window.downloadPDF = async function() {
  const btn = document.querySelector('[data-action="pdf"]');
  const status = document.getElementById('status');
  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Elegí "Guardar como PDF" en el diálogo de impresión...';

  const tituloOriginal = document.title;
  const nombre = val('nombre').trim() || 'Candidato';
  document.title = `Informe_ACE_${nombre.replace(/\s+/g, '_')}`;

  const restaurar = function() {
    document.title = tituloOriginal;
    if (btn) btn.disabled = false;
    if (status) status.textContent = '';
    window.removeEventListener('afterprint', restaurar);
  };

  window.addEventListener('afterprint', restaurar);
  setTimeout(function() { window.print(); }, 50);
};

window.downloadWord = async function() {
  const btn = document.querySelector('[data-action="word"]');
  const status = document.getElementById('status');
  if (btn) btn.disabled = true;
  if (status) status.textContent = 'Generando Word...';

  try {
    const nombre = val('nombre').trim() || '-';
    
    // Capturar Chart.js como Base64 limpio para inyectar en Word
    const canvasGrafico = document.getElementById('graficoCompetencias');
    const imgDataCompleta = canvasGrafico.toDataURL("image/png");
    const imgDataB64 = imgDataCompleta.split(',')[1]; 

    const children = [
      new docx.Paragraph({ text: "Evaluación de Competencias Ejecutivas (A.C.E.)", heading: docx.HeadingLevel.HEADING_1, alignment: docx.AlignmentType.CENTER }),
      new docx.Paragraph({ text: "" }),
      new docx.Paragraph({ text: `Candidato: ${nombre}` }),
      new docx.Paragraph({ text: `Cargo evaluado: ${val('cargoPostulacion')}` }),
      new docx.Paragraph({ text: `C.I.: ${val('ci')}  |  Edad: ${val('edad')}` }),
      new docx.Paragraph({ text: "" }),
      
      new docx.Paragraph({ text: "Fortalezas", heading: docx.HeadingLevel.HEADING_2 }),
      new docx.Paragraph({ text: val('fortalezasTexto') || '-' }),
      new docx.Paragraph({ text: "" }),
      
      new docx.Paragraph({ text: "Áreas de Mejora", heading: docx.HeadingLevel.HEADING_2 }),
      new docx.Paragraph({ text: val('debilidadesTexto') || '-' }),
      new docx.Paragraph({ text: "" }),
      
      new docx.Paragraph({ text: "Perfil de Competencias", heading: docx.HeadingLevel.HEADING_2 }),
      // Imagen del gráfico inyectada de forma nativa
      new docx.Paragraph({
        alignment: docx.AlignmentType.CENTER,
        children: [
          new docx.ImageRun({
            data: Uint8Array.from(atob(imgDataB64), c => c.charCodeAt(0)),
            transformation: { width: 550, height: 280 }
          })
        ]
      }),
      new docx.Paragraph({ text: "" }),
      
      new docx.Paragraph({ text: "Conclusión", heading: docx.HeadingLevel.HEADING_2 }),
      new docx.Paragraph({ text: val('conclusionTexto') || '-' })
    ];

    const doc = new docx.Document({ sections: [{ properties: {}, children }] });
    const blob = await docx.Packer.toBlob(doc);
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Informe_ACE_${nombre.replace(/\s+/g, '_')}.docx`;
    link.click();

    if (status) status.textContent = '✔ Word descargado.';
  } catch (e) {
    console.error(e);
    if (status) status.textContent = '⚠ Error en Word.';
  } finally {
    if (btn) btn.disabled = false;
    setTimeout(() => { if(status) status.textContent = ''; }, 4000);
  }
};