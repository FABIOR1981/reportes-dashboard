let chartInstance = null;

// Competencias por defecto (A.C.E.)
const defaultCompetencias = [
  { nombre: "Liderazgo", valor: 3 },
  { nombre: "Capacidad de trabajo en equipo y coordinación", valor: 3 },
  { nombre: "Resolución de Problemas y toma de decisiones", valor: 3 },
  { nombre: "Habilidades de comunicación", valor: 3 },
  { nombre: "Orientación al Cliente y a resultados", valor: 3 },
  { nombre: "Capacidad de negociación", valor: 3 },
  { nombre: "Organización y planificación", valor: 3 },
  { nombre: "Gestión eficiente y atención al detalle", valor: 3 },
  { nombre: "Iniciativa y proactividad", valor: 3 },
  { nombre: "Adaptabilidad y gestión del cambio", valor: 3 }
];

function initPanel() {
  const container = document.getElementById("compContainer");
  container.innerHTML = "";
  defaultCompetencias.forEach((comp, i) => {
    const row = document.createElement("div");
    row.className = "comp-row";
    row.innerHTML = `
      <input type="text" id="compName_${i}" value="${comp.nombre}">
      <input type="number" id="compVal_${i}" value="${comp.valor}" min="1" max="5">
    `;
    container.appendChild(row);
  });
  
  // Agregar listeners a todos los inputs
  document.querySelectorAll('#panel input, #panel textarea').forEach(el => {
    el.addEventListener('input', updatePreview);
  });
}

function updatePreview() {
  // 1. Cabezal
  document.getElementById('prevFechaInforme').textContent = document.getElementById('fechaInforme').value;
  document.getElementById('prevElaboradoPor').textContent = document.getElementById('elaboradoPor').value;
  
  // 2. Datos postulante
  document.getElementById('prevNombre').textContent = document.getElementById('nombre').value;
  document.getElementById('prevCargoPostulacion').textContent = document.getElementById('cargoPostulacion').value;
  document.getElementById('prevCI').textContent = document.getElementById('ci').value;
  document.getElementById('prevContacto').textContent = document.getElementById('contacto').value;
  document.getElementById('prevFechaEval').textContent = document.getElementById('fechaEval').value;

  // Actualizar inyecciones en el texto
  document.getElementById('prevNombreDoc').textContent = document.getElementById('nombre').value;
  document.getElementById('prevCargoDoc').textContent = document.getElementById('cargoPostulacion').value;

  // 3. Textos
  document.getElementById('prevObjetivo').textContent = document.getElementById('objetivo').value;
  document.getElementById('prevFortalezas').textContent = document.getElementById('fortalezas').value;
  document.getElementById('prevDebilidades').textContent = document.getElementById('debilidades').value;
  document.getElementById('prevConclusion').textContent = document.getElementById('conclusion').value;

  // 4. Competencias y Gráfica
  let nombres = [];
  let valoresObtenidos = [];
  let valoresMaximos = [];
  let totalPuntos = 0;
  
  for (let i=0; i<defaultCompetencias.length; i++) {
    let name = document.getElementById(`compName_${i}`).value;
    let val = parseFloat(document.getElementById(`compVal_${i}`).value) || 0;
    nombres.push(name);
    valoresObtenidos.push(val);
    valoresMaximos.push(3); // El maximo esperado en esta gráfica siempre es 3 visualmente
    totalPuntos += val;
  }
  
  let maxPosible = defaultCompetencias.length * 3;
  let porcentaje = Math.round((totalPuntos / maxPosible) * 100);
  document.getElementById('prevResumenPorcentaje').textContent = `El resultado final es ${totalPuntos} sobre ${maxPosible}, equivalente al ${porcentaje}% del máximo posible, lo que refleja un desempeño satisfactorio con buen potencial de desarrollo.`;

  renderChart(nombres, valoresObtenidos, valoresMaximos);

  // 5. Tabla de Clasificación Final
  let recomendacion = document.querySelector('input[name="recom"]:checked').value;
  document.getElementById('marcaRec').textContent = recomendacion === "RECOMENDABLE" ? "X" : "";
  document.getElementById('marcaRecObs').textContent = recomendacion === "RECOMENDABLE CON OBSERVACIÓN" ? "X" : "";
  document.getElementById('marcaNoRec').textContent = recomendacion === "NO RECOMENDABLE" ? "X" : "";
}

function renderChart(labels, dataObtenida, dataMax) {
  const ctx = document.getElementById('grafica').getContext('2d');
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  chartInstance = new Chart(ctx, {
    type: 'bar',
    plugins: [ChartDataLabels],
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Puntaje Obtenido',
          backgroundColor: '#00b0ff', // Azul claro (como el PDF original)
          data: dataObtenida
        },
        {
          label: 'Puntaje Maximo', // Se arregló el error de tipeo original
          backgroundColor: '#1f4e79', // Azul oscuro (como el PDF original)
          data: dataMax
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        datalabels: {
          color: '#fff',
          font: { weight: 'bold' },
          anchor: 'center',
          align: 'center'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 3.5,
          ticks: { stepSize: 0.5 }
        },
        x: {
          ticks: {
            callback: function(val, index) {
              // Corta los labels largos para que queden en varias lineas (como el original)
              const label = this.getLabelForValue(val);
              if (label.length > 20) {
                 const part1 = label.slice(0, label.lastIndexOf(' ', 15));
                 const part2 = label.slice(part1.length + 1);
                 return [part1, part2];
              }
              return label;
            }
          }
        }
      }
    }
  });
}

// Inicialización de la Botonera (guardar/cargar/PDF/Word)
if (typeof Botonera !== 'undefined') {
  Botonera.init({
    camposGuardables: [
      'fechaInforme', 'elaboradoPor', 'nombre', 'cargoPostulacion', 'ci', 'contacto', 'fechaEval',
      'objetivo', 'fortalezas', 'debilidades', 'conclusion'
      // Faltaría loopear competencias si quisieras guardarlas en el JSON
    ],
    camposOrtografia: [
      {id:'objetivo', label:'Objetivo'},
      {id:'fortalezas', label:'Fortalezas'},
      {id:'debilidades', label:'Debilidades'},
      {id:'conclusion', label:'Conclusión'}
    ],
    nombreArchivoBase: 'Informe_ACE',
    onResetExtra: function() {
      initPanel();
      updatePreview();
    },
    onLoadExtra: function() {
      updatePreview();
    }
  });
}

// Funciones vacías para conectar PDF y Word más adelante (usa dom-to-image o html2pdf si gustas)
window.downloadPDF = function() {
    alert("Función de PDF pendiente de configurar usando html2canvas/jspdf");
};
window.downloadWord = function() {
    alert("Función de Word pendiente de configurar con docx");
};

// Arrancar al cargar
document.addEventListener("DOMContentLoaded", () => {
  initPanel();
  updatePreview();
});